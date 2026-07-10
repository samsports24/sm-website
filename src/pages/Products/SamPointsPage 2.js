import React from 'react'
import ProductPage from './ProductPage'

const SamPointsPage = () => (
  <ProductPage
    accentColor="#f59e0b"
    eyebrow="SamPoints"
    headline="The Currency of SamSports."
    subheadline="Earn SamPoints by competing, winning, and making smart decisions. Spend them on draft picks, roster moves, league perks, and more. One currency across every game mode."
    highlights={[
      { stat: '6+', label: 'Ways to Earn' },
      { stat: '10+', label: 'Ways to Spend' },
      { stat: '∞', label: 'No Expiry' },
      { stat: 'Free', label: 'To Start Earning' },
    ]}
    features={[
      { icon: '🏆', title: 'Win Matches', description: 'Every H2H matchup win in SAM Rivals earns SamPoints. The higher the division, the bigger the payout.' },
      { icon: '🎯', title: 'Predict Correctly', description: 'Nail your Predictor picks — match winners and exact scores — to earn SamPoints for every correct call.' },
      { icon: '📈', title: 'Get Promoted', description: 'Climb divisions in SAM Rivals and earn promotion bonuses. Reaching the top tier pays a major SamPoints reward.' },
      { icon: '🏅', title: 'Achievements & Trophies', description: 'Unlock achievements like "Perfect Week" or "Trade Shark" and earn one-time SamPoints bonuses.' },
      { icon: '💰', title: 'Spend on Roster Moves', description: 'Use SamPoints to pick up free agents, fund auction bids, and make off-season moves across your leagues.' },
      { icon: '🎰', title: 'Draft Picks & Perks', description: 'Spend SamPoints to acquire supplemental draft picks, premium scouting reports, and league entry fees.' },
    ]}
    howItWorks={[
      { step: 1, title: 'Play Any Game Mode', description: 'Earn SamPoints in SAM Rivals, Dynasty Fantasy, CL Fantasy, and the Predictor. Every mode rewards you.' },
      { step: 2, title: 'Watch Your Balance Grow', description: 'SamPoints accumulate in your account wallet. Track earnings and spending in your profile dashboard.' },
      { step: 3, title: 'Spend Strategically', description: 'Use SamPoints for roster moves, draft picks, and league perks. Timing your spending is part of the game.' },
      { step: 4, title: 'Carry Across Seasons', description: 'SamPoints never expire. Bank them for the off-season or save up for a big move next year.' },
    ]}
    ctaText="Start earning SamPoints today"
  />
)

export default SamPointsPage
