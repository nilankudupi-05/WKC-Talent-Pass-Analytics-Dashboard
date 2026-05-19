import { useState } from "react";

const CATEGORIES = [
  { key: "dance", label: "Dance Wizards" },
  { key: "singing", label: "Singing Stars" },
  { key: "orator", label: "Master Orator" },
  { key: "build", label: "Build It!" },
  { key: "handwriting", label: "Handwriting Champs" },
  { key: "instrumental", label: "Instrumental Genius" },
  { key: "recite", label: "Recite It! - English" },
  { key: "color", label: "Color Wizards" },
  { key: "tale", label: "Tell Ur Tale" },
];

const STATUS_COLS = [
  { key: "rec",     label: "Rec Gen",    short: "REC GEN",   color: "#0369a1", bg: "#f0f9ff" },
  { key: "payInit", label: "Pay Init",   short: "PAY INIT",  color: "#b45309", bg: "#fffbeb" },
  { key: "payAbn",  label: "Pay Abn",    short: "PAY ABN",   color: "#dc2626", bg: "#fef2f2" },
  { key: "payOK",   label: "Pay Succ",   short: "PAY SUCC",  color: "#059669", bg: "#f0fdf4" },
];

const ALL_DATES = [
  "2026-04-25","2026-04-26","2026-04-27","2026-04-28","2026-04-29","2026-04-30",
  "2026-05-01","2026-05-02","2026-05-03","2026-05-04","2026-05-05","2026-05-06",
  "2026-05-07","2026-05-08","2026-05-09","2026-05-10","2026-05-11","2026-05-12",
  "2026-05-13","2026-05-14","2026-05-15","2026-05-16",
];

type CatData = { rec: number; payInit: number; payAbn: number; payOK: number };
type Row = { date: string; data: Record<string, CatData> };

function seed(n: number, max: number) { return Math.floor(((n * 7 + 3) % max) + 1); }

const ALL_ROWS: Row[] = ALL_DATES.map((date, di) => {
  const data: Record<string, CatData> = {};
  CATEGORIES.forEach((cat, ci) => {
    const rec = seed(di * 11 + ci * 3, 14) + 2;
    const payInit = Math.max(1, Math.floor(rec * (0.25 + ((di + ci) % 5) * 0.04)));
    const payAbn  = Math.max(0, Math.floor(payInit * (0.1 + (ci % 3) * 0.08)));
    const payOK   = Math.max(0, payInit - payAbn - Math.floor(payInit * 0.05));
    data[cat.key] = { rec, payInit, payAbn, payOK };
  });
  return { date, data };
});

const BTN = (active = false): React.CSSProperties => ({
  border: active ? "1.5px solid #1a1a1a" : "1px solid #e8e3dc",
  borderRadius: 5,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
  background: active ? "#1a1a1a" : "#fff",
  color: active ? "#fff" : "#6b6560",
  fontFamily: "inherit",
});

const INP: React.CSSProperties = {
  border: "1px solid #e8e3dc",
  borderRadius: 5,
  padding: "4px 8px",
  fontSize: 11,
  background: "#fff",
  color: "#1a1a1a",
  fontFamily: "inherit",
  outline: "none",
};

export function CategoryMatrix() {
  const [fromDate, setFromDate] = useState("2026-05-03");
  const [toDate,   setToDate]   = useState("2026-05-16");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(STATUS_COLS.map(s => s.key))
  );

  const toggleCol = (key: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const activeCols = STATUS_COLS.filter(s => visibleCols.has(s.key));

  const filteredRows = ALL_ROWS.filter(r => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate   && r.date > toDate)   return false;
    return true;
  });

  const catTotal = (catKey: string) => {
    const t = { rec: 0, payInit: 0, payAbn: 0, payOK: 0 };
    filteredRows.forEach(r => {
      t.rec     += r.data[catKey].rec;
      t.payInit += r.data[catKey].payInit;
      t.payAbn  += r.data[catKey].payAbn;
      t.payOK   += r.data[catKey].payOK;
    });
    return t;
  };

  const rowTotal = (row: Row) => {
    const t = { rec: 0, payInit: 0, payAbn: 0, payOK: 0 };
    CATEGORIES.forEach(cat => {
      t.rec     += row.data[cat.key].rec;
      t.payInit += row.data[cat.key].payInit;
      t.payAbn  += row.data[cat.key].payAbn;
      t.payOK   += row.data[cat.key].payOK;
    });
    return t;
  };

  const grandTotals = CATEGORIES.reduce(
    (acc, cat) => {
      const t = catTotal(cat.key);
      acc.rec += t.rec; acc.payInit += t.payInit; acc.payAbn += t.payAbn; acc.payOK += t.payOK;
      return acc;
    },
    { rec: 0, payInit: 0, payAbn: 0, payOK: 0 }
  );

  const cellVal = (v: number, colKey: string) => {
    if (!visibleCols.has(colKey)) return null;
    const col = STATUS_COLS.find(s => s.key === colKey)!;
    const isEmpty = v === 0;
    return (
      <td style={{ padding: "5px 6px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #f0ece6", fontFamily: "monospace", color: isEmpty ? "#ccc" : col.color, background: isEmpty ? "#fff" : col.bg + "40", whiteSpace: "nowrap" }}>
        {isEmpty ? "—" : v}
      </td>
    );
  };

  const footerVal = (v: number, colKey: string) => {
    if (!visibleCols.has(colKey)) return null;
    const col = STATUS_COLS.find(s => s.key === colKey)!;
    return (
      <td style={{ padding: "6px 6px", fontSize: 11, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: col.color, background: "#f5f2ee", whiteSpace: "nowrap" }}>
        {v}
      </td>
    );
  };

  const subHeaderTH = (col: typeof STATUS_COLS[0], isTotalGroup = false) => (
    <th key={col.key} style={{ padding: "5px 6px", fontSize: 9, fontWeight: 600, textAlign: "right", background: isTotalGroup ? "#f0ede8" : "#faf9f7", borderBottom: "2px solid #1a1a1a", color: col.color, textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {col.short}
    </th>
  );

  const colSpan = activeCols.length + 1; // +1 for Total col

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#faf9f7", minHeight: "100vh", fontSize: 13 }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-thumb { background: #d5d0c8; border-radius: 2px; } button:hover { opacity: .8; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e8e3dc", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>WizKids Carnival</span>
          <span style={{ fontSize: 11, color: "#9b9590" }}>Talent Pass Analytics</span>
        </div>
        {/* Global date range (matches main app header) */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0ede8", borderRadius: 6, padding: "4px 10px" }}>
          <span style={{ fontSize: 10, color: "#9b9590" }}>From</span>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 11, color: "#1a1a1a", outline: "none", fontFamily: "inherit", cursor: "pointer" }} />
          <span style={{ fontSize: 10, color: "#9b9590" }}>To</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 11, color: "#1a1a1a", outline: "none", fontFamily: "inherit", cursor: "pointer" }} />
          {(fromDate || toDate) && <span onClick={() => { setFromDate(""); setToDate(""); }} style={{ fontSize: 12, color: "#9b9590", cursor: "pointer" }}>✕</span>}
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e3dc", padding: "0 20px", background: "#faf9f7" }}>
        {["Data Table", "Quiz Sessions", "Recommendations", "Ask AI", "Category Matrix"].map(t => (
          <div key={t} style={{ padding: "12px 0", marginRight: 24, fontSize: 12, fontWeight: 500, cursor: "pointer", color: t === "Category Matrix" ? "#1a1a1a" : "#9b9590", borderBottom: t === "Category Matrix" ? "2px solid #1a1a1a" : "2px solid transparent" }}>{t}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {/* Page header + status filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Category Matrix</div>
            <div style={{ fontSize: 11, color: "#9b9590" }}>
              {filteredRows.length} day{filteredRows.length !== 1 ? "s" : ""} · funnel events per talent category
            </div>
          </div>

          {/* Status column visibility toggles */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#9b9590", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Show</span>
            {STATUS_COLS.map(col => (
              <button key={col.key} onClick={() => toggleCol(col.key)} style={{ ...BTN(visibleCols.has(col.key)), color: visibleCols.has(col.key) ? col.color : "#9b9590", background: visibleCols.has(col.key) ? col.bg : "#fff", border: visibleCols.has(col.key) ? `1.5px solid ${col.color}40` : "1px solid #e8e3dc" }}>
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length === 0
          ? <div style={{ background: "#fff", border: "1px solid #e8e3dc", borderRadius: 8, padding: 40, textAlign: "center", color: "#9b9590" }}>No data for the selected date range.</div>
          : <div style={{ overflowX: "auto", border: "1px solid #e8e3dc", borderRadius: 8, background: "#fff", maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "max-content" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                {/* Category group headers */}
                <tr>
                  <th rowSpan={2} style={{ padding: "6px 12px", fontSize: 10, fontWeight: 600, textAlign: "left", background: "#f5f2ee", borderBottom: "1px solid #e8e3dc", borderRight: "2px solid #d5d0c8", color: "#9b9590", letterSpacing: "0.05em", textTransform: "uppercase", minWidth: 84, position: "sticky", left: 0, zIndex: 6, verticalAlign: "bottom", paddingBottom: 11 }}>
                    Date
                  </th>
                  {CATEGORIES.map(cat => (
                    <th key={cat.key} colSpan={colSpan} style={{ padding: "6px 8px", fontSize: 10, fontWeight: 600, textAlign: "center", background: "#f5f2ee", borderBottom: "1px solid #e8e3dc", borderRight: "2px solid #d5d0c8", color: "#1a1a1a", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                      {cat.label}
                    </th>
                  ))}
                  <th colSpan={colSpan} style={{ padding: "6px 8px", fontSize: 10, fontWeight: 600, textAlign: "center", background: "#f0ede8", borderBottom: "1px solid #e8e3dc", color: "#6b6560", whiteSpace: "nowrap" }}>
                    Row Total
                  </th>
                </tr>
                {/* Sub-column headers */}
                <tr>
                  {CATEGORIES.map(cat => (
                    <>
                      {activeCols.map(col => subHeaderTH(col))}
                      <th key={cat.key + "_tot"} style={{ padding: "5px 6px", fontSize: 9, fontWeight: 600, textAlign: "right", background: "#faf9f7", borderBottom: "2px solid #1a1a1a", color: "#6b6560", textTransform: "uppercase", letterSpacing: "0.04em", borderRight: "2px solid #d5d0c8", whiteSpace: "nowrap" }}>
                        TOTAL
                      </th>
                    </>
                  ))}
                  {activeCols.map(col => subHeaderTH(col, true))}
                  <th style={{ padding: "5px 6px", fontSize: 9, fontWeight: 600, textAlign: "right", background: "#f0ede8", borderBottom: "2px solid #1a1a1a", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, ri) => {
                  const rt = rowTotal(row);
                  const rowTotal_ = (activeCols.reduce((s, c) => s + (rt as Record<string, number>)[c.key], 0));
                  return (
                    <tr key={row.date} style={{ background: ri % 2 === 0 ? "#fff" : "#fdfcfa" }}>
                      <td style={{ padding: "5px 12px", fontFamily: "monospace", fontSize: 10, color: "#6b6560", position: "sticky", left: 0, background: ri % 2 === 0 ? "#fff" : "#fdfcfa", borderRight: "2px solid #e8e3dc", borderBottom: "1px solid #f0ece6", zIndex: 1, whiteSpace: "nowrap" }}>
                        {row.date.slice(5)}
                      </td>
                      {CATEGORIES.map(cat => {
                        const d = row.data[cat.key];
                        const catSum = activeCols.reduce((s, c) => s + (d as Record<string, number>)[c.key], 0);
                        return (
                          <>
                            {activeCols.map(col => cellVal((d as Record<string, number>)[col.key], col.key))}
                            <td key={cat.key + "_tot"} style={{ padding: "5px 6px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #f0ece6", fontFamily: "monospace", fontWeight: 600, color: "#1a1a1a", background: "#faf9f7", borderRight: "2px solid #e8e3dc", whiteSpace: "nowrap" }}>
                              {catSum}
                            </td>
                          </>
                        );
                      })}
                      {/* Row total group */}
                      {activeCols.map(col => {
                        const v = (rt as Record<string, number>)[col.key];
                        return (
                          <td key={"rt_" + col.key} style={{ padding: "5px 6px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #f0ece6", fontFamily: "monospace", fontWeight: 600, color: col.color, background: "#f5f2ee", whiteSpace: "nowrap" }}>
                            {v || "—"}
                          </td>
                        );
                      })}
                      <td style={{ padding: "5px 6px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #f0ece6", fontFamily: "monospace", fontWeight: 700, color: "#1a1a1a", background: "#f0ede8", whiteSpace: "nowrap" }}>
                        {rowTotal_}
                      </td>
                    </tr>
                  );
                })}
                {/* Footer totals */}
                <tr style={{ borderTop: "2px solid #1a1a1a" }}>
                  <td style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#1a1a1a", position: "sticky", left: 0, background: "#f5f2ee", borderRight: "2px solid #d5d0c8", zIndex: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    TOTAL
                  </td>
                  {CATEGORIES.map(cat => {
                    const t = catTotal(cat.key);
                    const catSum = activeCols.reduce((s, c) => s + (t as Record<string, number>)[c.key], 0);
                    return (
                      <>
                        {activeCols.map(col => footerVal((t as Record<string, number>)[col.key], col.key))}
                        <td key={cat.key + "_ft"} style={{ padding: "6px 6px", fontSize: 11, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#1a1a1a", background: "#f0ede8", borderRight: "2px solid #d5d0c8" }}>
                          {catSum}
                        </td>
                      </>
                    );
                  })}
                  {activeCols.map(col => (
                    <td key={"gf_" + col.key} style={{ padding: "6px 6px", fontSize: 11, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: (STATUS_COLS.find(s => s.key === col.key)!).color, background: "#e8e3dc" }}>
                      {(grandTotals as Record<string, number>)[col.key]}
                    </td>
                  ))}
                  <td style={{ padding: "6px 6px", fontSize: 12, textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#1a1a1a", background: "#e0dbd3" }}>
                    {activeCols.reduce((s, c) => s + (grandTotals as Record<string, number>)[c.key], 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
