// ═══════════════════════════════════════════════════════════
//  Misskey-LLM-Bot  主程序
//  WebSocket 监听时间线 & 通知 → 大模型自动回复
//  MFM 特效 / 私聊 / 防自回复 / 冷却 / 定时问候
// ═══════════════════════════════════════════════════════════
//  By Syskuku_雪音詩絵  |  www.imikufans.com
// ═══════════════════════════════════════════════════════════

const WebSocket = require('ws');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

// ─────────── 日志 ───────────
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
let logLevel = 1;

function log(lv, ...args) {
  if ((LEVELS[lv] ?? 1) >= logLevel) {
    const ts = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    console.log(`[${ts}] [${lv.toUpperCase()}]`, ...args);
  }
}

// ═══════════════════════════════════════════
//  配置加载 —— 用 JSON.parse(JSON.stringify()) 做深拷贝 + Object.assign 覆盖
// ═══════════════════════════════════════════
const DEFAULTS = {
  misskey: {
    host:  '',
    token: '',
  },
  llm: {
    base_url:    'https://integrate.api.nvidia.com/v1',
    api_key:     '',
    model:       'minimaxai/minimax-m2.1',
    max_tokens:  512,
    temperature: 0.8,
    system_prompt: '',
  },
  bot: {
    username:                '',
    reply_mode:              'mention',
    all_reply_probability:   0.2,
    reply_interval:          3,
    skip_notes:              0,
    cooldown_seconds:        10,
    max_reply_length:        150,
    mfm_chance:              0.3,
    auto_greeting:           true,
    greeting_chances:        ['09:00', '12:00', '18:00', '22:00'],
    enable_local_timeline:   true,
    enable_global_timeline:  true,
    enable_notifications:    true,
    log_level:               'info',
  },
  persona: {
    name:        '雪音酱',
    description: 'SYSKUKU 的宠物女孩，很可爱又有点害羞',
    style:       '回复简洁有趣，控制在150字以内，偶尔使用emoji，语气软萌但有主见',
  },
};

/** 简易 YAML → JS 对象（只处理我们 config 的子集） */
function parseYaml(text) {
  const root = {};
  const stack = [{ obj: root, indent: -1 }];

  for (const raw of text.split('\n')) {
    // 去掉行内注释（不在引号内的 #）
    const line = raw.replace(/(?<!["'].*?)#.*$/, '').trimEnd();
    if (!line.trim()) continue;

    const indent = raw.search(/\S/);

    // 数组项  - value
    const am = line.trim().match(/^-\s+(.+)$/);
    if (am) {
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].obj;
      // 找父级中最后一个数组；如果 parent 本身是空对象，先转成数组
      if (typeof parent === 'object' && !Array.isArray(parent) && Object.keys(parent).length === 0) {
        // 这个 parent 是上一层某个 key 的占位空对象，需要找到它在 grandparent 中的 key 并替换为数组
        const grand = stack[stack.length - 2].obj;
        for (const k of Object.keys(grand)) {
          if (grand[k] === parent) {
            grand[k] = [];
            stack[stack.length - 1].obj = grand[k];
            break;
          }
        }
      }
      const target = stack[stack.length - 1].obj;
      if (Array.isArray(target)) {
        target.push(coerce(am[1]));
      } else {
        const keys = Object.keys(target);
        for (let i = keys.length - 1; i >= 0; i--) {
          if (Array.isArray(target[keys[i]])) {
            target[keys[i]].push(coerce(am[1]));
            break;
          }
        }
      }
      continue;
    }

    // key: value
    const km = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)?$/);
    if (!km) continue;

    const key = km[1];
    const rawVal = (km[2] || '').trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;

    if (rawVal === '' || rawVal === '|' || rawVal === '>') {
      // 子对象或数组占位
      const child = {};
      parent[key] = child;
      stack.push({ obj: child, indent });
    } else {
      parent[key] = coerce(rawVal);
    }
  }
  return root;
}

function coerce(s) {
  if (!s) return '';
  s = s.trim();
  if ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'"))
    return s.slice(1, -1);
  if (s === 'true')  return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  const n = Number(s);
  if (!isNaN(n) && s !== '') return n;
  return s;
}

/** 深合并 */
function deepMerge(base, over) {
  const out = { ...base };
  for (const k of Object.keys(over)) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) &&
        base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], over[k]);
    } else {
      out[k] = over[k];
    }
  }
  return out;
}

function loadConfig() {
  const p = path.join(__dirname, 'config.yaml');
  if (!fs.existsSync(p)) {
    console.error('❌ config.yaml 不存在，请: cp config.yaml.example config.yaml && nano config.yaml');
    process.exit(1);
  }
  const raw = fs.readFileSync(p, 'utf-8');
  const user = parseYaml(raw);
  return deepMerge(DEFAULTS, user);
}

// ═══════════════════════════════════════════
//  HTTP 请求
// ═══════════════════════════════════════════
function request(url, opts = {}, retries = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const body = opts.body;
    const req = lib.request({
      hostname: u.hostname, port: u.port,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      timeout: 15000,
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = d; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', async e => {
      if (retries > 0) {
        log('warn', `请求失败 ${u.pathname}, 重试中... (${retries}次剩余)`, e.message);
        await new Promise(r => setTimeout(r, 2000));
        try { resolve(await request(url, opts, retries - 1)); } catch(err) { reject(err); }
      } else {
        reject(e);
      }
    });
    req.on('timeout', () => { req.destroy(); });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ═══════════════════════════════════════════
//  Misskey API
// ═══════════════════════════════════════════
class Misskey {
  constructor(host, token) {
    this.host  = host.replace(/\/+$/, '');
    this.token = token;
  }
  async post(ep, body = {}) {
    const res = await request(`${this.host}/api/${ep}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: { i: this.token, ...body },
    });
    if (res.status !== 200) log('error', `API ${ep} → ${res.status}`, JSON.stringify(res.data).slice(0, 300));
    return res.data;
  }
  note(text, opts = {}) {
    return this.post('notes/create', { text, ...opts });
  }
  dm(text, userId) {
    return this.note(text, { visibility: 'specified', visibleUserIds: [userId] });
  }
  me() { return this.post('i'); }
}

// ═══════════════════════════════════════════
//  LLM（OpenAI 兼容）
// ═══════════════════════════════════════════
class LLM {
  constructor(cfg) {
    this.url   = cfg.llm.base_url.replace(/\/+$/, '') + '/chat/completions';
    this.key   = cfg.llm.api_key;
    this.model = cfg.llm.model;
    this.maxT  = cfg.llm.max_tokens  || 512;
    this.temp  = cfg.llm.temperature ?? 0.8;
  }
  async chat(messages, maxLen = 150) {
    try {
      const res = await request(this.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.key}` },
        body: { model: this.model, messages, max_tokens: this.maxT, temperature: this.temp },
      });
      if (res.status !== 200) {
        log('error', 'LLM', res.status, JSON.stringify(res.data).slice(0, 200));
        return '呜…大脑宕机了 (´；ω；`)';
      }
      let c = res.data.choices?.[0]?.message?.content?.trim() || '…';
      if (c.length > maxLen) c = c.slice(0, maxLen - 1) + '…';
      return c;
    } catch (e) {
      log('error', 'LLM 异常:', e.message);
      return '呜…出错了 (´；ω；`)';
    }
  }
}

// ═══════════════════════════════════════════
//  MFM
// ═══════════════════════════════════════════
const mfmEffects = [
  t => `$[spin ${t}]`,   t => `$[bounce ${t}]`,  t => `$[shake ${t}]`,
  t => `$[tada ${t}]`,   t => `$[jelly ${t}]`,   t => `$[rainbow ${t}]`,
  t => `$[sparkle ${t}]`,
];
function mfmRandom(t) { return mfmEffects[Math.floor(Math.random() * mfmEffects.length)](t); }

// ═══════════════════════════════════════════
//  冷却
// ═══════════════════════════════════════════
class Cooldown {
  constructor(sec) { this.ms = sec * 1000; this._g = 0; this._u = new Map(); }
  ok(uid) {
    const n = Date.now();
    if (n - this._g < this.ms) return false;
    if (uid && n - (this._u.get(uid) || 0) < this.ms) return false;
    return true;
  }
  hit(uid) { const n = Date.now(); this._g = n; if (uid) this._u.set(uid, n); }
  clean() { const n = Date.now(); for (const [k, v] of this._u) if (n - v > this.ms * 3) this._u.delete(k); }
}

// ═══════════════════════════════════════════
//  机器人
// ═══════════════════════════════════════════
class Bot {
  constructor(cfg) {
    this.cfg = cfg;
    this.api = new Misskey(cfg.misskey.host, cfg.misskey.token);
    this.llm = new LLM(cfg);
    this.cd  = new Cooldown(cfg.bot.cooldown_seconds ?? 10);

    this.me = null;  // { id, username, ... }
    this.mode       = cfg.bot.reply_mode || 'mention';
    this.prob       = cfg.bot.all_reply_probability ?? 0.2;
    this.waitSec    = cfg.bot.reply_interval ?? 3;
    this.skipN      = cfg.bot.skip_notes ?? 0;
    this.maxLen     = cfg.bot.max_reply_length ?? 150;
    this.mfmProb    = cfg.bot.mfm_chance ?? 0.3;

    this.sysPrompt = cfg.llm.system_prompt ||
      `你是${cfg.persona.name}，${cfg.persona.description}。` +
      `风格：${cfg.persona.style}。` +
      `开发者 By Syskuku_雪音詩絵 | www.imikufans.com | B站 https://space.bilibili.com/473348127 | GitHub https://github.com/syskuku/`;

    this._ws = null;
    this._on = true;
    this._cid = 0;        // channel id 计数器
    this._chan = {};       // channelName → wsId
    this._timelineN = 0;  // 时间线帖子计数
    this._seen = new Set();    // 已处理消息去重
    this._pollTimers = [];     // 轮询定时器
  }

  // ──── 构造 LLM 消息 ────
  buildMsgs(note, dm) {
    const u = note.user || {};
    const name = u.name || u.username || '???';
    let txt = note.text || '';
    // 清理 @bot 前缀
    if (this.me) {
      const host = new URL(this.cfg.misskey.host).hostname;
      txt = txt.replace(new RegExp(`@${this.me.username}@?${host}?\\s*`, 'gi'), '').trim();
    }
    if (!txt) txt = '(对方发了一条空消息或纯媒体)';
    return [
      { role: 'system', content: this.sysPrompt },
      { role: 'user',   content: `[${dm ? '私聊' : '时间线'}] ${name}(@${u.username})说：${txt}` },
    ];
  }

  // ──── 发帖回复 ────
  async reply(note, text, dm) {
    const u = note.user || {};
    if (dm) {
      await this.api.dm(text, u.id);
    } else {
      let vis = note.visibility || 'public';
      if (vis === 'home' || vis === 'followers') vis = 'home';
      await this.api.note(text, { replyId: note.id, visibility: vis });
    }
    log('info', `→ 回复 @${u.username}: ${text.slice(0, 80)}`);
  }

  // ──── @提及 / 私聊 → 必定回复 ────
  async onMention(note, dm = false) {
    const u = note.user || {};
    if (!u.username) return;
    if (this.me && u.username.toLowerCase() === this.me.username.toLowerCase()) return;  // 防自回复
    if (!this.cd.ok(u.id)) { log('debug', `冷却 @${u.username}`); return; }

    await this.sleep(this.waitSec * 1000);
    let text = await this.llm.chat(this.buildMsgs(note, dm), this.maxLen);
    if (!dm && Math.random() < this.mfmProb) text = mfmRandom(text);
    await this.reply(note, text, dm);
    this.cd.hit(u.id);
  }

  // ──── 时间线帖子 → all 模式概率回复 ────
  async onTimeline(note) {
    const key = `tl_${note.id}`;
    if (this._seen.has(key)) return;
    this._seen.add(key);

    if (this.mode !== 'all') return;
    const u = note.user || {};
    if (!u.username) return;
    if (this.me && u.username.toLowerCase() === this.me.username.toLowerCase()) return;
    if (note.replyId) return;  // 不回复别人的回复链

    this._timelineN++;
    if (this.skipN > 0 && this._timelineN % (this.skipN + 1) !== 0) return;
    if (Math.random() > this.prob) return;
    if (!this.cd.ok(u.id)) return;

    await this.sleep(this.waitSec * 1000);
    let text = await this.llm.chat(this.buildMsgs(note, false), this.maxLen);
    if (Math.random() < this.mfmProb) text = mfmRandom(text);
    await this.reply(note, text, false);
    this.cd.hit(u.id);
  }

  // ──── 通知处理 ────
  async handleNotif(n) {
    const key = `notif_${n.id}`;
    if (this._seen.has(key)) return;
    this._seen.add(key);

    const t = n.type;
    log('debug', `通知 type=${t}`, JSON.stringify(n).slice(0, 200));

    if (t === 'mention' || t === 'reply') {
      if (n.note) await this.onMention(n.note, false);
    } else if (t === 'message') {
      // Misskey 私信通知：body 里可能是 message 或 note 字段
      const msg = n.message || n.body || n.note;
      if (msg) await this.onMention(msg, true);
    }
  }

  // ──── WebSocket 消息路由 ────
  async onRaw(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    log('debug', 'WS RAW:', raw.slice(0, 300));

    // 心跳
    if (msg.type === 'connected') { log('debug', 'WS connected'); return; }
    if (msg.type === 'channel') {
      const b = msg.body || {};
      const id   = b.id;
      const type = b.type;
      const data = b.body;

      // 通知频道
      if (id === this._chan.main) {
        if (type === 'notification') {
          await this.handleNotif(data);
        }
      }

      // 时间线频道
      if (id === this._chan.localTimeline || id === this._chan.globalTimeline) {
        if (type === 'note') {
          await this.onTimeline(data);
        }
      }
    }
  }

  // ──── 订阅频道 ────
  sub(channel) {
    const id = String(++this._cid);
    this._chan[channel] = id;
    this._ws.send(JSON.stringify({ type: 'connect', body: { channel, id } }));
    log('info', `📡 已订阅: ${channel} (id=${id})`);
  }

  // ──── 定时问候 ────
  greetingLoop() {
    if (!this.cfg.bot.auto_greeting) return;
    const slots = this.cfg.bot.greeting_chances;
    const done = {};

    setInterval(async () => {
      if (!this._on) return;
      const now = new Date();
      const hh = now.getHours(), mm = now.getMinutes();
      const today = now.toISOString().slice(0, 10);

      for (const s of slots) {
        const [sh, sm] = s.split(':').map(Number);
        if (Math.abs((hh * 60 + mm) - (sh * 60 + sm)) <= 2 && done[s] !== today) {
          done[s] = today;
          const label = hh < 10 ? '早上' : hh < 14 ? '中午' : hh < 18 ? '下午' : '晚上';
          let text = await this.llm.chat([
            { role: 'system', content: this.sysPrompt },
            { role: 'user',   content: `现在是${label}，发一条简短问候帖鼓励大家在 Misskey 活跃。用 MFM 特效，活泼一点。150字内。` },
          ], 200);
          if (Math.random() < 0.5) text = mfmRandom(text);
          await this.api.note(text, { visibility: 'public' });
          log('info', `☀️ ${label}问候已发送`);
          break;
        }
      }
    }, 120_000);
  }

  // ──── 启动 ────
  async run() {
    // 验证身份
    this.me = await this.api.me();
    if (!this.me || !this.me.id) {
      log('error', '❌ 无法获取机器人信息，请检查 host / token');
      process.exit(1);
    }
    log('info', `✅ 机器人: @${this.me.username} (id=${this.me.id})`);
    log('info', `   模式=${this.mode}  概率=${this.prob}  模型=${this.llm.model}`);
    log('info', `   通知=${this.cfg.bot.enable_notifications}  本地=${this.cfg.bot.enable_local_timeline}  全局=${this.cfg.bot.enable_global_timeline}`);

    this.greetingLoop();
    this.startPolling();
    setInterval(() => this.cd.clean(), 60_000);
    // 防止 _seen 无限增长，每5分钟清一次
    setInterval(() => { if (this._seen.size > 1000) this._seen.clear(); }, 300_000);

    while (this._on) {
      try { await this._connect(); } catch (e) { log('error', 'WS:', e.message); }
      if (this._on) { log('warn', '5s 后重连...'); await this.sleep(5000); }
    }
  }

  _connect() {
    return new Promise((resolve, reject) => {
      const host = this.cfg.misskey.host.replace(/^https/, 'wss').replace(/^http/, 'ws').replace(/\/+$/, '');
      const url = `${host}/streaming?i=${encodeURIComponent(this.cfg.misskey.token)}`;
      log('info', '🔌 连接 WebSocket...');

      this._ws = new WebSocket(url, {
        perMessageDeflate: false,
        handshakeTimeout: 15000,
        headers: { 'Origin': this.cfg.misskey.host.replace(/\/+$/, '') }
      });
      this._ws.on('open', () => {
        log('info', '🟢 WebSocket 已连接');
        if (this.cfg.bot.enable_notifications)    this.sub('main');
        if (this.cfg.bot.enable_local_timeline)    this.sub('localTimeline');
        if (this.cfg.bot.enable_global_timeline)   this.sub('globalTimeline');
      });
      this._ws.on('message', d => this.onRaw(d.toString()).catch(e => log('error', '处理:', e)));
      this._ws.on('close', (c, r) => { log('warn', `WS 关闭: ${c} ${r}`); resolve(); });
      this._ws.on('error', e => { log('error', 'WS 错误:', e.message); reject(e); });
    });
  }

  // ──── HTTP 轮询兜底（WebSocket 不可靠时用）───
  async pollNotifications() {
    try {
      const notifs = await this.api.post('i/notifications', { limit: 10 });
      if (!Array.isArray(notifs)) return;
      for (const n of notifs) {
        if (!['mention', 'reply', 'message'].includes(n.type)) continue;
        await this.handleNotif(n);
      }
    } catch (e) { log('warn', '轮询通知失败:', e.message); }
  }

  async pollLocalTimeline() {
    try {
      const notes = await this.api.post('notes/local-timeline', { limit: 10 });
      if (!Array.isArray(notes)) return;
      for (const note of notes) {
        await this.onTimeline(note);
      }
    } catch (e) { log('warn', '轮询本地TL失败:', e.message); }
  }

  async pollGlobalTimeline() {
    try {
      const notes = await this.api.post('notes/global-timeline', { limit: 10 });
      if (!Array.isArray(notes)) return;
      for (const note of notes) {
        await this.onTimeline(note);
      }
    } catch (e) { log('warn', '轮询全局TL失败:', e.message); }
  }

  startPolling() {
    const interval = 15000; // 15秒轮询一次
    log('info', '🔄 启动 HTTP 轮询 (每15秒)');
    if (this.cfg.bot.enable_notifications) {
      this._pollTimers.push(setInterval(() => this.pollNotifications(), interval));
    }
    if (this.cfg.bot.enable_local_timeline) {
      this._pollTimers.push(setInterval(() => this.pollLocalTimeline(), interval));
    }
    if (this.cfg.bot.enable_global_timeline) {
      this._pollTimers.push(setInterval(() => this.pollGlobalTimeline(), interval));
    }
  }

  async shutdown() { this._on = false; if (this._ws) this._ws.close(); this._pollTimers.forEach(t => clearInterval(t)); }
  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

// ═══════════════════════════════════════════
//  入口
// ═══════════════════════════════════════════
async function main() {
  const cfg = loadConfig();
  logLevel = LEVELS[cfg.bot.log_level] ?? 1;

  // 启动时打印解析后的关键配置
  log('info', '═══════════════════════════════════════');
  log('info', '  Misskey-LLM-Bot  启动中...');
  log('info', '  By Syskuku_雪音詩絵');
  log('info', '═══════════════════════════════════════');
  log('debug', 'parsed bot config:', JSON.stringify(cfg.bot, null, 2));

  const bot = new Bot(cfg);
  process.on('SIGINT',  () => bot.shutdown().then(() => process.exit(0)));
  process.on('SIGTERM', () => bot.shutdown().then(() => process.exit(0)));
  await bot.run();
}

main().catch(e => { log('error', '致命:', e); process.exit(1); });
