// Shanghai Stock Exchange annual closure notices; weekends are always closed.
export const HOLIDAY_RANGES: Record<string, string[]> = {
  "2024": ["01-01", "02-09/02-17", "04-04/04-06", "05-01/05-05", "06-10", "09-15/09-17", "10-01/10-07"],
  "2025": ["01-01", "01-28/02-04", "04-04/04-06", "05-01/05-05", "05-31/06-02", "10-01/10-08"],
  "2026": ["01-01/01-03", "02-15/02-23", "04-04/04-06", "05-01/05-05", "06-19/06-21", "09-25/09-27", "10-01/10-07"],
};
export function expandClosures(year: string, input: string): string[] {
  if (!/^(19|20|21)\d{2}$/.test(year)) throw new Error("请输入有效年份");
  const result = new Set<string>();
  for (const token of input.split(/[\s,，;；]+/).filter(Boolean)) {
    const parts = token.split("/");
    if (parts.length > 2) throw new Error(`无效日期范围：${token}`);
    const dates = parts.map(part => part.length === 5 ? `${year}-${part}` : part);
    for (const date of dates) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) || !Number.isFinite(Date.parse(`${date}T12:00:00Z`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error(`无效休市日期：${date}`);
    }
    const [start, end = start] = dates;
    if (start > end) throw new Error(`日期范围倒置：${token}`);
    for (let day = new Date(`${start}T12:00:00Z`); day.toISOString().slice(0, 10) <= end; day.setUTCDate(day.getUTCDate() + 1)) result.add(day.toISOString().slice(0, 10));
  }
  return [...result].sort();
}
export function builtInClosures(): Set<string> {
  return new Set(Object.entries(HOLIDAY_RANGES).flatMap(([year, ranges]) => expandClosures(year, ranges.join("\n"))));
}

export function fourthMondayOfDecember(year: number): string {
  const first = new Date(Date.UTC(year, 11, 1));
  const day = 1 + (8 - first.getUTCDay()) % 7 + 21;
  return `${year}-12-${day}`;
}

export function calendarCheckTarget(now = new Date()): { today: string; year: string } {
  const today = new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
  const year = Number(today.slice(0, 4));
  return { today, year: String(today >= fourthMondayOfDecember(year) ? year + 1 : year) };
}

export function parseAnnualClosures(year: string, text: string): string[] | null {
  const clean = text.replace(/\s+/g, "").replace(/[（(][^）)]*[）)]/g, "");
  if (!clean.includes(`${year}年休市安排`) && !clean.includes(`${year}年部分节假日休市安排`) && !clean.includes(`${year}年全年休市安排`)) return null;
  const labels = [...clean.matchAll(/元旦[：:]|春节[：:]|清明节[：:]|劳动节[：:]|端午节[：:]|(?:国庆节[、及和与]?中秋节|中秋节[、及和与]?国庆节|国庆节|中秋节)[：:]/g)];
  if (!["元旦", "春节", "清明", "劳动", "端午", "中秋", "国庆"].every(name => labels.some(label => label[0].includes(name)))) return null;
  const dates = new Set<string>();
  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    const segment = clean.slice(label.index + label[0].length, labels[index + 1]?.index);
    const range = /(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日(?:至(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日)?休市/.exec(segment);
    if (!range) return null;
    const startYear = range[1] ?? year;
    const endYear = range[4] ?? year;
    const format = (y: string, m: string, d: string) => `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const start = format(startYear, range[2], range[3]);
    const end = range[5] ? format(endYear, range[5], range[6]) : start;
    const from = new Date(`${start}T12:00:00Z`), to = new Date(`${end}T12:00:00Z`);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from.toISOString().slice(0, 10) !== start || to.toISOString().slice(0, 10) !== end || to < from || to.getTime() - from.getTime() > 16 * 86400000) return null;
    for (let date = from; date <= to; date.setUTCDate(date.getUTCDate() + 1)) {
      const value = date.toISOString().slice(0, 10);
      if (value.startsWith(`${year}-`)) dates.add(value);
    }
  }
  return dates.size >= 10 ? [...dates].sort() : null;
}
