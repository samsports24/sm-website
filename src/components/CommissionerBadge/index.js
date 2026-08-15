import React, { useState } from 'react'

/**
 * CommissionerBadge — the SAMSPORTS "League Commissioner" badge image, shown next
 * to a commissioner's team name. Self-contained. Renders nothing unless `show`.
 *
 * Typical usage:
 *   <CommissionerBadge show={team?.isCommissioner && !team?.hideCommissionerBadge} />
 */
const BADGE_SRC = `${process.env.PUBLIC_URL || ''}/assets/commissioner-badge.png`

export default function CommissionerBadge({ show, size = 22 }) {
  const [broken, setBroken] = useState(false)
  if (!show || broken) return null
  return (
    <img
      src={BADGE_SRC}
      alt="League Commissioner"
      title="League Commissioner"
      onError={() => setBroken(true)}
      style={{
        height: size,
        width: size,
        objectFit: 'contain',
        borderRadius: 6,
        verticalAlign: 'middle',
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  )
}
