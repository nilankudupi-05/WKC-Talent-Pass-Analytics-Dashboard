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

const SAMPLE_DATES = [
  "2026-05-03",
  "2026-05-04",
  "2026-05-05",
  "2026-05-06",
  "2026-05-07",
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
];

type CatData = { rec: number; payInit: number; payAbandon: number };
type Row = { date: string; data: Record<string, CatData> };

function seed(n: number, max: number) {
  return Math.floor(((n * 7 + 3) % max) + 1);
}

const ROWS: Row[] = SAMPLE_DATES.map((date, di) => {
  const data: Record<string, CatData> = {};
  CATEGORIES.forEach((cat, ci) => {
    const rec = seed(di * 11 + ci * 3, 14) + 2;
    const payInit = Math.max(1, Math.floor(rec * (0.25 + ((di + ci) % 5) * 0.04)));
    const payAbandon = Math.max(0, Math.floor(payInit * (0.1 + (ci % 3) * 0.08)));
    data[cat.key] = { rec, payInit, payAbandon };
  });
  return { date, data };
});

const TH_CAT: React.CSSProperties = {
  padding: "6px 0",
  fontSize: 10,
  fontWeight: 600,
  textAlign: "center",
  background: "#f5f2ee",
  borderBottom: "1px solid #e8e3dc",
  borderRight: "2px solid #d5d0c8",
  color: "#1a1a1a",
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
};

const TH_SUB: React.CSSProperties = {
  padding: "5px 6px",
  fontSize: 9,
  fontWeight: 600,
  textAlign: "right",
  background: "#faf9f7",
  borderBottom: "2px solid #1a1a1a",
  color: "#9b9590",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const TH_TOTAL_SUB: React.CSSProperties = {
  ...TH_SUB,
  background: "#f0ede8",
  color: "#6b6560",
};

const TD: React.CSSProperties = {
  padding: "5px 6px",
  fontSize: 11,
  textAlign: "right",
  borderBottom: "1px solid #f0ece6",
  fontFamily: "monospace",
  color: "#1a1a1a",
  background: "#fff",
};

const TD_TOTAL: React.CSSProperties = {
  ...TD,
  background: "#faf9f7",
  fontWeight: 600,
  borderRight: "2px solid #d5d0c8",
};

const TD_GRAND: React.CSSProperties = {
  ...TD,
  background: "#f5f2ee",
  fontWeight: 700,
  color: "#1a1a1a",
};

export function CategoryMatrix() {
  const totals: Record<string, CatData> = {};
  CATEGORIES.forEach(cat => { totals[cat.key] = { rec: 0, payInit: 0, payAbandon: 0 }; });

  ROWS.forEach(row => {
    CATEGORIES.forEach(cat => {
      totals[cat.key].rec += row.data[cat.key].rec;
      totals[cat.key].payInit += row.data[cat.key].payInit;
      totals[cat.key].payAbandon += row.data[cat.key].payAbandon;
    });
  });

  const rowTotal = (row: Row) => {
    let rec = 0, payInit = 0, payAbandon = 0;
    CATEGORIES.forEach(cat => {
      rec += row.data[cat.key].rec;
      payInit += row.data[cat.key].payInit;
      payAbandon += row.data[cat.key].payAbandon;
    });
    return { rec, payInit, payAbandon };
  };

  const grandTotal = { rec: 0, payInit: 0, payAbandon: 0 };
  CATEGORIES.forEach(cat => {
    grandTotal.rec += totals[cat.key].rec;
    grandTotal.payInit += totals[cat.key].payInit;
    grandTotal.payAbandon += totals[cat.key].payAbandon;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#faf9f7", minHeight: "100vh", fontSize: 13 }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-thumb { background: #d5d0c8; border-radius: 2px; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e8e3dc", padding: "12px 20px", display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em" }}>WizKids Carnival</span>
        <span style={{ fontSize: 11, color: "#9b9590" }}>Talent Pass Analytics</span>
      </div>

      {/* Tab strip */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e3dc", padding: "0 20px", background: "#faf9f7" }}>
        {["Data Table", "Quiz Sessions", "Recommendations", "Ask AI", "Category Matrix"].map(t => (
          <div key={t} style={{ padding: "12px 0", marginRight: 24, fontSize: 12, fontWeight: 500, cursor: "pointer", color: t === "Category Matrix" ? "#1a1a1a" : "#9b9590", borderBottom: t === "Category Matrix" ? "2px solid #1a1a1a" : "2px solid transparent" }}>{t}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Category Matrix</div>
            <div style={{ fontSize: 11, color: "#9b9590" }}>Funnel events per talent category · rows = dates from telemetry CSV</div>
          </div>
          <div style={{ fontSize: 10, color: "#9b9590", display: "flex", gap: 16 }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#0369a1", marginRight: 4 }} />Rec Generated</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#b45309", marginRight: 4 }} />Pay Initiated</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#dc2626", marginRight: 4 }} />Pay Abandoned</span>
          </div>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #e8e3dc", borderRadius: 8, background: "#fff", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "max-content" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
              {/* Row 1: category group headers */}
              <tr>
                <th rowSpan={2} style={{ ...TH_CAT, textAlign: "left", padding: "6px 12px", minWidth: 90, position: "sticky", left: 0, zIndex: 6, background: "#f5f2ee", borderRight: "2px solid #d5d0c8", verticalAlign: "bottom", paddingBottom: 10 }}>
                  DATE
                </th>
                {CATEGORIES.map(cat => (
                  <th key={cat.key} colSpan={4} style={{ ...TH_CAT, paddingLeft: 8, paddingRight: 8, minWidth: 180 }}>
                    {cat.label}
                  </th>
                ))}
                <th colSpan={4} style={{ ...TH_CAT, background: "#f0ede8", borderRight: "none", minWidth: 180 }}>
                  Row Total
                </th>
              </tr>
              {/* Row 2: sub-column headers */}
              <tr>
                {CATEGORIES.map(cat => (
                  <>
                    <th key={cat.key + "_rec"} style={{ ...TH_SUB, color: "#0369a1" }}>Rec Gen</th>
                    <th key={cat.key + "_pay"} style={{ ...TH_SUB, color: "#b45309" }}>Pay Init</th>
                    <th key={cat.key + "_abn"} style={{ ...TH_SUB, color: "#dc2626" }}>Pay Abn</th>
                    <th key={cat.key + "_tot"} style={{ ...TH_SUB, borderRight: "2px solid #d5d0c8", color: "#6b6560" }}>Total</th>
                  </>
                ))}
                <th style={{ ...TH_TOTAL_SUB, color: "#0369a1" }}>Rec Gen</th>
                <th style={{ ...TH_TOTAL_SUB, color: "#b45309" }}>Pay Init</th>
                <th style={{ ...TH_TOTAL_SUB, color: "#dc2626" }}>Pay Abn</th>
                <th style={{ ...TH_TOTAL_SUB, color: "#1a1a1a" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => {
                const rt = rowTotal(row);
                return (
                  <tr key={row.date} style={{ background: ri % 2 === 0 ? "#fff" : "#fdfcfa" }}>
                    <td style={{ ...TD, textAlign: "left", padding: "5px 12px", fontFamily: "monospace", fontSize: 10, color: "#6b6560", position: "sticky", left: 0, background: ri % 2 === 0 ? "#fff" : "#fdfcfa", borderRight: "2px solid #e8e3dc", zIndex: 1 }}>
                      {row.date.slice(5)}
                    </td>
                    {CATEGORIES.map(cat => {
                      const d = row.data[cat.key];
                      return (
                        <>
                          <td key={cat.key + "_r"} style={{ ...TD, color: "#0369a1" }}>{d.rec}</td>
                          <td key={cat.key + "_p"} style={{ ...TD, color: d.payInit > 0 ? "#b45309" : "#ccc" }}>{d.payInit || "—"}</td>
                          <td key={cat.key + "_a"} style={{ ...TD, color: d.payAbandon > 0 ? "#dc2626" : "#ccc" }}>{d.payAbandon || "—"}</td>
                          <td key={cat.key + "_t"} style={{ ...TD_TOTAL }}>{d.rec + d.payInit + d.payAbandon}</td>
                        </>
                      );
                    })}
                    <td style={{ ...TD_GRAND, color: "#0369a1" }}>{rt.rec}</td>
                    <td style={{ ...TD_GRAND, color: "#b45309" }}>{rt.payInit}</td>
                    <td style={{ ...TD_GRAND, color: "#dc2626" }}>{rt.payAbandon}</td>
                    <td style={{ ...TD_GRAND }}>{rt.rec + rt.payInit + rt.payAbandon}</td>
                  </tr>
                );
              })}
              {/* Totals footer */}
              <tr style={{ borderTop: "2px solid #1a1a1a" }}>
                <td style={{ ...TD, textAlign: "left", padding: "6px 12px", fontWeight: 700, fontSize: 10, color: "#1a1a1a", position: "sticky", left: 0, background: "#f5f2ee", borderRight: "2px solid #d5d0c8", zIndex: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  TOTAL
                </td>
                {CATEGORIES.map(cat => {
                  const t = totals[cat.key];
                  return (
                    <>
                      <td key={cat.key + "_tr"} style={{ ...TD, background: "#f5f2ee", fontWeight: 700, color: "#0369a1" }}>{t.rec}</td>
                      <td key={cat.key + "_tp"} style={{ ...TD, background: "#f5f2ee", fontWeight: 700, color: "#b45309" }}>{t.payInit}</td>
                      <td key={cat.key + "_ta"} style={{ ...TD, background: "#f5f2ee", fontWeight: 700, color: "#dc2626" }}>{t.payAbandon}</td>
                      <td key={cat.key + "_tt"} style={{ ...TD, background: "#f0ede8", fontWeight: 700, borderRight: "2px solid #d5d0c8" }}>{t.rec + t.payInit + t.payAbandon}</td>
                    </>
                  );
                })}
                <td style={{ ...TD_GRAND, background: "#e8e3dc", fontWeight: 700, color: "#0369a1" }}>{grandTotal.rec}</td>
                <td style={{ ...TD_GRAND, background: "#e8e3dc", fontWeight: 700, color: "#b45309" }}>{grandTotal.payInit}</td>
                <td style={{ ...TD_GRAND, background: "#e8e3dc", fontWeight: 700, color: "#dc2626" }}>{grandTotal.payAbandon}</td>
                <td style={{ ...TD_GRAND, background: "#e8e3dc", fontWeight: 700, fontSize: 12 }}>{grandTotal.rec + grandTotal.payInit + grandTotal.payAbandon}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
