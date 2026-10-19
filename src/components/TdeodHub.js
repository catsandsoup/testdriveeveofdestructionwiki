import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import PS2Button from './PS2Button';
import DamageGauge from './DamageGauge';
import CRTFilter from './CRTFilter';
import EngineAudio from './EngineAudio';

export default function TdeodHub() {
  const subsystems = [
    {
      title: 'PS2 Battle & Weapons',
      tag: 'SLUS_209.10 • EE CORE',
      status: 'VERIFIED NATIVE ABI',
      desc: 'Weapon trajectory calculations, bot projectile target lead, splash radii, and validated collision envelopes.',
      link: '/ps2/BATTLE_RECOVERY',
      icon: '💥',
      accent: '#ef4444'
    },
    {
      title: 'GS Rendering & LOD',
      tag: 'GRAPHICS SYNTHESIZER',
      status: 'PACKET REPLAY ACTIVE',
      desc: 'GS cold packet replay, Vulkan synchronizations, dynamic mesh LOD runtime, and wide-aspect viewport anchors.',
      link: '/ps2/LOD_RUNTIME',
      icon: '⚡',
      accent: '#f5a623'
    },
    {
      title: 'DualShock 2 & Input',
      tag: 'IOP PAD PROTOCOL',
      status: 'ANALOG CONTINUATION',
      desc: 'DualShock 2 pressure sensitivity, analog steering linearity, SDL gamepad bridge, and keyboard fallback mapping.',
      link: '/ps2/INPUT_CONTINUATION',
      icon: '🎮',
      accent: '#3b82f6'
    },
    {
      title: 'Demolition Physics',
      tag: 'RIGID BODY / DEFORM',
      status: 'EMPIRICAL DYNAMICS',
      desc: 'Spring-damper suspension, soft-body crumple zones, dirt track friction slip curves, and roll impulse physics.',
      link: '/research/wiki/physics_and_collision',
      icon: '🏎️',
      accent: '#10b981'
    },
    {
      title: 'HUD, Menus & Saves',
      tag: 'BASLUS-20910',
      status: 'EDGE ANCHORED',
      desc: 'Safe area HUD anchors, font atlas streaming, PS2 memory card structure, and pushbuffer menu injection.',
      link: '/ps2/HUD_EDGE_ANCHORS',
      icon: '📋',
      accent: '#ec4899'
    },
    {
      title: 'Modding & Engine Specs',
      tag: 'REVERSE ENGINEERING',
      status: 'PIPELINE ROADMAP',
      desc: 'Disc filesystem extraction (.bms), car mesh substitution, custom track geometry, and native hooks.',
      link: '/ps2/MODDING_SCOPE',
      icon: '🔧',
      accent: '#a855f7'
    }
  ];

  const events = [
    { name: 'Suicide Race', type: 'High Impact', note: 'Opposing traffic lanes on dirt oval', badge: '☠️ DEADLY' },
    { name: 'Figure 8 Derby', type: 'Intersection', note: 'Blind crossroad collision timing', badge: '✖️ CROSSING' },
    { name: 'School Bus Race', type: 'Heavy Metal', note: '10-ton bus physics & barrel rolls', badge: '🚌 HEAVY' },
    { name: 'The Gauntlet', type: 'Survival', note: 'Escort hearse against swarm of killers', badge: '🛡️ ESCORT' },
    { name: 'Trailer Race', type: 'Towing Mayhem', note: 'Campers & boat trailers disintegrating', badge: '🏕️ CHAOS' },
    { name: 'Rollover Contest', type: 'Stunt / Jump', note: 'Launching off angled kicker ramps', badge: '🔄 AIRBORNE' }
  ];

  return (
    <div style={{ margin: '0 auto', maxWidth: '1100px', padding: '10px 0 40px' }}>
      
      {/* Top PS2 System Banner */}
      <div style={{
        background: '#0d1015',
        border: '1px solid #222936',
        borderRadius: '6px',
        padding: '10px 18px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: '#00439c',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '3px',
            fontFamily: "'Russo One', sans-serif",
            fontSize: '0.78rem',
            letterSpacing: '0.5px'
          }}>
            PS2 NATIVE
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#cbd5e1' }}>
            SLUS_209.10 • Sony PlayStation 2 Recompilation
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EngineAudio />
          <CRTFilter />
        </div>
      </div>

      {/* Hero Container */}
      <div style={{
        background: 'linear-gradient(180deg, #181d26 0%, #11141b 100%)',
        border: '2px solid #2e3544',
        borderRadius: '8px',
        padding: '36px 30px',
        marginBottom: '36px',
        position: 'relative',
        boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative hazard bar on top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'repeating-linear-gradient(-45deg, #f5a623, #f5a623 10px, #11141b 10px, #11141b 20px)'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="ps2-badge primary">REVERSE ENGINEERING RECOMPILATION</span>
              <span className="ps2-badge ps2">SLUS_209.10</span>
            </div>

            <h1 style={{
              fontFamily: "'Russo One', 'Impact', sans-serif",
              fontSize: '2.5rem',
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '14px',
              borderBottom: 'none',
              paddingBottom: 0,
              textTransform: 'uppercase'
            }}>
              Test Drive: <span style={{ color: '#f5a623', textShadow: '0 0 16px rgba(245, 166, 35, 0.4)' }}>Eve of Destruction</span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              maxWidth: '680px',
              marginBottom: '24px'
            }}>
              The comprehensive technical knowledge base, modder reference, and engine documentation for the 
              native PlayStation 2 recompilation. Documenting Emotion Engine assembly, Graphics Synthesizer rendering, 
              rigid-body physics, vehicle deformation, and empirical gameplay contracts.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link className="eod-btn" to="/ps2/BATTLE_RECOVERY">
                <span>EXPLORE SUBSYSTEMS <PS2Button btn="cross" /></span>
              </Link>
              <Link className="eod-btn secondary" to="/ps2/MODDING_SCOPE">
                <span>MODDER'S PLAYBOOK <PS2Button btn="square" /></span>
              </Link>
              <a className="eod-btn secondary" href={useBaseUrl('/knowledge-index.json')} target="_blank" rel="noopener noreferrer">
                <span>MACHINE INDEX (JSON)</span>
              </a>
            </div>
          </div>

          {/* Quick HUD Damage Widget */}
          <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
            <DamageGauge />
          </div>
        </div>
      </div>

      {/* Subsystem Cards Grid */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.35rem', letterSpacing: '1px' }}>
            PS2 CORE ARCHITECTURE &amp; SUBSYSTEMS
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
            SELECT TOPIC <PS2Button btn="cross" />
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {subsystems.map((sub, i) => (
            <Link
              key={i}
              to={sub.link}
              style={{
                textDecoration: 'none',
                display: 'block'
              }}
            >
              <div style={{
                background: 'linear-gradient(160deg, #171b23 0%, #0f1217 100%)',
                border: '1px solid #282f3d',
                borderRadius: '6px',
                padding: '20px',
                height: '100%',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = sub.accent;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.7), 0 0 14px ${sub.accent}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#282f3d';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{sub.icon}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: sub.accent,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    background: `${sub.accent}15`,
                    border: `1px solid ${sub.accent}40`
                  }}>
                    {sub.status}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: '1.15rem',
                  color: '#f8fafc',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {sub.title}
                </h3>

                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  color: '#64748b',
                  marginBottom: '10px',
                  textTransform: 'uppercase'
                }}>
                  {sub.tag}
                </div>

                <p style={{
                  fontSize: '0.88rem',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  margin: 0,
                  flex: 1
                }}>
                  {sub.desc}
                </p>

                <div style={{
                  marginTop: '16px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: '#cbd5e1'
                }}>
                  <span>Inspect Spec</span>
                  <span style={{ color: sub.accent, fontWeight: 'bold' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Demolition Event Roster */}
      <div style={{
        background: '#12151c',
        border: '1px solid #262c38',
        borderRadius: '6px',
        padding: '24px',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.2rem' }}>🏁</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f5a623' }}>
            DEMOLITION EVENT ROSTER (PS2 CAREER &amp; ACTION)
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
          Rulesets, AI waypoint loops, track boundaries, and collision trigger structures imported for native modding.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {events.map((ev, i) => (
            <div key={i} style={{
              background: '#181c25',
              border: '1px solid #2d3544',
              borderRadius: '4px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>{ev.name}</strong>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#f5a623',
                  background: 'rgba(245, 166, 35, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '2px',
                  border: '1px solid rgba(245, 166, 35, 0.3)'
                }}>
                  {ev.badge}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{ev.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Machine & LLM Retrieval Command Terminal */}
      <div style={{
        background: '#090b0e',
        border: '1px solid #2a313e',
        borderRadius: '6px',
        padding: '22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 'bold' }}>$</span>
            <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              MACHINE RETRIEVAL &amp; AUTOMATION PIPELINE
            </span>
          </div>
          <span className="ps2-badge">REST / LLM READY</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '14px' }}>
          Automated agents and modding tools can parse indexed findings with deterministic JSON and raw Markdown feeds:
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <a
            href={useBaseUrl('/knowledge-index.json')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#151921',
              border: '1px solid #333c4d',
              borderRadius: '4px',
              padding: '8px 14px',
              color: '#38bdf8',
              fontSize: '0.82rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📁</span> knowledge-index.json
          </a>
          <a
            href={useBaseUrl('/llms.txt')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#151921',
              border: '1px solid #333c4d',
              borderRadius: '4px',
              padding: '8px 14px',
              color: '#facc15',
              fontSize: '0.82rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📄</span> llms.txt (Retrieval Guide)
          </a>
          <a
            href={useBaseUrl('/llms-full.txt')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#151921',
              border: '1px solid #333c4d',
              borderRadius: '4px',
              padding: '8px 14px',
              color: '#4ade80',
              fontSize: '0.82rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📑</span> llms-full.txt (Full Corpus)
          </a>
        </div>

        <div style={{
          background: '#040507',
          border: '1px solid #1a1e27',
          padding: '10px 14px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          color: '#e2e8f0',
          overflowX: 'auto'
        }}>
          <code>jq '.entries[] | select(.platform | startswith("PS2")) | select(.category == "cars")' knowledge-index.json</code>
        </div>
      </div>

    </div>
  );
}
