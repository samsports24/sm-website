import React from 'react'
import ProductPage from './ProductPage'

const PredictorPage = () => (
  <ProductPage
    accentColor="#f59e0b"
    eyebrow="Predictor"
    headline="Predict Real Outcomes. Earn SamPoints."
    subheadline="Pick winners, predict scores, and call upsets across NFL and soccer fixtures every week. The more accurate your predictions, the more SamPoints you earn."
    highlights={[
      { stat: '100+', label: 'Weekly Fixtures' },
      { stat: '3', label: 'Prediction Types' },
      { stat: '2x', label: 'Upset Bonus' },
      { stat: 'Free', label: 'To Play' },
    ]}
    features={[
      { icon: '🎯', title: 'Match Predictions', description: 'Pick the winner of each match. Get bonus points for correctly predicting upsets where the underdog wins.' },
      { icon: '📊', title: 'Score Predictions', description: 'Go deeper and predict the exact score. Nail it for a massive points bonus. Close scores earn partial credit.' },
      { icon: '💎', title: 'Earn SamPoints', description: 'Every correct prediction earns SamPoints. Use them across the SamSports platform for draft picks, roster moves, and league perks.' },
      { icon: '📅', title: 'Weekly Rounds', description: 'New prediction rounds open every week aligned with the real fixture calendar. Never miss a matchweek.' },
      { icon: '🏆', title: 'Leaderboards', description: 'Compete against friends and the entire SamSports community. Seasonal leaderboards track the sharpest predictors.' },
      { icon: '⚡', title: 'Auto-Settlement', description: 'Results are settled automatically when real matches finish. No waiting — your SamPoints hit your balance instantly.' },
    ]}
    howItWorks={[
      { step: 1, title: 'Sign Up for Free', description: 'Create your SamSports account. The Predictor is completely free to play — no entry fees, no catches.' },
      { step: 2, title: 'Make Your Picks', description: 'Browse upcoming NFL and soccer fixtures. Lock in your match winner or exact score predictions before kickoff.' },
      { step: 3, title: 'Watch & Earn', description: 'Follow the action live. As results come in, your predictions are graded and SamPoints are awarded instantly.' },
      { step: 4, title: 'Climb the Leaderboard', description: 'Track your accuracy over the season. Top predictors earn badges and seasonal rewards.' },
    ]}
    ctaText="Think you can call it?"
  />
)

export default PredictorPage
