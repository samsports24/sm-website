import React, { useState, useMemo } from 'react'
import { Select, Button, InputNumber, message } from 'antd'
import { privateAPI, attachToken } from '../../config/constants'

/* ═══════════════════════════════════════════════════════════════════
   MANUAL PLAYOFF BRACKET BUILDER (commissioner) — NFL
   For leagues whose structure doesn't map to the standard 14-team / 7-seed
   playoff, the commissioner assigns the Wild Card matchups by hand. Posts to
   POST /postseason/bracket/manual { wildCard:[{conference,homeSeed,awaySeed,
   home,away}] }, which marks the bracket isManual so auto re-seeding never
   overwrites it. Later rounds fill in via the normal record-result flow.
   ═══════════════════════════════════════════════════════════════════ */

const COLORS = {
  glass: 'rgba(20, 28, 45, 0.6)',
  border: 'rgba(110, 105, 128, 0.25)',
  gold: '#D4A843',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.6)',
}

const emptyRow = (conference = 1) => ({
  conference,
  homeSeed: undefined,
  awaySeed: undefined,
  home: null,
  away: null,
})

const PlayoffBracketBuilder = ({ leagueId, teams = [] }) => {
  const [rows, setRows] = useState([emptyRow(1), emptyRow(2)])
  const [saving, setSaving] = useState(false)

  const teamOptions = useMemo(
    () =>
      (teams || [])
        .map((t) => ({
          value: t._id || t.id,
          label: t.teamName || t.name || t?.team?.name,
          conference: t.conference?.name || t.conference || null,
        }))
        .filter((o) => o.value && o.label),
    [teams]
  )

  const used = useMemo(() => {
    const s = new Set()
    rows.forEach((r) => {
      if (r.home) s.add(String(r.home))
      if (r.away) s.add(String(r.away))
    })
    return s
  }, [rows])

  const optionsFor = (currentVal) =>
    teamOptions.map((o) => ({
      ...o,
      disabled: used.has(String(o.value)) && String(o.value) !== String(currentVal),
    }))

  const setCell = (i, key, val) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)))

  const addRow = () => setRows((prev) => [...prev, emptyRow(prev.length % 2 === 0 ? 1 : 2)])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))

  const allValid =
    rows.length > 0 && rows.every((r) => r.home && r.away && r.conference)

  const save = async () => {
    if (!allValid) {
      message.warning('Every matchup needs a conference and both teams.')
      return
    }
    setSaving(true)
    try {
      await attachToken()
      await privateAPI.post(`/postseason/bracket/manual`, {
        wildCard: rows.map((r) => ({
          conference: r.conference,
          homeSeed: r.homeSeed,
          awaySeed: r.awaySeed,
          home: r.home,
          away: r.away,
        })),
      })
      message.success('Playoff bracket saved.')
    } catch (e) {
      message.error(e?.response?.data?.message || 'Could not save the bracket.')
    } finally {
      setSaving(false)
    }
  }

  const rowStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  }

  return (
    <div
      style={{
        background: COLORS.glass,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: 20,
        marginTop: 16,
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, margin: 0 }}>
        Manual Playoff Bracket
      </h3>
      <p style={{ fontSize: 12, color: COLORS.textMuted, margin: '6px 0 14px' }}>
        For non-standard league sizes that cannot auto-seed. Add Wild Card matchups and assign teams.
        Later rounds advance as results are recorded.
      </p>

      {rows.map((r, i) => (
        <div key={i} style={rowStyle}>
          <Select
            value={r.conference}
            onChange={(v) => setCell(i, 'conference', v)}
            options={[
              { value: 1, label: 'Conf 1' },
              { value: 2, label: 'Conf 2' },
            ]}
            style={{ width: 92 }}
          />
          <InputNumber
            min={1}
            max={32}
            placeholder="Seed"
            value={r.homeSeed}
            onChange={(v) => setCell(i, 'homeSeed', v)}
            style={{ width: 70 }}
          />
          <Select
            showSearch
            placeholder="Home team"
            value={r.home || undefined}
            onChange={(v) => setCell(i, 'home', v)}
            options={optionsFor(r.home)}
            optionFilterProp="label"
            style={{ flex: 1, minWidth: 130 }}
          />
          <span style={{ color: COLORS.textMuted, fontWeight: 700, fontSize: 12 }}>vs</span>
          <Select
            showSearch
            placeholder="Away team"
            value={r.away || undefined}
            onChange={(v) => setCell(i, 'away', v)}
            options={optionsFor(r.away)}
            optionFilterProp="label"
            style={{ flex: 1, minWidth: 130 }}
          />
          <InputNumber
            min={1}
            max={32}
            placeholder="Seed"
            value={r.awaySeed}
            onChange={(v) => setCell(i, 'awaySeed', v)}
            style={{ width: 70 }}
          />
          <Button danger type="text" onClick={() => removeRow(i)} disabled={rows.length <= 1}>
            ✕
          </Button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button
          onClick={addRow}
          style={{ background: 'transparent', borderColor: COLORS.border, color: COLORS.text }}
        >
          + Add matchup
        </Button>
        <Button
          type="primary"
          loading={saving}
          disabled={!allValid}
          onClick={save}
          style={{ flex: 1, background: COLORS.gold, borderColor: COLORS.gold, color: '#1a1a2e', fontWeight: 700 }}
        >
          Save Bracket
        </Button>
      </div>
    </div>
  )
}

export default PlayoffBracketBuilder
