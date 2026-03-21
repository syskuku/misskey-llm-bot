# Misskey-LLM-Bot 🤖

[![GitHub stars](https://img.shields.io/github/stars/syskuku/misskey-llm-bot?style=social)](https://github.com/syskuku/misskey-llm-bot/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/syskuku/misskey-llm-bot)](https://github.com/syskuku/misskey-llm-bot/releases)
[![License](https://img.shields.io/github/license/syskuku/misskey-llm-bot)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

> **一行部署，给你的 Misskey 实例加上 AI 小伙伴。**
>
> 🌐 **在线体验：[hub.imikufans.com](https://hub.imikufans.com)** — 去 @subot 打个招呼吧！

通过 WebSocket 实时监听时间线与通知，接入大模型智能回复。支持 NVIDIA NIM / OpenAI / DeepSeek / Ollama 等所有 OpenAI 兼容接口。

> **By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro**
> 🌐 [www.imikufans.com](http://www.imikufans.com) · 📺 [哔哩哔哩](https://space.bilibili.com/473348127) · 💻 [GitHub](https://github.com/syskuku/)
>
> Syskuku 是一名准备高考的高中生，平时没什么时间更新，但能请你祝我 2026 年考到 560+ 咩~

---

## ✨ 效果展示

| 日常互动 | 社区聊天 |
|:---:|:---:|
| ![demo1](screenshots/demo1.jpg) | ![demo2](screenshots/demo2.jpg) |
| ![demo3](screenshots/demo3.jpg) | ![demo4](screenshots/demo4.jpg) |

---

## 🚀 为什么选这个

| | |
|---|---|
| **一行部署** | `sudo bash deploy.sh` 自动安装 Node.js、创建用户、配置 systemd，开箱即用 |
| **多模型支持** | 兼容 OpenAI 格式，NVIDIA NIM / OpenAI / DeepSeek / Ollama 随便换 |
| **防刷屏设计** | 冷却机制 + 间隔回复 + 概率控制，不会一条消息回十遍 |
| **MFM 特效** | 随机 spin / bounce / rainbow，回复自带 Misskey 风格 |
| **人格定制** | config.yaml 改几行字就能换个性格，无需改代码 |
| **安全加固** | systemd 沙箱 + 独立用户 + 只读文件系统 |

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🎯 双模式回复 | `mention` 模式：@机器人的帖子全部回复；`all` 模式：按概率随机回复时间线 |
| 💬 私聊支持 | 自动识别私信并回复 |
| 🛡️ 防自回复 | 自动跳过自己发出的帖子 |
| ⏱️ 间隔回复 | 间隔 N 条帖子回复一次，避免连续回复 |
| ❄️ 冷却机制 | 同一用户冷却期内不重复回复，防止刷屏 |
| 🎨 MFM 特效 | 随机使用 spin / bounce / rainbow 等 Misskey 特效 |
| ⏰ 定时问候 | 定时发送问候帖鼓励大家活跃 |
| 🔧 纯配置管理 | 所有参数通过 `config.yaml` 配置，无需改代码 |
| 🧠 大模型接入 | 兼容 OpenAI 格式，支持 NVIDIA NIM / OpenAI / DeepSeek / Ollama 等 |

---

## 快速安装

### 系统要求

- Ubuntu 20.04 / 22.04 / 24.04（其他 Linux 发行版也行）
- Node.js >= 16
- 能访问你 Misskey 实例的网络

### 三步搞定

**1. 下载项目**

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
```

**2. 编辑配置**

```bash
cp config.yaml.example config.yaml
nano config.yaml
```

必须填写的三个值：

```yaml
misskey:
  host: "https://你的misskey实例地址"
  token: "你的API令牌"          # 设置 → API → 生成令牌

llm:
  api_key: "你的大模型API Key"   # 见下方获取方式
```

**3. 一键部署**

```bash
sudo bash deploy.sh
```

看到 `机器人已验证: @xxx` 就成功了！

---

## NVIDIA 模型接入（默认推荐）

本机器人默认使用 NVIDIA NIM，**有免费额度，注册就能用。**

1. 访问 [build.nvidia.com](https://build.nvidia.com/) 注册
2. 右上角头像 → **API Keys** → **Generate API Key**
3. 复制 Key 填入 `config.yaml`

```yaml
llm:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: "nvapi-你的key"
  model: "minimaxai/minimax-m2.1"    # 默认模型，中文优秀
```

### 推荐模型

| 模型 | 说明 | 免费额度 |
|------|------|---------|
| `minimaxai/minimax-m2.1` | 默认推荐，中文优秀 | ✅ |
| `meta/llama-3.1-405b-instruct` | 超大模型，能力强 | ✅ |
| `meta/llama-3.1-70b-instruct` | 平衡之选 | ✅ |
| `qwen/qwen2.5-72b-instruct` | 中文出色 | ✅ |

### 其他兼容接口

```yaml
# OpenAI 官方
llm:
  base_url: "https://api.openai.com/v1"
  api_key: "sk-..."
  model: "gpt-4o-mini"

# DeepSeek
llm:
  base_url: "https://api.deepseek.com/v1"
  api_key: "sk-..."
  model: "deepseek-chat"

# 本地 Ollama
llm:
  base_url: "http://localhost:11434/v1"
  api_key: "ollama"
  model: "qwen2.5:7b"
```

---

## 配置详解

所有配置在 `config.yaml` 中，改完重启即可生效：

```bash
sudo systemctl restart misskey-llm-bot
```

<details>
<summary>📋 完整配置项（点击展开）</summary>

### misskey

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `host` | Misskey 实例地址 | - |
| `token` | API 令牌 | - |

### llm

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `base_url` | OpenAI 兼容 API 地址 | `https://integrate.api.nvidia.com/v1` |
| `api_key` | API Key | - |
| `model` | 模型名称 | `minimaxai/minimax-m2.1` |
| `max_tokens` | 最大生成 token | `512` |
| `temperature` | 温度（0~2） | `0.8` |
| `system_prompt` | 自定义系统提示词（留空使用 persona） | `""` |

### bot

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `reply_mode` | `mention` 或 `all` | `mention` |
| `all_reply_probability` | all 模式免@回复概率 | `0.2` |
| `reply_interval` | 收到消息后等待几秒回复 | `3` |
| `skip_notes` | 间隔几条帖子回复一次（0=不间隔） | `0` |
| `cooldown_seconds` | 同一用户冷却秒数 | `10` |
| `max_reply_length` | 最大回复字数 | `150` |
| `mfm_chance` | MFM 特效触发概率 | `0.3` |
| `auto_greeting` | 定时问候开关 | `true` |
| `greeting_chances` | 定时问候时间点 | `["09:00","12:00","18:00","22:00"]` |
| `enable_local_timeline` | 监听本地时间线 | `true` |
| `enable_global_timeline` | 监听全局时间线 | `true` |
| `enable_notifications` | 监听通知 | `true` |
| `log_level` | 日志级别 | `info` |

### persona

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `name` | 人格名称 | `雪音酱` |
| `description` | 人格描述 | `SYSKUKU 的宠物女孩...` |
| `style` | 回复风格 | `回复简洁有趣...` |

</details>

---

## 服务管理

```bash
# 启动 / 停止 / 重启
sudo systemctl start misskey-llm-bot
sudo systemctl stop misskey-llm-bot
sudo systemctl restart misskey-llm-bot

# 查看状态 & 日志
sudo systemctl status misskey-llm-bot
sudo journalctl -u misskey-llm-bot -f
```

<details>
<summary>🔧 手动部署 & systemd 详情（点击展开）</summary>

### 不用部署脚本

```bash
cd misskey-llm-bot
cp config.yaml.example config.yaml
nano config.yaml
npm install
npm start
```

### 手动安装 systemd 服务

```bash
sudo cp misskey-llm-bot.service /etc/systemd/system/
which node   # 确认 node 路径
sudo systemctl daemon-reload
sudo systemctl enable --now misskey-llm-bot
```

### 服务安全加固

```ini
[Service]
User=misskey-bot          # 独立用户
Restart=always            # 崩溃自动重启
NoNewPrivileges=true      # 禁止提权
ProtectSystem=strict      # 只读文件系统
ProtectHome=true          # 隔离 /home
PrivateTmp=true           # 独立 /tmp
```

</details>

---

## 常见问题

**Q: 机器人不回复？**
检查日志 `sudo journalctl -u misskey-llm-bot -f`，确认 token 权限和网络。

**Q: 如何切换模型？**
改 `config.yaml` 的 `llm.model` + `llm.base_url`，然后 `sudo systemctl restart misskey-llm-bot`。

**Q: 太频繁 / 太冷淡？**
调 `all_reply_probability`（概率）和 `cooldown_seconds`（冷却）。

---

## 项目结构

```
misskey-llm-bot/
├── index.js                  # 主程序
├── config.yaml.example       # 配置示例
├── package.json              # npm 配置
├── deploy.sh                 # 一键部署脚本
├── misskey-llm-bot.service   # systemd 服务文件
└── README.md
```

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=syskuku/misskey-llm-bot&type=Date)](https://star-history.com/#syskuku/misskey-llm-bot&Date)

---

## 开源协议

MIT License

---

**By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro** · [www.imikufans.com](https://www.imikufans.com)
