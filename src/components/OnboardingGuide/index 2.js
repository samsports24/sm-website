import { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { useSelector } from 'react-redux'
import './onboarding.css'

/**
 * OnboardingGuide — First-time user welcome popup for any tab.
 *
 * Usage:
 *   <OnboardingGuide tabKey="dashboard" />
 *
 * Each tab shows its popup ONCE per user (stored in localStorage).
 * The popup adapts its content based on the tabKey prop.
 */

// ─── Tab content definitions ───────────────────────────────────
const TAB_CONTENT = {
  dashboard: {
    icon: '📊',
    title: 'Your Dashboard',
    subtitle: 'Your central nerve to follow all your league activities.',
    features: [
      { icon: '📰', title: 'Live News Feed', desc: 'Stay on top of real-time A.Football news, trades, and injury reports as they happen.' },
      { icon: '📈', title: 'Standings', desc: 'Track your league standings, conference rankings, and playoff race at a glance.' },
      { icon: '🔄', title: 'Transaction Tracker', desc: 'See every trade, auction win, roster move, and waiver claim across your league.' },
      { icon: '🏈', title: 'Weekly Matchups', desc: 'Preview upcoming matchups, follow live scoring on game day, and review past results.' },
    ],
  },

  'front-office': {
    icon: '🏢',
    title: 'Front Office',
    subtitle: 'Your hub for managing teams and switching between leagues.',
    features: [
      { icon: '🔀', title: 'Switch Leagues', desc: 'Manage all your teams and quickly jump between different leagues.' },
      { icon: '💰', title: 'Team Marketplace', desc: 'List your team for sale or browse teams available for purchase.' },
      { icon: '⚽', title: 'Multi-Sport', desc: 'Access both A.Football and Soccer leagues from a single War Room.' },
    ],
  },

  roster: {
    icon: '👥',
    title: 'Your Roster',
    subtitle: 'View and manage your active roster, bench, and practice squad.',
    features: [
      { icon: '⭐', title: 'Active Roster', desc: 'Your starting lineup and bench players. Set who plays each week.' },
      { icon: '📋', title: 'Practice Squad', desc: 'Stash developing players on your practice squad for future use.' },
      { icon: '💰', title: 'Cap Management', desc: 'Monitor each player\'s cap hit and manage your salary cap budget.' },
      { icon: '📊', title: 'Player Stats', desc: 'View detailed weekly and season stats for every player on your team.' },
    ],
  },

  'depth-chart': {
    icon: '📋',
    title: 'Starters / Depth Chart',
    subtitle: 'Set your starting lineup and manage your depth chart.',
    features: [
      { icon: '🏈', title: 'Set Starters', desc: 'Drag and drop players into starting positions. Your starters earn points on game day.' },
      { icon: '🔄', title: 'Quick Swap', desc: 'Easily swap players between starter and bench before the weekly deadline.' },
      { icon: '⚠️', title: 'Injury Alerts', desc: 'Players with injury designations are flagged so you can make last-minute changes.' },
    ],
  },

  'team-settings': {
    icon: '⚙️',
    title: 'Team Settings',
    subtitle: 'Customize your team identity and preferences.',
    features: [
      { icon: '🎨', title: 'Team Branding', desc: 'Upload your team logo, set your team name, and pick your colors.' },
      { icon: '🏟️', title: 'Stadium', desc: 'Choose and upgrade your virtual stadium for bragging rights.' },
    ],
  },

  league: {
    icon: '🏆',
    title: 'League Hub',
    subtitle: 'Everything about your league in one place.',
    features: [
      { icon: '📊', title: 'Standings', desc: 'Full league standings with win/loss records, points for/against, and division rankings.' },
      { icon: '👥', title: 'All Rosters', desc: 'Browse every team\'s roster in your league to scout the competition.' },
      { icon: '🔴', title: 'Live Scoring', desc: 'Watch scores update in real time during A.Football game days.' },
      { icon: '👑', title: 'Commissioner', desc: 'League commissioners can manage settings, approve trades, and send announcements.' },
    ],
  },

  transactions: {
    icon: '🔄',
    title: 'Transactions',
    subtitle: 'Trade players, bid in auctions, and manage your injured reserve.',
    features: [
      { icon: '🤝', title: 'Trades', desc: 'Propose trades with other teams. Negotiate player-for-player or include draft picks.' },
      { icon: '🔨', title: 'Auctions', desc: 'List free agents for auction or bid on players other teams have put up.' },
      { icon: '🏥', title: 'Injured Reserve', desc: 'Move injured players to IR to free up roster spots during their recovery.' },
    ],
  },

  draft: {
    icon: '📝',
    title: 'The Draft',
    subtitle: 'Build your team through the draft — the most exciting day in fantasy football.',
    features: [
      { icon: '🔴', title: 'Live Draft', desc: 'Join your league\'s live draft. Pick players in real time against other GMs.' },
      { icon: '📋', title: 'Supplemental Draft', desc: 'Pick up undrafted free agents through the supplemental draft process.' },
      { icon: '🌟', title: 'Rookie Draft', desc: 'Draft incoming rookies to build for the future in dynasty leagues.' },
    ],
  },

  playoffs: {
    icon: '🏆',
    title: 'Playoffs',
    subtitle: 'The road to the championship starts here.',
    features: [
      { icon: '🏅', title: 'Playoff Bracket', desc: 'View the bracket, matchups, and your path to the championship.' },
      { icon: '📊', title: 'Playoff Standings', desc: 'See who\'s in, who\'s on the bubble, and who\'s eliminated.' },
      { icon: '📝', title: 'Playoff Draft', desc: 'Special draft round for playoff-eligible teams to add reinforcements.' },
    ],
  },

  search: {
    icon: '🔍',
    title: 'Player Search',
    subtitle: 'Find any A.Football player — view stats, contracts, and availability.',
    features: [
      { icon: '📊', title: 'Full Stats', desc: 'Weekly and season stats for every A.Football player — offense, defense, and special teams.' },
      { icon: '💰', title: 'Contract & Cap Hit', desc: 'See each player\'s contract value, cap hit, and years remaining.' },
      { icon: '🏷️', title: 'Availability', desc: 'Instantly see if a player is a free agent or which team owns them in your league.' },
      { icon: '📋', title: 'Position Filters', desc: 'Filter by QB, RB, WR, TE, OL, K/P, and all defensive positions.' },
    ],
  },

  chat: {
    icon: '💬',
    title: 'League Chat',
    subtitle: 'Talk trash, negotiate trades, and strategize with your league mates.',
    features: [
      { icon: '📢', title: 'League Chat', desc: 'A group chat shared by all teams in your league. Talk trash and discuss trades.' },
      { icon: '🔔', title: 'Notifications', desc: 'Get notified when someone mentions you or sends a direct message.' },
    ],
  },

  rules: {
    icon: '📖',
    title: 'Rule Book',
    subtitle: 'Everything you need to know about how SamSports works.',
    features: [
      { icon: '📊', title: 'SAM Metric', desc: 'Learn how our proprietary scoring system works for every position.' },
      { icon: '⭐', title: 'GM Rating', desc: 'Understand how your GM rating is calculated and how to improve it.' },
      { icon: '💰', title: 'SamPoints', desc: 'Learn how to earn and spend SamPoints — the in-game currency.' },
      { icon: '🏆', title: 'Season & Playoffs', desc: 'Regular season format, playoff qualification, and championship rules.' },
    ],
  },

  faq: {
    icon: '❓',
    title: 'FAQ',
    subtitle: 'Quick answers to the most common questions.',
    features: [
      { icon: '🚀', title: 'Getting Started', desc: 'How to create a team, join a league, and set your first lineup.' },
      { icon: '💡', title: 'Tips & Strategy', desc: 'Pro tips on drafting, trading, and managing your cap space.' },
    ],
  },

  commissioner: {
    icon: '👑',
    title: 'Commissioner Hub',
    subtitle: 'You run the league. This is your control center for managing every aspect of it.',
    features: [
      { icon: '📬', title: 'Inbox', desc: 'Review pending trade requests, team complaints, and league disputes that need your approval.' },
      { icon: '⚙️', title: 'Game Rules', desc: 'Set roster sizes, salary cap limits, trade deadlines, waiver rules, and playoff format for your league.' },
      { icon: '🏆', title: 'Scoring', desc: 'Configure the scoring system — choose SAM Metric or set custom point values for every stat category by position.' },
      { icon: '👥', title: 'Teams & Owners', desc: 'Manage team owners, assign conferences and divisions, and handle team transfers or removals.' },
      { icon: '🤝', title: 'Trades', desc: 'Review, approve, or veto trades. You can also force trades if needed to keep the league fair.' },
      { icon: '📋', title: 'Draft Order', desc: 'Set up draft rounds, randomize the order, schedule the draft date, and configure the auction timeline.' },
      { icon: '🛡️', title: 'Team Control', desc: 'Investigate teams for cap violations, illegal rosters, or unpaid dues. Take corrective action when needed.' },
      { icon: '👤', title: 'Co-Commissioners', desc: 'Appoint co-commissioners to help manage the league or transfer full commissioner powers to another owner.' },
      { icon: '📅', title: 'Season Management', desc: 'Start new seasons, manage the renewal process, and handle the offseason transition.' },
    ],
  },

  'playoff-draft': {
    icon: '🏆',
    title: 'Playoff Draft',
    subtitle: 'After each playoff round, surviving teams draft players from eliminated teams.',
    features: [
      { icon: '🔄', title: 'How It Works', desc: 'When a team is eliminated from the playoffs, their players enter a draft pool. Surviving teams take turns picking from this pool to strengthen their roster.' },
      { icon: '📊', title: 'Draft Order', desc: 'The team with the best regular season record picks last. Worse records pick first, keeping things competitive.' },
      { icon: '👑', title: 'Commissioner Initiates', desc: 'Only the commissioner can initialize and schedule each playoff draft round after games are played.' },
      { icon: '⏱️', title: 'Timed Picks', desc: 'Each pick has a time limit. If you miss your window, the system auto-picks the best available player for you.' },
      { icon: '🏟️', title: 'Three Rounds', desc: 'Playoff drafts happen after Wild Card, Divisional, and Conference Championship rounds — three chances to upgrade.' },
    ],
  },

  stadium: {
    icon: '🏟️',
    title: 'Your Stadium',
    subtitle: 'Build, customize, and upgrade your virtual home turf.',
    features: [
      { icon: '🎨', title: 'Customize', desc: 'Choose your stadium style, field design, and atmosphere to create a unique home-field experience.' },
      { icon: '⬆️', title: 'Upgrades', desc: 'Spend SamPoints to upgrade your stadium — bigger capacity, better facilities, and exclusive features.' },
      { icon: '🏆', title: 'Prestige', desc: 'Your stadium reflects your success. Top GMs get access to legendary stadium tiers that showcase their achievements.' },
    ],
  },
}

const OnboardingGuide = ({ tabKey }) => {
  const [visible, setVisible] = useState(false)
  const userName = useSelector((state) => state.user?.userDetails?.user?.name || state.user?.userDetails?.name || '')

  const storageKey = `onboarding_seen_${tabKey}`

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      setVisible(true)
    }
  }, [storageKey])

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem(storageKey, 'true')
  }

  const content = TAB_CONTENT[tabKey]
  if (!content) return null

  const greeting = userName ? `Welcome, ${userName}!` : 'Welcome!'

  return (
    <Modal
      className="obg-modal"
      open={visible}
      onCancel={handleClose}
      centered
      footer={null}
      closeIcon={false}
      closable={false}
      width={480}
    >
      <div className="obg-content">
        {/* Header */}
        <div className="obg-header">
          <div className="obg-icon-circle">
            <span className="obg-tab-icon">{content.icon}</span>
          </div>
          <p className="obg-greeting">{greeting}</p>
          <h2 className="obg-title">{content.title}</h2>
          <p className="obg-subtitle">{content.subtitle}</p>
        </div>

        {/* Feature Cards */}
        <div className="obg-features">
          {content.features.map((feat, i) => (
            <div key={i} className="obg-feature-card">
              <span className="obg-feature-icon">{feat.icon}</span>
              <div className="obg-feature-text">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="obg-footer">
          <button className="obg-btn" onClick={handleClose}>
            {"Got it, let's go!"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default OnboardingGuide
