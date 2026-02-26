import { useState, useEffect, useRef } from "react";

const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const TIPI_ATTIVITA = ["Sviluppo", "Manutenzione", "Consulenza", "Formazione", "Supporto", "Altro"];
const CLIENT_COLORS = ["#63d297", "#6ba3f7", "#f7b96b", "#f76b8a", "#b96bf7", "#6bf7e3", "#f7f06b"];
const GRID_COLS = "160px 130px 100px 60px repeat(7, 1fr) 70px 80px";

let _rowId = 0;
function createRow(client) {
  return { id: ++_rowId, client, commessa: "", tipo: "Sviluppo", tariffa: "", hours: {}, notes: {} };
}

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  const monday = new Date(now.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// --- Sub-components ---

function TimeInput({ value, onChange }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value || ""}
      onChange={e => {
        const v = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
        onChange(v);
      }}
      placeholder="0"
      style={{
        width: "48px", textAlign: "center", border: "none", background: "transparent",
        fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", color: "#e0e0e0",
        outline: "none", padding: "2px 2px", borderRadius: "4px",
      }}
      onFocus={e => { e.target.style.background = "rgba(99,210,151,0.08)"; }}
      onBlur={e => { e.target.style.background = "transparent"; }}
    />
  );
}

function NoteInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder="..."
      style={{
        width: "100%", border: "none", background: "transparent",
        fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: "#b0b8c8",
        outline: "none", padding: "2px 2px", borderRadius: "4px",
      }}
      onFocus={e => { e.target.style.background = "rgba(99,210,151,0.05)"; }}
      onBlur={e => { e.target.style.background = "transparent"; }}
    />
  );
}

function InlineInput({ value, onChange, placeholder, width, style: extraStyle }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: width || "100%", border: "none", background: "transparent",
        fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#e0e0e0",
        outline: "none", padding: "2px 4px", borderRadius: "4px", ...extraStyle,
      }}
      onFocus={e => { e.target.style.background = "rgba(99,210,151,0.08)"; }}
      onBlur={e => { e.target.style.background = "transparent"; }}
    />
  );
}

function TariffaInput({ value, onChange }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value || ""}
      onChange={e => {
        const v = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
        onChange(v);
      }}
      placeholder="0"
      style={{
        width: "48px", textAlign: "right", border: "none", background: "transparent",
        fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: "#e0e0e0",
        outline: "none", padding: "2px 4px", borderRadius: "4px",
      }}
      onFocus={e => { e.target.style.background = "rgba(99,210,151,0.08)"; }}
      onBlur={e => { e.target.style.background = "transparent"; }}
    />
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", border: "none", background: "transparent",
        fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: "#e0e0e0",
        outline: "none", padding: "2px 0", borderRadius: "4px", cursor: "pointer",
      }}
    >
      {options.map(o => <option key={o} value={o} style={{ background: "#181d27", color: "#e0e0e0" }}>{o}</option>)}
    </select>
  );
}

// --- Main Component ---

export default function Timesheet() {
  const [rows, setRows] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem("timesheet_data"));
      if (d && d.rows && d.rows.length) {
        _rowId = Math.max(...d.rows.map(r => r.id), 0);
        return d.rows;
      }
    } catch(e) {}
    return [createRow("Cliente 1")];
  });
  const [weekOffset, setWeekOffset] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem("timesheet_data"));
      return (d && typeof d.weekOffset === "number") ? d.weekOffset : 0;
    } catch(e) { return 0; }
  });
  const [expandedRows, setExpandedRows] = useState({});
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const inputRef = useRef(null);
  const saveTimer = useRef(null);

  const weekDates = getWeekDates(weekOffset);
  const weekLabel = `${weekDates[0].getDate()} ${MONTHS[weekDates[0].getMonth()].slice(0,3)} – ${weekDates[6].getDate()} ${MONTHS[weekDates[6].getMonth()].slice(0,3)} ${weekDates[6].getFullYear()}`;

  // Persist to localStorage (debounced)
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem("timesheet_data", JSON.stringify({ rows, weekOffset }));
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [rows, weekOffset]);

  useEffect(() => {
    if (showAddClient && inputRef.current) inputRef.current.focus();
  }, [showAddClient]);

  // --- Row helpers ---
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const updateRowHours = (id, dateKey, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, hours: { ...r.hours, [dateKey]: value } } : r));
  };
  const updateRowNotes = (id, dateKey, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, notes: { ...r.notes, [dateKey]: value } } : r));
  };
  const getRowHours = (row, dateKey) => parseFloat(row.hours[dateKey]) || 0;
  const rowTotal = (row) => weekDates.reduce((s, d) => s + getRowHours(row, formatDate(d)), 0);
  const rowTotalEur = (row) => rowTotal(row) * (parseFloat(row.tariffa) || 0);

  const removeRow = (id) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const addCommessa = (client) => {
    setRows(prev => {
      let lastIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].client === client) { lastIdx = i; break; }
      }
      const newRow = createRow(client);
      const next = [...prev];
      next.splice(lastIdx + 1, 0, newRow);
      return next;
    });
  };

  const addClient = () => {
    const name = newClient.trim();
    if (!name) return;
    const exists = rows.some(r => r.client === name);
    if (exists) return;
    setRows(prev => [...prev, createRow(name)]);
    setNewClient("");
    setShowAddClient(false);
  };

  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  // --- Computed ---
  const uniqueClients = [];
  const clientSet = new Set();
  rows.forEach(r => {
    if (!clientSet.has(r.client)) {
      clientSet.add(r.client);
      uniqueClients.push(r.client);
    }
  });

  const totalForDay = (dateKey) => rows.reduce((s, r) => s + getRowHours(r, dateKey), 0);
  const grandTotalHours = rows.reduce((s, r) => s + rowTotal(r), 0);
  const grandTotalEur = rows.reduce((s, r) => s + rowTotalEur(r), 0);

  // --- Export ---
  const exportCSV = () => {
    const header = [
      "Cliente", "Commessa", "Tipo", "Tariffa",
      ...weekDates.map((_, i) => DAYS[i].slice(0, 3)),
      "Totale Ore", "Totale €",
      ...weekDates.map((_, i) => `Note ${DAYS[i].slice(0, 3)}`)
    ];
    let csv = header.map(h => `"${h}"`).join(",") + "\n";
    rows.forEach(row => {
      const hrs = weekDates.map(d => row.hours[formatDate(d)] || "0");
      const nts = weekDates.map(d => (row.notes[formatDate(d)] || "").replace(/"/g, '""'));
      const totH = rowTotal(row).toFixed(1);
      const totE = rowTotalEur(row).toFixed(2);
      const fields = [row.client, row.commessa, row.tipo, row.tariffa || "0", ...hrs, totH, totE, ...nts];
      csv += fields.map(f => `"${f}"`).join(",") + "\n";
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_${formatDate(weekDates[0])}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("✓ Esportato!");
    setTimeout(() => setExportMsg(""), 2000);
  };

  const copyTSV = () => {
    const header = [
      "Cliente", "Commessa", "Tipo", "Tariffa",
      ...weekDates.map((_, i) => DAYS[i].slice(0, 3)),
      "Totale Ore", "Totale €",
      ...weekDates.map((_, i) => `Note ${DAYS[i].slice(0, 3)}`)
    ];
    let tsv = header.join("\t") + "\n";
    rows.forEach(row => {
      const hrs = weekDates.map(d => row.hours[formatDate(d)] || "0");
      const nts = weekDates.map(d => row.notes[formatDate(d)] || "");
      const totH = rowTotal(row).toFixed(1);
      const totE = rowTotalEur(row).toFixed(2);
      const fields = [row.client, row.commessa, row.tipo, row.tariffa || "0", ...hrs, totH, totE, ...nts];
      tsv += fields.join("\t") + "\n";
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).then(() => {
        setCopyMsg("✓ Copiato!");
        setTimeout(() => setCopyMsg(""), 2000);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = tsv;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopyMsg("✓ Copiato!");
      setTimeout(() => setCopyMsg(""), 2000);
    }
  };

  // --- Styles ---
  const accent = "#63d297";
  const bg = "#0f1219";
  const card = "#181d27";
  const border = "#252b38";
  const textPrimary = "#e8ecf1";
  const textSecondary = "#7a8499";
  const cellBorder = { borderLeft: `1px solid ${border}` };

  const iconBtn = {
    background: "none", border: "none", cursor: "pointer",
    padding: "2px", flexShrink: 0, fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", background: bg, minHeight: "100vh",
      color: textPrimary, padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ===== HEADER ===== */}
      <div style={{
        background: `linear-gradient(135deg, ${card} 0%, #1a2233 100%)`,
        borderBottom: `1px solid ${border}`, padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}66` }} />
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: accent }}>
                Time Card
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: textPrimary }}>
              Registro Ore & Interventi
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={exportCSV} style={{
              background: `${accent}18`, color: accent, border: `1px solid ${accent}40`,
              borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px",
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
            }}
              onMouseEnter={e => { e.target.style.background = `${accent}30`; }}
              onMouseLeave={e => { e.target.style.background = `${accent}18`; }}
            >
              ↓ Esporta CSV
            </button>
            <button onClick={copyTSV} style={{
              background: `#6ba3f718`, color: "#6ba3f7", border: `1px solid #6ba3f740`,
              borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px",
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
            }}
              onMouseEnter={e => { e.target.style.background = "#6ba3f730"; }}
              onMouseLeave={e => { e.target.style.background = "#6ba3f718"; }}
            >
              📋 Copia per Sheets
            </button>
            {exportMsg && <span style={{ fontSize: "12px", color: accent, fontWeight: 600 }}>{exportMsg}</span>}
            {copyMsg && <span style={{ fontSize: "12px", color: "#6ba3f7", fontWeight: 600 }}>{copyMsg}</span>}
          </div>
        </div>

        {/* Week Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{
            background: "none", border: `1px solid ${border}`, color: textSecondary,
            borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer",
            fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
          <span style={{ fontSize: "15px", fontWeight: 600, color: textPrimary, minWidth: "200px", textAlign: "center" }}>
            {weekLabel}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{
            background: "none", border: `1px solid ${border}`, color: textSecondary,
            borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer",
            fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{
              background: "none", border: "none", color: accent, cursor: "pointer",
              fontSize: "12px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>Oggi</button>
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div style={{ padding: "20px 16px", overflowX: "auto" }}>
        <div style={{
          background: card, borderRadius: "12px", border: `1px solid ${border}`,
          overflow: "hidden", minWidth: "1050px",
        }}>

          {/* --- Column Headers --- */}
          <div style={{
            display: "grid", gridTemplateColumns: GRID_COLS,
            borderBottom: `1px solid ${border}`, background: "#141924",
          }}>
            <div style={{ padding: "12px 12px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary }}>
              Cliente
            </div>
            <div style={{ padding: "12px 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary, ...cellBorder }}>
              Commessa
            </div>
            <div style={{ padding: "12px 8px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary, ...cellBorder }}>
              Tipo
            </div>
            <div style={{ padding: "12px 4px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary, textAlign: "center", ...cellBorder }}>
              €/h
            </div>
            {weekDates.map((d, i) => {
              const isToday = formatDate(d) === formatDate(new Date());
              return (
                <div key={i} style={{
                  padding: "10px 4px", textAlign: "center", ...cellBorder,
                  background: isToday ? `${accent}08` : "transparent",
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: isToday ? accent : textSecondary }}>
                    {DAYS[i].slice(0, 3)}
                  </div>
                  <div style={{
                    fontSize: "16px", fontWeight: 700, color: isToday ? accent : textPrimary,
                    fontFamily: "'JetBrains Mono', monospace", marginTop: "2px",
                  }}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
            <div style={{
              padding: "12px 4px", textAlign: "center", ...cellBorder,
              fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary,
            }}>
              Tot h
            </div>
            <div style={{
              padding: "12px 4px", textAlign: "center", ...cellBorder,
              fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: textSecondary,
            }}>
              Tot €
            </div>
          </div>

          {/* --- Client Groups --- */}
          {uniqueClients.map((client, ci) => {
            const clientRows = rows.filter(r => r.client === client);
            const clientColor = CLIENT_COLORS[ci % CLIENT_COLORS.length];
            const clientTotalH = clientRows.reduce((s, r) => s + rowTotal(r), 0);
            const clientTotalE = clientRows.reduce((s, r) => s + rowTotalEur(r), 0);

            return (
              <div key={client}>
                {clientRows.map((row, ri) => {
                  const isExpanded = expandedRows[row.id];
                  const rTotal = rowTotal(row);
                  const rTotalE = rowTotalEur(row);
                  const isFirst = ri === 0;

                  return (
                    <React.Fragment key={row.id}>
                      {/* --- Data Row --- */}
                      <div style={{
                        display: "grid", gridTemplateColumns: GRID_COLS,
                        borderBottom: `1px solid ${border}`, transition: "background .15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#1c2230"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        {/* Client cell */}
                        <div style={{ padding: "8px 8px 8px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: "5px", height: "26px", borderRadius: "3px", background: clientColor,
                            flexShrink: 0,
                          }} />
                          {isFirst ? (
                            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{
                                fontSize: "13px", fontWeight: 600, color: textPrimary,
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0,
                              }}>
                                {client}
                              </span>
                              <button onClick={() => addCommessa(client)} title="Aggiungi commessa" style={{ ...iconBtn, color: clientColor, fontSize: "16px", lineHeight: 1 }}>+</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: textSecondary, flex: 1 }}>↳</span>
                          )}
                          <button onClick={() => toggleRow(row.id)} title="Note" style={{ ...iconBtn, color: isExpanded ? accent : textSecondary, fontSize: "13px" }}>
                            {isExpanded ? "▾" : "▸"}
                          </button>
                          {rows.length > 1 && (
                            <button onClick={() => removeRow(row.id)} title="Rimuovi" style={{ ...iconBtn, color: "#f76b8a50" }}
                              onMouseEnter={e => { e.target.style.color = "#f76b8a"; }}
                              onMouseLeave={e => { e.target.style.color = "#f76b8a50"; }}
                            >✕</button>
                          )}
                        </div>

                        {/* Commessa */}
                        <div style={{ ...cellBorder, display: "flex", alignItems: "center", padding: "0 4px" }}>
                          <InlineInput
                            value={row.commessa}
                            onChange={v => updateRow(row.id, "commessa", v)}
                            placeholder="Commessa..."
                          />
                        </div>

                        {/* Tipo */}
                        <div style={{ ...cellBorder, display: "flex", alignItems: "center", padding: "0 4px" }}>
                          <InlineSelect
                            value={row.tipo}
                            onChange={v => updateRow(row.id, "tipo", v)}
                            options={TIPI_ATTIVITA}
                          />
                        </div>

                        {/* Tariffa */}
                        <div style={{ ...cellBorder, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TariffaInput
                            value={row.tariffa}
                            onChange={v => updateRow(row.id, "tariffa", v)}
                          />
                        </div>

                        {/* Days */}
                        {weekDates.map((d, i) => {
                          const dk = formatDate(d);
                          const isToday = dk === formatDate(new Date());
                          return (
                            <div key={i} style={{
                              ...cellBorder,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: isToday ? `${accent}05` : "transparent",
                            }}>
                              <TimeInput
                                value={row.hours[dk] || ""}
                                onChange={v => updateRowHours(row.id, dk, v)}
                              />
                            </div>
                          );
                        })}

                        {/* Total hours */}
                        <div style={{
                          ...cellBorder,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                          fontSize: "14px", color: rTotal > 0 ? clientColor : textSecondary,
                        }}>
                          {rTotal > 0 ? rTotal.toFixed(1) : "–"}
                        </div>

                        {/* Total € */}
                        <div style={{
                          ...cellBorder,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                          fontSize: "13px", color: rTotalE > 0 ? "#f7b96b" : textSecondary,
                        }}>
                          {rTotalE > 0 ? `€${rTotalE.toFixed(0)}` : "–"}
                        </div>
                      </div>

                      {/* --- Notes Row (expandable) --- */}
                      {isExpanded && (
                        <div style={{
                          display: "grid", gridTemplateColumns: GRID_COLS,
                          borderBottom: `1px solid ${border}`, background: "#13171f",
                        }}>
                          <div style={{
                            gridColumn: "1 / 5",
                            padding: "6px 12px 6px 28px", fontSize: "11px", color: textSecondary,
                            display: "flex", alignItems: "center", fontStyle: "italic",
                          }}>
                            📝 Note
                          </div>
                          {weekDates.map((d, i) => {
                            const dk = formatDate(d);
                            return (
                              <div key={i} style={{ ...cellBorder, padding: "3px 4px", display: "flex", alignItems: "center" }}>
                                <NoteInput
                                  value={row.notes[dk] || ""}
                                  onChange={v => updateRowNotes(row.id, dk, v)}
                                />
                              </div>
                            );
                          })}
                          <div style={{ gridColumn: "12 / 14", ...cellBorder }} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* --- Client Subtotal (if 2+ rows) --- */}
                {clientRows.length > 1 && (
                  <div style={{
                    display: "grid", gridTemplateColumns: GRID_COLS,
                    borderBottom: `2px solid ${clientColor}20`,
                    background: `${clientColor}08`,
                  }}>
                    <div style={{
                      gridColumn: "1 / 5",
                      padding: "8px 12px 8px 28px", fontSize: "12px", fontWeight: 600,
                      color: clientColor, display: "flex", alignItems: "center",
                    }}>
                      Subtotale: {client}
                    </div>
                    {weekDates.map((d, i) => {
                      const dk = formatDate(d);
                      const daySubtotal = clientRows.reduce((s, r) => s + getRowHours(r, dk), 0);
                      return (
                        <div key={i} style={{
                          ...cellBorder,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                          fontSize: "13px", color: daySubtotal > 0 ? clientColor : textSecondary,
                          padding: "8px 0",
                        }}>
                          {daySubtotal > 0 ? daySubtotal.toFixed(1) : "–"}
                        </div>
                      );
                    })}
                    <div style={{
                      ...cellBorder,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                      fontSize: "14px", color: clientColor,
                    }}>
                      {clientTotalH > 0 ? clientTotalH.toFixed(1) : "–"}
                    </div>
                    <div style={{
                      ...cellBorder,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                      fontSize: "13px", color: clientTotalE > 0 ? "#f7b96b" : textSecondary,
                    }}>
                      {clientTotalE > 0 ? `€${clientTotalE.toFixed(0)}` : "–"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* --- Grand Total Row --- */}
          <div style={{
            display: "grid", gridTemplateColumns: GRID_COLS,
            background: "#141924", borderTop: `2px solid ${accent}30`,
          }}>
            <div style={{
              gridColumn: "1 / 5",
              padding: "12px 16px", fontSize: "12px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "1px", color: accent,
            }}>
              Totale
            </div>
            {weekDates.map((d, i) => {
              const dk = formatDate(d);
              const dayTotal = totalForDay(dk);
              return (
                <div key={i} style={{
                  ...cellBorder,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                  fontSize: "14px", color: dayTotal > 0 ? textPrimary : textSecondary,
                  padding: "12px 0",
                }}>
                  {dayTotal > 0 ? dayTotal.toFixed(1) : "–"}
                </div>
              );
            })}
            <div style={{
              ...cellBorder,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              fontSize: "16px", padding: "12px 0", color: accent,
              textShadow: `0 0 12px ${accent}44`,
            }}>
              {grandTotalHours > 0 ? grandTotalHours.toFixed(1) : "0"}
            </div>
            <div style={{
              ...cellBorder,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              fontSize: "14px", padding: "12px 0", color: "#f7b96b",
              textShadow: `0 0 12px #f7b96b44`,
            }}>
              {grandTotalEur > 0 ? `€${grandTotalEur.toFixed(0)}` : "€0"}
            </div>
          </div>
        </div>

        {/* ===== ADD CLIENT ===== */}
        <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          {showAddClient ? (
            <>
              <input
                ref={inputRef}
                value={newClient}
                onChange={e => setNewClient(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addClient(); if (e.key === "Escape") setShowAddClient(false); }}
                placeholder="Nome cliente..."
                style={{
                  background: card, border: `1px solid ${border}`, borderRadius: "8px",
                  padding: "8px 14px", color: textPrimary, fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif", outline: "none", width: "200px",
                }}
              />
              <button onClick={addClient} style={{
                background: accent, color: "#0f1219", border: "none", borderRadius: "8px",
                padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
              }}>Aggiungi</button>
              <button onClick={() => setShowAddClient(false)} style={{
                background: "none", border: "none", color: textSecondary, cursor: "pointer",
                fontSize: "13px", fontFamily: "'DM Sans', sans-serif",
              }}>Annulla</button>
            </>
          ) : (
            <button onClick={() => setShowAddClient(true)} style={{
              background: card, border: `1px dashed ${border}`, borderRadius: "8px",
              padding: "10px 20px", cursor: "pointer", color: textSecondary, fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all .2s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = accent; e.target.style.color = accent; }}
              onMouseLeave={e => { e.target.style.borderColor = border; e.target.style.color = textSecondary; }}
            >
              + Aggiungi Cliente
            </button>
          )}
        </div>

        {/* ===== LEGEND ===== */}
        <div style={{
          marginTop: "20px", padding: "14px 18px", background: card,
          borderRadius: "10px", border: `1px solid ${border}`,
          display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", color: textSecondary,
        }}>
          <span>💡 Clicca <strong style={{ color: textPrimary }}>▸</strong> per espandere le note</span>
          <span>⏱ Ore in decimali (es. <strong style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>1.5</strong> = 1h 30m)</span>
          <span>📋 "Copia per Sheets" copia in formato tab per incollare in Google Sheets</span>
          <span>💾 Salvataggio automatico nel browser</span>
        </div>
      </div>
    </div>
  );
}
