export type ReviewPeriod = "daily" | "weekly";
export function plainReviewText(text: string): string {
  return text.replace(/!\[\[[^\]]*\]\]/g, "").replace(/!\[[^\]]*\]\((?:[^()]|\([^()]*\))*\)/g, "").replace(/!\[[^\]]*\](?:\[[^\]]*\])?/g, "").replace(/<img\b[^>]*>/gi, "").replace(/data:image\/[^\s)"']+/gi, "").trim();
}
export function reviewRange(date: string, period: ReviewPeriod): { start: string; end: string } {
  const day = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date) throw new Error("无效的复盘日期");
  if (period === "daily") return { start: date, end: date };
  const offset = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - offset);
  const start = day.toISOString().slice(0, 10);
  day.setUTCDate(day.getUTCDate() + 6);
  return { start, end: day.toISOString().slice(0, 10) };
}
