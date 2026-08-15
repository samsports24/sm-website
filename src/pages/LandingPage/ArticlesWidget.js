import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLatestArticles } from '../../soccer/services/articleService'

const LEAGUE_LABELS = {
  premier_league: 'Premier League', la_liga: 'La Liga', serie_a: 'Serie A',
  bundesliga: 'Bundesliga', ligue_1: 'Ligue 1', ekstraklasa: 'Ekstraklasa',
  champions_league: 'Champions League', mls: 'MLS', liga_portugal: 'Liga Portugal',
  world_cup_2026: 'World Cup 2026', nfl: 'NFL',
}
const LEAGUE_GRADIENTS = {
  premier_league: 'linear-gradient(135deg,#3d195b,#1a0d2e)',
  la_liga: 'linear-gradient(135deg,#1a237e,#0d1240)',
  serie_a: 'linear-gradient(135deg,#024494,#01224a)',
  bundesliga: 'linear-gradient(135deg,#8b0a0a,#1a0d0d)',
  ligue_1: 'linear-gradient(135deg,#091c3e,#0d1722)',
  ekstraklasa: 'linear-gradient(135deg,#8b1a0a,#1a0d0d)',
  champions_league: 'linear-gradient(135deg,#0d1b4a,#0a1230)',
  mls: 'linear-gradient(135deg,#1a2a1a,#0d1f0d)',
  liga_portugal: 'linear-gradient(135deg,#004d29,#002d19)',
  world_cup_2026: 'linear-gradient(135deg,#143024,#0d2618)',
  nfl: 'linear-gradient(135deg,#0b2545,#0a1730)',
}
const CAT_META = {
  world_cup: { label: 'World Cup 2026', color: '#F2B516' },
  fantasy: { label: 'Fantasy', color: '#3CA6FF' },
  analysis: { label: 'Analysis', color: '#FF3030' },
  predictions: { label: 'Predictions', color: '#8B5CF6' },
  transfers: { label: 'Transfer', color: '#5BD313' },
  opinion: { label: 'Opinion', color: '#14b8a6' },
  ai_reports: { label: 'AI Report', color: '#06b6d4' },
  match: { label: 'Match', color: '#687481' },
}
const CATS = [
  { key: 'all', label: 'All', cat: null },
  { key: 'fantasy', label: 'Fantasy', cat: 'fantasy' },
  { key: 'analysis', label: 'Analysis', cat: 'analysis' },
  { key: 'predictions', label: 'Predictions', cat: 'predictions' },
  { key: 'transfers', label: 'Transfers', cat: 'transfers' },
  { key: 'opinion', label: 'Opinion', cat: 'opinion' },
]
const fmtDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* Fixed-size editorial card (138px) — fully inline so external CSS can never
   let it balloon. Image (or league gradient) with text overlaid at the bottom. */
const ArticleCard = ({ article, navigate }) => {
  const meta = CAT_META[article.category]
  const badgeLabel = meta ? meta.label : (LEAGUE_LABELS[article.realLeague] || 'SAM Report')
  const badgeColor = meta ? meta.color : '#687481'
  const grad = LEAGUE_GRADIENTS[article.realLeague] || LEAGUE_GRADIENTS.premier_league
  const bg = article.coverImage
    ? { backgroundImage: `url(${article.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: grad }
  return (
    <a
      href={`/articles?article=${article.slug}`}
      onClick={(e) => { e.preventDefault(); navigate(`/articles?article=${article.slug}`) }}
      style={{
        position: 'relative', display: 'block', height: 138, borderRadius: 10, overflow: 'hidden',
        textDecoration: 'none', border: '1px solid rgba(145,171,187,0.14)', ...bg,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,7,13,0) 30%, rgba(2,7,13,0.55) 62%, rgba(2,7,13,0.92) 100%)' }} />
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 11 }}>
        <span style={{
          display: 'inline-block', background: badgeColor, color: '#04120a',
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 9, fontWeight: 800,
          letterSpacing: 0.5, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, marginBottom: 6,
        }}>{badgeLabel}</span>
        <div style={{
          fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 700, lineHeight: 1.2, color: '#F5F7F8',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{article.title}</div>
        <div style={{ marginTop: 4, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 10, color: '#A3ADB7' }}>
          {fmtDate(article.createdAt)}{article.readTimeMinutes ? ` · ${article.readTimeMinutes} min read` : ''}
        </div>
      </div>
    </a>
  )
}

/* SAM Reports — category pills + editorial card row. Wired to real
   Article.category. All layout inline so it renders correctly regardless of
   external stylesheet state. */
const ArticlesWidget = ({ limit = 8 }) => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await getLatestArticles(30)
        const list = res?.data?.data?.articles || []
        // World Cup content is retired — never surface it, even if older WC
        // articles are still in the DB.
        const isWorldCup = (a) =>
          /world_cup/i.test(a.realLeague || '') ||
          a.category === 'world_cup' ||
          (Array.isArray(a.categories) && a.categories.includes('world_cup'))
        if (alive) setArticles(list.filter((a) => !isWorldCup(a)))
      } catch {
        if (alive) setArticles([])
      }
      if (alive) setLoading(false)
    })()
    return () => { alive = false }
  }, [])

  if (loading || articles.length === 0) return null

  // The tab-driving `category` field is often empty on AI-generated articles —
  // their subject lives in the `categories` array of AI tags (e.g. 'transfer_news').
  // Match a tab if EITHER the singular category or a mapped AI tag applies, so
  // AI transfer/analysis/etc. reports show under the right tab.
  const AI_TAG_MAP = {
    world_cup: ['world_cup', 'international'],
    fantasy: ['fantasy'],
    analysis: ['league_analysis', 'team_analysis', 'tactics', 'player_focus', 'records'],
    predictions: ['preview', 'title_race', 'relegation'],
    transfers: ['transfer_news'],
    opinion: ['editorial', 'controversy', 'manager', 'derby'],
  }
  const inCat = (a, cat) => {
    if (!cat) return true
    if (a.category === cat) return true
    const tags = Array.isArray(a.categories) ? a.categories : []
    return (AI_TAG_MAP[cat] || []).some((t) => tags.includes(t))
  }
  const countFor = (cat) => articles.filter((a) => inCat(a, cat)).length
  const filtered = activeCat === 'all' ? articles : articles.filter((a) => inCat(a, activeCat))
  const cards = filtered.slice(0, Math.max(limit, 8))

  const pillBase = {
    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
    textTransform: 'uppercase', padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
    background: 'transparent', border: '1px solid rgba(145,171,187,0.24)', color: '#A3ADB7',
  }

  return (
    <div style={{ maxWidth: 1824, margin: '0 auto', padding: '20px 48px 28px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <span style={{
          position: 'relative', paddingLeft: 12, fontFamily: "'Rajdhani',sans-serif",
          fontSize: 18, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: '#F5F7F8',
        }}>
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 4, height: 18, borderRadius: 2, background: '#5BD313' }} />
          SAM REPORTS
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {CATS.map(c => {
            const active = activeCat === c.key
            const empty = c.key !== 'all' && countFor(c.cat) === 0
            return (
              <button key={c.key} onClick={() => setActiveCat(c.key)} style={{
                ...pillBase,
                ...(active ? { background: '#5BD313', borderColor: '#5BD313', color: '#04120a' } : {}),
                ...(empty ? { opacity: 0.4 } : {}),
              }}>{c.label}</button>
            )
          })}
        </div>
        <button onClick={() => navigate('/articles')} style={{
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
          textTransform: 'uppercase', color: '#5BD313', background: 'none', border: 'none', cursor: 'pointer',
        }}>View All</button>
      </div>

      {/* card row */}
      {cards.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {cards.map(a => <ArticleCard key={a._id || a.slug} article={a} navigate={navigate} />)}
        </div>
      ) : (
        <div style={{
          padding: '26px', textAlign: 'center', fontFamily: "'Barlow',sans-serif", fontSize: 13, color: '#687481',
          border: '1px dashed rgba(145,171,187,0.24)', borderRadius: 10,
        }}>No reports in this category yet.</div>
      )}
    </div>
  )
}

export default ArticlesWidget
