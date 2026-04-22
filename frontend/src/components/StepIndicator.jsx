import React from 'react';

const STEPS = [
  { id: 1, label: 'Soil Data', icon: '🪱' },
  { id: 2, label: 'Location', icon: '📍' },
  { id: 3, label: 'Results', icon: '🌱' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, gap: 0 }}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step.id}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, border: '2.5px solid',
              borderColor: currentStep >= step.id ? '#4A7C59' : '#ddd',
              background: currentStep > step.id ? '#4A7C59' : currentStep === step.id ? '#f0f7f0' : 'white',
              transition: 'all 0.3s',
              boxShadow: currentStep === step.id ? '0 0 0 4px #4A7C5922' : 'none',
            }}>
              {currentStep > step.id ? '✓' : step.icon}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: currentStep >= step.id ? '#4A7C59' : '#aaa',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '-18px 8px 0',
              background: currentStep > step.id ? '#4A7C59' : '#eee',
              transition: 'background 0.3s', maxWidth: 60
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
