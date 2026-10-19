import React, { useState } from 'react';

export default function DamageGauge() {
  const [damageLevel, setDamageLevel] = useState(35); // 0 = pristine, 100 = wrecked

  const getStatus = (lvl) => {
    if (lvl < 25) return { text: 'RACE READY', color: '#10b981' };
    if (lvl < 60) return { text: 'BATTERED', color: '#f5a623' };
    if (lvl < 85) return { text: 'HEAVY IMPACT', color: '#ff5722' };
    return { text: 'TOTALED / SMOKING', color: '#ef4444' };
  };

  const status = getStatus(damageLevel);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #181c25 0%, #101319 100%)',
      border: '2px solid #2e3544',
      borderRadius: '6px',
      padding: '16px 20px',
      margin: '20px 0',
      position: 'relative',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      maxWidth: '560px'
    }}>
      {/* Corner rivets */}
      <div style={{ position: 'absolute', top: 6, left: 6, width: 6, height: 6, borderRadius: '50%', background: '#475569', boxShadow: 'inset 0 1px 1px #94a3b8' }} />
      <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#475569', boxShadow: 'inset 0 1px 1px #94a3b8' }} />
      <div style={{ position: 'absolute', bottom: 6, left: 6, width: 6, height: 6, borderRadius: '50%', background: '#475569', boxShadow: 'inset 0 1px 1px #94a3b8' }} />
      <div style={{ position: 'absolute', bottom: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#475569', boxShadow: 'inset 0 1px 1px #94a3b8' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: status.color,
            boxShadow: `0 0 8px ${status.color}`
          }} />
          <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: '0.88rem', letterSpacing: '1px', color: '#f8fafc' }}>
            DEMOLITION DAMAGE MONITOR
          </span>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          fontWeight: 700,
          color: status.color,
          padding: '2px 8px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 3,
          border: `1px solid ${status.color}`
        }}>
          {status.text} • {damageLevel}%
        </span>
      </div>

      {/* Segmented Damage Meter */}
      <div style={{
        background: '#090b0e',
        border: '1px solid #282f3d',
        padding: 4,
        borderRadius: 4,
        display: 'flex',
        gap: 3,
        height: 24,
        marginBottom: 14
      }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const segThreshold = (i + 1) * 5;
          const active = damageLevel >= segThreshold;
          let segColor = '#10b981';
          if (segThreshold > 50) segColor = '#f5a623';
          if (segThreshold > 80) segColor = '#ef4444';

          return (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: 2,
                background: active ? segColor : '#171a22',
                opacity: active ? 1 : 0.4,
                boxShadow: active ? `0 0 6px ${segColor}` : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <input
          type="range"
          min="0"
          max="100"
          value={damageLevel}
          onChange={(e) => setDamageLevel(Number(e.target.value))}
          style={{
            flex: 1,
            accentColor: '#f5a623',
            cursor: 'pointer'
          }}
        />
        <button
          onClick={() => setDamageLevel((prev) => (prev >= 100 ? 0 : Math.min(100, prev + 25)))}
          style={{
            background: '#222834',
            border: '1px solid #3d475a',
            color: '#f8fafc',
            fontFamily: "'Russo One', sans-serif",
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: 3,
            cursor: 'pointer',
            letterSpacing: '0.5px'
          }}
        >
          {damageLevel >= 100 ? 'RESET PIT' : 'SIMULATE CRUNCH 💥'}
        </button>
      </div>
    </div>
  );
}
