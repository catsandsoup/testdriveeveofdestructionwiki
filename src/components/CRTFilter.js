import React, { useState, useEffect } from 'react';

export default function CRTFilter() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      document.body.classList.add('crt-active');
    } else {
      document.body.classList.remove('crt-active');
    }
    return () => {
      document.body.classList.remove('crt-active');
    };
  }, [active]);

  return (
    <>
      <button
        onClick={() => setActive(!active)}
        title="Toggle PS2 480i CRT Scanline Simulation"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: active ? 'rgba(245, 166, 35, 0.2)' : '#161920',
          border: `1px solid ${active ? '#f5a623' : '#323a4a'}`,
          color: active ? '#ffd000' : '#94a3b8',
          padding: '4px 10px',
          borderRadius: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: active ? '0 0 10px rgba(245, 166, 35, 0.4)' : 'none'
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: active ? '#00e676' : '#64748b',
          boxShadow: active ? '0 0 6px #00e676' : 'none'
        }} />
        PS2 CRT {active ? 'ON' : 'OFF'}
      </button>

      {active && <div className="crt-overlay" />}
    </>
  );
}
