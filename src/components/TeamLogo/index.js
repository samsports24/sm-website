import { useState } from 'react'

/*
 * TeamLogo — one place for rendering a team crest with a safe fallback.
 *
 * Shows the team's logo image when it loads. If the logo is missing OR the URL
 * fails to load (e.g. the old dead S3 default), it falls back to the team's
 * initial in a colored circle instead of the browser's broken-image icon.
 *
 * Flexible props: pass a `team` object, or `src`/`name` directly.
 *   <TeamLogo team={team} size={32} />
 *   <TeamLogo src={t.logo} name={t.name} size={24} className="foo" />
 *
 * `round` (default true) = circle; set false for a rounded square.
 * `className` is applied to whichever element renders (img or fallback), so
 * existing sizing classes keep working; inline size is a safety net.
 */
export default function TeamLogo({
  team,
  src,
  name,
  teamColor,
  size = 32,
  round = true,
  className = '',
  style = {},
}) {
  const [broken, setBroken] = useState(false)

  const logo = src ?? team?.logo
  const label = (name ?? team?.name ?? '?').toString().trim()
  const color = teamColor ?? team?.teamColor

  const box = {
    width: size,
    height: size,
    borderRadius: round ? '50%' : Math.max(6, Math.round(size * 0.22)),
    flexShrink: 0,
    ...style,
  }

  if (logo && !broken) {
    return (
      <img
        src={logo}
        alt=''
        className={className}
        style={{ ...box, objectFit: 'cover', display: 'inline-block' }}
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <span
      className={className}
      aria-hidden
      style={{
        ...box,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color || 'rgba(34,197,94,0.15)',
        color: color ? '#fff' : '#22c55e',
        fontWeight: 800,
        fontSize: Math.max(10, Math.round(size * 0.42)),
        lineHeight: 1,
        textTransform: 'uppercase',
        overflow: 'hidden',
      }}
    >
      {(label.charAt(0) || '?').toUpperCase()}
    </span>
  )
}
