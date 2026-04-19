import React from 'react'
import {
  CrownOutlined,
  TeamOutlined,
  DollarOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  RiseOutlined,
  FireOutlined,
} from '@ant-design/icons'
import './nfl-rivals.css'

/* ══════════════════════════════════════
   A.FOOTBALL RIVALS — RULES BOOK
   Purple-themed (#A78BFA) version
   Matches Soccer Rivals RivalsRulesbook.js
   ══════════════════════════════════════ */

const RULES_SECTIONS = [
  {
    icon: <CrownOutlined />,
    heading: 'What Is A.FOOTBALL RIVALS?',
    text: 'A.FOOTBALL RIVALS is a standalone prestige-based ladder competition for American Football. Unlike traditional fantasy leagues, RIVALS requires no league or draft — any registered user can enter. You build a 53-man roster from all active NFL players and compete in weekly head-to-head seasons across 4 divisions. Win matches, earn promotions, climb the ranks, and collect trophies on your way to the ultimate goal: Gridiron Elite (Division 1).',
  },
  {
    icon: <TeamOutlined />,
    heading: 'Squad Rules',
    text: 'Your RIVALS roster consists of exactly 53 players drawn from all 32 NFL teams. You must field a valid 24-man Active Gameday roster each week. The Active Gameday roster requires a minimum of: 1 QB, 2 RB, 3 WR, 1 TE, 5 OL (any combination of OT, OG, C), 3 DL (any combination of DE, DT), 3 LB, 2 CB, 2 S, 1 K, and 1 P. The remaining 29 players form your Practice Squad and serve as depth for injuries and bye weeks.',
  },
  {
    icon: <DollarOutlined />,
    heading: 'Salary Cap & Floor',
    text: 'The total salary cap is $301,000,000 ($301M). Each player\'s salary counts against this cap. You must also maintain a salary floor of $280,000,000 ($280M), meaning you cannot hoard cap space by fielding a roster of minimum-salary players. Player salaries are derived from real NFL contract data and update periodically. If your total roster salary exceeds $301M you will not be able to save your squad until you make changes.',
  },
  {
    icon: <SwapOutlined />,
    heading: 'Player Roles & Scoring',
    text: 'Each player on your 53-man roster is assigned one of two roles: Active (Gameday roster) or Practice Squad. You must have exactly 24 Active players. Active players contribute 100% of their SAM Metric points each week. Practice Squad players contribute 0% — they are depth only. Points are calculated using the proprietary SAM Metric system, where every stat is weighted by a position-specific multiplier derived from real NFL franchise tag values. All touchdowns are flat 1.0 points regardless of position. Full IDP (Individual Defensive Player) scoring is supported — tackles, sacks, interceptions, forced fumbles, and more all count.',
  },
  {
    icon: <SafetyCertificateOutlined />,
    heading: 'The 4 Divisions',
    text: 'RIVALS features 4 competitive divisions. Every new player starts in Division 4 — Rookie Tier. The full division ladder: 4. Rookie Tier — where every manager begins their journey. 3. Varsity Conference — earn your stripes against proven competitors. 2. All-Pro League — the proving ground for elite managers. 1. Gridiron Elite — the pinnacle. Only the best survive here.',
  },
  {
    icon: <ThunderboltOutlined />,
    heading: 'Season Structure',
    text: 'Each RIVALS season runs for the duration of the NFL regular season (Weeks 1–18). At the start of each season, players are assigned to pods of 12 managers within the same division. Each pod operates as a mini-league where all 12 managers compete against each other over the course of the season. Your season record (wins, draws, losses) determines your final pod standing.',
  },
  {
    icon: <FireOutlined />,
    heading: 'Weekly Scoring',
    text: 'Each NFL week (Thursday through Monday Night Football), your Active Gameday roster earns real-time SAM Metric points from all NFL games. Stats are processed live and weighted by each player\'s position-specific franchise tag multiplier — so a QB\'s passing yards are worth more per yard than an RB\'s rushing yards, just like the NFL values them. Your total weekly SAM score is compared head-to-head against every other manager in your pod. A win awards 3 points, a draw awards 1 point, and a loss awards 0 points. Total points across all weeks determine your pod ranking. Bye-week management is critical — make sure you have Active players who are actually playing that week.',
  },
  {
    icon: <RiseOutlined />,
    heading: 'Promotion & Relegation',
    text: 'At the end of each season, the top 3 managers in each pod earn promotion to the next higher division. The bottom 3 managers are relegated to the division below. Managers finishing 4th through 9th remain in their current division. Division 1 (Gridiron Elite) has no promotion — only the glory of staying at the top. Division 4 (Rookie Tier) has no relegation — it is the starting point for all new entrants.',
  },
  {
    icon: <TrophyOutlined />,
    heading: 'Trophies & Achievements',
    text: 'Earn permanent trophies for your achievements. Division Trophy — finish in the top 3 of any pod. Giant Killer — defeat a manager from a higher division in a cross-division event. The Invincible — go an entire season unbeaten. Wonderkid Whisperer — have a rookie player score 30+ points in a single week while on your Active roster. Gridiron Elite — reach Division 1. Trophies are permanently displayed in your Trophy Cabinet.',
  },
]

const QUICK_REF = [
  'Roster: 53 players',
  'Cap: $301M',
  'Floor: $280M',
  'Active Gameday: 24',
  '1 QB mandatory',
  '5 OL mandatory',
  '3 DL mandatory',
  '3-4 Defense base',
  '4 Divisions',
  'Pods of 12 managers',
  'Top 3 promoted',
  'Bottom 3 relegated',
  'Thu → Mon scoring',
  'Full IDP scoring',
  'Bye-week management',
  '5 Trophies to earn',
]

const RulesBook = () => {
  return (
    <div className="nflr-page" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(167,139,250,0.12)',
            border: '1px solid rgba(167,139,250,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#A78BFA',
          }}>
            <CrownOutlined />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              lineHeight: 1.1,
            }}>
              A.FOOTBALL RIVALS
            </h1>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: '#A78BFA',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
              Official Rules Book
            </div>
          </div>
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          margin: '8px 0 0 62px',
        }}>
          A standalone head-to-head A.Football fantasy competition with 4 divisions, seasonal play, promotion &amp; relegation, and full IDP scoring. No league required.
        </p>
      </div>

      {/* Rule Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {RULES_SECTIONS.map((section, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(20,28,45,0.6)',
              border: '1px solid rgba(110,105,128,0.15)',
              borderRadius: 16,
              backdropFilter: 'blur(12px)',
              padding: '22px 24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ color: '#A78BFA', fontSize: 16 }}>{section.icon}</span>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: '#A78BFA',
                margin: 0,
              }}>
                {section.heading}
              </h3>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.75,
              margin: 0,
              paddingLeft: 26,
            }}>
              {section.text}
            </p>
          </div>
        ))}
      </div>

      {/* Quick-reference summary card */}
      <div style={{
        marginTop: 28,
        background: 'rgba(167,139,250,0.06)',
        border: '1px solid rgba(167,139,250,0.15)',
        borderRadius: 16,
        padding: '20px 24px',
      }}>
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: '#A78BFA',
          margin: '0 0 12px',
        }}>
          Quick Reference
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 8,
        }}>
          {QUICK_REF.map((rule, i) => (
            <span key={i} style={{
              padding: '6px 12px',
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.12)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#cbd5e1',
              fontFamily: "'Rajdhani', sans-serif",
            }}>
              {rule}
            </span>
          ))}
        </div>
      </div>

      {/* SAM Metric Scoring */}
      <div style={{
        marginTop: 28,
        background: 'rgba(20,28,45,0.6)',
        border: '1px solid rgba(110,105,128,0.15)',
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        padding: '22px 24px',
      }}>
        <h3 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 17,
          fontWeight: 700,
          color: '#A78BFA',
          margin: '0 0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <ThunderboltOutlined /> The SAM Metric
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13,
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: '0 0 20px',
        }}>
          SAM RIVALS uses the proprietary <strong style={{ color: '#A78BFA' }}>SAM Metric</strong> scoring system — not traditional PPR or Standard fantasy scoring. Every stat is weighted by a position-specific multiplier derived from real NFL franchise tag values. This means a QB&apos;s passing yard is worth a different amount than an RB&apos;s rushing yard, reflecting how the NFL itself values each position.
        </p>

        {/* How it works */}
        <div style={{
          background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{
            fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
            color: '#A78BFA', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
          }}>How SAM Scoring Works</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75 }}>
            <strong style={{ color: '#e2e8f0' }}>Weekly Score = Σ (stat value × position weight)</strong>
            <br />
            Each position has unique multipliers for every stat — passing yards, rushing yards, tackles, sacks, field goals, etc. — calibrated from that position&apos;s NFL franchise tag cost relative to QB (the baseline at 100%).
            <br /><br />
            <strong style={{ color: '#f59e0b' }}>Exception: Touchdowns are always flat 1.0 points</strong> regardless of position. Passing TDs, rushing TDs, receiving TDs, defensive TDs, pick sixes, and return TDs all award exactly 1.0 SAM point — they are never scaled by the franchise tag multiplier.
          </div>
        </div>

        {/* Franchise Tag Weights */}
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
          color: '#22c55e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
        }}>2026 Franchise Tag Position Weights</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 20 }}>
          {[
            ['QB', '$43.9M', '100%', '#ef4444'],
            ['WR', '$27.3M', '62.2%', '#22c55e'],
            ['DT', '$27.1M', '61.8%', '#a855f7'],
            ['LB', '$26.9M', '61.2%', '#ec4899'],
            ['OL', '$25.8M', '58.7%', '#64748b'],
            ['DE', '$24.4M', '55.7%', '#a855f7'],
            ['CB', '$21.2M', '48.2%', '#06b6d4'],
            ['S', '$20.1M', '45.9%', '#06b6d4'],
            ['TE', '$15.0M', '34.3%', '#f59e0b'],
            ['RB', '$14.3M', '32.6%', '#3b82f6'],
            ['K / P', '$6.6M', '15.1%', '#78716c'],
          ].map(([pos, tag, pct, color], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: 'rgba(255,255,255,0.02)', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 800,
                color, minWidth: 32,
              }}>{pos}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{tag}</span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700,
                color: '#e2e8f0',
              }}>{pct}</span>
            </div>
          ))}
        </div>

        {/* What this means */}
        <div style={{
          fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700,
          color: '#a855f7', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
        }}>What This Means In Practice</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
          {[
            'A QB\'s stats are scored at full weight (100%) — the NFL\'s most valuable position.',
            'A WR earns ~62% of the base value per stat — reflecting wide receiver franchise tag value.',
            'A DT earns ~62% per stat — defensive tackles are valued nearly as high as receivers.',
            'An RB earns ~33% per stat — reflecting the modern NFL\'s devaluation of the running back position.',
            'A K/P earns ~15% per stat — specialists have the lowest franchise tag values.',
            'All touchdowns are flat 1.0 points regardless of position — the great equalizer.',
            'Stat multipliers update annually when new franchise tag values are announced.',
          ].map((rule, i) => (
            <div key={i} style={{
              padding: '4px 0',
              borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}>
              {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RulesBook
