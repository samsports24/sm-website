import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ThunderboltFilled,
  CrownFilled,
  RocketFilled,
  StarFilled,
  CheckCircleFilled,
  ArrowLeftOutlined,
} from '@ant-design/icons'

import Header from '../../components/Header'
import '../../styles/pages/buySampoints.css'

/* ═══ Polish VAT (23%) ═══
   STATSCORE is a Polish entity — all digital service purchases
   must include Polish VAT at 23%. Prices below are NET (before tax).
   The VAT is calculated and displayed separately on the checkout page. */
const VAT_RATE = 0.23

const TIERS = [
  {
    key: 'starter',
    label: 'Starter',
    icon: <ThunderboltFilled />,
    points: '1,000,000',
    pointsShort: '1M',
    price: 1.99,
    color: '#3B82F6',
    perks: ['Auction funds boost', 'Practice squad moves'],
    popular: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    icon: <CrownFilled />,
    points: '7,500,000',
    pointsShort: '7.5M',
    price: 9.99,
    color: '#22C55E',
    perks: ['Best value per SP', 'Trade leverage', 'Draft upgrades'],
    popular: true,
  },
  {
    key: 'elite',
    label: 'Elite',
    icon: <RocketFilled />,
    points: '20,000,000',
    pointsShort: '20M',
    price: 19.99,
    color: '#A855F7',
    perks: ['Maximum SP stack', 'Full season coverage', 'Priority features'],
    popular: false,
  },
  {
    key: 'legend',
    label: 'Legend',
    icon: <StarFilled />,
    points: '50,000,000',
    pointsShort: '50M',
    price: 49.99,
    color: '#F59E0B',
    perks: ['Massive SP reserve', 'Dominate auctions', 'Multi-season power'],
    popular: false,
  },
  {
    key: 'titan',
    label: 'Titan',
    icon: <RocketFilled />,
    points: '200,000,000',
    pointsShort: '200M',
    price: 99.99,
    color: '#EF4444',
    perks: ['Ultimate SP vault', 'Total market control', 'Dynasty builder'],
    popular: false,
  },
]

/* Prices are VAT-inclusive. Extract the net + VAT portions from the gross price. */
const calcVat = (grossPrice) => {
  const net = Math.round((grossPrice / (1 + VAT_RATE)) * 100) / 100
  const vat = Math.round((grossPrice - net) * 100) / 100
  return { net, vat, total: grossPrice }
}

const BuySampoints = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromRivals = location.state?.fromRivals || new URLSearchParams(location.search).get('from') === 'rivals'

  const handleBuyClick = (grossPrice, mysampoints) => {
    const { net, vat } = calcVat(grossPrice)
    navigate('/select-buy-options', {
      state: { myamount: grossPrice, mysampoints, fromRivals, netPrice: net, vatAmount: vat, vatRate: VAT_RATE },
    })
  }

  return (
    <>
      {!fromRivals && <Header />}
      <div className="bsp-page">
        {/* Back nav */}
        <button className="bsp-back" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Back
        </button>

        {/* Page header */}
        <div className="bsp-header">
          <div className="bsp-header-icon">
            <StarFilled />
          </div>
          <h1 className="bsp-title">SAM Points Store</h1>
          <p className="bsp-subtitle">
            Power up your franchise with SAM Points, use them for auctions, trades, and roster moves
          </p>
        </div>

        {/* Tier cards */}
        <div className="bsp-grid">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={`bsp-card ${tier.popular ? 'bsp-card--popular' : ''}`}
              style={{ '--bsp-accent': tier.color }}
            >
              {tier.popular && (
                <div className="bsp-popular-tag">MOST POPULAR</div>
              )}

              {/* Icon + tier name */}
              <div className="bsp-card-top">
                <span className="bsp-card-icon">{tier.icon}</span>
                <span className="bsp-card-tier">{tier.label}</span>
              </div>

              {/* Points amount */}
              <div className="bsp-card-points">
                <span className="bsp-card-pts-big">{tier.pointsShort}</span>
                <span className="bsp-card-pts-label">SAM Points</span>
              </div>

              {/* Full amount */}
              <div className="bsp-card-full-pts">{tier.points} SP</div>

              {/* Perks */}
              <ul className="bsp-card-perks">
                {tier.perks.map((perk, i) => (
                  <li key={i}>
                    <CheckCircleFilled className="bsp-perk-check" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Price + CTA */}
              <div className="bsp-card-bottom">
                <div className="bsp-card-price">
                  <span className="bsp-card-dollar">$</span>
                  <span className="bsp-card-amount">{tier.price.toFixed(2)}</span>
                </div>
                <div className="bsp-card-vat-info">
                  <span className="bsp-card-net">incl. ${calcVat(tier.price).vat.toFixed(2)} VAT</span>
                </div>
                <button
                  className="bsp-card-btn"
                  onClick={() => handleBuyClick(tier.price, tier.points)}
                >
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="bsp-footer">
          <p>All prices are inclusive of 23% Polish VAT. Purchases are processed securely via Stripe. SAM Points are non-refundable and tied to your account.</p>
        </div>
      </div>
    </>
  )
}

export default BuySampoints
