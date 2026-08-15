import React from 'react'
import { posColor } from './theme'

// The draft board — the thing people actually stare at.
// Teams across the top, rounds down the side, and every pick lands as a tile
// filled with its position colour, so the shape of a draft (the run on linemen,
// the QB nobody took) reads at a glance.

export default function DraftBoard({ teams, order, picks, pickIdx, teamCount, rounds, compact }) {
  const cellW = compact ? 92 : 118
  const cellH = compact ? 52 : 62

  return (
    <div style={{ overflow: 'auto' }}>
      <div style={{ minWidth: teamCount * cellW + 42 }}>
        {/* Team header row */}
        <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 2, background: '#0F131C' }}>
          <div style={{ width: 42, flexShrink: 0 }} />
          {teams.map((t) => (
            <div
              key={t.id}
              title={t.name}
              style={{
                width: cellW, flexShrink: 0, padding: '9px 6px', textAlign: 'center',
                fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                color: t.isYou ? '#22C55E' : 'rgba(255,255,255,0.5)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {t.isYou ? 'YOU' : t.name}
            </div>
          ))}
        </div>

        {/* One row per round */}
        {Array.from({ length: rounds }, (_, r) => {
          const rowPicks = order.slice(r * teamCount, r * teamCount + teamCount)
          return (
            <div key={r} style={{ display: 'flex' }}>
              <div style={{
                width: 42, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              }}>
                R{r + 1}
              </div>

              {rowPicks.map((teamId, c) => {
                const globalIdx = r * teamCount + c
                const pick = picks[globalIdx]
                const isNow = globalIdx === pickIdx
                const isYours = teams[teamId]?.isYou
                const col = pick ? posColor(pick.pos) : null

                return (
                  <div key={c} style={{ width: cellW, height: cellH, flexShrink: 0, padding: 2 }}>
                    <div
                      style={{
                        width: '100%', height: '100%', borderRadius: 6,
                        padding: '5px 6px', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        // A drafted player fills his cell with his position colour,
                        // the way Sleeper's board reads.
                        background: pick
                          ? `linear-gradient(135deg, ${col}3D, ${col}1F)`
                          : isNow ? 'rgba(34,197,94,0.14)'
                          : isYours ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                        borderLeft: pick ? `3px solid ${col}` : '3px solid transparent',
                        border: isNow && !pick ? '2px solid #22C55E' : undefined,
                        boxShadow: pick ? `inset 0 0 0 1px ${col}33` : 'none',
                      }}
                    >
                      {pick ? (
                        <>
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 9, fontWeight: 900, color: col, lineHeight: 1.2,
                          }}>
                            <span>{pick.pos}{pick.team ? ` · ${pick.team}` : ''}</span>
                            {pick._price != null && (
                              <span style={{ color: '#D4A843' }}>{pick._price}M</span>
                            )}
                          </div>
                          <div style={{
                            fontSize: compact ? 11 : 12, fontWeight: 700, color: '#fff',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            marginTop: 2,
                          }}>
                            {pick.name}
                          </div>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                            {r + 1}.{c + 1}
                          </div>
                        </>
                      ) : (
                        <div style={{
                          fontSize: 10, textAlign: 'center',
                          color: isNow ? '#22C55E' : 'rgba(255,255,255,0.16)',
                          fontWeight: isNow ? 800 : 400,
                        }}>
                          {isNow ? 'ON THE CLOCK' : `${r + 1}.${c + 1}`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
