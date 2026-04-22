import React, { useEffect, useState } from 'react';
import { getCropInfo } from '../utils/cropData';

function WeatherBadge({ icon, label, value, unit }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
      borderRadius: 12, padding: '12px 18px', textAlign: 'center', flex: 1,
      border: '1px solid rgba(255,255,255,0.25)'
    }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginTop: 2 }}>
        {value}<span style={{ fontSize: 12, fontWeight: 400 }}>{unit}</span>
      </div>
    </div>
  );
}

function ConfidenceBar({ crop, confidence, color, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(confidence), 100 + delay);
    return () => clearTimeout(t);
  }, [confidence, delay]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#2C1810', textTransform: 'capitalize' }}>
          {getCropInfo(crop).emoji} {crop}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: color }}>{confidence}%</span>
      </div>
      <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, width: `${width}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>
    </div>
  );
}

export default function ResultCard({ result, weather, rainfall, top3 }) {
  const [visible, setVisible] = useState(false);
  const info = getCropInfo(result);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [result]);

  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Hero result */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: 16,
        background: `linear-gradient(135deg, ${info.color}dd, ${info.color}aa)`,
        boxShadow: `0 16px 48px ${info.color}44`,
      }}>
        <div style={{ padding: '32px 28px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            ✨ AI Recommendation
          </div>
          <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8 }}>{info.emoji}</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 900, color: 'white', textTransform: 'capitalize', lineHeight: 1.1 }}>
            {result}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontStyle: 'italic' }}>
            {info.desc}
          </div>
        </div>

        {/* Weather strip */}
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '14px 20px', display: 'flex', gap: 10 }}>
          <WeatherBadge icon="🌡️" label="Temp" value={weather?.temperature} unit="°C" />
          <WeatherBadge icon="💧" label="Humidity" value={weather?.humidity} unit="%" />
          <WeatherBadge icon="🌧️" label="Rainfall" value={rainfall?.toFixed(1)} unit="mm" />
        </div>
      </div>

      {/* Top 3 alternatives */}
      {top3 && top3.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 20px rgba(44,24,16,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7B9E6B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Top 3 Predictions
          </div>
          {top3.map((item, i) => (
            <ConfidenceBar
              key={item.crop} crop={item.crop} confidence={item.confidence}
              color={i === 0 ? '#4A7C59' : i === 1 ? '#D4A017' : '#A0522D'}
              delay={i * 150}
            />
          ))}
        </div>
      )}
    </div>
  );
}
