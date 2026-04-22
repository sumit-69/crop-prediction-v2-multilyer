import React, { useState, useEffect } from 'react';
import { getStates, getDistricts } from '../utils/api';

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const selectStyle = (focused) => ({
  width: '100%', padding: '12px 16px', border: `2px solid ${focused ? '#4A7C59' : '#e8e8e8'}`,
  borderRadius: 12, fontSize: 14, fontFamily: 'DM Sans, sans-serif',
  color: '#2C1810', background: 'white', outline: 'none', cursor: 'pointer',
  transition: 'border-color 0.2s', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A7C59' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
});

const labelStyle = { fontSize: 12, fontWeight: 600, color: '#7B9E6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' };

export default function LocationSelector({ values, onChange }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [focused, setFocused] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    getStates()
      .then(data => { setStates(data); setLoadingStates(false); })
      .catch(() => { setLoadingStates(false); setError('Could not load states. Is the backend running on port 8000?'); });
  }, []);

  useEffect(() => {
    if (!values.state) { setDistricts([]); return; }
    setLoadingDistricts(true);
    getDistricts(values.state)
      .then(data => {
        setDistricts(data);
        setLoadingDistricts(false);
        // Only reset district if current district not in new list
        if (!data.includes(values.district)) {
          onChange('district', '');
        }
      })
      .catch(() => setLoadingDistricts(false));
  }, [values.state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, fontSize: 13, color: '#856404' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
        <label style={labelStyle}>📍 State</label>
        <div style={{ position: 'relative' }}>
          <select
            value={values.state} disabled={loadingStates}
            onChange={e => onChange('state', e.target.value)}
            onFocus={() => setFocused('state')} onBlur={() => setFocused('')}
            style={selectStyle(focused === 'state')}
          >
            <option value="">{loadingStates ? 'Loading states…' : '— Select State —'}</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
        <label style={labelStyle}>🏘 District</label>
        <select
          value={values.district} disabled={!values.state || loadingDistricts}
          onChange={e => onChange('district', e.target.value)}
          onFocus={() => setFocused('district')} onBlur={() => setFocused('')}
          style={selectStyle(focused === 'district')}
        >
          <option value="">{loadingDistricts ? 'Loading districts…' : !values.state ? '— Select state first —' : '— Select District —'}</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
        <label style={labelStyle}>📅 Month of Cultivation</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
          {MONTHS.map(m => (
            <button key={m} onClick={() => onChange('month', m)}
              style={{
                padding: '9px 4px', borderRadius: 10, border: '2px solid',
                borderColor: values.month === m ? '#4A7C59' : '#eee',
                background: values.month === m ? '#4A7C59' : 'white',
                color: values.month === m ? 'white' : '#2C1810',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{m}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
