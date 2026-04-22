import React, { useState, useEffect } from 'react';
import { getCropInfo } from '../utils/cropData';

const SCENARIO_ICONS  = { Optimistic:'🌤️', Current:'🌡️', 'Dry Season':'🏜️', 'Monsoon Peak':'🌧️', 'Drought Risk':'⚠️' };
const SCENARIO_COLORS = { Optimistic:'#27AE60', Current:'#4A7C59', 'Dry Season':'#E67E22', 'Monsoon Peak':'#2980B9', 'Drought Risk':'#C0392B' };
const MONTH_SHORT = ['J','F','M','A','M','J','J','A','S','O','N','D'];

function AnimatedBar({ value, color, delay = 0, height = 6 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 80 + delay); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div style={{ height, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', borderRadius: 3, width: `${w}%`, background: `linear-gradient(90deg,${color}88,${color})`, transition: 'width 0.9s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: '#aaa' }}>
      <div style={{ fontSize: 28, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
      <div style={{ fontSize: 13, marginTop: 8 }}>Running analysis…</div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f4f4f0', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: '0 0 auto', padding: '7px 10px', borderRadius: 9, border: 'none',
          background: active === t.id ? 'white' : 'transparent',
          color: active === t.id ? '#2C1810' : '#aaa',
          fontSize: 11, fontWeight: active === t.id ? 700 : 500,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          boxShadow: active === t.id ? '0 2px 8px rgba(44,24,16,0.10)' : 'none',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

/* ── Scenarios ─────────────────────────────────────────── */
function ScenariosTab({ scenarios }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {scenarios.map((s, i) => {
        const color = SCENARIO_COLORS[s.scenario] || '#4A7C59';
        const icon  = SCENARIO_ICONS[s.scenario]  || '🌿';
        const info  = getCropInfo(s.winner);
        return (
          <div key={s.scenario} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${color}33`, boxShadow: `0 2px 12px ${color}15` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.scenario}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>{s.conditions.temperature}°C · {s.conditions.humidity}% · {s.conditions.rainfall}mm</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 20 }}>{info.emoji}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2C1810', textTransform: 'capitalize' }}>{s.winner}</div>
                <div style={{ fontSize: 10, color }}>{s.confidence}%</div>
              </div>
            </div>
            {s.top3.map((item, j) => (
              <div key={item.crop} style={{ marginBottom: j < 2 ? 7 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{getCropInfo(item.crop).emoji} {item.crop}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{item.confidence}%</span>
                </div>
                <AnimatedBar value={item.confidence} color={color} delay={i * 100 + j * 50} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── pH Layers ─────────────────────────────────────────── */
function PhTab({ phLayers }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>How crop rankings shift as soil pH changes ±0.5 from your input</div>
      {phLayers.map(layer => (
        <div key={layer.ph_label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f9fdf7', borderRadius: 12, marginBottom: 8, border: '1px solid #e8f5e9' }}>
          <div style={{ textAlign: 'center', minWidth: 52 }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>pH</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4A7C59' }}>{layer.ph_value}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{layer.ph_label}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {layer.top3.map((t, i) => (
                <span key={t.crop} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: i === 0 ? '#4A7C5920' : '#f0f0f0', color: i === 0 ? '#2D5016' : '#777', fontWeight: i === 0 ? 700 : 400, textTransform: 'capitalize' }}>
                  {getCropInfo(t.crop).emoji} {t.crop} {t.confidence}%
                </span>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 22 }}>{getCropInfo(layer.winner).emoji}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Consistency ───────────────────────────────────────── */
function ConsistencyTab({ consistency }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 20px rgba(44,24,16,0.07)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7B9E6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>🏆 Cross-Scenario Consistency</div>
      {consistency.map((item, i) => {
        const info = getCropInfo(item.crop);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        return (
          <div key={item.crop} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < consistency.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <span style={{ fontSize: 18, minWidth: 24 }}>{medal}</span>
            <span style={{ fontSize: 20 }}>{info.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2C1810', textTransform: 'capitalize' }}>{item.crop}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4A7C59' }}>{item.consistency_score}%</span>
              </div>
              <div style={{ fontSize: 10, color: '#aaa' }}>Appears in {item.appearances}/{item.total_slots} slots · avg {item.avg_confidence}% confidence</div>
              <AnimatedBar value={item.consistency_score} color={i === 0 ? '#4A7C59' : '#7B9E6B'} delay={i * 120} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Stability Matrix ──────────────────────────────────── */
function StabilityTab({ matrix, loading }) {
  if (loading) return <Spinner />;
  if (!matrix) return <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 24 }}>Matrix data unavailable.</div>;

  const getColor = (val) => {
    if (val > 50) return { bg: `rgba(74,124,89,${0.1 + val / 130})`, text: '#2D5016' };
    if (val > 20) return { bg: `rgba(212,160,23,${0.1 + val / 130})`, text: '#7B5800' };
    return { bg: `rgba(192,57,43,${0.08 + val / 130})`, text: '#7B1F14' };
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Confidence % of top crops across all weather scenarios. Darker = stronger fit.</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3, fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px', color: '#aaa', fontWeight: 600, fontSize: 10 }}>Crop</th>
              {matrix.scenarios.map(s => (
                <th key={s} style={{ padding: '4px 4px', color: SCENARIO_COLORS[s] || '#555', fontWeight: 700, fontSize: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {SCENARIO_ICONS[s] || ''}<br />{s.split(' ')[0]}
                </th>
              ))}
              <th style={{ padding: '4px 6px', color: '#888', fontWeight: 700, fontSize: 10, textAlign: 'center' }}>Avg</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map(row => (
              <tr key={row.crop}>
                <td style={{ padding: '6px 8px', fontWeight: 600, textTransform: 'capitalize', color: '#2C1810', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {getCropInfo(row.crop).emoji} {row.crop}
                </td>
                {matrix.scenarios.map(s => {
                  const val = row.scenarios[s];
                  const { bg, text } = getColor(val);
                  return (
                    <td key={s} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: bg, color: text, fontWeight: 700, fontSize: 12 }}>
                      {val}
                    </td>
                  );
                })}
                <td style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: '#f0f7ee', color: '#4A7C59', fontWeight: 800, fontSize: 12 }}>
                  {row.avg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: '#ccc', marginTop: 8, textAlign: 'right' }}>🟢 &gt;50% · 🟡 20–50% · 🔴 &lt;20%</div>
    </div>
  );
}

/* ── Seasonal Calendar ─────────────────────────────────── */
function SeasonalTab({ seasonal, loading }) {
  if (loading) return <Spinner />;
  if (!seasonal) return <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 24 }}>Seasonal data unavailable.</div>;

  const months = seasonal.months || [];
  return (
    <div>
      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Best crop per month based on typical seasonal conditions across India</div>

      {/* Confidence sparkline */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 64, marginBottom: 14, padding: '0 2px' }}>
        {months.map((m, i) => {
          const info = getCropInfo(m.winner);
          const h = Math.round((m.winner_conf / 100) * 56);
          return (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div title={`${m.winner} ${m.winner_conf}%`} style={{ width: '100%', height: h, background: `${info.color}cc`, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
              <span style={{ fontSize: 9, color: '#aaa', fontWeight: 600 }}>{MONTH_SHORT[i]}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        {months.map(m => {
          const info  = getCropInfo(m.winner);
          const info2 = getCropInfo(m.runner_up);
          return (
            <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'white', borderRadius: 11, border: '1px solid #f0f0f0' }}>
              <div style={{ minWidth: 34, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4A7C59' }}>{m.month}</div>
                <div style={{ fontSize: 9, color: '#bbb' }}>{m.temperature}°C</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{info.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2C1810', textTransform: 'capitalize' }}>{m.winner}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: info.color, marginLeft: 'auto' }}>{m.winner_conf}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: '#ccc' }}>Alt:</span>
                  <span style={{ fontSize: 10, color: '#999', textTransform: 'capitalize' }}>{info2.emoji} {m.runner_up} {m.runner_up_conf}%</span>
                  <span style={{ fontSize: 9, color: '#ccc', marginLeft: 'auto' }}>💧{m.rainfall}mm</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Risk Assessment ───────────────────────────────────── */
function RiskTab({ risk, loading }) {
  if (loading) return <Spinner />;
  if (!risk) return <div style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 24 }}>Risk data unavailable.</div>;

  const info = getCropInfo(risk.crop);
  const sensitivities = Object.entries(risk.sensitivity || {});

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Risk badge */}
      <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: `2px solid ${risk.risk_color}33`, boxShadow: `0 4px 20px ${risk.risk_color}15` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 36 }}>{info.emoji}</span>
          <div>
            <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>Risk for</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2C1810', textTransform: 'capitalize' }}>{risk.crop}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'center', background: `${risk.risk_color}18`, borderRadius: 12, padding: '10px 16px', border: `1.5px solid ${risk.risk_color}44` }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: risk.risk_color }}>{risk.risk_level}</div>
            <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>Risk</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14, fontStyle: 'italic' }}>{risk.risk_desc}</div>

        {/* Confidence range */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 4 }}>
            <span>Worst: <b style={{ color: '#C0392B' }}>{risk.worst_case}%</b></span>
            <span>Mean: <b style={{ color: '#4A7C59' }}>{risk.mean_confidence}%</b></span>
            <span>Best: <b style={{ color: '#27AE60' }}>{risk.best_case}%</b></span>
          </div>
          <div style={{ position: 'relative', height: 10, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: `${risk.worst_case}%`, width: `${risk.best_case - risk.worst_case}%`, height: '100%', background: `${risk.risk_color}44` }} />
            <div style={{ position: 'absolute', left: `${risk.mean_confidence - 1.5}%`, width: 3, height: '100%', background: risk.risk_color, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 3, textAlign: 'right' }}>σ = {risk.std_dev}%</div>
        </div>
      </div>

      {/* Sensitivity */}
      <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7B9E6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>📐 Input Sensitivity</div>
        {sensitivities.map(([dim, data]) => {
          const delta = data.delta;
          const barColor = delta >= 0 ? '#27AE60' : '#C0392B';
          return (
            <div key={dim} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: '#444', fontWeight: 600 }}>{dim}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {data.flipped && (
                    <span style={{ fontSize: 10, background: '#fdecea', color: '#C0392B', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>
                      ⚡ → {data.new_winner}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{delta >= 0 ? '+' : ''}{delta}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#f0f0f0' }}>
                <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
                  {delta < 0 && <div style={{ width: `${Math.min(Math.abs(delta) * 2, 100)}%`, background: '#C0392B', transition: 'width 0.8s' }} />}
                </div>
                <div style={{ width: '50%' }}>
                  {delta >= 0 && <div style={{ width: `${Math.min(delta * 2, 100)}%`, background: '#27AE60', transition: 'width 0.8s' }} />}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>⚡ "→ crop" means the recommended crop flips with that nudge.</div>
      </div>
    </div>
  );
}

/* ── Main export ───────────────────────────────────────── */
const TABS = [
  { id: 'scenarios',   label: '🌦️ Scenarios' },
  { id: 'ph',          label: '🧪 pH Layers' },
  { id: 'consistency', label: '🏆 Consistency' },
  { id: 'matrix',      label: '📊 Matrix' },
  { id: 'seasonal',    label: '📅 Seasonal' },
  { id: 'risk',        label: '⚠️ Risk' },
];

export default function MultiLayerPanel({ data, stability, seasonal, risk, loadingStates }) {
  const [tab, setTab] = useState('scenarios');

  if (!data && loadingStates?.base) return <Spinner />;
  if (!data) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'scenarios'   && <ScenariosTab   scenarios={data.scenarios} />}
      {tab === 'ph'          && <PhTab           phLayers={data.ph_layers} />}
      {tab === 'consistency' && <ConsistencyTab  consistency={data.consistency} />}
      {tab === 'matrix'      && <StabilityTab    matrix={stability}  loading={loadingStates?.matrix} />}
      {tab === 'seasonal'    && <SeasonalTab     seasonal={seasonal} loading={loadingStates?.seasonal} />}
      {tab === 'risk'        && <RiskTab         risk={risk}         loading={loadingStates?.risk} />}
    </div>
  );
}
