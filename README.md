# Misskey-LLM-Bot 🤖

Misskey 大模型自动回复机器人，通过 WebSocket 实时监听时间线与通知，接入大模型智能回复。

> **By Syskuku_雪音詩絵**
> 🌐 www.imikufans.com
> 📺 [哔哩哔哩](https://space.bilibili.com/473348127)
> 💻 [GitHub](https://github.com/syskuku/)
>
> Syskuku 是一名准备高考的高中生，平时没什么时间更新，但能请你祝我 2026 年考到 560+ 咩~

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

## 系统要求

- Ubuntu 20.04 / 22.04 / 24.04（其他 Linux 发行版也行）
- Node.js >= 16
- 能访问你 Misskey 实例的网络

---

## 快速安装

### 第一步：下载项目

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
```

或者直接下载源码包解压。

### 第二步：编辑配置

```bash
cp config.yaml.example config.yaml
nano config.yaml
```

**必须填写的三个值：**

```yaml
misskey:
  host: "https://你的misskey实例地址"
  token: "你的API令牌"

llm:
  api_key: "你的大模型API Key"
```

#### 获取 Misskey API 令牌

1. 登录你的 Misskey 实例
2. 进入 **设置 → API**
3. 点击 **生成令牌**
4. 勾选权限：`read:account` / `write:notes` / `read:notifications`
5. 复制生成的令牌填入 `config.yaml` 的 `misskey.token`

#### 获取 NVIDIA API Key

详见下方 [NVIDIA 模型接入指南](#nvidia-模型接入指南)。

### 第三步：运行部署脚本

```bash
sudo bash deploy.sh
```

部署脚本会自动完成：
1. 安装 Node.js（如果没有）
2. 创建系统用户 `misskey-bot`
3. 部署文件到 `/opt/misskey-llm-bot`
4. 安装 npm 依赖
5. 配置 systemd 自启动服务
6. 询问是否立即启动

### 第四步：启动 & 查看日志

```bash
# 启动
sudo systemctl start misskey-llm-bot

# 查看状态
sudo systemctl status misskey-llm-bot

# 实时查看日志
sudo journalctl -u misskey-llm-bot -f
```

看到 `机器人已验证: @xxx` 就说明连接成功了！

---

## NVIDIA 模型接入指南

本机器人默认使用 NVIDIA NIM 平台的大模型服务，通过 OpenAI 兼容格式接入。

### 1. 注册 NVIDIA 账号

访问 [build.nvidia.com](https://build.nvidia.com/) 注册并登录。

### 2. 获取 API Key

1. 点击右上角头像 → **API Keys**
2. 点击 **Generate API Key**
3. 复制 Key（格式类似 `nvapi-xxxxxxxxxxxx`）

### 3. 选择模型

NVIDIA NIM 提供多种免费和付费模型，在 `config.yaml` 中配置：

```yaml
llm:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: "nvapi-你的key"
  model: "minimaxai/minimax-m2.1"    # 默认模型
```

#### 推荐模型

| 模型 | 说明 | 免费额度 |
|------|------|---------|
| `minimaxai/minimax-m2.1` | 默认推荐，中文优秀 | 有 |
| `meta/llama-3.1-405b-instruct` | 超大模型，能力强 | 有 |
| `meta/llama-3.1-70b-instruct` | 平衡之选 | 有 |
| `qwen/qwen2.5-72b-instruct` | 中文出色 | 有 |

#### 切换模型

只需修改 `config.yaml` 中的 `model` 字段，然后重启：

```bash
sudo systemctl restart misskey-llm-bot
```

### 4. 其他兼容接口

只要是 OpenAI 兼容格式的 API 都能用：

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

## systemd 自启配置

部署脚本已自动配置，你也可以手动管理：

### 服务管理命令

```bash
# 启动
sudo systemctl start misskey-llm-bot

# 停止
sudo systemctl stop misskey-llm-bot

# 重启（修改配置后）
sudo systemctl restart misskey-llm-bot

# 查看状态
sudo systemctl status misskey-llm-bot

# 开机自启
sudo systemctl enable misskey-llm-bot

# 取消自启
sudo systemctl disable misskey-llm-bot
```

### 查看日志

```bash
# 实时日志
sudo journalctl -u misskey-llm-bot -f

# 最近 100 行
sudo journalctl -u misskey-llm-bot -n 100

# 今天的日志
sudo journalctl -u misskey-llm-bot --since today
```

### 手动安装 systemd 服务

如果不用部署脚本，可以手动操作：

```bash
# 复制服务文件
sudo cp misskey-llm-bot.service /etc/systemd/system/

# 修改 ExecStart 中的 node 路径（如果不在 /usr/bin/node）
which node   # 查看实际路径

# 重载并启用
sudo systemctl daemon-reload
sudo systemctl enable misskey-llm-bot
sudo systemctl start misskey-llm-bot
```

### 服务文件说明

```ini
[Service]
User=misskey-bot          # 以独立用户运行（安全）
Restart=always            # 崩溃自动重启
RestartSec=10             # 重启间隔 10 秒
NoNewPrivileges=true      # 禁止提权
ProtectSystem=strict      # 只读文件系统
ProtectHome=true          # 不能访问 /home
PrivateTmp=true           # 独立 /tmp
```

---

## 配置详解

所有配置在 `config.yaml` 中，改完 `sudo systemctl restart misskey-llm-bot` 即可生效。

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
| `temperature` | 温度 | `0.8` |
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

---

## 项目结构

```
misskey-llm-bot/
├── index.js                  # 主程序
├── config.yaml.example       # 配置示例
├── config.yaml               # 你的配置（需手动创建）
├── package.json              # npm 配置
├── deploy.sh                 # 一键部署脚本
├── misskey-llm-bot.service   # systemd 服务文件
└── README.md                 # 本文件
```

---

## 手动运行（不用部署脚本）

```bash
cd misskey-llm-bot
cp config.yaml.example config.yaml
nano config.yaml          # 填写配置
npm install
npm start
```

---

## 常见问题

### Q: 提示 "config.yaml 不存在"

```bash
cp config.yaml.example config.yaml
# 然后编辑 config.yaml 填写配置
```

### Q: 机器人不回复

1. 检查日志：`sudo journalctl -u misskey-llm-bot -f`
2. 确认 Misskey token 权限正确
3. 确认 `bot.username` 和 Misskey 用户名一致（或留空自动检测）
4. 确认网络能访问 Misskey 实例和大模型 API

### Q: 如何切换模型

编辑 `config.yaml` 修改 `llm.model` 和 `llm.base_url`，然后：

```bash
sudo systemctl restart misskey-llm-bot
```

### Q: 如何修改回复人格

编辑 `config.yaml` 的 `persona` 部分，或者直接填写 `llm.system_prompt`（会覆盖 persona）。

### Q: 太频繁 / 太冷淡

调整 `all_reply_probability`（概率）和 `cooldown_seconds`（冷却）。

---

## 开源协议

MIT License

---

**By Syskuku_雪音詩絵** · [www.imikufans.com](https://www.imikufans.com)
