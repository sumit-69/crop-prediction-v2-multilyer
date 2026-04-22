import React from 'react';

const SOIL_PARAMS = [
  { key: 'nitrogen',    label: 'Nitrogen (N)',    min: 0,   max: 140, unit: 'mg/kg', color: '#4A7C59', hint: 'Promotes leaf growth' },
  { key: 'phosphorous', label: 'Phosphorus (P)',  min: 0,   max: 145, unit: 'mg/kg', color: '#D4A017', hint: 'Root development' },
  { key: 'potassium',   label: 'Potassium (K)',   min: 0,   max: 205, unit: 'mg/kg', color: '#A0522D', hint: 'Disease resistance' },
  { key: 'ph',          label: 'Soil pH',         min: 3.5, max: 9.5, unit: '',      color: '#7B9E6B', hint: 'Acidity/alkalinity', step: 0.1 },
];

export default function SoilInput({ values, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {SOIL_PARAMS.map(param => (
        <div key={param.key} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#2C1810' }}>{param.label}</span>
              <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{param.hint}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                value={values[param.key]}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                onChange={e => onChange(param.key, parseFloat(e.target.value) || 0)}
                style={{
                  width: 70, padding: '4px 8px', border: `2px solid ${param.color}33`,
                  borderRadius: 8, fontSize: 14, fontWeight: 600, color: param.color,
                  textAlign: 'center', outline: 'none', background: `${param.color}08`,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />
              {param.unit && <span style={{ fontSize: 12, color: '#aaa' }}>{param.unit}</span>}
            </div>
          </div>
          <div style={{ position: 'relative', height: 6 }}>
            <div style={{ position: 'absolute', inset: 0, background: '#f0f0f0', borderRadius: 3 }} />
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${param.color}88, ${param.color})`,
              width: `${((values[param.key] - param.min) / (param.max - param.min)) * 100}%`,
              transition: 'width 0.2s ease'
            }} />
            <input
              type="range" min={param.min} max={param.max} step={param.step || 1}
              value={values[param.key]}
              onChange={e => onChange(param.key, parseFloat(e.target.value))}
              style={{
                position: 'absolute', inset: '-8px 0', width: '100%', opacity: 0,
                cursor: 'pointer', height: 22
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#ccc' }}>{param.min}</span>
            <span style={{ fontSize: 11, color: '#ccc' }}>{param.max}{param.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
