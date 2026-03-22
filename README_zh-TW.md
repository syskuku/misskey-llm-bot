# Misskey-LLM-Bot 🤖

[![GitHub stars](https://img.shields.io/github/stars/syskuku/misskey-llm-bot?style=social)](https://github.com/syskuku/misskey-llm-bot/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/syskuku/misskey-llm-bot)](https://github.com/syskuku/misskey-llm-bot/releases)
[![License](https://img.shields.io/github/license/syskuku/misskey-llm-bot)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

**[简体中文](README.md)** | **繁體中文** | **[日本語](README_ja.md)** | **[English](README_en.md)**

> **一行部署，為你的 Misskey 實例加上 AI 小夥伴。**
>
> 🌐 **線上體驗：[hub.imikufans.com](https://hub.imikufans.com)** — 去 @subot 打個招呼吧！

透過 WebSocket 即時監聽時間軸與通知，接入大模型智慧回覆。支援 NVIDIA NIM / OpenAI / DeepSeek / Ollama 等所有 OpenAI 相容介面。

> **By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro**
> 🌐 [www.imikufans.com](http://www.imikufans.com) · 📺 [嗶哩嗶哩](https://space.bilibili.com/473348127) · 💻 [GitHub](https://github.com/syskuku/)
>
> Syskuku 是一名準備高考的高中生，平時沒什麼時間更新，但能請你祝我 2026 年考到 560+ 咩~

---

## ✨ 效果展示

| 日常互動 | 社群聊天 |
|:---:|:---:|
| ![demo1](screenshots/demo1.jpg) | ![demo2](screenshots/demo2.jpg) |
| ![demo3](screenshots/demo3.jpg) | ![demo4](screenshots/demo4.jpg) |

---

## 🚀 為什麼選這個

| | |
|---|---|
| **一行部署** | `sudo bash deploy.sh` 自動安裝 Node.js、建立使用者、設定 systemd，開箱即用 |
| **多模型支援** | 相容 OpenAI 格式，NVIDIA NIM / OpenAI / DeepSeek / Ollama 隨便換 |
| **防洗版設計** | 冷卻機制 + 間隔回覆 + 機率控制，不會一則訊息回十遍 |
| **MFM 特效** | 隨機 spin / bounce / rainbow，回覆自帶 Misskey 風格 |
| **人格定制** | config.yaml 改幾行字就能換個性格，無需改程式碼 |
| **安全加固** | systemd 沙箱 + 獨立使用者 + 唯讀檔案系統 |

---

## 功能特性

| 功能 | 說明 |
|------|------|
| 🎯 雙模式回覆 | `mention` 模式：@機器人的貼文全部回覆；`all` 模式：按機率隨機回覆時間軸 |
| 💬 私聊支援 | 自動辨識私訊並回覆 |
| 🛡️ 防自回覆 | 自動跳過自己發出的貼文 |
| ⏱️ 間隔回覆 | 間隔 N 則貼文回覆一次，避免連續回覆 |
| ❄️ 冷卻機制 | 同一使用者冷卻期內不重複回覆，防止洗版 |
| 🎨 MFM 特效 | 隨機使用 spin / bounce / rainbow 等 Misskey 特效 |
| ⏰ 定時問候 | 定時發送問候貼文鼓勵大家活躍 |
| 🔧 純配置管理 | 所有參數透過 `config.yaml` 配置，無需改程式碼 |
| 🧠 大模型接入 | 相容 OpenAI 格式，支援 NVIDIA NIM / OpenAI / DeepSeek / Ollama 等 |

---

## 快速安裝

### 系統需求

- Ubuntu 20.04 / 22.04 / 24.04（其他 Linux 發行版也行）
- Node.js >= 16
- 能存取你 Misskey 實例的網路

### 三步搞定

**1. 下載專案**

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
```

**2. 編輯配置**

```bash
cp config.yaml.example config.yaml
nano config.yaml
```

必須填寫的三個值：

```yaml
misskey:
  host: "https://你的misskey實例位址"
  token: "你的API權杖"          # 設定 → API → 產生權杖

llm:
  api_key: "你的大模型API Key"   # 見下方取得方式
```

**3. 一鍵部署**

```bash
sudo bash deploy.sh
```

看到 `機器人已驗證: @xxx` 就成功了！

---

## NVIDIA 模型接入（預設推薦）

本機器人預設使用 NVIDIA NIM，**有免費額度，註冊就能用。**

1. 前往 [build.nvidia.com](https://build.nvidia.com/) 註冊
2. 右上角頭像 → **API Keys** → **Generate API Key**
3. 複製 Key 填入 `config.yaml`

```yaml
llm:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: "nvapi-你的key"
  model: "minimaxai/minimax-m2.1"    # 預設模型，中文優秀
```

### 推薦模型

| 模型 | 說明 | 免費額度 |
|------|------|---------|
| `minimaxai/minimax-m2.1` | 預設推薦，中文優秀 | ✅ |
| `meta/llama-3.1-405b-instruct` | 超大模型，能力強 | ✅ |
| `meta/llama-3.1-70b-instruct` | 平衡之選 | ✅ |
| `qwen/qwen2.5-72b-instruct` | 中文出色 | ✅ |

### 其他相容介面

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

# 本機 Ollama
llm:
  base_url: "http://localhost:11434/v1"
  api_key: "ollama"
  model: "qwen2.5:7b"
```

---

## 配置詳解

所有配置在 `config.yaml` 中，改完重啟即可生效：

```bash
sudo systemctl restart misskey-llm-bot
```

<details>
<summary>📋 完整配置項（點擊展開）</summary>

### misskey

| 欄位 | 說明 | 預設值 |
|------|------|--------|
| `host` | Misskey 實例位址 | - |
| `token` | API 權杖 | - |

### llm

| 欄位 | 說明 | 預設值 |
|------|------|--------|
| `base_url` | OpenAI 相容 API 位址 | `https://integrate.api.nvidia.com/v1` |
| `api_key` | API Key | - |
| `model` | 模型名稱 | `minimaxai/minimax-m2.1` |
| `max_tokens` | 最大產生 token | `512` |
| `temperature` | 溫度（0~2） | `0.8` |
| `system_prompt` | 自訂系統提示詞（留空使用 persona） | `""` |

### bot

| 欄位 | 說明 | 預設值 |
|------|------|--------|
| `reply_mode` | `mention` 或 `all` | `mention` |
| `all_reply_probability` | all 模式免@回覆機率 | `0.2` |
| `reply_interval` | 收到訊息後等待幾秒回覆 | `3` |
| `skip_notes` | 間隔幾則貼文回覆一次（0=不間隔） | `0` |
| `cooldown_seconds` | 同一使用者冷卻秒數 | `10` |
| `max_reply_length` | 最大回覆字數 | `150` |
| `mfm_chance` | MFM 特效觸發機率 | `0.3` |
| `auto_greeting` | 定時問候開關 | `true` |
| `greeting_chances` | 定時問候時間點 | `["09:00","12:00","18:00","22:00"]` |
| `enable_local_timeline` | 監聽本地時間軸 | `true` |
| `enable_global_timeline` | 監聽全域時間軸 | `true` |
| `enable_notifications` | 監聽通知 | `true` |
| `log_level` | 日誌層級 | `info` |

### persona

| 欄位 | 說明 | 預設值 |
|------|------|--------|
| `name` | 人格名稱 | `雪音醬` |
| `description` | 人格描述 | `SYSKUKU 的寵物女孩...` |
| `style` | 回覆風格 | `回覆簡潔有趣...` |

</details>

---

## 服務管理

```bash
# 啟動 / 停止 / 重啟
sudo systemctl start misskey-llm-bot
sudo systemctl stop misskey-llm-bot
sudo systemctl restart misskey-llm-bot

# 檢視狀態 & 日誌
sudo systemctl status misskey-llm-bot
sudo journalctl -u misskey-llm-bot -f
```

<details>
<summary>🔧 手動部署 & systemd 詳情（點擊展開）</summary>

### 不用部署腳本

```bash
cd misskey-llm-bot
cp config.yaml.example config.yaml
nano config.yaml
npm install
npm start
```

### 手動安裝 systemd 服務

```bash
sudo cp misskey-llm-bot.service /etc/systemd/system/
which node   # 確認 node 路徑
sudo systemctl daemon-reload
sudo systemctl enable --now misskey-llm-bot
```

### 服務安全加固

```ini
[Service]
User=misskey-bot          # 獨立使用者
Restart=always            # 崩潰自動重啟
NoNewPrivileges=true      # 禁止提權
ProtectSystem=strict      # 唯讀檔案系統
ProtectHome=true          # 隔離 /home
PrivateTmp=true           # 獨立 /tmp
```

</details>

---

## 常見問題

**Q: 機器人不回覆？**
檢查日誌 `sudo journalctl -u misskey-llm-bot -f`，確認 token 權限和網路。

**Q: 如何切換模型？**
改 `config.yaml` 的 `llm.model` + `llm.base_url`，然後 `sudo systemctl restart misskey-llm-bot`。

**Q: 太頻繁 / 太冷淡？**
調 `all_reply_probability`（機率）和 `cooldown_seconds`（冷卻）。

---

## 專案結構

```
misskey-llm-bot/
├── index.js                  # 主程式
├── config.yaml.example       # 配置範例
├── package.json              # npm 配置
├── deploy.sh                 # 一鍵部署腳本
├── misskey-llm-bot.service   # systemd 服務檔案
└── README.md
```

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=syskuku/misskey-llm-bot&type=Date)](https://star-history.com/#syskuku/misskey-llm-bot&Date)

---

## 開源協議

MIT License

---

**By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro** · [www.imikufans.com](https://www.imikufans.com)
