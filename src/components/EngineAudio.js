import React, { useState } from 'react';

export default function EngineAudio() {
  const [revving, setRevving] = useState(false);

  const playV8Rev = () => {
    if (revving) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setRevving(true);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Low rumble sawtooth
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.35);
      filter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.9);

      // Pitch sweep up then down (V8 throttle blip)
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.35);
      osc1.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.9);

      osc2.frequency.setValueAtTime(56, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(194, ctx.currentTime + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(66, ctx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 1.0);

      setTimeout(() => {
        setRevving(false);
      }, 1000);
    } catch (e) {
      setRevving(false);
    }
  };

  return (
    <button
      onClick={playV8Rev}
      title="Click to rev the V8 engine (Web Audio synth)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: revving ? 'linear-gradient(180deg, #ff5722 0%, #d32f2f 100%)' : '#181c25',
        border: `1px solid ${revving ? '#ff7043' : '#333b4b'}`,
        color: revving ? '#ffffff' : '#f5a623',
        padding: '5px 12px',
        borderRadius: 4,
        fontFamily: "'Russo One', sans-serif",
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        boxShadow: revving ? '0 0 16px rgba(255, 87, 34, 0.6)' : '0 2px 6px rgba(0,0,0,0.5)',
        transition: 'all 0.15s ease'
      }}
    >
      <span>{revving ? '🔥' : '🏁'}</span>
      <span>{revving ? 'REVVING V8...' : 'REV ENGINE'}</span>
    </button>
  );
}
