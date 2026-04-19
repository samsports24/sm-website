import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  ThunderboltOutlined,
  TeamOutlined,
  GiftOutlined,
  DashboardOutlined,
  DollarOutlined,
  TrophyOutlined,
  SwapOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
} from '@ant-design/icons'

/* ═══════════════════════════════════════════════════════════
   CARD DATA
   ═══════════════════════════════════════════════════════════ */
const CARD_KEYS = [
  {
    key: 'sammetric',
    icon: <ThunderboltOutlined />,
    titleKey: 'rule_sammetric_title',
    subtitleKey: 'rule_sammetric_subtitle',
    descKey: 'rule_sammetric_desc',
    color: '#F59E0B',
    route: '/rule-book/sammetric',
    featured: true,
  },
  {
    key: 'roster',
    icon: <TeamOutlined />,
    titleKey: 'rule_roster_title',
    subtitleKey: 'rule_roster_subtitle',
    descKey: 'rule_roster_desc',
    color: '#3B82F6',
    route: '/rule-book/roasterinfo',
    featured: true,
  },
  {
    key: 'rewards',
    icon: <GiftOutlined />,
    titleKey: 'rule_rewards_title',
    subtitleKey: 'rule_rewards_subtitle',
    descKey: 'rule_rewards_desc',
    color: '#22C55E',
    route: '/rule-book/reward-info',
  },
  {
    key: 'gm',
    icon: <DashboardOutlined />,
    titleKey: 'rule_gm_title',
    subtitleKey: 'rule_gm_subtitle',
    descKey: 'rule_gm_desc',
    color: '#06B6D4',
    route: '/rule-book/gm-rating',
  },
  {
    key: 'sampoints',
    icon: <DollarOutlined />,
    titleKey: 'rule_sampoints_title',
    subtitleKey: 'rule_sampoints_subtitle',
    descKey: 'rule_sampoints_desc',
    color: '#A78BFA',
    route: '/rule-book/sampoints-breakdown',
  },
  {
    key: 'season',
    icon: <TrophyOutlined />,
    titleKey: 'rule_season_title',
    subtitleKey: 'rule_season_subtitle',
    descKey: 'rule_season_desc',
    color: '#EC4899',
    route: '/rule-book/regularseason-and-playoff',
  },
  {
    key: 'exchange',
    icon: <SwapOutlined />,
    titleKey: 'rule_exchange_title',
    subtitleKey: 'rule_exchange_subtitle',
    descKey: 'rule_exchange_desc',
    color: '#F97316',
    route: '/rule-book/exchange',
    featured: true,
  },
  {
    key: 'empire',
    icon: <BankOutlined />,
    titleKey: 'rule_empire_title',
    subtitleKey: 'rule_empire_subtitle',
    descKey: 'rule_empire_desc',
    color: '#EAB308',
    route: '/rule-book/empire-sales',
  },
  {
    key: 'governance',
    icon: <SafetyCertificateOutlined />,
    titleKey: 'rule_governance_title',
    subtitleKey: 'rule_governance_subtitle',
    descKey: 'rule_governance_desc',
    color: '#8B5CF6',
    route: '/rule-book/governance',
    featured: true,
  },
]

/* ═══════════════════════════════════════════════════════════
   CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const RuleCard = ({ card, onClick, t }) => (
  <div
    className={`rbl-card ${card.featured ? 'rbl-card--featured' : ''}`}
    onClick={onClick}
    style={{ '--rbl-accent': card.color }}
  >
    <div className='rbl-card-glow' />
    <div className='rbl-card-accent' />
    <div className='rbl-card-body'>
      <div className='rbl-card-icon'>{card.icon}</div>
      <div className='rbl-card-info'>
        <div className='rbl-card-title'>{t(card.titleKey)}</div>
        <div className='rbl-card-subtitle'>{t(card.subtitleKey)}</div>
        <div className='rbl-card-desc'>{t(card.descKey)}</div>
      </div>
      <div className='rbl-card-arrow'>
        <RightOutlined />
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const MainRuleBook = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const featured = CARD_KEYS.filter((c) => c.featured)
  const standard = CARD_KEYS.filter((c) => !c.featured)

  return (
    <div className='rbl-page'>
      {/* Header */}
      <div className='rbl-header'>
        <div className='rbl-header-bg' />
        <div className='rbl-header-content'>
          <h1 className='rbl-header-title'>
            {t('ruleBookTitle')}
          </h1>
          <p className='rbl-header-sub'>
            {t('ruleBookSubtitle')}
          </p>
        </div>
      </div>

      {/* Featured Cards */}
      <div className='rbl-featured'>
        {featured.map((card) => (
          <RuleCard key={card.key} card={card} onClick={() => navigate(card.route)} t={t} />
        ))}
      </div>

      {/* Standard Cards Grid */}
      <div className='rbl-grid'>
        {standard.map((card) => (
          <RuleCard key={card.key} card={card} onClick={() => navigate(card.route)} t={t} />
        ))}
      </div>
    </div>
  )
}

export default MainRuleBook
