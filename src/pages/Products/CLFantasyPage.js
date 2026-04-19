import React from 'react'
import ProductPage from './ProductPage'

const CLFantasyPage = () => (
  <ProductPage
    accentColor="#8b5cf6"
    eyebrow="CL Fantasy"
    headline="Champions League Fantasy. Real Knockouts, Real Stakes."
    subheadline="Draft from every CL squad. When clubs get eliminated in real life, their players go dark in your team. Replace them through automatic auction windows or watch your squad crumble."
    highlights={[
      { stat: '36', label: 'CL Clubs' },
      { stat: '17', label: 'Matchdays' },
      { stat: '5', label: 'Auction Windows' },
      { stat: '€1B', label: 'Draft Budget' },
    ]}
    features={[
      { icon: '⚡', title: 'Real Elimination System', description: 'When a CL club is knocked out, every player from that club is flagged in your squad. They score zero and cannot be in your lineup.' },
      { icon: '🔄', title: 'Automatic Auction Windows', description: 'After each CL knockout round, an auction window opens automatically. Sign free agents to replace eliminated players before the next matchweek.' },
      { icon: '📅', title: 'Smart Timing', description: 'Windows open Monday before each CL week and close midnight before kickoff. Pre-Final window closes 48 hours before the match. Fully automatic.' },
      { icon: '💰', title: 'Market Value Refunds', description: 'Drop eliminated players during an active auction window and get their market value refunded to your budget. Outside windows, drops are sunk cost.' },
      { icon: '🏟️', title: '16-Player Minimum', description: 'You must maintain 11 starters + 5 subs at all times. The system blocks lineup submission if your squad falls below this threshold.' },
      { icon: '📊', title: 'SAM Metric Scoring', description: 'Same proven scoring engine used across all SamSports leagues. Every real CL performance translates into fantasy points.' },
    ]}
    howItWorks={[
      { step: 1, title: 'Create or Join a League', description: 'Set up a CL Fantasy league for 4 to 36 managers. Invite friends or join a public league.' },
      { step: 2, title: 'Draft Your CL Squad', description: 'Pick players from all 36 Champions League clubs within your €1B budget. One player per club uniqueness rule applies.' },
      { step: 3, title: 'Survive the Knockouts', description: 'As real CL clubs are eliminated, their players go dark. Use auction windows to replace them and keep your squad alive.' },
      { step: 4, title: 'Last GM Standing', description: 'The manager who builds the best squad through league phase, playoffs, and all the way to the Final wins.' },
    ]}
    ctaText="Think you can survive all 17 matchdays?"
  />
)

export default CLFantasyPage
