import React from 'react'
import ProductPage from './ProductPage'

const DraftLeaguesPage = () => (
  <ProductPage
    accentColor="#3b82f6"
    eyebrow="Dynasty Fantasy"
    headline="Build Your Dynasty. Manage the Cap. Own the League."
    subheadline="Full-season fantasy leagues with real NFL and soccer contracts, salary caps, trades, and a live draft. Run your franchise like a real GM."
    highlights={[
      { stat: '2,500+', label: 'NFL Players' },
      { stat: '$200M', label: 'Salary Cap' },
      { stat: '25', label: 'Roster Spots' },
      { stat: '18', label: 'Week Season' },
    ]}
    features={[
      { icon: '📋', title: 'Live Snake & Auction Drafts', description: 'Choose your draft format. Snake drafts for quick setup, live auctions for maximum strategy. Every pick matters.' },
      { icon: '💵', title: 'Real Salary Caps', description: 'Every player has a real contract value. Manage your cap space across starters, bench, and reserves just like an NFL front office.' },
      { icon: '🔄', title: 'Trades & Free Agency', description: 'Propose trades, negotiate counter-offers, and pick up free agents through auctions. Build your roster all season long.' },
      { icon: '📈', title: 'Dynasty Mode', description: 'Keep your roster across seasons. Draft rookies, develop young talent, and build a franchise that lasts for years.' },
      { icon: '⚖️', title: 'Commissioner Tools', description: 'Full league governance: set rules, approve trades, manage disputes, schedule matchweeks, and run your league your way.' },
      { icon: '🏅', title: 'Playoff Bracket', description: 'Top teams qualify for the playoff bracket. Single-elimination matchups lead to the championship in a thrilling postseason.' },
    ]}
    howItWorks={[
      { step: 1, title: 'Create Your League', description: 'Pick your sport, set the league size (4 to 48 teams), and configure rules like scoring, salary cap, and draft format.' },
      { step: 2, title: 'Invite & Draft', description: 'Share your league code with friends. Once everyone joins, the commissioner schedules the live draft.' },
      { step: 3, title: 'Manage Your Franchise', description: 'Set lineups each week, work the waiver wire, negotiate trades, and manage your cap space throughout the season.' },
      { step: 4, title: 'Win the Championship', description: 'Compete through the regular season and playoffs to be crowned league champion. Your GM Rating updates accordingly.' },
    ]}
    ctaText="Ready to run your franchise?"
  />
)

export default DraftLeaguesPage
