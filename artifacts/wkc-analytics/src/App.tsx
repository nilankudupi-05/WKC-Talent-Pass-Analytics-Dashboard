import { useState, useRef } from "react";

const GST = 0.18;
const MODEL = "claude-sonnet-4-6";
const DATES = (() => {
  const d: string[] = [];
  let c = new Date("2026-04-25");
  const e = new Date("2026-05-19");
  for (; c <= e; c.setDate(c.getDate() + 1)) d.push(c.toISOString().slice(0, 10));
  return d;
})();

const SEED_DEPS = [
  { date: "2026-05-03", label: "New landing page" },
  { date: "2026-05-05", label: "New recommendation page" },
  { date: "2026-05-12", label: "Claude's rec page changes" },
  { date: "2026-05-14", label: "Abhishek's landing page" },
];

const SEED_META: Record<string, Record<string, string>> = {
  "2026-04-25": { adSpend: "402.51", impressions: "1644", reach: "1434", linkClicks: "37", lpv: "30" },
  "2026-04-26": { adSpend: "466.80", impressions: "1493", reach: "1277", linkClicks: "50", lpv: "37" },
  "2026-04-27": { adSpend: "496.35", impressions: "1134", reach: "1011", linkClicks: "35", lpv: "28" },
  "2026-04-28": { adSpend: "487.96", impressions: "1528", reach: "1238", linkClicks: "32", lpv: "25" },
  "2026-04-29": { adSpend: "553.84", impressions: "1522", reach: "1303", linkClicks: "32", lpv: "25" },
  "2026-04-30": { adSpend: "523.56", impressions: "1571", reach: "1335", linkClicks: "37", lpv: "27" },
  "2026-05-01": { adSpend: "536.30", impressions: "1648", reach: "1381", linkClicks: "42", lpv: "31" },
  "2026-05-02": { adSpend: "499.47", impressions: "1504", reach: "1286", linkClicks: "38", lpv: "29" },
  "2026-05-03": { adSpend: "543.21", impressions: "1712", reach: "1456", linkClicks: "56", lpv: "44" },
  "2026-05-04": { adSpend: "571.88", impressions: "1803", reach: "1521", linkClicks: "62", lpv: "51" },
  "2026-05-05": { adSpend: "589.34", impressions: "1934", reach: "1643", linkClicks: "71", lpv: "60" },
  "2026-05-06": { adSpend: "612.45", impressions: "2012", reach: "1712", linkClicks: "78", lpv: "65" },
  "2026-05-07": { adSpend: "597.23", impressions: "1876", reach: "1598", linkClicks: "69", lpv: "57" },
  "2026-05-08": { adSpend: "578.91", impressions: "1754", reach: "1487", linkClicks: "63", lpv: "52" },
  "2026-05-09": { adSpend: "601.34", impressions: "1889", reach: "1601", linkClicks: "74", lpv: "62" },
  "2026-05-10": { adSpend: "623.78", impressions: "2034", reach: "1723", linkClicks: "82", lpv: "68" },
  "2026-05-11": { adSpend: "598.12", impressions: "1923", reach: "1634", linkClicks: "76", lpv: "63" },
  "2026-05-12": { adSpend: "641.56", impressions: "2156", reach: "1834", linkClicks: "94", lpv: "79" },
  "2026-05-13": { adSpend: "667.34", impressions: "2234", reach: "1901", linkClicks: "101", lpv: "86" },
  "2026-05-14": { adSpend: "689.23", impressions: "2389", reach: "2034", linkClicks: "112", lpv: "95" },
  "2026-05-15": { adSpend: "712.45", impressions: "2512", reach: "2143", linkClicks: "124", lpv: "106" },
  "2026-05-16": { adSpend: "698.34", impressions: "2423", reach: "2067", linkClicks: "118", lpv: "101" },
  "2026-05-17": { adSpend: "", impressions: "", reach: "", linkClicks: "", lpv: "" },
  "2026-05-18": { adSpend: "", impressions: "", reach: "", linkClicks: "", lpv: "" },
  "2026-05-19": { adSpend: "", impressions: "", reach: "", linkClicks: "", lpv: "" },
};

const SEED_PCT: Record<string, Record<string, string>> = {
  "2026-04-25": { qLink: "23.21%", qLPV: "26.84%", qDone: "100.00%", payI: "", payD: "0.00%", eF: "0.00%", eP: "8.33%", pClk: "0.00%", pLPV: "0.00%", pQS: "0.00%", pQC: "0.00%" },
  "2026-04-26": { qLink: "18.00%", qLPV: "73.33%", qDone: "81.82%", payI: "", payD: "0.00%", eF: "33.33%", eP: "0.00%", pClk: "0.00%", pLPV: "0.00%", pQS: "0.00%", pQC: "0.00%" },
  "2026-04-27": { qLink: "37.14%", qLPV: "24.32%", qDone: "100.00%", payI: "", payD: "0.00%", eF: "11.11%", eP: "0.00%", pClk: "2.00%", pLPV: "2.70%", pQS: "11.11%", pQC: "11.11%" },
  "2026-04-28": { qLink: "28.00%", qLPV: "35.20%", qDone: "89.29%", payI: "", payD: "0.00%", eF: "0.00%", eP: "3.57%", pClk: "0.00%", pLPV: "0.00%", pQS: "0.00%", pQC: "0.00%" },
  "2026-04-29": { qLink: "31.25%", qLPV: "40.00%", qDone: "92.00%", payI: "20.00%", payD: "0.00%", eF: "5.00%", eP: "6.25%", pClk: "3.13%", pLPV: "4.00%", pQS: "10.00%", pQC: "11.11%" },
  "2026-04-30": { qLink: "27.03%", qLPV: "37.04%", qDone: "86.36%", payI: "15.79%", payD: "0.00%", eF: "3.70%", eP: "5.41%", pClk: "2.70%", pLPV: "3.70%", pQS: "10.00%", pQC: "11.54%" },
  "2026-05-01": { qLink: "33.33%", qLPV: "45.16%", qDone: "93.33%", payI: "21.43%", payD: "0.00%", eF: "6.67%", eP: "8.33%", pClk: "4.76%", pLPV: "6.45%", pQS: "14.29%", pQC: "15.38%" },
  "2026-05-02": { qLink: "26.32%", qLPV: "34.48%", qDone: "88.89%", payI: "18.75%", payD: "0.00%", eF: "4.35%", eP: "6.25%", pClk: "2.63%", pLPV: "3.45%", pQS: "10.00%", pQC: "11.11%" },
  "2026-05-03": { qLink: "37.50%", qLPV: "47.73%", qDone: "94.12%", payI: "25.00%", payD: "0.00%", eF: "8.82%", eP: "12.50%", pClk: "7.14%", pLPV: "9.09%", pQS: "19.05%", pQC: "20.00%" },
  "2026-05-04": { qLink: "40.32%", qLPV: "50.98%", qDone: "96.00%", payI: "27.08%", payD: "3.85%", eF: "10.00%", eP: "13.71%", pClk: "8.06%", pLPV: "10.20%", pQS: "20.00%", pQC: "20.83%" },
  "2026-05-05": { qLink: "43.66%", qLPV: "53.33%", qDone: "96.97%", payI: "28.13%", payD: "2.22%", eF: "11.76%", eP: "15.49%", pClk: "9.86%", pLPV: "12.00%", pQS: "22.58%", pQC: "23.33%" },
  "2026-05-06": { qLink: "44.87%", qLPV: "55.38%", qDone: "97.14%", payI: "29.41%", payD: "2.00%", eF: "12.86%", eP: "16.67%", pClk: "10.26%", pLPV: "12.31%", pQS: "22.86%", pQC: "23.53%" },
  "2026-05-07": { qLink: "42.03%", qLPV: "52.63%", qDone: "96.55%", payI: "26.79%", payD: "1.96%", eF: "10.34%", eP: "14.49%", pClk: "8.70%", pLPV: "10.53%", pQS: "20.69%", pQC: "21.43%" },
  "2026-05-08": { qLink: "38.10%", qLPV: "48.08%", qDone: "95.00%", payI: "26.32%", payD: "2.00%", eF: "8.00%", eP: "12.70%", pClk: "7.94%", pLPV: "9.62%", pQS: "20.83%", pQC: "21.95%" },
  "2026-05-09": { qLink: "41.89%", qLPV: "51.61%", qDone: "96.77%", payI: "26.67%", payD: "2.50%", eF: "9.68%", eP: "13.51%", pClk: "8.11%", pLPV: "9.68%", pQS: "19.35%", pQC: "20.00%" },
  "2026-05-10": { qLink: "45.12%", qLPV: "55.88%", qDone: "97.44%", payI: "30.00%", payD: "2.22%", eF: "12.82%", eP: "17.07%", pClk: "10.98%", pLPV: "13.24%", pQS: "24.39%", pQC: "25.00%" },
  "2026-05-11": { qLink: "43.42%", qLPV: "53.97%", qDone: "96.97%", payI: "28.13%", payD: "2.22%", eF: "11.11%", eP: "15.63%", pClk: "9.21%", pLPV: "11.11%", pQS: "21.21%", pQC: "21.88%" },
  "2026-05-12": { qLink: "48.94%", qLPV: "60.76%", qDone: "97.92%", payI: "31.91%", payD: "2.00%", eF: "14.58%", eP: "19.15%", pClk: "12.77%", pLPV: "15.19%", pQS: "26.09%", pQC: "26.67%" },
  "2026-05-13": { qLink: "50.50%", qLPV: "62.79%", qDone: "98.04%", payI: "33.00%", payD: "1.82%", eF: "15.69%", eP: "20.20%", pClk: "13.86%", pLPV: "16.28%", pQS: "27.45%", pQC: "28.00%" },
  "2026-05-14": { qLink: "53.57%", qLPV: "66.32%", qDone: "98.33%", payI: "33.90%", payD: "1.67%", eF: "16.67%", eP: "21.43%", pClk: "15.18%", pLPV: "18.95%", pQS: "28.33%", pQC: "28.81%" },
  "2026-05-15": { qLink: "55.65%", qLPV: "68.87%", qDone: "98.55%", payI: "34.78%", payD: "1.56%", eF: "17.39%", eP: "22.58%", pClk: "16.13%", pLPV: "20.75%", pQS: "29.03%", pQC: "29.55%" },
  "2026-05-16": { qLink: "54.24%", qLPV: "67.33%", qDone: "98.44%", payI: "34.15%", payD: "1.59%", eF: "17.19%", eP: "21.95%", pClk: "15.25%", pLPV: "19.80%", pQS: "28.13%", pQC: "28.57%" },
  "2026-05-17": {},
  "2026-05-18": {},
  "2026-05-19": {},
};

function parseFields(line: string): string[] {
  const f: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) { f.push(""); break; }
    if (line[i] === '"') {
      let v = ""; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { v += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else v += line[i++];
      }
      f.push(v); if (line[i] === ',') i++;
    } else {
      const e = line.indexOf(',', i);
      if (e === -1) { f.push(line.slice(i)); break; }
      f.push(line.slice(i, e)); i = e + 1;
    }
  }
  return f;
}

function parseCSV(text: string, filterFn?: (row: Record<string, string>) => boolean): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  const hdrs = parseFields(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseFields(line);
    const row: Record<string, string> = {};
    hdrs.forEach((h, i) => row[h] = (vals[i] || "").trim());
    return row;
  }).filter(filterFn || Boolean);
}

const gp = (obj: unknown, path: string): unknown =>
  path && obj ? path.split(".").reduce((o: unknown, k: string) => o == null ? undefined : (o as Record<string, unknown>)[k], obj) : undefined;

const calcDerived = (m: Record<string, string>) => {
  const s = +m.adSpend || 0, imp = +m.impressions || 0, r = +m.reach || 0, lc = +m.linkClicks || 0, lpv = +m.lpv || 0;
  return { gst: s * (1 + GST), freq: r ? imp / r : null, cpc: lc ? s / lc : null, cpl: lpv ? s / lpv : null, ctr: imp ? (lc / imp) * 100 : null };
};

const inRange = (d: string, dr: { from: string; to: string }) => {
  if (!dr) return true;
  if (dr.from && d < dr.from) return false;
  if (dr.to && d > dr.to) return false;
  return true;
};

const stepToStatus: Record<string, string> = {
  "payment_successful": "Payment Successful",
  "payment_initiated": "Payment Intiated",
  "payment_dismissed": "Payment Dismissed",
  "payment_abandoned": "Payment Abandoned",
};

interface TelRow { quizStarted: number; quizCompleted: number; payInitiated: number; payDismissed: number; paySuccessful: number; }

function computeTel(rawRows: Record<string, string>[], date: string): TelRow | null {
  const day = rawRows.filter(r => (r.created_on || "").startsWith(date));
  if (!day.length) return null;
  const parsed = day.map(r => { try { return { sid: r.session_id, p: JSON.parse(r.response || "{}") }; } catch { return { sid: r.session_id, p: {} }; } });
  const sid = (fn: (x: { sid: string; p: Record<string, unknown> }) => boolean) => new Set(parsed.filter(fn).map(x => x.sid)).size;
  return {
    quizStarted: sid(({ p }) => p.category === "QUIZ"),
    quizCompleted: sid(({ p }) => p.category === "QUIZ" && (p as Record<string, Record<string, unknown>>).data?.quiz?.step === 4),
    payInitiated: sid(({ p }) => p.category === "PAYMENT" && (p as Record<string, Record<string, unknown>>).data?.step === "payment_initiated"),
    payDismissed: sid(({ p }) => p.category === "PAYMENT" && (p as Record<string, Record<string, unknown>>).data?.step === "payment_dismissed"),
    paySuccessful: sid(({ p }) => p.category === "PAYMENT" && (p as Record<string, Record<string, unknown>>).data?.step === "payment_successful"),
  };
}

function schemaFP(rawRows: Record<string, string>[]): string {
  const combos = new Set<string>();
  rawRows.slice(0, 200).forEach(r => { try { const p = JSON.parse(r.response || "{}"); combos.add((p.category || "") + "|" + Object.keys(p.data || {}).sort().join(",")); } catch {} });
  return [...combos].sort().join(";");
}

function sampleByCategory(rawRows: Record<string, string>[]): Record<string, unknown[]> {
  const by: Record<string, unknown[]> = {};
  rawRows.forEach(r => { try { const p = JSON.parse(r.response || "{}"); const cat = p.category || "?"; if (!by[cat]) by[cat] = []; if (by[cat].length < 4) by[cat].push(p); } catch {} });
  return by;
}

interface MappingState {
  quizCategory: string; quizStepPath: string; quizAnswerPath: string; quizQuestionIdPath: string;
  recCategory: string; recNamePath: string; paymentCategory: string; paymentStepPath: string;
  paymentPlanPath: string; paymentCategoryPath: string; userNamePath: string; userMobilePath: string;
  userAgeGroupPath: string; utmPath: string; telemetryCategory: string; timeSpentTypePath: string;
  timeSpentTypeValue: string; timeSpentSectionPath: string; timeSpentSecondsPath: string;
  sectionIdToColumnMap: Record<string, string>;
  changes?: string[];
}

const DEFAULT_MAPPING: MappingState = {
  quizCategory: "QUIZ", quizStepPath: "data.quiz.step", quizAnswerPath: "data.quiz.answer",
  quizQuestionIdPath: "data.quiz.id", recCategory: "RECOMMENDATION_GENERATED", recNamePath: "data.categoryName",
  paymentCategory: "PAYMENT", paymentStepPath: "data.step", paymentPlanPath: "data.subscriptionId",
  paymentCategoryPath: "data.categoryName", userNamePath: "user.name", userMobilePath: "user.mobile",
  userAgeGroupPath: "user.ageGroup", utmPath: "utmDetails", telemetryCategory: "TELEMETRY",
  timeSpentTypePath: "data.type", timeSpentTypeValue: "TIME_SPENT", timeSpentSectionPath: "data.sectionId",
  timeSpentSecondsPath: "data.timeSpentSeconds", sectionIdToColumnMap: {},
};

async function fetchAIMapping(rawRows: Record<string, string>[]): Promise<MappingState> {
  const sample = JSON.stringify(sampleByCategory(rawRows), null, 2).slice(0, 10000);
  const prompt = "Map these quiz funnel telemetry events to field paths. Return ONLY JSON (no markdown) with keys: quizCategory,quizStepPath,quizAnswerPath,quizQuestionIdPath,recCategory,recNamePath,paymentCategory,paymentStepPath,paymentPlanPath,paymentCategoryPath,userNamePath,userMobilePath,userAgeGroupPath,utmPath,telemetryCategory,timeSpentTypePath,timeSpentTypeValue,timeSpentSectionPath,timeSpentSecondsPath,sectionIdToColumnMap,changes.\n\nEvents:\n" + sample;
  const res = await fetch("/api/ai/complete", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }], maxTokens: 2000 }),
  });
  const d = await res.json() as { text: string };
  const text = (d.text || "").split("```json").join("").split("```").join("").trim();
  return JSON.parse(text) as MappingState;
}

interface SessionRow {
  session_id: string; name: string; mobile: string; age_group: string; utm_source: string;
  utm_campaign: string; Datevalue: string; _date: string; q1_answer: string; q2_answer: string;
  q3_answer: string; q4_answer: string; recommendation: string; "Status for Analytics": string;
  payment_plan: string; button_clicked: string; "Time Spent Less Than 2 Seconds": string;
  "Time Spent Greater Than 2 Seconds": string;
  page_recommendation_time_seconds: string; [key: string]: string;
}

function buildSessions(rawRows: Record<string, string>[], mapping: MappingState, internalNums: string[]): SessionRow[] {
  const m = mapping || DEFAULT_MAPPING;
  const sessions: Record<string, { r: Record<string, string>; p: Record<string, unknown> }[]> = {};
  rawRows.forEach(r => {
    if (!r.session_id) return;
    if (!sessions[r.session_id]) sessions[r.session_id] = [];
    try { const p = JSON.parse(r.response || "{}"); sessions[r.session_id].push({ r, p }); } catch {}
  });
  return Object.entries(sessions).map(([sid, events]) => {
    const uEvt = events.find(e => gp(e.p, m.userMobilePath));
    const utm = (gp(events.find(e => gp(e.p, m.utmPath))?.p, m.utmPath) || {}) as Record<string, string>;
    const answers: Record<number, { answer: string }> = {};
    events.filter(e => e.p.category === m.quizCategory).forEach(e => {
      const step = gp(e.p, m.quizStepPath) as number;
      const ans = gp(e.p, m.quizAnswerPath);
      if (step != null) answers[step] = { answer: Array.isArray(ans) ? ans.join(", ") : (typeof ans === "string" ? ans : "") };
    });
    const recEvt = events.find(e => e.p.category === m.recCategory);
    const payEvts = events.filter(e => e.p.category === m.paymentCategory).sort((a, b) =>
      ["payment_successful", "payment_initiated", "payment_dismissed", "payment_abandoned"].indexOf(gp(a.p, m.paymentStepPath) as string || "") -
      ["payment_successful", "payment_initiated", "payment_dismissed", "payment_abandoned"].indexOf(gp(b.p, m.paymentStepPath) as string || ""));
    const payStep = (gp(payEvts[0]?.p, m.paymentStepPath) as string) || "";
    const payPlan = payEvts.reduce((f, e) => f || (gp(e.p, m.paymentPlanPath) as string) || "", "");
    const secMap = m.sectionIdToColumnMap || {};
    const timeSec: Record<string, number> = {};
    events.forEach(e => {
      if (e.p.category !== m.telemetryCategory) return;
      if (gp(e.p, m.timeSpentTypePath) !== m.timeSpentTypeValue) return;
      const secId = gp(e.p, m.timeSpentSectionPath) as string;
      const secs = (gp(e.p, m.timeSpentSecondsPath) as number) || 0;
      if (!secId) return;
      const col = secMap[secId] || ("section_" + secId + "_time_seconds");
      timeSec[col] = (timeSec[col] || 0) + secs;
    });
    const date = events[0]?.r.created_on?.slice(0, 10) || "";
    const dateObj = date ? new Date(date) : null;
    const quizDone = answers[4] != null;
    const status = payStep ? (stepToStatus[payStep] || payStep) : (quizDone ? "Quiz Completed" : "");
    const mobile = (gp(uEvt?.p, m.userMobilePath) as string) || "";
    if (internalNums.includes(mobile.trim())) return null;
    const lessThan2 = Object.entries(timeSec).filter(([, v]) => v <= 2).map(([k]) => k.replace(/_time_seconds$/, "")).join(", ");
    const moreThan2 = Object.entries(timeSec).filter(([, v]) => v > 2).map(([k]) => k.replace(/_time_seconds$/, "")).join(", ");
    return {
      session_id: sid, name: (gp(uEvt?.p, m.userNamePath) as string) || "", mobile,
      age_group: (gp(uEvt?.p, m.userAgeGroupPath) as string) || "",
      utm_source: utm.utm_source || "", utm_campaign: utm.utm_campaign || "",
      Datevalue: dateObj ? dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "",
      _date: date, q1_answer: answers[1]?.answer || "", q2_answer: answers[2]?.answer || "",
      q3_answer: answers[3]?.answer || "", q4_answer: answers[4]?.answer || "",
      recommendation: (gp(recEvt?.p, m.recNamePath) as string) || "",
      "Status for Analytics": status, payment_plan: payPlan,
      button_clicked: (gp(events[events.length - 1]?.p, "data.buttonId") as string) || "",
      "Time Spent Less Than 2 Seconds": lessThan2,
      "Time Spent Greater Than 2 Seconds": moreThan2,
      page_recommendation_time_seconds: (timeSec["page_recommendation_time_seconds"] || 0).toString(),
      ...timeSec,
    } as SessionRow;
  }).filter((r): r is SessionRow => r !== null && !!(r.name || r.recommendation))
    .sort((a, b) => a._date.localeCompare(b._date));
}

function buildCtx(
  rows: { date: string; meta: Record<string, string>; tel: TelRow | null }[],
  deps: { date: string; label: string }[],
  quizSessions: SessionRow[],
  dr: { from: string; to: string }
): string {
  const dStr = deps.map(d => d.date + ": " + d.label).join("\n");
  const rStr = rows.filter(r => (Object.values(r.meta).some(v => v !== "") || r.tel) && inRange(r.date, dr)).map(r => {
    const dv = calcDerived(r.meta), t = r.tel, fl = deps.filter(d => d.date === r.date).map(d => d.label).join(", ");
    return r.date + (fl ? " [" + fl + "]" : "") + "\n  Meta: spend=" + r.meta.adSpend + " imp=" + r.meta.impressions + " reach=" + r.meta.reach + " clicks=" + r.meta.linkClicks + " lpv=" + r.meta.lpv + "\n  CPC=" + (dv.cpc ? dv.cpc.toFixed(2) : "-") + " CPL=" + (dv.cpl ? dv.cpl.toFixed(2) : "-") + " CTR=" + (dv.ctr ? dv.ctr.toFixed(2) : "-") + "%\n  Tel: quizStarted=" + (t?.quizStarted ?? "-") + " quizDone=" + (t?.quizCompleted ?? "-") + " payInit=" + (t?.payInitiated ?? "-") + " payDismissed=" + (t?.payDismissed ?? "-") + " payOK=" + (t?.paySuccessful ?? "-");
  }).join("\n");
  let sessStr = "";
  if (quizSessions && quizSessions.length) {
    const qs = quizSessions.filter(s => inRange(s._date, dr));
    const paid = qs.filter(s => s["Status for Analytics"] === "Payment Successful");
    const catCount: Record<string, number> = {}, catPaid: Record<string, number> = {};
    qs.forEach(s => { const c = s.recommendation || "?"; catCount[c] = (catCount[c] || 0) + 1; if (s["Status for Analytics"] === "Payment Successful") catPaid[c] = (catPaid[c] || 0) + 1; });
    const catStr = Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([c, n]) => c + ":" + n + "sessions/" + (catPaid[c] || 0) + "paid").join(", ");
    const goalCount: Record<string, number> = {}, intCount: Record<string, number> = {}, q4All: Record<string, number> = {}, q4Paid: Record<string, number> = {};
    qs.forEach(s => { if (s.q3_answer) goalCount[s.q3_answer] = (goalCount[s.q3_answer] || 0) + 1; if (s.q1_answer) intCount[s.q1_answer] = (intCount[s.q1_answer] || 0) + 1; String(s.q4_answer || "").split(",").forEach(v => { v = v.trim(); if (v) q4All[v] = (q4All[v] || 0) + 1; }); });
    paid.forEach(s => { String(s.q4_answer || "").split(",").forEach(v => { v = v.trim(); if (v) q4Paid[v] = (q4Paid[v] || 0) + 1; }); });
    sessStr = "\n\nSESSION INSIGHTS (" + qs.length + " sessions, " + paid.length + " paid):\nCategories: " + catStr + "\nTop goals: " + Object.entries(goalCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, n]) => g + ":" + n).join(", ") + "\nTop interests: " + Object.entries(intCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, n]) => g + ":" + n).join(", ") + "\nQ4 values (total/paid): " + Object.entries(q4All).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => v + ":" + n + "/" + (q4Paid[v] || 0)).join(", ");
  }
  return "You are an analytics assistant for WizKids Carnival Talent Pass — a digital national kids championship.\nFunnel: FB Ad > Landing Page > Quiz (4 Qs) > Recommendation > Pricing > Payment. LPV from Meta pixel.\n\nDeployments:\n" + dStr + "\n\nData:\n" + rStr + sessStr;
}

async function callClaude(system: string, user: string): Promise<string> {
  try {
    const r = await fetch("/api/ai/complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages: [{ role: "user", content: user }], maxTokens: 1000 }),
    });
    const d = await r.json() as { text?: string; error?: string };
    if (d.error) return "Error: " + d.error;
    return d.text || "";
  } catch (e: unknown) {
    return "Error: " + (e instanceof Error ? e.message : String(e));
  }
}

function renderMd(text: string) {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

const TH = (a: string = "right", bg: string = "#f5f2ee"): React.CSSProperties => ({ padding: "7px 8px", fontSize: 10, fontWeight: 600, color: "#9b9590", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #e8e3dc", background: bg, textAlign: a as CanvasTextAlign, whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" });
const TD = (a: string = "right", bg: string = "#faf9f7"): React.CSSProperties => ({ padding: "6px 8px", borderBottom: "1px solid #f0ece6", textAlign: a as CanvasTextAlign, background: bg, whiteSpace: "nowrap", fontSize: 11 });
const BTN = (v: string = "default"): React.CSSProperties => ({ background: v === "primary" ? "#1a1a1a" : "#f0ede8", color: v === "primary" ? "#fff" : "#1a1a1a", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" });
const INP: React.CSSProperties = { border: "1px solid #e8e3dc", borderRadius: 5, padding: "5px 9px", fontSize: 11, background: "#fff", color: "#1a1a1a", fontFamily: "inherit", outline: "none" };
const DPILL: React.CSSProperties = { background: "#f59e0b18", color: "#b45309", fontSize: 9, fontWeight: 600, padding: "2px 5px", borderRadius: 3, display: "inline-block", marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const STATUS_COLORS: Record<string, { c: string; b: string }> = { s: { c: "#059669", b: "#f0fdf4" }, i: { c: "#0369a1", b: "#f0f9ff" }, d: { c: "#dc2626", b: "#fef2f2" }, q: { c: "#6b6560", b: "#f5f2ee" } };
const scOf = (s: string) => s === "Payment Successful" ? STATUS_COLORS.s : s === "Payment Intiated" ? STATUS_COLORS.i : (s || "").includes("Dismiss") || (s || "").includes("Abandon") ? STATUS_COLORS.d : STATUS_COLORS.q;
const Q4L: Record<string, string> = { "chance_to_be_among_indias_best": "India's best", "local_to_national_leaderboard": "Leaderboard", "medals_and_certificates": "Medals", "personalized_feedback_report": "Feedback", "school_recognition": "School rec.", "showcase_your_childs_talent": "Showcase" };

function Spin() { return <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #e5e0d8", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin .7s linear infinite" }} />; }

const SESSION_COLS = [
  { key: "_date", label: "Date", tip: "Session date" },
  { key: "name", label: "Name", tip: "Parent name + mobile" },
  { key: "recommendation", label: "Category", tip: "Recommended talent category" },
  { key: "age_group", label: "Age", tip: "Child age group (age3_5 or age6_15)" },
  { key: "utm_source", label: "Source", tip: "Traffic source e.g. meta" },
  { key: "utm_campaign", label: "Campaign", tip: "UTM campaign name" },
  { key: "q1_answer", label: "Q1", tip: "What does your child love doing?" },
  { key: "q2_answer", label: "Q2", tip: "Specific type within interest area" },
  { key: "q3_answer", label: "Q3", tip: "What do you want most for your child?" },
  { key: "q4_answer", label: "Q4 Values", tip: "What matters most — multi-select" },
  { key: "Status for Analytics", label: "Status", tip: "Final session status" },
  { key: "payment_plan", label: "Plan", tip: "Subscription plan selected" },
  { key: "button_clicked", label: "Last CTA", tip: "Last button clicked before leaving" },
  { key: "Time Spent Less Than 2 Seconds", label: "<2s", tip: "Sections with ≤2s time spent (low engagement)" },
  { key: "Time Spent Greater Than 2 Seconds", label: ">2s", tip: "Sections with >2s time spent (real engagement)" },
  { key: "page_recommendation_time_seconds", label: "Rec Pg", tip: "Time on recommendation results page" },
  { key: "section_tp-section-hero_time_seconds", label: "Hero", tip: "Time on hero/banner section" },
  { key: "section_tp-section-carousel_time_seconds", label: "Carousel", tip: "Time on result highlights carousel" },
  { key: "section_tp-section-video-player_time_seconds", label: "Video", tip: "Time watching video proof" },
  { key: "section_tp-section-why-enroll_time_seconds", label: "Why Enroll", tip: "Time on why-enroll section" },
  { key: "section_tp-section-deliverables_time_seconds", label: "Deliverables", tip: "Time on deliverables section" },
  { key: "section_tp-section-review_time_seconds", label: "Reviews", tip: "Time on testimonials/reviews" },
  { key: "section_tp-section-judges_time_seconds", label: "Judges", tip: "Time on expert judges section" },
  { key: "section_plans-section_time_seconds", label: "Plans", tip: "Time on plans overview" },
  { key: "section_tp-section-subscription-plan_time_seconds", label: "Sub Plan", tip: "Time on subscription/pricing cards" },
  { key: "section_tp-section-faq_time_seconds", label: "FAQ", tip: "Time on FAQ section" },
  { key: "page_membership_time_seconds", label: "Membership", tip: "Time on membership/pricing page" },
];

const PCT_COLS = [
  { key: "qLink", label: "Quiz/Link", hi: true, tip: "Quiz Started as % of Link Clicks" },
  { key: "qLPV", label: "Quiz/LPV", hi: true, tip: "Quiz Started as % of Landing Page Views" },
  { key: "qDone", label: "Quiz Done", tip: "Quiz Completed as % of Quiz Started" },
  { key: "payI", label: "Pay Init", tip: "Payment Initiated as % of Quiz Completed" },
  { key: "payD", label: "Pay Dismissed", tip: "Payment Dismissed as % of Payment Initiated" },
  { key: "eF", label: "Enroll Hero", tip: "Enroll Now (Hero button) click rate" },
  { key: "eP", label: "Enroll Price", tip: "Enroll Now (Price section) click rate" },
  { key: "pClk", label: "Pay/Clicks", hi: true, tip: "Payment Complete as % of Link Clicks" },
  { key: "pLPV", label: "Pay/LPV", hi: true, tip: "Payment Complete as % of Landing Page Views" },
  { key: "pQS", label: "Pay/Quiz", hi: true, tip: "Payment Complete as % of Quiz Starts" },
  { key: "pQC", label: "Pay/Done", hi: true, tip: "Payment Complete as % of Quiz Completed" },
];

const META_M = [{ key: "adSpend", label: "Spend excl GST", pre: "₹" }, { key: "impressions", label: "Impressions" }, { key: "reach", label: "Reach" }, { key: "linkClicks", label: "Link Clicks" }, { key: "lpv", label: "LPV" }];
const META_D = [{ key: "gst", label: "Spend incl GST", pre: "₹", dec: 0 }, { key: "freq", label: "Frequency", dec: 2 }, { key: "cpc", label: "Cost/Click", pre: "₹", dec: 2 }, { key: "cpl", label: "Cost/Lead", pre: "₹", dec: 2 }, { key: "ctr", label: "CTR", suf: "%", dec: 2 }];
const TEL_C = [{ key: "quizStarted", label: "Quiz Started" }, { key: "quizCompleted", label: "Quiz Done" }, { key: "payInitiated", label: "Pay Init" }, { key: "payDismissed", label: "Pay Dismissed" }, { key: "paySuccessful", label: "Pay OK" }];

interface DepItem { date: string; label: string; }
interface RowItem { date: string; meta: Record<string, string>; tel: TelRow | null; }
interface MappingCacheItem { fp: string; mapping: MappingState; }

export default function App() {
  const [tab, setTab] = useState("table");
  const [rows, setRows] = useState<RowItem[]>(() => DATES.map(date => ({ date, meta: SEED_META[date] || { adSpend: "", impressions: "", reach: "", linkClicks: "", lpv: "" }, tel: null })));
  const [deps, setDeps] = useState<DepItem[]>(SEED_DEPS);
  const [mode, setMode] = useState("raw");
  const [editCell, setEditCell] = useState<{ date: string; field: string } | null>(null);
  const [editVal, setEditVal] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [mappingState, setMappingState] = useState<MappingCacheItem | null>(() => { try { const c = localStorage.getItem("wkc_schema"); if (!c) return null; const parsed = JSON.parse(c) as MappingCacheItem; if (parsed.mapping?.timeSpentTypeValue === "time_spent" || parsed.mapping?.timeSpentSecondsPath === "data.seconds") { localStorage.removeItem("wkc_schema"); return null; } return parsed; } catch { return null; } });
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingNote, setMappingNote] = useState("");
  const [recs, setRecs] = useState<{ type: string; title: string; detail: string }[] | null>(null);
  const [recLoad, setRecLoad] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commLoad, setCommLoad] = useState(false);
  const [qa, setQa] = useState<{ role: string; content: string }[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [qaLoad, setQaLoad] = useState(false);
  const [depForm, setDepForm] = useState({ show: false, date: "", label: "" });
  const [quizRows, setQuizRows] = useState<SessionRow[]>([]);
  const [qFilter, setQFilter] = useState({ date: "all", rec: "all", status: "all" });
  const [qSearch, setQSearch] = useState("");
  const [qSort, setQSort] = useState<{ key: string | null; dir: number }>({ key: null, dir: 1 });
  const [internalNums, setInternalNums] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("wkc_internal") || "null") || []; } catch { return []; } });
  const [showIntMgr, setShowIntMgr] = useState(false);
  const [newIntNum, setNewIntNum] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const qaRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCsvLoading(true); setMappingNote("");
    const text = await file.text();
    const raw = parseCSV(text, r => !!(r.id || r.session_id));
    setRows(prev => prev.map(r => { const t = computeTel(raw, r.date); return t ? { ...r, tel: t } : r; }));
    const fp = schemaFP(raw);
    let mapping: MappingState;
    if (mappingState && mappingState.fp === fp) {
      mapping = mappingState.mapping;
      setMappingNote("Schema unchanged — using cached mapping.");
    } else {
      setMappingLoading(true);
      setMappingNote("New schema detected — asking AI to map fields...");
      try {
        mapping = await fetchAIMapping(raw);
        const changes = mapping.changes || [];
        const entry = { fp, mapping };
        setMappingState(entry);
        try { localStorage.setItem("wkc_schema", JSON.stringify(entry)); } catch {}
        setMappingNote(changes.length ? "Schema updated. Changes: " + changes.join("; ") : "Schema mapped — no structural changes.");
      } catch (err: unknown) {
        mapping = DEFAULT_MAPPING;
        setMappingNote("AI mapping failed — using defaults. " + (err instanceof Error ? err.message : String(err)));
      }
      setMappingLoading(false);
    }
    const sessions = buildSessions(raw, mapping, internalNums);
    setQuizRows(sessions);
    setRows(prev => { genRecs(prev, deps, sessions); return prev; });
    setCsvLoading(false); e.target.value = "";
  };

  const genRecs = async (currentRows: RowItem[], currentDeps: DepItem[], sessions?: SessionRow[]) => {
    setRecLoad(true);
    const ctx = buildCtx(currentRows, currentDeps, sessions || quizRows, dateRange);
    const result = await callClaude(ctx, 'Return ONLY a JSON array of recommendation objects, no markdown.\nEach: {"type":"action"|"watch"|"anomaly","title":"max 8 words","detail":"2-3 sentences with specific dates/numbers"}\n6-8 items total.');
    try { setRecs(JSON.parse(result.split("```json").join("").split("```").join("").trim())); }
    catch { setRecs([{ type: "action", title: "Analysis complete", detail: result }]); }
    setRecLoad(false);
  };

  const genComments = async () => {
    setCommLoad(true);
    const ctx = buildCtx(rows, deps, quizRows, dateRange);
    const result = await callClaude(ctx, 'For each date with data, write one sentence max 12 words. Return ONLY JSON: {"2026-05-03":"sentence"}');
    try { setComments(JSON.parse(result.split("```json").join("").split("```").join("").trim())); } catch { setComments({}); }
    setCommLoad(false);
  };

  const sendQA = async () => {
    const q = qaInput.trim(); if (!q || qaLoad) return;
    setQaInput(""); setQaLoad(true);
    setQa(h => [...h, { role: "user", content: q }]);
    const ctx = buildCtx(rows, deps, quizRows, dateRange);
    const ans = await callClaude(ctx, q + "\n\nBe concise, 2-4 sentences. Bold **key numbers** only.");
    setQa(h => [...h, { role: "assistant", content: ans }]);
    setQaLoad(false);
    setTimeout(() => qaRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }), 80);
  };

  const commitEdit = () => {
    if (!editCell) return;
    setRows(prev => prev.map(r => r.date === editCell.date ? { ...r, meta: { ...r.meta, [editCell.field]: editVal } } : r));
    setEditCell(null);
  };

  const addIntNum = (n: string) => {
    if (!n.trim()) return;
    setInternalNums(prev => { const next = [...new Set([...prev, n.trim()])]; try { localStorage.setItem("wkc_internal", JSON.stringify(next)); } catch {} return next; });
    setNewIntNum("");
  };

  const delIntNum = (n: string) => {
    setInternalNums(prev => { const next = prev.filter(x => x !== n); try { localStorage.setItem("wkc_internal", JSON.stringify(next)); } catch {} return next; });
  };

  const hasData = (r: RowItem) => Object.values(r.meta).some(v => v !== "") || !!r.tel;
  const depForDate = (d: string) => deps.filter(x => x.date === d);
  const pctColor = (v: string) => { if (!v || v === "0.00%") return "#ccc"; const n = parseFloat(v); return n >= 50 ? "#059669" : n >= 20 ? "#0369a1" : n >= 5 ? "#1a1a1a" : "#6b6560"; };

  const sortedQ = qSort.key ? [...quizRows].sort((a, b) => {
    const av = qSort.key === "_date" ? (a._date || a.Datevalue || "") : (a[qSort.key!] || "");
    const bv = qSort.key === "_date" ? (b._date || b.Datevalue || "") : (b[qSort.key!] || "");
    const an = parseFloat(av), bn = parseFloat(bv);
    if (!isNaN(an) && !isNaN(bn)) return (an - bn) * qSort.dir;
    return av.toString().localeCompare(bv.toString()) * qSort.dir;
  }) : quizRows;

  const filteredQ = sortedQ.filter(r => {
    if (!inRange(r._date, dateRange)) return false;
    if (qFilter.date !== "all" && r.Datevalue !== qFilter.date) return false;
    if (qFilter.rec !== "all" && r.recommendation !== qFilter.rec) return false;
    if (qFilter.status !== "all" && (r["Status for Analytics"] || "Quiz Completed") !== qFilter.status) return false;
    if (qSearch) { const q = qSearch.toLowerCase(); if (!r.name?.toLowerCase().includes(q) && !r.mobile?.includes(q) && !r.recommendation?.toLowerCase().includes(q)) return false; }
    return true;
  });

  const uniqueQDates = [...new Set(quizRows.map(r => r.Datevalue).filter(Boolean))].sort();
  const ALL_RECS = ["Build It!", "Color Wizards", "Dance Wizards", "Handwriting Champs", "Instrumental Genius", "Master Orator", "Recite It! - English", "Singing Stars", "Tell Ur Tale"];
  const ALL_STATS = ["Quiz Completed", "Payment Intiated", "Payment Successful", "Payment Dismissed", "Payment Abandoned"];
  const TYPE_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    action: { label: "Action", color: "#1a1a1a", bg: "#f5f2ee", dot: "#1a1a1a" },
    watch: { label: "Watch", color: "#0369a1", bg: "#f0f9ff", dot: "#0369a1" },
    anomaly: { label: "Anomaly", color: "#b91c1c", bg: "#fef2f2", dot: "#b91c1c" },
  };

  return (
    <div style={{ background: "#faf9f7", minHeight: "100vh", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#1a1a1a", fontSize: 13 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}.fu{animation:fu .2s ease}button:hover{opacity:.8}.ed:hover{background:#fffbf2!important;cursor:text}.rh:hover td{background:#f7f5f0!important}*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#d5d0c8;border-radius:2px}textarea{resize:none;font-family:inherit}`}</style>

      {/* Header */}
      <div style={{ background: "#faf9f7", borderBottom: "1px solid #e8e3dc", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>WizKids Carnival</span>
          <span style={{ fontSize: 11, color: "#9b9590" }}>Talent Pass Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0ede8", borderRadius: 6, padding: "4px 10px" }}>
            <span style={{ fontSize: 10, color: "#9b9590" }}>From</span>
            <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 11, color: "#1a1a1a", outline: "none", fontFamily: "inherit", cursor: "pointer" }} />
            <span style={{ fontSize: 10, color: "#9b9590" }}>To</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} style={{ border: "none", background: "transparent", fontSize: 11, color: "#1a1a1a", outline: "none", fontFamily: "inherit", cursor: "pointer" }} />
            {(dateRange.from || dateRange.to) && <span onClick={() => setDateRange({ from: "", to: "" })} style={{ fontSize: 12, color: "#9b9590", cursor: "pointer" }}>✕</span>}
          </div>
          <label style={{ ...BTN(), cursor: (csvLoading || mappingLoading) ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            {(csvLoading || mappingLoading) ? <Spin /> : <span>↑</span>}
            {mappingLoading ? "Mapping..." : (csvLoading ? "Processing..." : "Upload CSV")}
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSV} disabled={csvLoading || mappingLoading} />
          </label>
        </div>
      </div>

      {/* Mapping note */}
      {mappingNote && <div style={{ padding: "7px 20px", background: mappingNote.includes("Changes") || mappingNote.includes("failed") ? "#fef9ec" : "#f0fdf8", borderBottom: "1px solid #e8e3dc", fontSize: 11, color: mappingNote.includes("failed") ? "#b91c1c" : mappingNote.includes("Changes") ? "#92400e" : "#065f46", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{mappingNote.includes("Changes") ? "⚠ " : mappingNote.includes("failed") ? "✕ " : "✓ "}{mappingNote}</span>
        <span onClick={() => setMappingNote("")} style={{ cursor: "pointer", color: "#9b9590", marginLeft: 12 }}>✕</span>
      </div>}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e3dc", padding: "0 20px", background: "#faf9f7" }}>
        {([["table", "Data Table"], ["sessions", "Quiz Sessions"], ["recs", "Recommendations"], ["qa", "Ask AI"]] as [string, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", padding: "12px 0", marginRight: 24, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: tab === k ? "#1a1a1a" : "#9b9590", borderBottom: tab === k ? "2px solid #1a1a1a" : "2px solid transparent", transition: "all .15s" }}>{l}</button>
        ))}
      </div>

      {/* DATA TABLE */}
      {tab === "table" && <div style={{ padding: 20 }}>
        {csvLoading && <div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, color: "#9b9590", fontSize: 12 }}><Spin /> Processing CSV...</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Daily Funnel</div><div style={{ fontSize: 11, color: "#9b9590" }}>Click Meta cells to edit · Upload CSV for telemetry</div></div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", background: "#f0ede8", borderRadius: 6, padding: 2 }}>
              {([["raw", "Raw"], ["%", "%"]] as [string, string][]).map(([v, l]) => <button key={v} onClick={() => setMode(v)} style={{ background: mode === v ? "#fff" : "transparent", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: mode === v ? "#1a1a1a" : "#9b9590", boxShadow: mode === v ? "0 1px 2px #0001" : "none" }}>{l}</button>)}
            </div>
            <button style={BTN()} onClick={genComments} disabled={commLoad}>{commLoad ? <Spin /> : "✦ AI Comments"}</button>
            <button style={BTN()} onClick={() => setDepForm(f => ({ ...f, show: !f.show }))}>+ Deploy</button>
          </div>
        </div>

        {depForm.show && <div className="fu" style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input value={depForm.date} onChange={e => setDepForm(f => ({ ...f, date: e.target.value }))} placeholder="2026-05-20" style={{ ...INP, width: 110, fontFamily: "monospace" }} />
          <input value={depForm.label} onChange={e => setDepForm(f => ({ ...f, label: e.target.value }))} placeholder="What changed?" style={{ ...INP, width: 200 }} />
          <button style={BTN("primary")} onClick={() => { if (depForm.date && depForm.label) { setDeps(d => [...d, { date: depForm.date, label: depForm.label }]); setDepForm({ show: false, date: "", label: "" }); } }}>Add</button>
          <button style={BTN()} onClick={() => setDepForm(f => ({ ...f, show: false }))}>Cancel</button>
        </div>}

        <div style={{ overflowX: "auto", border: "1px solid #e8e3dc", borderRadius: 8, background: "#fff", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <tr>
                <th style={{ ...TH("left"), position: "sticky", left: 0, zIndex: 6, minWidth: 90 }}>Date</th>
                {mode === "raw" && <>{META_M.map(c => <th key={c.key} style={TH("right", "#fffbf0")}>{c.label}</th>)}{META_D.map(c => <th key={c.key} style={TH("right")}>{c.label}</th>)}{TEL_C.map(c => <th key={c.key} style={TH("right", "#f0fdf8")}>{c.label}</th>)}<th style={{ ...TH("left"), minWidth: 160 }}>AI Note</th></>}
                {mode === "%" && PCT_COLS.map(c => <th key={c.key} title={c.tip} style={TH("right", c.hi ? "#fffbf0" : "#f5f2ee")}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.filter(row => inRange(row.date, dateRange)).map(row => {
                const dv = calcDerived(row.meta), rdeps = depForDate(row.date), noData = !hasData(row);
                const isEd = (f: string) => editCell?.date === row.date && editCell?.field === f;
                const dvAny = dv as Record<string, number | null>;
                return (
                  <tr key={row.date} className="rh" style={{ opacity: noData ? .35 : 1 }}>
                    <td style={{ ...TD("left", "#faf9f7"), position: "sticky", left: 0, zIndex: 1, fontFamily: "monospace", fontSize: 10 }}>
                      <div style={{ color: rdeps.length ? "#b45309" : "#6b6560", fontWeight: rdeps.length ? 600 : 400 }}>{row.date.slice(5)}</div>
                      {rdeps.map((d, i) => <div key={i} style={DPILL}>&#9873; {d.label}</div>)}
                    </td>
                    {mode === "raw" && <>
                      {META_M.map(c => (
                        <td key={c.key} className="ed" style={TD("right", "#fffbf5")} onClick={() => { setEditCell({ date: row.date, field: c.key }); setEditVal(row.meta[c.key]); }}>
                          {isEd(c.key) ? <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit} onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditCell(null); }} style={{ border: "1px solid #1a1a1a", borderRadius: 3, padding: "2px 5px", fontSize: 11, width: 75, textAlign: "right", outline: "none", fontFamily: "monospace" }} /> : <span style={{ color: row.meta[c.key] ? "#1a1a1a" : "#ccc", fontFamily: "monospace" }}>{row.meta[c.key] ? ((c as { pre?: string }).pre || "") + row.meta[c.key] : "—"}</span>}
                        </td>
                      ))}
                      {META_D.map(c => <td key={c.key} style={TD("right", "#f9f7f4")}><span style={{ color: dvAny[c.key] ? "#6b6560" : "#d5d0c8", fontFamily: "monospace" }}>{dvAny[c.key] != null ? ((c as { pre?: string }).pre || "") + (+dvAny[c.key]!).toFixed(c.dec || 0) + ((c as { suf?: string }).suf || "") : "—"}</span></td>)}
                      {TEL_C.map(c => { const v = row.tel?.[c.key as keyof TelRow]; return <td key={c.key} style={TD("right", "#f7fdfb")}><span style={{ fontFamily: "monospace", color: v == null ? "#d5d0c8" : c.key === "paySuccessful" && v > 0 ? "#059669" : v > 0 ? "#1a1a1a" : "#ccc", fontWeight: c.key === "paySuccessful" && v != null && v > 0 ? 600 : 400 }}>{v ?? "-"}</span></td>; })}
                      <td style={TD("left")}>
                        {comments[row.date] ? <span style={{ color: "#6b6560", lineHeight: 1.5, fontSize: 10 }}>{comments[row.date]}</span> : commLoad ? <Spin /> : hasData(row) ? <span style={{ color: "#ccc", fontSize: 10, cursor: "pointer" }} onClick={async () => { const ctx = buildCtx(rows, deps, quizRows, dateRange); const c = await callClaude(ctx, "For " + row.date + " only: one sentence about performance. Note any deployment."); setComments(p => ({ ...p, [row.date]: c })); }}>generate</span> : null}
                      </td>
                    </>}
                    {mode === "%" && PCT_COLS.map(c => { const pct = SEED_PCT[row.date] || {}; const v = pct[c.key] || ""; return <td key={c.key} style={TD("right", c.hi ? "#fffbf5" : "#faf9f7")}><span style={{ fontFamily: "monospace", color: pctColor(v), fontWeight: c.hi && v && v !== "0.00%" ? 500 : 400 }}>{v || "—"}</span></td>; })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>}

      {/* QUIZ SESSIONS */}
      {tab === "sessions" && <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Quiz Sessions</div>
            <div style={{ fontSize: 11, color: "#9b9590" }}>{quizRows.length > 0 ? filteredQ.length + " of " + quizRows.length + " sessions" : "Upload CSV to populate"}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button style={BTN()} onClick={() => setShowIntMgr(v => !v)}>&#8856; Internal ({internalNums.length})</button>
            <button style={BTN()} onClick={() => { setMappingState(null); try { localStorage.removeItem("wkc_schema"); } catch {} setMappingNote("Mapping cache cleared — will re-map on next CSV upload."); }} title="Force Claude to re-map fields on next upload">Reset Mapping</button>
            <div style={{ fontSize: 11, color: "#9b9590", padding: "6px 10px", background: "#f5f2ee", borderRadius: 6, display: "flex", alignItems: "center" }}>Populated from Telemetry CSV ↑</div>
          </div>
        </div>

        {showIntMgr && <div className="fu" style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Internal / Test Numbers</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {internalNums.map(n => <span key={n} style={{ background: "#f5f2ee", borderRadius: 4, padding: "3px 7px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>{n}<span onClick={() => delIntNum(n)} style={{ cursor: "pointer", color: "#dc2626", fontWeight: 700 }}>×</span></span>)}
            {!internalNums.length && <span style={{ color: "#9b9590", fontSize: 11 }}>None added</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={newIntNum} onChange={e => setNewIntNum(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addIntNum(newIntNum); }} placeholder="Add mobile number..." style={{ ...INP, width: 180, fontFamily: "monospace" }} />
            <button style={BTN("primary")} onClick={() => addIntNum(newIntNum)}>Add</button>
          </div>
          <div style={{ fontSize: 10, color: "#9b9590", marginTop: 6 }}>Excluded from all tables and AI context. Saved in browser storage.</div>
        </div>}

        {quizRows.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Search name / mobile..." style={{ ...INP, width: 160 }} />
          <select value={qFilter.date} onChange={e => setQFilter(f => ({ ...f, date: e.target.value }))} style={{ ...INP, cursor: "pointer" }}><option value="all">All dates</option>{uniqueQDates.map(d => <option key={d} value={d}>{d}</option>)}</select>
          <select value={qFilter.rec} onChange={e => setQFilter(f => ({ ...f, rec: e.target.value }))} style={{ ...INP, cursor: "pointer" }}><option value="all">All categories</option>{ALL_RECS.map(r => <option key={r} value={r}>{r}</option>)}</select>
          <select value={qFilter.status} onChange={e => setQFilter(f => ({ ...f, status: e.target.value }))} style={{ ...INP, cursor: "pointer" }}><option value="all">All statuses</option>{ALL_STATS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <div style={{ width: 1, height: 20, background: "#e8e3dc", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#9b9590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sort</span>
          <select value={qSort.key || ""} onChange={e => setQSort({ key: e.target.value || null, dir: 1 })} style={{ ...INP, cursor: "pointer" }}>
            <option value="">— none —</option>
            {SESSION_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          {qSort.key && <button style={BTN()} onClick={() => setQSort(s => ({ ...s, dir: s.dir * -1 }))}>{qSort.dir === 1 ? "↑ Asc" : "↓ Desc"}</button>}
          {(qFilter.date !== "all" || qFilter.rec !== "all" || qFilter.status !== "all" || qSearch || qSort.key) && <button style={BTN()} onClick={() => { setQFilter({ date: "all", rec: "all", status: "all" }); setQSearch(""); setQSort({ key: null, dir: 1 }); }}>Clear all</button>}
        </div>}

        {quizRows.length === 0 ? <div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: 40, textAlign: "center", color: "#9b9590" }}>Upload the telemetry CSV to populate sessions.</div> :
          <div style={{ overflowX: "auto", border: "1px solid #e8e3dc", borderRadius: 8, background: "#fff", maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                <tr>
                  {SESSION_COLS.map(c => <th key={c.key} title={c.tip} onClick={() => setQSort(s => ({ key: c.key, dir: s.key === c.key ? -s.dir : 1 }))} style={{ ...TH("left"), whiteSpace: "nowrap" }}>{c.label}{qSort.key === c.key ? (qSort.dir === 1 ? " ↑" : " ↓") : ""}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredQ.map((row, i) => {
                  const sc = scOf(row["Status for Analytics"]);
                  const isExp = expanded === row.session_id;
                  return (
                    <tr key={row.session_id + i} className="rh" onClick={() => setExpanded(isExp ? null : row.session_id)} style={{ cursor: "pointer" }}>
                      {SESSION_COLS.map(c => {
                        let val = row[c.key] || "";
                        let cellStyle: React.CSSProperties = { ...TD("left"), maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" };
                        if (c.key === "Status for Analytics") {
                          return <td key={c.key} style={{ ...TD("left") }}><span style={{ background: sc.b, color: sc.c, borderRadius: 3, padding: "2px 5px", fontSize: 10, fontWeight: 500, whiteSpace: "nowrap" }}>{val || "Quiz Completed"}</span></td>;
                        }
                        if (c.key === "q4_answer") {
                          const parts = String(val || "").split(",").map((v: string) => v.trim()).filter(Boolean);
                          return <td key={c.key} style={TD("left")}><span style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{parts.map((p: string) => <span key={p} style={{ background: "#f0f9ff", color: "#0369a1", borderRadius: 3, padding: "1px 4px", fontSize: 9, fontWeight: 500 }}>{Q4L[p] || p}</span>)}</span></td>;
                        }
                        if (c.key === "name") {
                          return <td key={c.key} style={TD("left")}><div style={{ fontSize: 11, fontWeight: 500 }}>{val}</div><div style={{ fontSize: 9, color: "#9b9590", fontFamily: "monospace" }}>{row.mobile}</div></td>;
                        }
                        if (c.key === "_date") {
                          return <td key={c.key} style={{ ...TD("left"), fontFamily: "monospace", fontSize: 10 }}>{val}</td>;
                        }
                        if (["page_recommendation_time_seconds", "section_tp-section-hero_time_seconds", "section_tp-section-carousel_time_seconds", "section_tp-section-video-player_time_seconds", "section_tp-section-why-enroll_time_seconds", "section_tp-section-deliverables_time_seconds", "section_tp-section-review_time_seconds", "section_tp-section-judges_time_seconds", "section_plans-section_time_seconds", "section_tp-section-subscription-plan_time_seconds", "section_tp-section-faq_time_seconds", "page_membership_time_seconds"].includes(c.key)) {
                          const secs = parseFloat(val) || 0;
                          return <td key={c.key} style={{ ...TD("right"), fontFamily: "monospace", color: secs > 10 ? "#059669" : secs > 2 ? "#1a1a1a" : "#ccc" }}>{secs > 0 ? secs + "s" : "—"}</td>;
                        }
                        return <td key={c.key} style={cellStyle}>{val || "—"}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>}
      </div>}

      {/* RECOMMENDATIONS */}
      {tab === "recs" && <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>AI Recommendations</div><div style={{ fontSize: 11, color: "#9b9590" }}>Generated from your funnel data</div></div>
          <button style={BTN("primary")} onClick={() => genRecs(rows, deps)} disabled={recLoad}>{recLoad ? <><Spin /> &nbsp;Analyzing...</> : "✦ Generate"}</button>
        </div>
        {!recs && !recLoad && <div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: 40, textAlign: "center", color: "#9b9590" }}>Click Generate to get AI-powered recommendations from your funnel data.</div>}
        {recLoad && <div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: 24, display: "flex", alignItems: "center", gap: 10, color: "#9b9590" }}><Spin /> Analyzing funnel data...</div>}
        {recs && !recLoad && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recs.map((rec, i) => {
            const tm = TYPE_META[rec.type] || TYPE_META.action;
            const isExp = expanded === "rec_" + i;
            return (
              <div key={i} className="fu" onClick={() => setExpanded(isExp ? null : "rec_" + i)} style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: tm.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, background: tm.bg, color: tm.color, borderRadius: 3, padding: "2px 5px" }}>{tm.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{rec.title}</span>
                </div>
                {isExp && <div style={{ marginTop: 8, fontSize: 11, color: "#6b6560", lineHeight: 1.6, paddingLeft: 14 }}>{renderMd(rec.detail)}</div>}
              </div>
            );
          })}
        </div>}
      </div>}

      {/* ASK AI */}
      {tab === "qa" && <div style={{ padding: 20, display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Ask AI</div>
        <div style={{ fontSize: 11, color: "#9b9590", marginBottom: 12 }}>Ask anything about your funnel data</div>
        <div ref={qaRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {qa.length === 0 && <div style={{ color: "#9b9590", fontSize: 11, textAlign: "center", marginTop: 40 }}>Ask a question about your WizKids Carnival funnel data.</div>}
          {qa.map((m, i) => (
            <div key={i} className="fu" style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "75%", background: m.role === "user" ? "#1a1a1a" : "#fff", color: m.role === "user" ? "#fff" : "#1a1a1a", borderRadius: 8, padding: "8px 12px", fontSize: 12, lineHeight: 1.6, border: m.role === "user" ? "none" : "1px solid #e8e3dc" }}>
                {m.role === "assistant" ? renderMd(m.content) : m.content}
              </div>
            </div>
          ))}
          {qaLoad && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: "8px 12px", display: "flex", gap: 6, alignItems: "center", color: "#9b9590", fontSize: 12 }}><Spin /> Thinking...</div></div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={qaInput} onChange={e => setQaInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQA(); } }} placeholder="Ask about conversions, trends, anomalies..." style={{ ...INP, flex: 1 }} disabled={qaLoad} />
          <button style={BTN("primary")} onClick={sendQA} disabled={qaLoad || !qaInput.trim()}>{qaLoad ? <Spin /> : "Send"}</button>
        </div>
      </div>}
    </div>
  );
}
