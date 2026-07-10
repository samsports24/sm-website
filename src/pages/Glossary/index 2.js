import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined, SearchOutlined } from '@ant-design/icons'
import SEO from '../../components/SEO'
import './glossary.css'

/* ═══════════════════════════════════════════════════════════════
   SEO GLOSSARY — Fantasy Sports Definitions & How-To Content
   Targets long-tail keywords for organic search traffic.
   ═══════════════════════════════════════════════════════════════ */

const GLOSSARY_ENTRIES = [
  {
    term: 'SAM Metric',
    slug: 'sam-metric',
    category: 'Scoring',
    definition: 'SAM Metric is the proprietary scoring system used across all SamSports fantasy leagues. It assigns weighted points to real-world player actions: goals earn 8 points, assists earn 5 points, saves earn 3 points, tackles earn 1.5 points, dribbles earn 1 point, and shots earn 0.5 points, with bonuses for pass accuracy above league averages. Unlike traditional fantasy scoring, SAM Metric rewards well-rounded players, not just goal scorers.',
  },
  {
    term: 'SAM Points (SP)',
    slug: 'sam-points',
    category: 'Economy',
    definition: 'SAM Points (SP) are the in-game currency used across SamSports. Every team earns SP independently through match wins (+500 SP), draws (+200 SP), daily logins (+50 SP), and 7-day login streaks (+500 SP bonus). SP are used for drafting players, completing trades, upgrading your virtual stadium, and other in-league transactions. Each team tracks its own SP balance and annual earnings separately.',
  },
  {
    term: 'Draft Budget',
    slug: 'draft-budget',
    category: 'Economy',
    definition: 'The draft budget is the starting allocation of SAM Points given to each team at the beginning of a season for player acquisition. In standard leagues, teams start with 500 million SP. The budget must be managed strategically across the draft, free agency, and mid-season trades. Overspending early can leave you without resources for key waiver pickups later in the season.',
  },
  {
    term: 'Salary Cap',
    slug: 'salary-cap',
    category: 'League Rules',
    definition: 'The salary cap is the maximum total salary a team can carry on its roster. Each player has an assigned salary based on their real-world market value and performance. Commissioners can set custom salary caps when creating a league. Managing your salary cap is critical — exceeding it may result in trade restrictions or forced roster cuts.',
  },
  {
    term: 'Franchise Tag',
    slug: 'franchise-tag',
    category: 'League Rules',
    definition: 'The franchise tag allows a team to designate one player as untradeable and protected from free agency for the current season. Tagged players cannot be poached through waivers or trade offers. Each team gets one franchise tag per season. It is a powerful tool for protecting your top performer, but it comes at the cost of reduced roster flexibility.',
  },
  {
    term: 'Dynasty League',
    slug: 'dynasty-league',
    category: 'League Types',
    definition: 'A dynasty league is a multi-season fantasy format where teams retain their rosters from year to year. Unlike redraft leagues (which reset each season), dynasty leagues reward long-term roster building, prospect development, and strategic trading. In SamSports, dynasty leagues include rookie drafts, contract extensions, and aging mechanics that mirror real-world team management.',
  },
  {
    term: 'GM Rating',
    slug: 'gm-rating',
    category: 'Rankings',
    definition: 'The GM Rating is a composite score that evaluates your performance as a fantasy general manager across all your leagues. It factors in win-loss record, trade activity, roster management efficiency, draft hit rate, and league engagement. Ratings are displayed globally, so every SamSports manager can see where they rank against the community. Top GMs earn gold, silver, or bronze badges.',
  },
  {
    term: 'War Room (Front Office)',
    slug: 'war-room',
    category: 'Features',
    definition: 'The War Room (also called Front Office) is your central management hub in SamSports. From here you can view all your teams across A.Football and soccer, monitor SAM Points balances, track annual earnings and spending, switch between leagues, and manage transfers. Think of it as your personal GM office where every team you manage is visible at a glance.',
  },
  {
    term: 'Live Auction Draft',
    slug: 'live-auction-draft',
    category: 'Draft Types',
    definition: 'A live auction draft is a real-time drafting format where managers bid on players using their SAM Points budget. Each player is nominated one at a time, and all managers can bid until the timer expires. The highest bidder wins the player. Auction drafts require more strategy than snake drafts because every player is theoretically available to every team — budget management is everything.',
  },
  {
    term: 'Snake Draft',
    slug: 'snake-draft',
    category: 'Draft Types',
    definition: 'A snake draft is the classic fantasy drafting format where pick order reverses each round. If you pick 1st in Round 1, you pick last in Round 2 and first again in Round 3. SamSports supports snake drafts with customizable timer settings, auto-pick logic, and draft position trading. This format is beginner-friendly and balances the advantage of picking early.',
  },
  {
    term: 'Supplemental Draft',
    slug: 'supplemental-draft',
    category: 'Draft Types',
    definition: 'The supplemental draft occurs mid-season and allows teams to draft players who were not available during the initial draft. This includes late-season call-ups, international transfers, and players returning from injury. Draft order for supplemental rounds is typically based on inverse standings, giving struggling teams the first opportunity to improve.',
  },
  {
    term: 'Rookie Draft',
    slug: 'rookie-draft',
    category: 'Draft Types',
    definition: 'In dynasty leagues, the rookie draft is held annually to allow teams to select newly eligible players (real-world rookies entering the league). Draft order is determined by the previous season\'s final standings, with the worst-performing teams picking first. Rookie drafts are a key part of the dynasty experience, as finding future stars at a bargain is how championship teams are built.',
  },
  {
    term: 'Waiver Wire / Free Agency',
    slug: 'waiver-wire',
    category: 'Roster Management',
    definition: 'The waiver wire is the pool of players not currently rostered by any team. In SamSports, free agency operates on a continuous or FAAB (Free Agent Acquisition Budget) basis, depending on your league settings. When a player is dropped, they enter a waiver period before becoming a true free agent. Strategic waiver claims can be the difference between a playoff run and a losing season.',
  },
  {
    term: 'Expansion Draft',
    slug: 'expansion-draft',
    category: 'Draft Types',
    definition: 'An expansion draft occurs when a new team joins an existing league mid-season or between seasons. The new team selects unprotected players from existing rosters, giving them a competitive starting point. Each existing team can protect a set number of players from selection. This mirrors real-world expansion drafts in professional sports.',
  },
  {
    term: 'Team Value Cap',
    slug: 'team-value-cap',
    category: 'Economy',
    definition: 'The Team Value Cap is the total market value of all players on your roster, calculated from their real-world market valuations. It is displayed in your header and Front Office dashboard. This metric helps you understand the overall strength and investment level of your squad compared to the league-set salary ceiling.',
  },
  {
    term: 'Matchweek Scoring',
    slug: 'matchweek-scoring',
    category: 'Scoring',
    definition: 'Matchweek scoring is how SamSports calculates fantasy results each game week. Your starting lineup\'s real-world performances are evaluated using the SAM Metric, and your total score is compared against your opponent\'s. Wins, losses, and draws directly affect your standings and your team\'s SAM Points earnings (+500 SP for wins, +200 SP for draws).',
  },
  {
    term: 'Depth Chart',
    slug: 'depth-chart',
    category: 'Roster Management',
    definition: 'The depth chart shows your full roster organized by position, with starters at the top and bench players below. In SamSports, your depth chart determines automatic substitutions if a starter is inactive or injured. Setting your depth chart correctly before each matchweek is essential to avoid fielding an incomplete lineup.',
  },
  {
    term: 'Commissioner',
    slug: 'commissioner',
    category: 'League Management',
    definition: 'The commissioner is the manager who created the league and has administrative powers. Commissioners can adjust league settings, resolve disputes, approve or veto trades, set draft dates, modify scoring rules, and manage league membership. In SamSports, commissioner tools are accessible from the team settings page.',
  },
  {
    term: 'Playoff Bracket',
    slug: 'playoff-bracket',
    category: 'Postseason',
    definition: 'The playoff bracket is the elimination tournament that determines the league champion at the end of the regular season. Top teams from the standings qualify for the playoffs. SamSports supports customizable bracket sizes (4, 6, or 8 teams), bye weeks for top seeds, and multi-week matchups. The playoff experience includes a visual bracket tracker updated in real time.',
  },
  {
    term: 'Empire Mode / Empire Sales',
    slug: 'empire-mode',
    category: 'League Types',
    definition: 'Empire Mode is an advanced dynasty variant where the league continues until one team wins back-to-back championships. When that happens, the empire "falls" and the winning team claims the empire pot — a cumulative prize pool funded by league dues each season. Empire leagues are designed for ultra-competitive, long-term play.',
  },
]

const CATEGORIES = [...new Set(GLOSSARY_ENTRIES.map(e => e.category))]

const Glossary = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = useMemo(() => {
    return GLOSSARY_ENTRIES
      .filter(e => !activeCategory || e.category === activeCategory)
      .filter(e =>
        e.term.toLowerCase().includes(search.toLowerCase()) ||
        e.definition.toLowerCase().includes(search.toLowerCase())
      )
  }, [search, activeCategory])

  // JSON-LD for the glossary — DefinedTermSet
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Fantasy Sports Glossary — SAM Sports',
    description: 'Complete glossary of fantasy sports terms, scoring rules, draft types, and league management concepts used in SAM Sports.',
    hasDefinedTerm: GLOSSARY_ENTRIES.map(e => ({
      '@type': 'DefinedTerm',
      name: e.term,
      description: e.definition,
      inDefinedTermSet: 'https://samsports.com/glossary',
    })),
  }

  return (
    <div className="glossary-page">
      <SEO
        title="Fantasy Sports Glossary — Terms, Scoring & Rules"
        description="Complete glossary of fantasy sports terms including SAM Metric scoring, SAM Points, dynasty leagues, salary caps, draft types, and league management. Learn everything about SamSports."
        path="/glossary"
        jsonLd={jsonLd}
      />

      {/* Header */}
      <div className="glossary-topbar">
        <button className="glossary-back" onClick={() => navigate(-1)}>
          <LeftOutlined /> Back
        </button>
        <h1 className="glossary-title">Fantasy Sports Glossary</h1>
        <p className="glossary-subtitle">
          {GLOSSARY_ENTRIES.length} terms &bull; Everything you need to know about SAM Sports
        </p>
      </div>

      {/* Search + Filters */}
      <div className="glossary-controls">
        <div className="glossary-search">
          <SearchOutlined />
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="glossary-cats">
          <button
            className={`glossary-cat-btn ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`glossary-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <div className="glossary-list">
        {filtered.map((entry) => (
          <article key={entry.slug} id={entry.slug} className="glossary-entry">
            <div className="glossary-entry-header">
              <h2 className="glossary-term">{entry.term}</h2>
              <span className="glossary-cat-tag">{entry.category}</span>
            </div>
            <p className="glossary-definition">{entry.definition}</p>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="glossary-empty">No terms match your search.</div>
        )}
      </div>

      {/* Internal links for SEO crawlability */}
      <nav className="glossary-internal-links" aria-label="Related pages">
        <h3 className="glossary-links-title">Learn More</h3>
        <div className="glossary-links-grid">
          <a href="/rule-book/sammetric" className="glossary-link">SAM Metric Scoring Guide</a>
          <a href="/rule-book/sampoints-breakdown" className="glossary-link">SAM Points Breakdown</a>
          <a href="/rule-book/gm-rating" className="glossary-link">GM Rating System</a>
          <a href="/rule-book/roasterinfo" className="glossary-link">Roster Rules</a>
          <a href="/rule-book/franchisetag" className="glossary-link">Franchise Tag Rules</a>
          <a href="/rule-book/regularseason-and-playoff" className="glossary-link">Season & Playoff Format</a>
          <a href="/rule-book/empire-sales" className="glossary-link">Empire Mode Guide</a>
          <a href="/rule-book/governance" className="glossary-link">League Governance</a>
          <a href="/faq" className="glossary-link">Frequently Asked Questions</a>
          <a href="/popular-league" className="glossary-link">Browse Popular Leagues</a>
        </div>
      </nav>
    </div>
  )
}

export default Glossary
