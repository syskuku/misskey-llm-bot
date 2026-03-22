# Contributing to misskey-llm-bot

感谢你对 misskey-llm-bot 的关注！欢迎任何形式的贡献。

Thank you for your interest in contributing! All contributions are welcome.

## 如何贡献 / How to Contribute

### 报告问题 / Report Issues

- 使用 [Issues](https://github.com/syskuku/misskey-llm-bot/issues) 提交 Bug 报告或功能建议
- 请先搜索是否已有相同问题
- 提交 Bug 时请附上日志和环境信息

### 提交代码 / Submit Code

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m "Add your feature"`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 代码规范 / Code Style

- JavaScript 代码保持简洁可读
- 提交信息使用英文，简明扼要
- 确保 `node index.js` 能正常启动

### 配置变更 / Config Changes

如果新增了 `config.yaml` 的配置项，请同步更新：
- `config.yaml.example`
- README 中的配置说明（简中 / 繁中 / 日文 / 英文）

## 开发 / Development

```bash
git clone https://github.com/syskuku/misskey-llm-bot.git
cd misskey-llm-bot
cp config.yaml.example config.yaml
# 编辑 config.yaml 填入你的配置
npm install
npm start
```

## 协议 / License

贡献的代码将遵循本项目的 [MIT License](LICENSE)。
