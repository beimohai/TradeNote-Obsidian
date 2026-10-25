const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const notices = [];
class TFile {}
class TFolder {}
let request = async () => { throw new Error('Unexpected network request'); };
const obsidian = { App: class {}, ItemView: class {}, MarkdownView: class {}, Modal: class {}, Notice: class { constructor(message) { notices.push(message); } }, Plugin: class {}, PluginSettingTab: class {}, Setting: class {}, TFile, TFolder, normalizePath: s => s.replace(/\\/g, '/'), requestUrl: (...args) => request(...args), setIcon() {} };
const modules = {};
for (const name of ['market-calendar', 'review-analysis']) {
  const moduleContext = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, moduleContext);
  modules[`./${name}`] = moduleContext.exports;
}
const context = { exports: {}, require: name => name === 'obsidian' ? obsidian : modules[name], console, Date, Map, Set, URL, URLSearchParams, window: { setTimeout, clearTimeout } };
const source = fs.readFileSync('src/main.ts', 'utf8') + '\nObject.assign(exports, { sectionText, marketDateFor, chinaTradingDatesBetween, StockReviewDashboardView });';
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const api = context.exports;
async function main() {
  const markdown = '# 市场观察\n\n第一行\n第二行\n\n```md\n# 代码内标题\n```\n\n# 今日操作\n\n买入\n';
  assert.match(api.sectionText(markdown, '市场观察'), /第一行\n第二行/);
  assert.match(api.sectionText(markdown, '市场观察'), /代码内标题/);
  assert.equal(api.sectionText(markdown, '今日操作'), '买入');
  assert.equal(api.sectionText('# 市场观察\n\n# 今日操作\n正文', '市场观察'), '');
  assert.equal(api.sectionText('## 明日计划\r\n\r\n计划一\r\n计划二', '明日计划'), '计划一\n计划二');
  assert.equal(api.marketDateFor(new Date('2026-10-08T14:59:00')), '2026-09-30');
  assert.equal(api.marketDateFor(new Date('2026-10-08T15:00:00')), '2026-10-08');
  assert.equal(api.marketDateFor(new Date('2026-10-04T16:00:00')), '2026-09-30');
  assert.equal(api.chinaTradingDatesBetween('2026-05-14', '2026-09-30').length, 98);
  const dashboard = new api.StockReviewDashboardView();
  dashboard.quickFilter = 'all'; dashboard.sectionFilter = '市场观察'; dashboard.query = '';
  const entry = { date: '2026-10-15', sections: { 市场观察: '' }, text: '' };
  dashboard.sectionPresence = 'written'; assert.equal(dashboard.matchesFilters(entry), false);
  dashboard.sectionPresence = 'missing'; assert.equal(dashboard.matchesFilters(entry), true);
  const plugin = new api.default();
  const oldFile = Object.assign(new TFile(), { path: '交易复盘/日报/2026-10-16.md', name: '2026-10-16.md', basename: '2026-10-16' });
  plugin.app = { vault: { getAbstractFileByPath: () => null, getMarkdownFiles: () => [oldFile] } };
  plugin.settings = { rootFolder: '交易复盘', dailyFolder: '日报' };
  assert.equal(await plugin.getOrCreateDaily('2026-10-16'), oldFile);
  const ai = new api.default(); ai.settings = { aiBaseUrl: 'https://example.com', aiApiKey: 'test', aiModel: 'test' };
  request = async () => ({ json: {} }); await assert.rejects(ai.testAi(), /有效消息/);
  await assert.rejects(plugin.getOrCreateDaily('2026-02-30'), /无效/);
  assert.equal(plugin.imageExtension(''), '');
  const attachment = Object.assign(new TFile(), { name: 'shared.png' });
  const unused = Object.assign(new TFile(), { name: 'unused.png' });
  const folder = Object.assign(new TFolder(), { children: [attachment, unused] }); const removed = [];
  plugin.app = { vault: { getAbstractFileByPath: () => folder, getMarkdownFiles: () => [{ name: 'other.md', path: 'other.md' }], read: async () => '![[shared.png]]' }, fileManager: { trashFile: async file => removed.push(file.name) } };
  await plugin.deleteAttachmentsForDate('2026-10-16'); assert.equal(removed.join(','), 'unused.png');
  const calendar = modules['./market-calendar'];
  assert.equal(calendar.fourthMondayOfDecember(2026), '2026-12-28');
  assert.equal(calendar.fourthMondayOfDecember(2025), '2025-12-22');
  assert.equal(calendar.calendarCheckTarget(new Date('2026-12-27T15:59:00Z')).year, '2026');
  assert.equal(calendar.calendarCheckTarget(new Date('2026-12-27T16:00:00Z')).year, '2027');
  assert.equal(calendar.calendarCheckTarget(new Date('2027-01-02T00:00:00Z')).year, '2027');
  const annualText = '2026年休市安排 元旦：1月1日（星期四）至1月3日（星期六）休市。春节：2月15日至2月23日休市。清明节：4月4日至4月6日休市。劳动节：5月1日至5月5日休市。端午节：6月19日至6月21日休市。中秋节：9月25日至9月27日休市。国庆节：10月1日至10月7日休市。';
  assert.equal(calendar.parseAnnualClosures('2026', annualText).join(','), calendar.expandClosures('2026', calendar.HOLIDAY_RANGES['2026'].join(' ')).join(','));
  assert.equal(calendar.parseAnnualClosures('2027', annualText), null);
  assert.equal(calendar.parseAnnualClosures('2026', '2026年休市安排 元旦：1月1日休市'), null);
  const crossYear = annualText.replace('1月1日（星期四）至1月3日（星期六）', '2025年12月31日至2026年1月3日');
  assert.equal(calendar.parseAnnualClosures('2026', crossYear)[0], '2026-01-01');
  const updater = new api.default(); updater.settings = { calendarYears: {}, calendarChecks: {} };
  updater.saveData = async () => {}; updater.refreshDashboards = async () => {}; updater.applyCalendar = () => {};
  updater.app = { workspace: { getLeavesOfType: () => [] } };
  let calendarFetches = 0;
  updater.fetchAnnualCalendar = async () => { calendarFetches++; return null; };
  await updater.checkAnnualCalendar(new Date('2026-12-27T00:00:00Z')); assert.equal(calendarFetches, 0);
  await updater.checkAnnualCalendar(new Date('2026-12-28T00:00:00Z')); assert.equal(calendarFetches, 1);
  await updater.checkAnnualCalendar(new Date('2026-12-28T12:00:00Z')); assert.equal(calendarFetches, 1);
  updater.fetchAnnualCalendar = async () => { calendarFetches++; return { dates: ['2027-01-01'], source: 'https://www.sse.com.cn/' }; };
  await updater.checkAnnualCalendar(new Date('2026-12-29T00:00:00Z')); assert.equal(calendarFetches, 2);
  assert.equal(updater.settings.calendarChecks['2027'].completed, true);
  await updater.checkAnnualCalendar(new Date('2027-01-02T00:00:00Z')); assert.equal(calendarFetches, 2);
  assert.equal(updater.settings.calendarYears['2027'][0], '2027-01-01');
  assert.equal(calendar.builtInClosures().has('2026-02-23'), true);
  assert.equal(calendar.builtInClosures().has('2025-02-04'), true);
  assert.equal(calendar.builtInClosures().has('2024-02-09'), true);
  assert.equal(calendar.expandClosures('2027', '01-01/01-03').length, 3);
  assert.throws(() => calendar.expandClosures('2027', '02-30'));
  assert.throws(() => calendar.expandClosures('2027', '2026-01-01'));
  assert.throws(() => calendar.expandClosures('2027', '01-03/01-01'));
  const analysis = modules['./review-analysis'];
  assert.equal(analysis.reviewRange('2026-10-22', 'weekly').start, '2026-10-19');
  assert.equal(analysis.reviewRange('2026-10-22', 'weekly').end, '2026-10-25');
  assert.equal(analysis.reviewRange('2026-10-22', 'daily').end, '2026-10-22');
  assert.doesNotMatch(analysis.plainReviewText('内容 ![[a.png]] ![x](https://example.com/a.png) <img src="b.png">'), /a.png|b.png|https:/);
  const reviewer = new api.default(); reviewer.settings = ai.settings;
  reviewer.getReviewEntries = async () => [
    { date: '2026-10-19', text: '# 市场观察\n复盘事实 ![[private.png]]' },
    { date: '2026-10-20', text: '# 今日反思\n反思记录' },
    { date: '2026-10-23', text: 'FUTURE_SHOULD_NOT_SEND' },
    { date: '2026-10-18', text: 'WEEKEND_SHOULD_NOT_SEND' }
  ];
  let sent;
  request = async options => { sent = JSON.parse(options.body); return { json: { choices: [{ message: { content: '文字分析 ![bad](https://example.com/b.png)' } }] } }; };
  const report = await reviewer.analyzeReview('2026-10-22', 'weekly');
  assert.equal(typeof sent.messages[0].content, 'string');
  assert.match(sent.messages[0].content, /复盘事实/);
  assert.doesNotMatch(sent.messages[0].content, /private.png|FUTURE_SHOULD_NOT_SEND|WEEKEND_SHOULD_NOT_SEND/);
  assert.doesNotMatch(report, /b.png/);
  reviewer.getReviewEntries = async () => [];
  await assert.rejects(reviewer.analyzeReview('2026-10-22', 'daily'), /没有可分析/);
  console.log('PASS: review parsing, filters, market cutoff, legacy notes, attachments, AI text analysis and annual calendar');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
