import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import PS2Button from './PS2Button';

function StatMeter({ label, value, max = 5 }) {
  const blocks = [];
  for (let i = 1; i <= max; i++) {
    blocks.push(
      <span
        key={i}
        className={`stat-meter__block ${i <= value ? 'stat-meter__block--active' : ''}`}
      />
    );
  }
  return (
    <div className="stat-meter">
      <span className="stat-meter__label">{label}</span>
      <div className="stat-meter__track">{blocks}</div>
      <span className="stat-meter__val">{value}/{max}</span>
    </div>
  );
}

export default function TdeodHub() {
  const [activeCategory, setActiveCategory] = useState('all');

  const subsystems = [
    {
      title: 'PS2 Battle & Weapons',
      platform: 'PS2 SLUS_209.10',
      badge: 'NATIVE ABI',
      desc: 'Chicken weapon ballistics, straight-line launch velocity (F * (|v|+28)), mortar arc clearance, splash envelopes, and bot targeting.',
      link: '/ps2/BATTLE_RECOVERY',
      category: 'combat',
      stats: [
        { label: 'Ballistics', val: 5 },
        { label: 'AI Routing', val: 4 }
      ]
    },
    {
      title: 'Course Navigation & Bots',
      platform: 'EE 0x003CD190',
      badge: 'VERIFIED RECOVERY',
      desc: 'Primary course waypoints (60-byte nodes), node tangent tracking, obstacle lookahead, and live pursuit heuristics in Battle mode.',
      link: '/ps2/BATTLE_NAVIGATION',
      category: 'combat',
      stats: [
        { label: 'Waypoints', val: 5 },
        { label: 'Pursuit', val: 4 }
      ]
    },
    {
      title: 'GS Rendering & LOD',
      platform: 'GRAPHICS SYNTHESIZER',
      badge: 'PACKET REPLAY',
      desc: 'Cold packet initialization, Vulkan/Metal synchronization, Euclidean LOD distance scaling (Low1 vs Low0), and 16:9 projection.',
      link: '/ps2/LOD_RUNTIME',
      category: 'graphics',
      stats: [
        { label: 'GS Packets', val: 5 },
        { label: 'LOD Curves', val: 5 }
      ]
    },
    {
      title: 'DualShock 2 Input',
      platform: 'IOP PAD PROTOCOL',
      badge: 'CONTINUATION',
      desc: 'Pressure-sensitive analog buttons (0-255), controller state continuation across menus, and keyboard fallback bindings.',
      link: '/ps2/INPUT_CONTINUATION',
      category: 'engine',
      stats: [
        { label: 'DS2 Pressure', val: 5 },
        { label: 'RPC Buffers', val: 4 }
      ]
    },
    {
      title: 'Gameplay Mods & Patches',
      platform: 'LIVE CHEATS & INJECTION',
      badge: 'VERIFIED RECOMP',
      desc: '14 built-in mods: in-game F1 mod menu, SinglePlayerBattle injection, master cheats (0x003C4190), and turbo physics scaling.',
      link: '/ps2/GAMEPLAY_MODS_RE',
      category: 'mods',
      stats: [
        { label: 'Mod Menu', val: 5 },
        { label: '14 Built-in', val: 5 }
      ]
    },
    {
      title: 'Human Manual Recovery',
      platform: 'HLE RECOVERY HOOK',
      badge: 'GAMEPLAY TWEAK',
      desc: 'Selective 3-second auto-reset suppression for humans, native SELECT rearm deadline, and live settings toggle in overlay.',
      link: '/ps2/MANUAL_RECOVERY',
      category: 'mods',
      stats: [
        { label: 'HLE Hooks', val: 4 },
        { label: 'Select Btn', val: 5 }
      ]
    },
    {
      title: 'HUD & Screen Anchors',
      platform: '2D GS PRIMITIVES',
      badge: 'SAFE AREA UI',
      desc: 'Dynamic wide-aspect coordinate anchoring, damage gauges, tachometer scaling, and font atlas streaming from disc.',
      link: '/ps2/HUD_EDGE_ANCHORS',
      category: 'graphics',
      stats: [
        { label: 'Wide-Aspect', val: 5 },
        { label: 'Atlas VRAM', val: 4 }
      ]
    },
    {
      title: 'Modding Scope & Tools',
      platform: 'REVERSE ENGINEERING',
      badge: 'PIPELINE ROADMAP',
      desc: 'Disc filesystem extraction (.bms), car mesh and paint replacement, track injection, and binary hook contracts.',
      link: '/ps2/MODDING_SCOPE',
      category: 'engine',
      stats: [
        { label: 'Disc VFS', val: 5 },
        { label: 'Mesh Replace', val: 4 }
      ]
    },
  ];

  const filteredSubsystems = activeCategory === 'all'
    ? subsystems
    : subsystems.filter(s => s.category === activeCategory);

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '10px 0 40px' }}>
      
      {/* Top PS2 Hardware Header Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #131722 0%, #0d1017 100%)',
        border: '1px solid #283140',
        borderRadius: '6px',
        padding: '10px 18px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: '#003791',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '3px',
            fontFamily: "'Russo One', sans-serif",
            fontSize: '0.78rem',
            letterSpacing: '0.6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            PS2
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#cbd5e1' }}>
            SLUS_209.10 • Sony PlayStation 2 Native Recompilation Technical Wiki
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ps2-pill ps2">EMOTION ENGINE 294.9MHz</span>
          <span className="ps2-pill active">GS 147.4MHz</span>
        </div>
      </div>

      {/* Main Hero: Riveted Galvanized Steel Panel */}
      <div className="ps2-panel ps2-panel-riveted" style={{
        padding: '32px 36px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px' }}>
          
          {/* Authentic Square Game Logo */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={useBaseUrl('/img/logo.svg')}
              alt="Test Drive: Eve of Destruction Square Logo"
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '12px',
                border: '2px solid #3b4556',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                display: 'block'
              }}
            />
          </div>

          {/* Title & Demolition Tagline */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--ps2-game-yellow)',
                letterSpacing: '1.2px',
                textTransform: 'uppercase'
              }}>
                PLAYSTATION 2 NATIVE RECOMPILATION &amp; REVERSE-ENGINEERING
              </span>
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              margin: '2px 0 14px',
              borderBottom: 'none',
              paddingBottom: 0,
              lineHeight: '1.15',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ color: '#ffffff', fontFamily: "'Russo One', sans-serif" }}>Test Drive:</span>
              <span className="spray-graffiti" style={{ fontSize: '2.5rem', transform: 'rotate(-2deg)' }}>
                EVE OF DESTRUCTION
              </span>
            </h1>

            <p style={{
              fontSize: '0.98rem',
              lineHeight: '1.6',
              color: '#94a3b8',
              maxWidth: '820px',
              margin: '0 0 20px'
            }}>
              A public, evidence-backed engineering reference for understanding and modifying <em>Test Drive: Eve of Destruction</em> (PS2 SLUS_209.10).
              Featuring verified MIPS R5900 disassembly, Graphics Synthesizer packet replay, bot combat navigation, in-game mod menus, and structured retrieval for LLMs.
            </p>

            {/* Career-style Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link
                to="/ps2/BATTLE_RECOVERY"
                className="stamped-tab stamped-tab--primary"
              >
                <span>BATTLE &amp; COMBAT AI</span>
                <PS2Button btn="cross" />
              </Link>

              <Link
                to="/ps2/GAMEPLAY_MODS_RE"
                className="stamped-tab stamped-tab--yellow"
              >
                <span>MOD MENU &amp; CHEATS</span>
                <PS2Button btn="triangle" />
              </Link>

              <Link
                to="/ps2/LOD_RUNTIME"
                className="stamped-tab"
              >
                <span>GS RENDERING &amp; LOD</span>
                <PS2Button btn="square" />
              </Link>

              <a
                href={useBaseUrl('/knowledge-index.json')}
                target="_blank"
                rel="noopener noreferrer"
                className="stamped-tab"
              >
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>JSON INDEX</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Career Car Purchase Screen Stamped Category Filter Tabs */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc', letterSpacing: '0.5px' }}>
              ENGINE SUBSYSTEMS &amp; REVERSE-ENGINEERING SPECS
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Select a subsystem to inspect machine-readable contracts and verified evidence:
            </span>
          </div>

          {/* Stamped Tabs [All] [Combat & Bots] [Graphics & GS] [Mods & Patches] [Engine Core] */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`stamped-tab ${activeCategory === 'all' ? 'stamped-tab--active' : ''}`}
            >
              ALL [8]
            </button>
            <button
              onClick={() => setActiveCategory('combat')}
              className={`stamped-tab ${activeCategory === 'combat' ? 'stamped-tab--active' : ''}`}
            >
              COMBAT &amp; BOTS
            </button>
            <button
              onClick={() => setActiveCategory('graphics')}
              className={`stamped-tab ${activeCategory === 'graphics' ? 'stamped-tab--active' : ''}`}
            >
              GS &amp; LOD
            </button>
            <button
              onClick={() => setActiveCategory('mods')}
              className={`stamped-tab ${activeCategory === 'mods' ? 'stamped-tab--active' : ''}`}
            >
              MODS &amp; CHEATS
            </button>
            <button
              onClick={() => setActiveCategory('engine')}
              className={`stamped-tab ${activeCategory === 'engine' ? 'stamped-tab--active' : ''}`}
            >
              ENGINE &amp; INPUT
            </button>
          </div>
        </div>

        {/* 8 Subsystem Cards Styled with Galvanized Steel Panels & Chunky Stat Meters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {filteredSubsystems.map((sub, i) => (
            <Link
              key={i}
              to={sub.link}
              style={{
                textDecoration: 'none',
                display: 'block'
              }}
            >
              <div
                className="ps2-panel ps2-panel-riveted"
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 18px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ps2-game-yellow)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 208, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ps2-border-light)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.7)';
                }}
              >
                {/* Top Badge & Platform */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    color: '#94a3b8'
                  }}>
                    {sub.platform}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--ps2-game-yellow)',
                    background: 'rgba(255, 208, 0, 0.1)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 208, 0, 0.3)'
                  }}>
                    {sub.badge}
                  </span>
                </div>

                {/* Subsystem Title */}
                <h3 style={{
                  fontSize: '1.05rem',
                  color: '#ffffff',
                  margin: '0 0 8px',
                  fontFamily: "'Russo One', sans-serif",
                  letterSpacing: '0.3px'
                }}>
                  {sub.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.84rem',
                  color: '#94a3b8',
                  lineHeight: '1.5',
                  margin: '0 0 14px',
                  flex: 1
                }}>
                  {sub.desc}
                </p>

                {/* Career Car Purchase Screen Chunky Stat Meters */}
                <div style={{
                  background: '#090c12',
                  border: '1px solid #1a202c',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  marginBottom: '12px'
                }}>
                  {sub.stats.map((st, idx) => (
                    <StatMeter key={idx} label={st.label} value={st.val} />
                  ))}
                </div>

                {/* Footer Action */}
                <div style={{
                  paddingTop: '8px',
                  borderTop: '1px solid #1e2430',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  <span>Inspect Code &amp; Registers</span>
                  <span style={{ color: 'var(--ps2-game-yellow)', fontWeight: 'bold' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Machine & LLM Retrieval Command Section: Weathered Steel Plate */}
      <div className="ps2-panel" style={{
        marginTop: '32px',
        padding: '22px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <strong style={{ fontSize: '0.92rem', color: '#f8fafc', fontFamily: "'Russo One', sans-serif", letterSpacing: '0.5px' }}>
            STRUCTURED RETRIEVAL FOR MODDERS &amp; LLMS
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
            MACHINE-READABLE CORPUS
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '0 0 14px' }}>
          Query stable subsystem IDs, validated platform signatures, function addresses, and dependencies without parsing unstructured HTML:
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}>
          <a
            href={useBaseUrl('/knowledge-index.json')}
            target="_blank"
            rel="noopener noreferrer"
            className="stamped-tab"
            style={{ color: '#60a5fa' }}
          >
            knowledge-index.json
          </a>
          <a
            href={useBaseUrl('/llms.txt')}
            target="_blank"
            rel="noopener noreferrer"
            className="stamped-tab"
            style={{ color: '#facc15' }}
          >
            llms.txt
          </a>
          <a
            href={useBaseUrl('/llms-full.txt')}
            target="_blank"
            rel="noopener noreferrer"
            className="stamped-tab"
            style={{ color: '#4ade80' }}
          >
            llms-full.txt
          </a>
        </div>

        <div style={{
          background: '#06080c',
          border: '1px solid #1a202c',
          padding: '10px 14px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem',
          color: '#cbd5e1'
        }}>
          <code>jq '.entries[] | select(.platform | startswith("PS2")) | select(.category == "combat")' knowledge-index.json</code>
        </div>
      </div>

    </div>
  );
}
