import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import PS2Button from './PS2Button';

export default function TdeodHub() {
  const subsystems = [
    {
      title: 'PS2 Battle & Weapons',
      platform: 'PS2 SLUS_209.10',
      badge: 'NATIVE ABI',
      desc: 'Weapon trajectory physics, lead-angle projectile aim, splash envelopes, and validated combat bot loops.',
      link: '/ps2/BATTLE_RECOVERY',
    },
    {
      title: 'Course Navigation & Bots',
      platform: 'EE 0x003CD190',
      badge: 'VERIFIED RECOVERY',
      desc: 'Primary course waypoints, node tangent tracking, obstacle lookahead, and live pursuit heuristics.',
      link: '/ps2/BATTLE_NAVIGATION',
    },
    {
      title: 'GS Rendering & LOD',
      platform: 'GRAPHICS SYNTHESIZER',
      badge: 'PACKET REPLAY',
      desc: 'Cold packet initialization, Vulkan render sync, distance LOD curves, and native 16:9 viewport anchoring.',
      link: '/ps2/LOD_RUNTIME',
    },
    {
      title: 'DualShock 2 Input',
      platform: 'IOP PAD PROTOCOL',
      badge: 'CONTINUATION',
      desc: 'Pressure-sensitive analog buttons, controller continuation across menus, and keyboard fallback mappings.',
      link: '/ps2/INPUT_CONTINUATION',
    },
    {
      title: 'Gameplay Mods & Patches',
      platform: 'LIVE CHEATS & INJECTION',
      badge: 'VERIFIED RECOMP',
      desc: 'Master cheat registers (0x003C4190), controller chords, SinglePlayerBattle injection, and turbo physics scaling.',
      link: '/ps2/GAMEPLAY_MODS_RE',
    },
    {
      title: 'Human Manual Recovery',
      platform: 'HLE RECOVERY HOOK',
      badge: 'GAMEPLAY TWEAK',
      desc: 'Selective 3-second auto-reset suppression for humans, native SELECT rearm deadline, and live settings toggle.',
      link: '/ps2/MANUAL_RECOVERY',
    },
    {
      title: 'HUD & Screen Anchors',
      platform: '2D GS PRIMITIVES',
      badge: 'SAFE AREA UI',
      desc: 'Dynamic wide-aspect coordinate anchoring, damage gauges, tachometer scaling, and font atlas streaming.',
      link: '/ps2/HUD_EDGE_ANCHORS',
    },
    {
      title: 'Modding Scope & Tools',
      platform: 'REVERSE ENGINEERING',
      badge: 'PIPELINE ROADMAP',
      desc: 'Disc filesystem extraction (.bms), model swapping, track injection, and binary hook contracts.',
      link: '/ps2/MODDING_SCOPE',
    },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '10px 0 30px' }}>
      
      {/* Top PS2 System Header Bar */}
      <div style={{
        background: '#101319',
        border: '1px solid #262c38',
        borderRadius: '4px',
        padding: '10px 16px',
        marginBottom: '20px',
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
            borderRadius: '2px',
            fontFamily: "'Russo One', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}>
            PS2
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: '#cbd5e1' }}>
            SLUS_209.10 • Sony PlayStation 2 Native Recompilation Knowledge Base
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="ps2-pill ps2">EMOTION ENGINE &amp; GS</span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div style={{
        background: '#14171f',
        border: '1px solid #262c38',
        borderRadius: '6px',
        padding: '28px',
        marginBottom: '30px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#e5a93c',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            EVE OF DESTRUCTION • TECHNICAL MODDING &amp; RECOMPILATION REFERENCE
          </span>
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          margin: '4px 0 16px',
          borderBottom: 'none',
          paddingBottom: 0,
          color: '#ffffff'
        }}>
          Test Drive: <span style={{ color: '#e5a93c' }}>Eve of Destruction</span>
        </h1>

        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#94a3b8',
          maxWidth: '780px',
          margin: '0 0 22px'
        }}>
          A public, evidence-backed engineering reference for understanding and modifying <em>Test Drive: Eve of Destruction</em>.
          Documenting native PlayStation 2 (SLUS_209.10) subsystems, MIPS R5900 disassembly, Graphics Synthesizer rendering,
          vehicle dynamics, and modding interfaces for both human developers and LLM agents.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/ps2/BATTLE_RECOVERY"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#8e1b1b',
              border: '1px solid #b72b2b',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '4px',
              fontFamily: "'Russo One', sans-serif",
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              textDecoration: 'none'
            }}
          >
            <span>START RESEARCH</span>
            <PS2Button btn="cross" />
          </Link>

          <Link
            to="/ps2/GAMEPLAY_MODS_RE"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1b202a',
              border: '1px solid #2f3746',
              color: '#cbd5e1',
              padding: '8px 16px',
              borderRadius: '4px',
              fontFamily: "'Russo One', sans-serif",
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              textDecoration: 'none'
            }}
          >
            <span>GAMEPLAY MODS &amp; CHEATS</span>
            <PS2Button btn="triangle" />
          </Link>

          <a
            href={useBaseUrl('/knowledge-index.json')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1b202a',
              border: '1px solid #2f3746',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: '4px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.82rem',
              textDecoration: 'none'
            }}
          >
            <span>JSON INDEX</span>
          </a>
        </div>
      </div>

      {/* Subsystem Navigation Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f3f4f6' }}>
            ENGINE SUBSYSTEMS &amp; REVERSE-ENGINEERING SPECS
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
            PRESS <PS2Button btn="cross" /> TO SELECT
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '14px'
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
              <div
                style={{
                  background: '#14171e',
                  border: '1px solid #262c38',
                  borderRadius: '4px',
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8e1b1b';
                  e.currentTarget.style.background = '#1a1e27';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#262c38';
                  e.currentTarget.style.background = '#14171e';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    color: '#64748b'
                  }}>
                    {sub.platform}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#e5a93c',
                    background: 'rgba(229, 169, 60, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '2px',
                    border: '1px solid rgba(229, 169, 60, 0.25)'
                  }}>
                    {sub.badge}
                  </span>
                </div>

                <h3 style={{
                  fontSize: '1rem',
                  color: '#ffffff',
                  margin: '0 0 6px'
                }}>
                  {sub.title}
                </h3>

                <p style={{
                  fontSize: '0.84rem',
                  color: '#94a3b8',
                  lineHeight: '1.45',
                  margin: 0,
                  flex: 1
                }}>
                  {sub.desc}
                </p>

                <div style={{
                  marginTop: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid #1f2530',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.76rem',
                  color: '#64748b'
                }}>
                  <span>Inspect Evidence</span>
                  <span style={{ color: '#e5a93c' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Machine & LLM Retrieval Command Section */}
      <div style={{
        background: '#0d1015',
        border: '1px solid #222936',
        borderRadius: '4px',
        padding: '18px 20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '0.88rem', color: '#e2e8f0', fontFamily: "'Russo One', sans-serif" }}>
            STRUCTURED RETRIEVAL FOR MODDERS &amp; LLMS
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
            MACHINE INDEX
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 12px' }}>
          Query stable subsystem IDs, validated platform signatures, function addresses, and dependencies:
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <a
            href={useBaseUrl('/knowledge-index.json')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#161922',
              border: '1px solid #2d3444',
              borderRadius: '3px',
              padding: '6px 12px',
              color: '#60a5fa',
              fontSize: '0.78rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none'
            }}
          >
            knowledge-index.json
          </a>
          <a
            href={useBaseUrl('/llms.txt')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#161922',
              border: '1px solid #2d3444',
              borderRadius: '3px',
              padding: '6px 12px',
              color: '#facc15',
              fontSize: '0.78rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none'
            }}
          >
            llms.txt
          </a>
          <a
            href={useBaseUrl('/llms-full.txt')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#161922',
              border: '1px solid #2d3444',
              borderRadius: '3px',
              padding: '6px 12px',
              color: '#4ade80',
              fontSize: '0.78rem',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none'
            }}
          >
            llms-full.txt
          </a>
        </div>

        <div style={{
          background: '#07090c',
          border: '1px solid #1a1e26',
          padding: '8px 12px',
          borderRadius: '3px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.76rem',
          color: '#cbd5e1'
        }}>
          <code>jq '.entries[] | select(.platform | startswith("PS2")) | select(.category == "cars")' knowledge-index.json</code>
        </div>
      </div>

    </div>
  );
}
