# Misskey-LLM-Bot 🤖

[![GitHub stars](https://img.shields.io/github/stars/syskuku/misskey-llm-bot?style=social)](https://github.com/syskuku/misskey-llm-bot/stargazers)
[![GitHub release](https://img.shields.io/github/v/release/syskuku/misskey-llm-bot)](https://github.com/syskuku/misskey-llm-bot/releases)
[![License](https://img.shields.io/github/license/syskuku/misskey-llm-bot)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

**[简体中文](README.md)** | **[繁體中文](README_zh-TW.md)** | **日本語** | **[English](README_en.md)**

> **ワンコマンドでデプロイ。Misskey インスタンスに AI バディを追加しよう。**
>
> 🌐 **デモ：[hub.imikufans.com](https://hub.imikufans.com)** — @subot に挨拶してみてね！

WebSocket でタイムラインと通知をリアルタイムに監視し、大規模言語モデル（LLM）によるスマート返信を実現。NVIDIA NIM / OpenAI / DeepSeek / Ollama など、すべての OpenAI 互換インターフェースに対応。

> **By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro**
> 🌐 [www.imikufans.com](http://www.imikufans.com) · 📺 [ビリビリ](https://space.bilibili.com/473348127) · 💻 [GitHub](https://github.com/syskuku/)
>
> Syskuku は大学受験を控えた高校生です。更新はあまりできませんが、2026年の受験で560点以上取れるように応援してください！

---

## ✨ デモ

| 日常会話 | コミュニティチャット |
|:---:|:---:|
| ![demo1](screenshots/demo1.jpg) | ![demo2](screenshots/demo2.jpg) |
| ![demo3](screenshots/demo3.jpg) | ![demo4](screenshots/demo4.jpg) |

---

## 🚀 このプロジェクトの特徴

| | |
|---|---|
| **ワンコマンドデプロイ** | `sudo bash deploy.sh` で Node.js のインストール、ユーザー作成、systemd 設定を自動実行 |
| **多モデル対応** | OpenAI フォーマット互換。NVIDIA NIM / OpenAI / DeepSeek / Ollama を自由に切り替え可能 |
| **スパム防止設計** | クールダウン + 返信間隔 + 確率制御で、同じメッセージへの連続返信を防止 |
| **MFM エフェクト** | spin / bounce / rainbow をランダムに適用し、Misskey スタイルの返信を実現 |
| **ペルソナカスタマイズ** | config.yaml を数行編集するだけで性格を変更可能。コード変更不要 |
| **セキュリティ強化** | systemd サンドボックス + 専用ユーザー + 読み取り専用ファイルシステム |

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| 🎯 デュアルモード返信 | `mention` モード：メンションされた投稿にすべて返信。`all` モード：確率に基づきタイムラインにランダム返信 |
| 💬 DM 対応 | ダイレクトメッセージを自動検出して返信 |
| 🛡️ 自己返信防止 | 自分が投稿したノートには自動的に返信しない |
| ⏱️ 返信間隔制御 | N 件の投稿ごとに 1 回返信し、連続返信を回避 |
| ❄️ クールダウン | 同一ユーザーへの連続返信を一定時間制限 |
| 🎨 MFM エフェクト | spin / bounce / rainbow などの Misskey エフェクトをランダムに使用 |
| ⏰ 定時挨拶 | 指定時間に挨拶を投稿してコミュニティを活性化 |
| 🔧 設定ファイル管理 | すべてのパラメータを `config.yaml` で管理。コード変更不要 |
| 🧠 LLM 統合 | OpenAI フォーマット互換。NVIDIA NIM / OpenAI / DeepSeek / Ollama に対応 |

---

## クイックインストール

### システム要件

- Ubuntu 20.04 / 22.04 / 24.04（他の Linux ディストリビューションでも可）
- Node.js >= 16
- Misskey インスタンスへのネットワークアクセス

### 3 ステップでセットアップ

**1. プロジェクトをクローン**

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
```

**2. 設定を編集**

```bash
cp config.yaml.example config.yaml
nano config.yaml
```

以下の 3 つの値を必ず設定してください：

```yaml
misskey:
  host: "https://your-misskey-instance.com"
  token: "your-api-token"          # 設定 → API → トークンを生成

llm:
  api_key: "your-llm-api-key"      # 下記の取得方法を参照
```

**3. ワンコマンドデプロイ**

```bash
sudo bash deploy.sh
```

`机器人已验证: @xxx`（ボット認証成功）と表示されれば完了です！

---

## NVIDIA モデル接続（デフォルト推奨）

本ボットはデフォルトで NVIDIA NIM を使用します。**無料枠があるので、登録するだけで使えます。**

1. [build.nvidia.com](https://build.nvidia.com/) にアクセスして登録
2. 右上のプロフィール → **API Keys** → **Generate API Key**
3. キーをコピーして `config.yaml` に貼り付け

```yaml
llm:
  base_url: "https://integrate.api.nvidia.com/v1"
  api_key: "nvapi-your-key"
  model: "minimaxai/minimax-m2.1"    # デフォルトモデル。中国語に優秀
```

### 推奨モデル

| モデル | 説明 | 無料枠 |
|--------|------|--------|
| `minimaxai/minimax-m2.1` | デフォルト推奨。中国語に優秀 | ✅ |
| `meta/llama-3.1-405b-instruct` | 超大規模モデル。高性能 | ✅ |
| `meta/llama-3.1-70b-instruct` | バランス型 | ✅ |
| `qwen/qwen2.5-72b-instruct` | 中国語に優秀 | ✅ |

### その他の互換インターフェース

```yaml
# OpenAI 公式
llm:
  base_url: "https://api.openai.com/v1"
  api_key: "sk-..."
  model: "gpt-4o-mini"

# DeepSeek
llm:
  base_url: "https://api.deepseek.com/v1"
  api_key: "sk-..."
  model: "deepseek-chat"

# ローカル Ollama
llm:
  base_url: "http://localhost:11434/v1"
  api_key: "ollama"
  model: "qwen2.5:7b"
```

---

## 設定詳細

すべての設定は `config.yaml` にあります。変更後に再起動で反映されます：

```bash
sudo systemctl restart misskey-llm-bot
```

<details>
<summary>📋 全設定項目（クリックで展開）</summary>

### misskey

| フィールド | 説明 | デフォルト |
|-----------|------|-----------|
| `host` | Misskey インスタンスの URL | - |
| `token` | API トークン | - |

### llm

| フィールド | 説明 | デフォルト |
|-----------|------|-----------|
| `base_url` | OpenAI 互換 API の URL | `https://integrate.api.nvidia.com/v1` |
| `api_key` | API キー | - |
| `model` | モデル名 | `minimaxai/minimax-m2.1` |
| `max_tokens` | 最大生成トークン数 | `512` |
| `temperature` | 温度（0〜2） | `0.8` |
| `system_prompt` | カスタムシステムプロンプト（空欄で persona を使用） | `""` |

### bot

| フィールド | 説明 | デフォルト |
|-----------|------|-----------|
| `reply_mode` | `mention` または `all` | `mention` |
| `all_reply_probability` | all モードでのメンションなし返信確率 | `0.2` |
| `reply_interval` | メッセージ受信後の返信待機秒数 | `3` |
| `skip_notes` | N 件の投稿をスキップしてから返信（0=スキップなし） | `0` |
| `cooldown_seconds` | 同一ユーザーへのクールダウン秒数 | `10` |
| `max_reply_length` | 最大返信文字数 | `150` |
| `mfm_chance` | MFM エフェクト発動確率 | `0.3` |
| `auto_greeting` | 定時挨拶のオン/オフ | `true` |
| `greeting_chances` | 定時挨拶の時刻 | `["09:00","12:00","18:00","22:00"]` |
| `enable_local_timeline` | ローカルタイムラインの監視 | `true` |
| `enable_global_timeline` | グローバルタイムラインの監視 | `true` |
| `enable_notifications` | 通知の監視 | `true` |
| `log_level` | ログレベル | `info` |

### persona

| フィールド | 説明 | デフォルト |
|-----------|------|-----------|
| `name` | ペルソナ名 | `雪音酱` |
| `description` | ペルソナの説明 | `SYSKUKU のペットガール...` |
| `style` | 返信スタイル | `簡潔で面白い返信...` |

</details>

---

## サービス管理

```bash
# 起動 / 停止 / 再起動
sudo systemctl start misskey-llm-bot
sudo systemctl stop misskey-llm-bot
sudo systemctl restart misskey-llm-bot

# ステータス & ログの確認
sudo systemctl status misskey-llm-bot
sudo journalctl -u misskey-llm-bot -f
```

<details>
<summary>🔧 手動デプロイ & systemd 詳細（クリックで展開）</summary>

### デプロイスクリプトを使わない場合

```bash
cd misskey-llm-bot
cp config.yaml.example config.yaml
nano config.yaml
npm install
npm start
```

### systemd サービスの手動インストール

```bash
sudo cp misskey-llm-bot.service /etc/systemd/system/
which node   # node のパスを確認
sudo systemctl daemon-reload
sudo systemctl enable --now misskey-llm-bot
```

### サービスセキュリティ強化

```ini
[Service]
User=misskey-bot          # 専用ユーザー
Restart=always            # クラッシュ時に自動再起動
NoNewPrivileges=true      # 権限昇格を禁止
ProtectSystem=strict      # 読み取り専用ファイルシステム
ProtectHome=true          # /home を隔離
PrivateTmp=true           # 独立した /tmp
```

</details>

---

## よくある質問

**Q: ボットが返信しない？**
ログを確認してください：`sudo journalctl -u misskey-llm-bot -f`。トークンの権限とネットワークを確認してください。

**Q: モデルを切り替えるには？**
`config.yaml` の `llm.model` と `llm.base_url` を変更し、`sudo systemctl restart misskey-llm-bot` を実行してください。

**Q: 返信が多すぎる / 少なすぎる？**
`all_reply_probability`（確率）と `cooldown_seconds`（クールダウン）を調整してください。

---

## プロジェクト構成

```
misskey-llm-bot/
├── index.js                  # メインプログラム
├── config.yaml.example       # 設定サンプル
├── package.json              # npm 設定
├── deploy.sh                 # ワンコマンドデプロイスクリプト
├── misskey-llm-bot.service   # systemd サービスファイル
└── README.md
```

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=syskuku/misskey-llm-bot&type=Date)](https://star-history.com/#syskuku/misskey-llm-bot&Date)

---

## ライセンス

MIT License

---

**By Syskuku_雪音詩絵 & Xiaomi MiMo V2 Pro** · [www.imikufans.com](https://www.imikufans.com)
