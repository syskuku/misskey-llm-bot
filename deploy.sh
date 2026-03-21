#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Misskey-LLM-Bot  一键部署脚本
#  适用系统: Ubuntu 20.04 / 22.04 / 24.04
#  用法:
#    1. 先编辑 config.yaml 填好配置
#    2. sudo bash deploy.sh
# ═══════════════════════════════════════════════════════════
#  By Syskuku_雪音詩絵  |  www.imikufans.com
# ═══════════════════════════════════════════════════════════
set -euo pipefail

BOT_NAME="misskey-llm-bot"
BOT_USER="misskey-bot"
BOT_DIR="/opt/${BOT_NAME}"
SERVICE_NAME="${BOT_NAME}.service"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ────────── 颜色 ──────────
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${G}[✓]${NC} $*"; }
warn()  { echo -e "${Y}[!]${NC} $*"; }
error() { echo -e "${R}[✗]${NC} $*"; exit 1; }
step()  { echo -e "\n${C}── $* ──${NC}"; }

# ────────── 前置检查 ──────────
[[ $EUID -ne 0 ]] && error "请用 root 运行: sudo bash deploy.sh"
[[ ! -f "${SCRIPT_DIR}/config.yaml" ]] && error "config.yaml 不存在！请先: cp config.yaml.example config.yaml && nano config.yaml"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     Misskey-LLM-Bot  部署程序            ║"
echo "║     By Syskuku_雪音詩絵                  ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ────────── 1. 系统依赖 ──────────
step "1/6  安装系统依赖"
apt-get update -qq
apt-get install -y -qq curl >/dev/null 2>&1

# ────────── 2. Node.js ──────────
step "2/6  检查 Node.js"
if command -v node &>/dev/null; then
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ $NODE_VER -ge 16 ]]; then
        info "Node.js $(node -v) 已安装 ✓"
    else
        warn "Node.js 版本过低 ($(node -v))，正在安装 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
        apt-get install -y -qq nodejs >/dev/null 2>&1
    fi
else
    info "正在安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs >/dev/null 2>&1
fi
info "Node.js $(node -v)  npm $(npm -v)"

# ────────── 3. 创建用户 & 部署目录 ──────────
step "3/6  部署文件到 ${BOT_DIR}"
if ! id "$BOT_USER" &>/dev/null; then
    useradd --system --shell /usr/sbin/nologin --home-dir "$BOT_DIR" --create-home "$BOT_USER"
    info "创建用户 ${BOT_USER}"
fi

mkdir -p "$BOT_DIR"

# 复制文件
cp "${SCRIPT_DIR}/index.js"             "$BOT_DIR/"
cp "${SCRIPT_DIR}/package.json"         "$BOT_DIR/"
cp "${SCRIPT_DIR}/config.yaml"          "$BOT_DIR/"
info "文件已复制"

# ────────── 4. 安装 npm 依赖 ──────────
step "4/6  安装 npm 依赖"
cd "$BOT_DIR"
npm install --production --no-optional 2>&1 | tail -1
info "依赖安装完成"

# ────────── 5. 权限 ──────────
step "5/6  设置权限"
chown -R "${BOT_USER}:${BOT_USER}" "$BOT_DIR"
chmod 600 "${BOT_DIR}/config.yaml"
info "权限已设置 (config.yaml 600)"

# ────────── 6. systemd 服务 ──────────
step "6/6  安装 systemd 服务"
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Misskey-LLM-Bot (By Syskuku)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${BOT_USER}
Group=${BOT_USER}
WorkingDirectory=${BOT_DIR}
ExecStart=$(which node) ${BOT_DIR}/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${BOT_NAME}

# 安全加固
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${BOT_DIR}
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
info "systemd 服务已安装并启用"

# ────────── 完成 ──────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║           部署完成！🎉                    ║"
echo "╠══════════════════════════════════════════╣"
echo "║  启动:  sudo systemctl start ${BOT_NAME}   "
echo "║  状态:  sudo systemctl status ${BOT_NAME}  "
echo "║  日志:  sudo journalctl -u ${BOT_NAME} -f  "
echo "║  停止:  sudo systemctl stop ${BOT_NAME}    "
echo "║  重启:  sudo systemctl restart ${BOT_NAME} "
echo "╚══════════════════════════════════════════╝"
echo ""
read -p "是否立即启动机器人？[Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$|^$ ]]; then
    systemctl start "$SERVICE_NAME"
    sleep 2
    systemctl status "$SERVICE_NAME" --no-pager
fi
