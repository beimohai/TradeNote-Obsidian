const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const notices = [];
class TFile {}
class TFolder {}
let supportsDeclarative = true;
const settingRows = [];
class MockSetting {
  constructor() { settingRows.push(this); }
  setName(value) { this.name = value; return this; }
  setDesc(value) { this.desc = value; return this; }
  setHeading() { this.heading = true; return this; }
  control(callback) {
    const component = { inputEl: {}, setPlaceholder() { return this; }, setValue(value) { this.value = value; return this; }, addOptions() { return this; }, setButtonText() { return this; }, setDisabled(value) { this.disabled = value; return this; }, onClick(fn) { this.click = fn; return this; }, onChange(fn) { this.change = fn; return this; } };
    (this.controls ??= []).push(component); callback(component); return this;
  }
  addText(fn) { return this.control(fn); }
  addToggle(fn) { return this.control(fn); }
  addButton(fn) { return this.control(fn); }
  addDropdown(fn) { return this.control(fn); }
}
let request = async () => { throw new Error('Unexpected network request'); };
const obsidian = { App: class {}, ItemView: class {}, MarkdownView: class {}, Modal: class {}, Notice: class { constructor(message) { notices.push(message); } }, Plugin: class {}, PluginSettingTab: class {}, Setting: MockSetting, requireApiVersion: () => supportsDeclarative, TFile, TFolder, normalizePath: s => s.replace(/\\/g, '/'), requestUrl: (...args) => request(...args), setIcon() {} };
const modules = {};
for (const name of ['market-calendar', 'review-analysis']) {
  const moduleContext = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/${name}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, moduleContext);
  modules[`./${name}`] = moduleContext.exports;
}
const context = { exports: {}, require: name => name === 'obsidian' ? obsidian : modules[name], console, Date, Map, Set, URL, URLSearchParams, window: { setTimeout, clearTimeout, setInterval: () => 0 } };
const source = fs.readFileSync('src/main.ts', 'utf8') + '\nObject.assign(exports, { loadReviewSettings, StockReviewSettingTab, sectionText, marketDateFor, StockReviewDashboardView });';
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const api = context.exports;
async function main() {

  const defaults = api.loadReviewSettings(null);
  const invalid = api.loadReviewSettings({ rootFolder: 42, confirmDelete: "false", calendarYears: { bad: ["01-01"], 2027: ["02-30"] }, calendarChecks: { 2027: { lastCheck: "broken", completed: true } } });
  assert.equal(invalid.rootFolder, defaults.rootFolder);
  assert.equal(invalid.confirmDelete, true);
  assert.equal(Object.keys(invalid.calendarYears).length, 0);
  assert.equal(Object.keys(invalid.calendarChecks).length, 0);
  const restored = api.loadReviewSettings({ rootFolder: " 自选复盘 ", confirmDelete: false, aiApiKey: "saved-key", calendarYears: { 2027: ["01-01/01-03"] }, calendarChecks: { 2027: { lastCheck: "2026-12-28", completed: true } } });
  assert.equal(restored.rootFolder, "自选复盘"); assert.equal(restored.confirmDelete, false);
  assert.equal(restored.aiApiKey, "saved-key"); assert.equal(restored.calendarYears['2027'].length, 3);
  restored.calendarYears['2027'].push('2027-01-04');
  assert.equal(Object.keys(api.loadReviewSettings(null).calendarYears).length, 0);
  const settingsPlugin = new api.default(); settingsPlugin.settings = api.loadReviewSettings(null);
  let settingSaves = 0; settingsPlugin.saveSettings = async () => { settingSaves++; };
  const tab = new api.StockReviewSettingTab({}, settingsPlugin);
  tab.containerEl = { empty() { settingRows.length = 0; } };
  const definitions = tab.getSettingDefinitions();
  assert.ok(definitions.every(d => typeof d.name === 'string' && typeof d.render === 'function'));
  tab.display();
  assert.equal(settingRows.length, definitions.length + 1); assert.equal(settingRows[0].heading, true);
  const legacyNames = settingRows.slice(1).map(row => row.name);
  assert.equal(legacyNames.join('|'), definitions.map(d => d.name).join('|'));
  const folderRow = settingRows.find(row => row.name === '日报文件夹');
  await folderRow.controls[0].change('  自选日报  ');
  assert.equal(settingsPlugin.settings.dailyFolder, '自选日报'); assert.equal(settingSaves, 1);
  supportsDeclarative = false; tab.refreshSettings();
  assert.equal(settingRows.length, definitions.length + 1);
  let updates = 0; tab.update = () => { updates++; };
  supportsDeclarative = true; tab.refreshSettings(); assert.equal(updates, 1);
  const startup = new api.default();
  const editorHandlers = {};
  startup.loadData = async () => ({ rootFolder: false, confirmDelete: false });
  startup.registerInterval = startup.registerEvent = startup.addSettingTab = startup.registerView = startup.addRibbonIcon = startup.addCommand = () => {};
  startup.app = { workspace: { onLayoutReady() {}, on(event, callback) { editorHandlers[event] = callback; } }, vault: { on() {} } };
  await startup.onload(); assert.equal(startup.settings.rootFolder, defaults.rootFolder); assert.equal(startup.settings.confirmDelete, false);
  editorHandlers['editor-paste']({ defaultPrevented: true, get clipboardData() { throw Error('Handled paste must not inspect clipboard'); } }, {}, null);
  let pasted = 0; let prevented = 0;
  startup.isDailyReview = () => true; startup.insertPastedImage = async () => { pasted++; };
  const editorInfo = Object.assign(new obsidian.MarkdownView(), { file: new TFile() });
  editorHandlers['editor-paste']({ defaultPrevented: false, clipboardData: { files: [{ type: 'image/png', name: 'test.png' }] }, preventDefault() { prevented++; } }, {}, editorInfo);
  assert.equal(pasted, 1); assert.equal(prevented, 1);

  const markdown = '# 市场观察\n\n第一行\n第二行\n\n```md\n# 代码内标题\n```\n\n# 今日操作\n\n买入\n';
  assert.match(api.sectionText(markdown, '市场观察'), /第一行\n第二行/);
  assert.match(api.sectionText(markdown, '市场观察'), /代码内标题/);
  assert.equal(api.sectionText(markdown, '今日操作'), '买入');
  assert.equal(api.sectionText('# 市场观察\n\n# 今日操作\n正文', '市场观察'), '');
  assert.equal(api.sectionText('## 明日计划\r\n\r\n计划一\r\n计划二', '明日计划'), '计划一\n计划二');
  assert.equal(api.marketDateFor(new Date('2026-10-08T14:59:00')), '2026-09-30');
  assert.equal(api.marketDateFor(new Date('2026-10-08T15:00:00')), '2026-10-08');
  assert.equal(api.marketDateFor(new Date('2026-10-04T16:00:00')), '2026-09-30');
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
  const modelPlugin = new api.default(); modelPlugin.settings = api.loadReviewSettings({ aiBaseUrl: 'https://a.example/chat/completions', aiApiKey: 'fixture', aiModel: 'manual-model' });
  const modelTab = new api.StockReviewSettingTab({}, modelPlugin); modelTab.refreshSettings = () => {};
  let finishModels; modelPlugin.listAiModels = () => new Promise(resolve => { finishModels = resolve; });
  const pendingRow = new MockSetting(); modelTab.renderModelSetting(pendingRow);
  const fetching = pendingRow.controls[1].click(); modelPlugin.settings.aiBaseUrl = 'https://b.example/chat/completions'; finishModels(['obsolete-model']); await fetching;
  assert.equal(modelTab.availableModels.length, 0, 'late model response cannot replace a different provider list');
  assert.equal(pendingRow.controls[1].disabled, false, 'fetch button is restored after rejection');
  modelPlugin.listAiModels = async () => ['provider-b-model'];
  const fetchedRow = new MockSetting(); modelTab.renderModelSetting(fetchedRow); await fetchedRow.controls[1].click();
  const selectableRow = new MockSetting(); modelTab.renderModelSetting(selectableRow);
  modelPlugin.settings.aiApiKey = 'different-fixture'; await selectableRow.controls[1].change('provider-b-model');
  assert.equal(modelPlugin.settings.aiModel, 'manual-model', 'a stale dropdown cannot save a model after credentials change');
  console.log('PASS: model-list response races, stale selections and fetch-button recovery');
  const reader = new api.default(); reader.settings = api.loadReviewSettings(null);
  const reviewFile = { path: '交易复盘/日报/2026/10/20261028复盘.md', name: '20261028复盘.md', basename: '20261028复盘', extension: 'md' };
  let reviewText = '# 市场观察\n原文\n# 今日反思\n反思', cachedReads = 0;
  reader.app = { vault: {
    getMarkdownFiles: () => [reviewFile],
    getFiles: () => [reviewFile, { path: '交易复盘/附件/2026/10/28/image.png', extension: 'png' }],
    cachedRead: async () => { cachedReads++; return reviewText; },
    read: async () => { throw new Error('Dashboard should use the Vault read cache'); }
  } };
  let entries = await reader.getReviewEntries();
  assert.equal(entries[0].date, '2026-10-28'); assert.equal(entries[0].filledCount, 2); assert.equal(entries[0].attachmentCount, 1);
  reviewText = '# 市场观察\n编辑后的正文'; entries = await reader.getReviewEntries();
  assert.match(entries[0].text, /编辑后的正文/); assert.equal(entries[0].filledCount, 1); assert.equal(cachedReads, 2);
  console.log('PASS: dashboard cached reads retain date parsing, sections, attachments and edited content');
  console.log('PASS: review parsing, filters, market cutoff, legacy notes, attachments, AI text analysis and annual calendar');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
