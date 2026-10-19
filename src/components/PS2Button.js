import React from 'react';

export default function PS2Button({ btn = 'cross', label = '' }) {
  const normalized = btn.toLowerCase();
  
  const symbols = {
    cross: '✕',
    circle: '○',
    square: '□',
    triangle: '△',
    l1: 'L1',
    r1: 'R1',
    l2: 'L2',
    r2: 'R2',
    start: 'START',
    select: 'SELECT',
    dpad: '✚',
  };

  const symbol = symbols[normalized] || btn;
  const isShoulder = ['l1', 'r1', 'l2', 'r2', 'start', 'select'].includes(normalized);

  if (isShoulder) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: '3px',
        background: '#1b202a',
        border: '1px solid #475569',
        color: '#f8fafc',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        margin: '0 3px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {symbol}
        {label ? <span style={{ marginLeft: 5, color: '#94a3b8' }}>{label}</span> : null}
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span className={`ps2-btn ${normalized}`} title={`PS2 ${normalized.toUpperCase()} Button`}>
        {symbol}
      </span>
      {label ? <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{label}</span> : null}
    </span>
  );
}
