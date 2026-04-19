import { useMemo } from 'react'

/* ═══ Section divider pill inside the ticker track ═══ */
const SectionTag = ({ label, cls }) => (
  <div className={`ls-tick-divider ${cls}`}>
    <span>{label}</span>
  </div>
)

const LiveTicker = ({ tickerItems = [] }) => {
  // Insert section dividers between live / upcoming / finished groups
  const displayItems = useMemo(() => {
    if (!tickerItems.length) {
      return [{ type: 'item', tag: '', homeAbbr: '', awayAbbr: '', score: '', statusLabel: 'Loading live scores...', statusCls: 'ns' }]
    }

    const result = []
    let lastCategory = null

    for (const item of tickerItems) {
      if (item.category !== lastCategory) {
        if (item.category === 'live') result.push({ type: 'divider', label: 'LIVE', cls: 'div-live' })
        else if (item.category === 'upcoming') result.push({ type: 'divider', label: 'UPCOMING', cls: 'div-upcoming' })
        else if (item.category === 'finished') result.push({ type: 'divider', label: 'RESULTS', cls: 'div-finished' })
        lastCategory = item.category
      }
      result.push({ ...item, type: 'item' })
    }

    return result
  }, [tickerItems])

  // Count live games for the badge
  const liveCount = tickerItems.filter(i => i.category === 'live').length

  return (
    <div className="ls-ticker-bar">
      <div className="ls-ticker-lbl">
        <span className="ls-live-dot" />
        <span>Live</span>
        {liveCount > 0 && <span className="ls-live-count">{liveCount}</span>}
      </div>
      <div className="ls-ticker-track-wrap">
        <div className="ls-ticker-track">
          {/* Render twice for infinite scroll */}
          {[...displayItems, ...displayItems].map((item, i) => (
            item.type === 'divider' ? (
              <SectionTag key={`d-${i}`} label={item.label} cls={item.cls} />
            ) : (
              <div className={`ls-tick-item ${item.category === 'live' ? 'ls-tick-item-live' : ''}`} key={i}>
                {item.tag && <span className="ls-tick-tag">{item.tag}</span>}
                <span className="ls-tick-teams">
                  {item.homeAbbr}{' '}
                  <strong className={item.category === 'upcoming' ? 'ls-tick-vs' : ''}>{item.score}</strong>
                  {' '}{item.awayAbbr}
                </span>
                <span className={`ls-tick-${item.statusCls || 'ns'}`}>
                  {item.statusLabel}
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveTicker
