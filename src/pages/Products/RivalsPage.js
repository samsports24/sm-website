import React from 'react'
import ProductPage from './ProductPage'

const RivalsPage = () => (
  <ProductPage
    accentColor="#22C55E"
    eyebrow="SAM Rivals"
    headline="Head-to-Head Fantasy. Promotion & Relegation."
    subheadline="Compete in weekly H2H matchups across divisions. Win to climb, lose to drop. Earn SamPoints, unlock trophies, and prove you're the best GM in your league."
    highlights={[
      { stat: '10', label: 'Divisions' },
      { stat: 'H2H', label: 'Weekly Matchups' },
      { stat: '17', label: 'Week Season' },
      { stat: '2', label: 'Sports' },
    ]}
    features={[
      { icon: '🏆', title: 'Promotion & Relegation', description: 'Win your division and move up. Finish bottom and get relegated. Every week matters in the fight for promotion.' },
      { icon: '⚔️', title: 'H2H Matchups', description: 'Face a new opponent every week. Your starting lineup is scored using the SAM Metric and compared head-to-head.' },
      { icon: '📊', title: 'SAM Metric Scoring', description: 'Our proprietary scoring system rewards real-world performance beyond just touchdowns and goals. Every contribution counts.' },
      { icon: '🏈⚽', title: 'A.Football & Soccer', description: 'Play Rivals in both American Football (NFL) and Soccer. Same competitive structure, different sports.' },
      { icon: '🎯', title: 'SamPoints Economy', description: 'Earn SamPoints for wins, promotions, and achievements. Spend them on roster moves, draft picks, and league perks.' },
      { icon: '🛡️', title: 'GM Rating', description: 'Build your GM reputation over time. Your rating reflects your trade history, draft skill, and win record across all seasons.' },
    ]}
    howItWorks={[
      { step: 1, title: 'Sign Up & Pick Your Sport', description: 'Create your free SamSports account and choose A.Football or Soccer to start your Rivals journey.' },
      { step: 2, title: 'Draft Your Squad', description: 'Build your roster through the draft. Manage your salary cap and make strategic picks.' },
      { step: 3, title: 'Set Your Lineup Weekly', description: 'Choose your starters and subs before each matchweek. Injured players and bye weeks keep you on your toes.' },
      { step: 4, title: 'Compete & Climb', description: 'Win H2H matchups to earn promotion. Track your progress on the leaderboard and earn trophies.' },
    ]}
    ctaText="Ready to climb the ranks?"
  />
)

export default RivalsPage
