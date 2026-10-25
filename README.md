# 复盘札记 · TradeNote

一个本地优先的 Obsidian 交易复盘插件。用普通 Markdown 笔记记录观察、操作和反思，通过日历和历史资料库持续回顾交易决策。

## 功能

- 日历工作台：按交易日创建、打开复盘，查看各板块填写情况。
- 五段式复盘：市场观察、昨日验证、今日操作、今日反思、明日计划。
- 历史检索：按日期、正文、月份、板块及填写情况筛选记录。
- 计划承接：查看上一份复盘的明日计划，复制或定位原文。
- 图片附件：粘贴或拖入图片，自动保存到日期目录并插入链接。
- 可选 AI 分析：兼容 Chat Completions API，生成纯文字日报或周报分析。
- A 股交易日历：内置 2024—2026 年休市安排，可手动补充，并按年度检查上交所公告。

## 安装

1. 在 [Releases](https://github.com/beimohai/TradeNote-Obsidian/releases) 下载 `main.js`、`manifest.json`、`styles.css`。
2. 在 Vault 下创建 `.obsidian/plugins/tradenote/`，放入这三个文件。
3. 重新加载 Obsidian，在社区插件设置中启用 **TradeNote**。
4. 点击左侧图标或运行命令“打开复盘仪表盘”。

这是手动安装版本，尚未提交 Obsidian 社区插件目录。

## 数据与网络

默认笔记路径为 `交易复盘/日报/YYYY/MM/YYYYMMDD复盘.md`，图片放在 `交易复盘/附件/YYYY/MM/DD/`。笔记不添加 YAML，也不预填示例内容，可直接用 Obsidian 编辑和备份。

AI 为可选功能。触发分析时，插件把选定日期范围内剔除图片引用后的复盘文字发送到用户配置的 API；不读取图片文件。周报只读取所选自然周中截至所选日期或今天的记录，结果可复制或另存，不覆盖原文。API Key 保存在当前 Vault 的插件设置文件中，请自行保护该文件。

年度日历检查访问上交所网站，通常从每年 12 月第四个星期一起检查次年安排，同一北京时间日期最多尝试一次，完整保存后停止该年度搜索。未公布年份需以交易所公告为准。

## 开发

需要 Node.js 20+ 和 pnpm 9+。

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

`pnpm dev` 监听源码并构建。构建后把根目录的三个插件文件复制到测试 Vault 的插件目录。

## 发布

同步更新 `manifest.json`、`package.json` 和 `versions.json` 的版本，运行检查后提交。创建与版本号一致的 Git 标签（例如 `0.1.0`），推送后 GitHub Actions 自动生成包含三个安装文件的 Release。

## 许可证

[MIT](LICENSE)。插件用于记录和回顾交易，不提供投资建议。
