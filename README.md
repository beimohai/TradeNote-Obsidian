# 复盘札记

## 项目简介

复盘札记（TradeNote）是一款 [Obsidian](https://obsidian.md/) 本地交易复盘插件，用普通 Markdown 笔记记录每天的市场观察、交易操作和思考。它可以轻松实现：

- **日历复盘**：按交易日创建和打开复盘，查看每天各板块的填写情况；
- **五段记录**：市场观察、昨日验证、今日操作、今日反思、明日计划；
- **计划承接**：查看上一份复盘的明日计划，复制内容或打开原文；
- **历史检索**：按月份、日期、正文和复盘板块查找记录，筛选已写或未写内容；
- **图片归档**：粘贴或拖入图片，按日期保存附件并插入笔记；
- **文字分析**：可选配置 AI，对日报或周报生成纯文字分析；
- **交易日历**：内置 A 股休市安排，支持手动补充和年度更新。

复盘笔记和图片均保存在本地，不依赖其他插件，可以直接使用 Obsidian 的编辑、搜索、链接和备份功能。基础复盘无需配置 AI；启用 AI 分析时，所选范围内的复盘文字会发送到你配置的接口。

作者 B 站主页：[北漠海](https://space.bilibili.com/1065768987)

更新日志：[更新记录](CHANGELOG.md)

如果发现问题或有功能建议，欢迎 B 站私信[北漠海](https://space.bilibili.com/1065768987)，或加 QQ 群 **588526922** 交流反馈。也可以通过[问题反馈](https://github.com/beimohai/TradeNote-Obsidian/issues)提交问题。

## 快速入门

### 从 GitHub 下载并安装

需要 Obsidian 1.7.2 或更高版本；在 1.13 及以上版本中，插件设置支持全局设置搜索。

1. 打开[版本发布页](https://github.com/beimohai/TradeNote-Obsidian/releases/latest)，下载 `main.js`、`manifest.json` 和 `styles.css` 三个文件；
2. 在 Obsidian 仓库的 `.obsidian/plugins/` 目录下新建 `tradenote` 文件夹，将三个文件放入其中；如果看不到 `.obsidian`，需打开系统的“显示隐藏文件”选项；
3. 重启 Obsidian，在“设置 → 第三方插件”中启用 **TradeNote**；
4. 点击左侧功能区的复盘图标，或在命令面板运行“打开复盘仪表盘”。

手动更新时只替换这三个文件，不要删除原来的 `data.json`，否则会丢失插件设置。

插件尚未上架 Obsidian 插件市场，目前请使用上述方式安装。

### 开始复盘

1. 在仪表盘选择交易日，创建或打开当天的复盘笔记；
2. 在五个板块下记录自己的观察、操作和反思，可以直接粘贴或拖入图片；
3. 在工作台回顾上一份复盘的明日计划，在历史资料库中搜索和筛选已有记录；
4. 如需 AI 分析，在插件设置中填写接口地址、密钥和模型，再运行“AI 日报与周报分析”。

### 从源码构建

需要 Node.js 22.13 或更高版本，以及 pnpm 11.25.0：

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
pnpm build
```

构建后，项目根目录会生成 `main.js`，与 `manifest.json`、`styles.css` 一起放入插件目录即可。开发时可运行 `pnpm dev` 监听源码并重新构建。

## 功能概览

### 1. 日历工作台与五段复盘

- 日历按 A 股交易日创建和打开复盘，已创建的日期显示五个板块的填写情况；
- 今日工作台可直接打开笔记，或定位到对应板块；
- 日报只包含五个一级标题，不添加 YAML 属性，也不预填示例内容；
- 上一份复盘中的明日计划会显示在工作台，方便核对计划与实际操作。

### 2. 历史资料库与筛选

- 支持全部、当前月、今日等范围，按日期或修改时间升序、降序排列；
- 可以搜索日期和正文，按某一复盘板块及其是否已写筛选记录；
- 点击摘要可直接定位原笔记中的标题；
- 删除复盘支持二次确认，笔记通过 Obsidian 的文件回收机制处理。

### 3. 图片附件与本地存储

- 在复盘笔记中粘贴或拖入图片，自动按日期归档并插入图片链接；
- 笔记和图片使用普通文件保存，停用插件后仍可阅读、编辑和备份；
- 复盘根目录、日报目录和附件目录可在插件设置中调整。

### 4. AI 日报与周报分析

- 支持兼容聊天补全格式的接口，可手动填写模型或获取模型列表，并测试连接；
- 日报分析读取所选日期，周报分析汇总所选日期所在自然周；
- 周报只使用截至所选日期或今天的记录，以较早者为准；
- 分析前剔除图片引用，不读取图片文件；输出为纯文字，可复制或另存为笔记，不覆盖原始日报。

### 5. A 股休市日历

- 内置 2024—2026 年休市安排，周六、周日固定排除，包括法定调休工作日；
- 可按年份手动补充休市日期，与内置日历合并使用；
- 每年 12 月第四个星期一起检查上交所次年年度休市公告，同一北京时间日期最多尝试一次，完整保存后停止该年度搜索；
- 插件关闭期间不会检查，下次打开时补查。尚未公布的休市安排无法提前确定，应以交易所公告为准。

## 文件结构

默认目录如下，可在插件设置中修改：

```text
交易复盘/
├─ 日报/
│  └─ YYYY/
│     └─ MM/
│        └─ YYYYMMDD复盘.md
├─ 附件/
│  └─ YYYY/
│     └─ MM/
│        └─ DD/
│           └─ image-时间戳.png
└─ AI复盘分析/
   └─ YYYY/
```

每篇日报的初始内容为：

```markdown
# 市场观察

# 昨日验证

# 今日操作

# 今日反思

# 明日计划
```

## 数据与网络说明

- 日常复盘保存在当前 Obsidian 仓库内，不连接券商账户；
- 年度日历更新访问[上海证券交易所](https://www.sse.com.cn/disclosure/dealinstruc/closed/)，用于获取休市公告；
- AI 为可选功能。运行分析或测试连接、获取模型列表时，会请求你配置的服务；服务可能需要账户或产生费用，按服务方规则执行；
- AI 分析会发送所选日期范围内剔除图片引用后的复盘文字，请根据自己的需要选择服务；
- 接口密钥保存在当前仓库的 `.obsidian/plugins/tradenote/data.json` 中，请勿将该文件提交到公开仓库。
- 历史检索和附件统计会枚举仓库中的文件路径；删除附件前会检查其他 Markdown 笔记的引用，避免误删仍被使用的图片。相关读取在本地完成，AI 分析只发送所选范围内的复盘文字；
- 剪贴板仅在点击“复制”时写入相应文字，粘贴图片时读取本次粘贴事件携带的图片，不会在后台读取系统剪贴板。

插件用于记录和回顾交易，不提供投资建议。

## 赞助与支持

如果你喜欢我的插件，你可以在这里对我表达支持，谢谢！

![微信与支付宝收款码](src/assets/community/support.png)

交流群：QQ 群 **588526922**。

- [问题反馈](https://github.com/beimohai/TradeNote-Obsidian/issues)
- [提交改进](https://github.com/beimohai/TradeNote-Obsidian/pulls)
- [作者 GitHub](https://github.com/beimohai)
- [作者 B 站主页](https://space.bilibili.com/1065768987)

## 开源协议

本项目基于 [MIT 开源协议](LICENSE) 开源。

_世界因开源更精彩_

---

## English overview

TradeNote is a local-first trading journal for [Obsidian](https://obsidian.md/). Record market observations, verify previous plans, document trades, reflect on decisions, and prepare the next trading day in ordinary Markdown notes. Your journal and image attachments remain readable and editable without the plugin.

### Features

- A trading-day calendar with section completion indicators.
- Five-section daily notes and carryover of the previous review’s plan.
- Search and filter past reviews by date, month, text, section, and whether a section has been written.
- Paste or drop images into review notes and organize attachments by date.
- Optional text-only AI analysis for daily and weekly reviews through a compatible Chat Completions API.
- Built-in Chinese stock-market holidays for 2024–2026, manual additions, and annual updates from the Shanghai Stock Exchange.

### Installation

Requires Obsidian 1.7.2 or later. Settings are searchable on Obsidian 1.13 and later.

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/beimohai/TradeNote-Obsidian/releases/latest).
2. Create `.obsidian/plugins/tradenote/` inside your vault and place the three files in that folder.
3. Restart Obsidian and enable **TradeNote** under **Settings → Community plugins**.
4. Open the review dashboard from the ribbon or command palette and select a trading day to start writing.

When updating manually, replace only those three files and keep your existing `data.json`.

### Privacy and network access

Basic journaling does not require an AI account. Journal notes and attachments are stored in your vault. The plugin enumerates file paths for review search and attachment statistics, and checks other Markdown notes before deleting attachments to avoid removing images still in use. Clipboard writes happen when you select a copy action; image pasting reads only the image provided by the paste event, with no background clipboard reading.

Annual calendar updates contact the Shanghai Stock Exchange. If you choose AI analysis, text from the selected review period is sent to your configured provider after image references are removed. Image files are not read for analysis. Connection tests and model-list requests also contact that provider, which may require an account or charge fees. API credentials are stored in `.obsidian/plugins/tradenote/data.json`; do not publish this file.

### Development

Use Node.js 22.13 or later and pnpm 11.25.0. Run `pnpm install --frozen-lockfile`, followed by `pnpm release:files` to check types, lint, run tests, and build. Release tags use the exact numeric version in `manifest.json`, for example `0.1.3`, without a `v` prefix.

### Support and license

Report problems through [GitHub issues](https://github.com/beimohai/TradeNote-Obsidian/issues), contact [北漠海 on Bilibili](https://space.bilibili.com/1065768987), or join QQ group **588526922**. Optional donations are welcome through the WeChat Pay and Alipay codes in the Chinese support section above. Donations are not required to use any feature.

TradeNote is released under the [MIT License](LICENSE). It helps record and review trading decisions and does not provide investment advice.
