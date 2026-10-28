# 复盘札记 · TradeNote 0.1.4

- 仪表盘复用 Obsidian 的笔记读取缓存，减少搜索和刷新时的重复磁盘读取，同时保留最新编辑内容。
- 修复延迟加载的仪表盘标签页无法立即打开或刷新的问题。
- 获取 AI 模型列表时校验当前接口地址与密钥，避免切换服务后显示或选用旧列表。
- 生产构建移除内联源码映射并压缩语法与空白，减小安装文件；开发监听仍保留源码映射。
- 新增仅包含三个安装文件的打包命令，扩充规范检查和缓存读取回归测试。
- 中英文说明优先使用 Obsidian 插件市场安装和更新，GitHub 手动安装保留为备用；更新数据说明，保持基础复盘和纯文字 AI 分析的现有功能与移动端兼容声明。

## 安装与更新

需要 Obsidian 1.7.2 或更高版本。在“设置 → 第三方插件 → 浏览”中搜索 **TradeNote**，安装并启用；已有用户可在第三方插件设置中检查更新。

如需手动安装，下载 `main.js`、`manifest.json`、`styles.css`，放入仓库的 `.obsidian/plugins/tradenote/` 目录。更新时仅替换这三个文件，保留 `data.json`；基础复盘不需要 AI 账号。

[使用说明](https://github.com/beimohai/TradeNote-Obsidian#readme) · [更新记录](https://github.com/beimohai/TradeNote-Obsidian/blob/main/CHANGELOG.md)
