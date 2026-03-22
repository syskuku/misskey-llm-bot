# Misskey-LLM-Bot 🤖

[![GitHub stars](https://img.shields.io/github/stars/syskuku/misskey-llm-bot?style=social)](https://github.com/syskuku/misskey-llm-bot/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/syskuku/misskey-llm-bot)](https://github.com/syskuku/misskey-llm-bot/releases)
[![License](https://img.shields.io/github/license/syskuku/misskey-llm-bot)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

**[简体中文](README.md)** | **[繁體中文](README_zh-TW.md)** | **[日本語](README_ja.md)** | **English**

> **One command to deploy. Add an AI companion to your Misskey instance.**
>
> 🌐 **Live Demo: [hub.imikufans.com](https://hub.imikufans.com)** — Say hi to @subot!

Real-time timeline and notification monitoring via WebSocket, powered by LLM smart replies. Supports all OpenAI-compatible APIs including NVIDIA NIM / OpenAI / DeepSeek / Ollama.

> **By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro**
> 🌐 [www.imikufans.com](http://www.imikufans.com) · 📺 [Bilibili](https://space.bilibili.com/473348127) · 💻 [GitHub](https://github.com/syskuku/)
>
> Syskuku is a high school student preparing for college entrance exams. Updates may be slow, but wishing me 560+ in 2026 would mean a lot!

---

## ✨ Screenshots

| Casual Chat | Community Chat |
|:---:|:---:|
| ![demo1](screenshots/demo1.jpg) | ![demo2](screenshots/demo2.jpg) |
| ![demo3](screenshots/demo3.jpg) | ![demo4](screenshots/demo4.jpg) |

---

## 🚀 Why Choose This

| | |
|---|---|
| **One-command deploy** | `sudo bash deploy.sh` auto-installs Node.js, creates user, configures systemd — ready out of the box |
| **Multi-model support** | OpenAI format compatible — swap between NVIDIA NIM / OpenAI / DeepSeek / Ollama freely |
| **Anti-spam design** | Cooldown + reply interval + probability control — no ten replies to one message |
| **MFM effects** | Random spin / bounce / rainbow — replies come with Misskey flair |
| **Persona customization** | Change personality by editing a few lines in `config.yaml` — no code changes needed |
| **Security hardened** | systemd sandbox + dedicated user + read-only filesystem |

---

## Features

| Feature | Description |
|---------|-------------|
| 🎯 Dual reply modes | `mention` mode: reply to all @mentions; `all` mode: random replies to timeline based on probability |
| 💬 Direct message support | Auto-detects and replies to DMs |
| 🛡️ Self-reply prevention | Automatically skips your own posts |
| ⏱️ Reply interval | Reply once every N posts to avoid consecutive replies |
| ❄️ Cooldown mechanism | Prevents repeated replies to the same user within the cooldown period |
| 🎨 MFM effects | Randomly applies spin / bounce / rainbow and other Misskey effects |
| ⏰ Scheduled greetings | Timed greeting posts to keep the community active |
| 🔧 Config-only management | All parameters managed via `config.yaml` — no code changes needed |
| 🧠 LLM integration | OpenAI format compatible — supports NVIDIA NIM / OpenAI / DeepSeek / Ollama and more |

---

## Quick Install

### Requirements

- Ubuntu 20.04 / 22.04 / 24.04 (other Linux distros work too)
- Node.js >= 16
- Network access to your Misskey instance

### 3 Steps to Get Started

**1. Clone the repo**

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
```

**2. Edit config**

```bash
cp config.yaml.example config.yaml
nano config.yaml
```

Three values must be filled in:

```yaml
misskey:
  host: "https://your-misskey-instance.com"
  token: "your-api-token"          # Settings → API → Generate token

llm:
  api_key: "your-llm-api-key"      # See instructions below
```

**3. One-command deploy**

```bash
sudo bash deploy.sh
```

When you see `机器人已验证: @xxx` (Bot verified), you're all set!

---

## NVIDIA Model Access (Default & Recommended)

This bot uses NVIDIA NIM by default. **Free quota available — just register and go.**

1. Visit [build.nvidia.com](https://build.nvidia.com/) and sign up
2. Click your profile (top-right) → **API Keys** → **Generate API Key**
3. Copy the key and paste it into `config.yaml`

```yaml
llm:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: "nvapi-your-key"
  model: "minimaxai/minimax-m2.1"    # Default model, excellent for Chinese
```

### Recommended Models

| Model | Description | Free Quota |
|-------|-------------|------------|
| `minimaxai/minimax-m2.1` | Default recommendation, excellent Chinese | ✅ |
| `meta/llama-3.1-405b-instruct` | Ultra-large model, highly capable | ✅ |
| `meta/llama-3.1-70b-instruct` | Balanced choice | ✅ |
| `qwen/qwen2.5-72b-instruct` | Excellent Chinese | ✅ |

### Other Compatible APIs

```yaml
# OpenAI official
llm:
  base_url: "https://api.openai.com/v1"
  api_key: "sk-..."
  model: "gpt-4o-mini"

# DeepSeek
llm:
  base_url: "https://api.deepseek.com/v1"
  api_key: "sk-..."
  model: "deepseek-chat"

# Local Ollama
llm:
  base_url: "http://localhost:11434/v1"
  api_key: "ollama"
  model: "qwen2.5:7b"
```

---

## Configuration

All settings are in `config.yaml`. Changes take effect after restart:

```bash
sudo systemctl restart misskey-llm-bot
```

<details>
<summary>📋 Full configuration options (click to expand)</summary>

### misskey

| Field | Description | Default |
|-------|-------------|---------|
| `host` | Misskey instance URL | - |
| `token` | API token | - |

### llm

| Field | Description | Default |
|-------|-------------|---------|
| `base_url` | OpenAI-compatible API URL | `https://integrate.api.nvidia.com/v1` |
| `api_key` | API key | - |
| `model` | Model name | `minimaxai/minimax-m2.1` |
| `max_tokens` | Max generation tokens | `512` |
| `temperature` | Temperature (0~2) | `0.8` |
| `system_prompt` | Custom system prompt (leave empty to use persona) | `""` |

### bot

| Field | Description | Default |
|-------|-------------|---------|
| `reply_mode` | `mention` or `all` | `mention` |
| `all_reply_probability` | Probability of replying without @ in all mode | `0.2` |
| `reply_interval` | Seconds to wait before replying | `3` |
| `skip_notes` | Skip N posts before replying (0 = no skip) | `0` |
| `cooldown_seconds` | Cooldown per user in seconds | `10` |
| `max_reply_length` | Max reply length (characters) | `150` |
| `mfm_chance` | MFM effect trigger probability | `0.3` |
| `auto_greeting` | Enable scheduled greetings | `true` |
| `greeting_chances` | Scheduled greeting times | `["09:00","12:00","18:00","22:00"]` |
| `enable_local_timeline` | Monitor local timeline | `true` |
| `enable_global_timeline` | Monitor global timeline | `true` |
| `enable_notifications` | Monitor notifications | `true` |
| `log_level` | Log level | `info` |

### persona

| Field | Description | Default |
|-------|-------------|---------|
| `name` | Persona name | `雪音酱` |
| `description` | Persona description | `SYSKUKU's pet girl...` |
| `style` | Reply style | `Concise and fun replies...` |

</details>

---

## Service Management

```bash
# Start / Stop / Restart
sudo systemctl start misskey-llm-bot
sudo systemctl stop misskey-llm-bot
sudo systemctl restart misskey-llm-bot

# Check status & logs
sudo systemctl status misskey-llm-bot
sudo journalctl -u misskey-llm-bot -f
```

<details>
<summary>🔧 Manual deploy & systemd details (click to expand)</summary>

### Without deploy script

```bash
cd misskey-llm-bot
cp config.yaml.example config.yaml
nano config.yaml
npm install
npm start
```

### Manual systemd service install

```bash
sudo cp misskey-llm-bot.service /etc/systemd/system/
which node   # confirm node path
sudo systemctl daemon-reload
sudo systemctl enable --now misskey-llm-bot
```

### Service security hardening

```ini
[Service]
User=misskey-bot          # Dedicated user
Restart=always            # Auto-restart on crash
NoNewPrivileges=true      # Prevent privilege escalation
ProtectSystem=strict      # Read-only filesystem
ProtectHome=true          # Isolate /home
PrivateTmp=true           # Isolated /tmp
```

</details>

---

## FAQ

**Q: Bot not replying?**
Check logs: `sudo journalctl -u misskey-llm-bot -f`. Verify token permissions and network connectivity.

**Q: How to switch models?**
Update `llm.model` and `llm.base_url` in `config.yaml`, then run `sudo systemctl restart misskey-llm-bot`.

**Q: Too many / too few replies?**
Adjust `all_reply_probability` (probability) and `cooldown_seconds` (cooldown).

---

## Project Structure

```
misskey-llm-bot/
├── index.js                  # Main program
├── config.yaml.example       # Config template
├── package.json              # npm config
├── deploy.sh                 # One-command deploy script
├── misskey-llm-bot.service   # systemd service file
└── README.md
```

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=syskuku/misskey-llm-bot&type=Date)](https://star-history.com/#syskuku/misskey-llm-bot&Date)

---

## License

MIT License

---

**By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro** · [www.imikufans.com](https://www.imikufans.com)
