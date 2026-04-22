import React, { useState } from 'react';
import SoilInput from './components/SoilInput';
import LocationSelector from './components/LocationSelector';
import ResultCard from './components/ResultCard';
import StepIndicator from './components/StepIndicator';
import MultiLayerPanel from './components/MultiLayerPanel';
import { predictCrop, predictMultilayer, predictStability, predictSeasonal, predictRisk } from './utils/api';

const DEFAULT_SOIL = { nitrogen: 50, phosphorous: 50, potassium: 50, ph: 6.5 };
const DEFAULT_LOC = { state: '', district: '', month: 'JUN' };

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', height: 24 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: 'white',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 20px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#4A7C5918', borderRadius: 30, padding: '6px 16px',
        marginBottom: 16, border: '1px solid #4A7C5933'
      }}>
        <span style={{ fontSize: 12 }}>✨</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#4A7C59', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI-Powered Agriculture
        </span>
      </div>
      <h1 style={{
        fontFamily: 'Playfair Display, serif', fontWeight: 900,
        fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.1,
        color: '#2C1810', marginBottom: 12
      }}>
        Know Your<br />
        <span style={{ color: '#4A7C59', fontStyle: 'italic' }}>Perfect Crop</span>
      </h1>
      <p style={{ fontSize: 15, color: '#888', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
        Enter your soil composition and location. Our deep learning model will recommend
        the best crop for your conditions.
      </p>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#FEFDF8', borderRadius: 20, padding: '28px 24px',
      boxShadow: '0 8px 40px rgba(44,24,16,0.10)', border: '1px solid #f0ece4',
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#2C1810' }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 13, color: '#aaa', marginLeft: 32 }}>{subtitle}</p>}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [soil, setSoil] = useState(DEFAULT_SOIL);
  const [loc, setLoc] = useState(DEFAULT_LOC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [multilayer, setMultilayer] = useState(null);
  const [stability, setStability] = useState(null);
  const [seasonal, setSeasonal] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loadingStates, setLoadingStates] = useState({ base: false, matrix: false, seasonal: false, risk: false });
  const [showMultilayer, setShowMultilayer] = useState(false);

  const handleSoilChange = (key, val) => setSoil(prev => ({ ...prev, [key]: val }));
  const handleLocChange = (key, val) => setLoc(prev => ({ ...prev, [key]: val }));

  const canProceed = loc.state && loc.district && loc.month;

  const handlePredict = async () => {
    if (!canProceed) return;
    setLoading(true);
    setError('');
    setMultilayer(null); setStability(null); setSeasonal(null); setRisk(null);
    setShowMultilayer(false);
    setLoadingStates({ base: true, matrix: false, seasonal: false, risk: false });
    try {
      const data = await predictCrop({ ...soil, ...loc });
      setResult(data);
      setStep(3);
      // Fire all background analyses in parallel
      setLoadingStates({ base: true, matrix: true, seasonal: true, risk: true });
      predictMultilayer({ ...soil, ...loc })
        .then(ml => { setMultilayer(ml); setLoadingStates(s => ({ ...s, base: false })); })
        .catch(() => setLoadingStates(s => ({ ...s, base: false })));
      predictStability({ ...soil, ...loc })
        .then(m => { setStability(m); setLoadingStates(s => ({ ...s, matrix: false })); })
        .catch(() => setLoadingStates(s => ({ ...s, matrix: false })));
      predictSeasonal({ ...soil, ...loc })
        .then(s => { setSeasonal(s); setLoadingStates(p => ({ ...p, seasonal: false })); })
        .catch(() => setLoadingStates(p => ({ ...p, seasonal: false })));
      predictRisk({ ...soil, ...loc })
        .then(r => { setRisk(r); setLoadingStates(s => ({ ...s, risk: false })); })
        .catch(() => setLoadingStates(s => ({ ...s, risk: false })));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Prediction failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setResult(null); setError('');
    setSoil(DEFAULT_SOIL); setLoc(DEFAULT_LOC);
    setMultilayer(null); setStability(null); setSeasonal(null); setRisk(null);
    setLoadingStates({ base: false, matrix: false, seasonal: false, risk: false });
    setShowMultilayer(false);
  };

  return (
    <div style={{
      minHeight: '100vh', padding: '40px 16px 80px',
      background: 'linear-gradient(160deg, #f8fdf5 0%, #fefdf8 40%, #f5f0e8 100%)',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #4A7C5915, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, #D4A01715, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
        <Header />
        <StepIndicator currentStep={step} />

        {/* Step 1: Soil */}
        {step === 1 && (
          <Card style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <SectionTitle icon="🪱" title="Soil Composition" subtitle="Drag sliders or type values directly" />
            <SoilInput values={soil} onChange={handleSoilChange} />
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%', marginTop: 24, padding: '15px', borderRadius: 14,
                background: 'linear-gradient(135deg, #4A7C59, #2D5016)',
                color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 6px 20px #4A7C5940', transition: 'transform 0.15s, box-shadow 0.15s',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 10px 28px #4A7C5950'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 20px #4A7C5940'; }}
            >
              Continue to Location →
            </button>
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <SectionTitle icon="🗺️" title="Location & Season" subtitle="Used to fetch live weather & rainfall data" />
            <LocationSelector values={loc} onChange={handleLocChange} />

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fdf0f0', border: '1px solid #f5c6c6', borderRadius: 10, color: '#c0392b', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: '0 0 auto', padding: '15px 20px', borderRadius: 14,
                  background: 'white', color: '#4A7C59', border: '2px solid #4A7C5944',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >← Back</button>
              <button
                onClick={handlePredict}
                disabled={!canProceed || loading}
                style={{
                  flex: 1, padding: '15px', borderRadius: 14,
                  background: canProceed ? 'linear-gradient(135deg, #4A7C59, #2D5016)' : '#ccc',
                  color: 'white', border: 'none', fontSize: 15, fontWeight: 700,
                  cursor: canProceed ? 'pointer' : 'not-allowed',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: canProceed ? '0 6px 20px #4A7C5940' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <LoadingDots /> : '🔍 Predict My Crop'}
              </button>
            </div>
          </Card>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <ResultCard
              result={result.prediction}
              weather={result.weather}
              rainfall={result.rainfall}
              top3={result.top3}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'white', color: '#4A7C59', border: '2px solid #4A7C5944',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >← Adjust Inputs</button>
              <button
                onClick={reset}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #4A7C59, #2D5016)',
                  color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 6px 20px #4A7C5940',
                }}
              >🔄 New Prediction</button>
            </div>

            {/* Multi-Layer Prediction toggle */}
            <button
              onClick={() => setShowMultilayer(v => !v)}
              style={{
                width: '100%', marginTop: 14, padding: '13px 20px', borderRadius: 14,
                background: showMultilayer ? 'linear-gradient(135deg, #2980B9, #1a5276)' : 'white',
                color: showMultilayer ? 'white' : '#2980B9',
                border: '2px solid #2980B933',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.25s',
                boxShadow: showMultilayer ? '0 6px 20px #2980B940' : '0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              {loadingStates.base
                ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span> Analysing scenarios…</>
                : <>{showMultilayer ? '▲' : '▼'} {showMultilayer ? 'Hide' : 'Show'} Multi-Layer Prediction</>
              }
            </button>

            {showMultilayer && (
              <div style={{ background: '#FEFDF8', borderRadius: 20, padding: '20px 20px 16px', marginTop: 10, border: '1px solid #e8f0e4', boxShadow: '0 8px 32px rgba(44,24,16,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>🔬</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#2C1810' }}>Multi-Layer Prediction</h2>
                </div>
                <p style={{ fontSize: 12, color: '#aaa', marginBottom: 2, marginLeft: 28 }}>
                  Model re-run across 5 weather scenarios · 3 pH variants · consistency ranking
                </p>
                <MultiLayerPanel
                  data={multilayer}
                  stability={stability}
                  seasonal={seasonal}
                  risk={risk}
                  loadingStates={loadingStates}
                />
              </div>
            )}

            {/* Soil summary */}
            <div style={{ marginTop: 16, background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 12px rgba(44,24,16,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7B9E6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Input Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'N', value: soil.nitrogen, unit: '' },
                  { label: 'P', value: soil.phosphorous, unit: '' },
                  { label: 'K', value: soil.potassium, unit: '' },
                  { label: 'pH', value: soil.ph, unit: '' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', background: '#f8fdf5', borderRadius: 10, padding: '10px 6px' }}>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2C1810' }}>{item.value}{item.unit}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#aaa', textAlign: 'center' }}>
                📍 {loc.district}, {loc.state} &nbsp;|&nbsp; 📅 {loc.month}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: '#ccc' }}>
          Powered by NumPy DNN · Weather by Open-Meteo · 22 crop classes · Multi-Layer Analysis
        </div>
      </div>
    </div>
  );
}
