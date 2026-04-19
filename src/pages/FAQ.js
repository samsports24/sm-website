import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined, SearchOutlined } from '@ant-design/icons'
import { useLanguage } from '../i18n/LanguageContext'
import SEO from '../components/SEO'
import OnboardingGuide from '../components/OnboardingGuide'
import '../styles/pages/faqPage.css'

const faqDataKeys = [
  {
    categoryKey: 'faqCat_gettingStarted',
    icon: '🚀',
    questions: [
      { q: 'faqQ_whatIsSamSports', a: 'faqA_whatIsSamSports' },
      { q: 'faqQ_howCreateAccount', a: 'faqA_howCreateAccount' },
      { q: 'faqQ_isSamSportsFree', a: 'faqA_isSamSportsFree' },
      { q: 'faqQ_whatSportsSupported', a: 'faqA_whatSportsSupported' },
      { q: 'faqQ_whatDevices', a: 'faqA_whatDevices' },
    ],
  },
  {
    categoryKey: 'faqCat_leagues',
    icon: '🏟️',
    questions: [
      { q: 'faqQ_leagueTypes', a: 'faqA_leagueTypes' },
      { q: 'faqQ_createLeague', a: 'faqA_createLeague' },
      { q: 'faqQ_joinLeague', a: 'faqA_joinLeague' },
      { q: 'faqQ_leagueSize', a: 'faqA_leagueSize' },
      { q: 'faqQ_multipleLeagues', a: 'faqA_multipleLeagues' },
    ],
  },
  {
    categoryKey: 'faqCat_drafts',
    icon: '📋',
    questions: [
      { q: 'faqQ_draftWork', a: 'faqA_draftWork' },
      { q: 'faqQ_snakeDraft', a: 'faqA_snakeDraft' },
      { q: 'faqQ_draftSpotAuction', a: 'faqA_draftSpotAuction' },
      { q: 'faqQ_randomizeDraft', a: 'faqA_randomizeDraft' },
      { q: 'faqQ_supplementalRookie', a: 'faqA_supplementalRookie' },
    ],
  },
  {
    categoryKey: 'faqCat_rostersPositions',
    icon: '🏈',
    questions: [
      { q: 'faqQ_rosterSize', a: 'faqA_rosterSize' },
      { q: 'faqQ_availablePositions', a: 'faqA_availablePositions' },
      { q: 'faqQ_depthChart', a: 'faqA_depthChart' },
      { q: 'faqQ_injuredReserve', a: 'faqA_injuredReserve' },
      { q: 'faqQ_changeRosterSize', a: 'faqA_changeRosterSize' },
    ],
  },
  {
    categoryKey: 'faqCat_scoringSamPoints',
    icon: '⭐',
    questions: [
      { q: 'faqQ_scoringWork', a: 'faqA_scoringWork' },
      { q: 'faqQ_samPointsAre', a: 'faqA_samPointsAre' },
      { q: 'faqQ_scoringBreakdown', a: 'faqA_scoringBreakdown' },
      { q: 'faqQ_customizeScoring', a: 'faqA_customizeScoring' },
      { q: 'faqQ_gmRating', a: 'faqA_gmRating' },
    ],
  },
  {
    categoryKey: 'faqCat_tradesFreeAgency',
    icon: '🔄',
    questions: [
      { q: 'faqQ_tradePlayers', a: 'faqA_tradePlayers' },
      { q: 'faqQ_counterTrade', a: 'faqA_counterTrade' },
      { q: 'faqQ_freeAgency', a: 'faqA_freeAgency' },
      { q: 'faqQ_tradeDeadlines', a: 'faqA_tradeDeadlines' },
    ],
  },
  {
    categoryKey: 'faqCat_commissioner',
    icon: '👑',
    questions: [
      { q: 'faqQ_commissionerDo', a: 'faqA_commissionerDo' },
      { q: 'faqQ_transferOwnership', a: 'faqA_transferOwnership' },
      { q: 'faqQ_commissionerProtections', a: 'faqA_commissionerProtections' },
      { q: 'faqQ_setupAuction', a: 'faqA_setupAuction' },
      { q: 'faqQ_inviteMembers', a: 'faqA_inviteMembers' },
    ],
  },
  {
    categoryKey: 'faqCat_playoffsOffseason',
    icon: '🏆',
    questions: [
      { q: 'faqQ_playoffWork', a: 'faqA_playoffWork' },
      { q: 'faqQ_playoffBracket', a: 'faqA_playoffBracket' },
      { q: 'faqQ_offseason', a: 'faqA_offseason' },
    ],
  },
  {
    categoryKey: 'faqCat_sampointsEconomy',
    icon: '💰',
    questions: [
      { q: 'faqQ_sampointsUsedFor', a: 'faqA_sampointsUsedFor' },
      { q: 'faqQ_getSamPoints', a: 'faqA_getSamPoints' },
      { q: 'faqQ_costRealMoney', a: 'faqA_costRealMoney' },
      { q: 'faqQ_salaryCap', a: 'faqA_salaryCap' },
    ],
  },
  {
    categoryKey: 'faqCat_accountSettings',
    icon: '⚙️',
    questions: [
      { q: 'faqQ_editProfile', a: 'faqA_editProfile' },
      { q: 'faqQ_teamSettings', a: 'faqA_teamSettings' },
      { q: 'faqQ_forgotPassword', a: 'faqA_forgotPassword' },
      { q: 'faqQ_contactSupport', a: 'faqA_contactSupport' },
    ],
  },
]

const FAQ = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState({})
  const [activeCategory, setActiveCategory] = useState(null)

  const toggleItem = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Build faqData with translated values
  const faqData = faqDataKeys.map((cat) => ({
    category: t(cat.categoryKey),
    categoryKey: cat.categoryKey,
    icon: cat.icon,
    questions: cat.questions.map((q) => ({
      q: t(q.q),
      a: t(q.a),
    })),
  }))

  const filteredData = faqData
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0)
    .filter((cat) => !activeCategory || cat.category === activeCategory)

  const totalQuestions = faqData.reduce((sum, cat) => sum + cat.questions.length, 0)

  return (
    <div className='faq-page'>
      <SEO
        title="FAQ — Frequently Asked Questions"
        description="Find answers about SAM Sports fantasy leagues, SAM Metric scoring, SAM Points, drafting, trades, salary caps, and more."
        path="/faq"
      />
      <OnboardingGuide tabKey="faq" />
      <div className='faq-topbar'>
        <button className='faq-back' onClick={() => navigate(-1)}>
          <LeftOutlined /> {t('backButton')}
        </button>
        <div className='faq-logo'>
          <span>SAMSPORTS</span>
        </div>
        <div className='faq-topbar-spacer' />
      </div>

      <div className='faq-container'>
        <div className='faq-header'>
          <div className='faq-header-badge'>{t('faqHeader')}</div>
          <h1>{t('faqPageTitle')}</h1>
          <p className='faq-subtitle'>
            {t('faqSubtitle')}, {totalQuestions} {t('answers')} {t('across')} {faqData.length} {t('topics')}
          </p>
        </div>

        <div className='faq-search-wrap'>
          <SearchOutlined className='faq-search-icon' />
          <input
            className='faq-search'
            type='text'
            placeholder={t('searchQuestions')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className='faq-search-clear' onClick={() => setSearchTerm('')}>
              &times;
            </button>
          )}
        </div>

        <div className='faq-categories'>
          <button
            className={`faq-cat-chip ${!activeCategory ? 'faq-cat-chip--active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            {t('allCategories')}
          </button>
          {faqData.map((cat) => (
            <button
              key={cat.category}
              className={`faq-cat-chip ${activeCategory === cat.category ? 'faq-cat-chip--active' : ''}`}
              onClick={() =>
                setActiveCategory(activeCategory === cat.category ? null : cat.category)
              }
            >
              <span className='faq-cat-chip-icon'>{cat.icon}</span>
              {cat.category}
            </button>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className='faq-empty'>
            <span className='faq-empty-icon'>🔍</span>
            <p>{t('noQuestionsFound')} &ldquo;{searchTerm}&rdquo;</p>
            <button className='faq-empty-btn' onClick={() => { setSearchTerm(''); setActiveCategory(null) }}>
              {t('clearFilters')}
            </button>
          </div>
        )}

        <div className='faq-body'>
          {filteredData.map((cat) => (
            <div key={cat.category} className='faq-section'>
              <div className='faq-section-header'>
                <span className='faq-section-icon'>{cat.icon}</span>
                <h2>{cat.category}</h2>
                <span className='faq-section-count'>{cat.questions.length}</span>
              </div>

              <div className='faq-items'>
                {cat.questions.map((item, idx) => {
                  const key = `${cat.category}-${idx}`
                  const isOpen = openItems[key]
                  return (
                    <div
                      key={key}
                      className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
                      onClick={() => toggleItem(key)}
                    >
                      <div className='faq-item-header'>
                        <span className='faq-item-q'>{item.q}</span>
                        <span className={`faq-item-toggle ${isOpen ? 'faq-item-toggle--open' : ''}`}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </div>
                      {isOpen && (
                        <div className='faq-item-answer'>
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className='faq-contact-block'>
          <div className='faq-contact-icon'>💬</div>
          <h3>{t('stillHaveQuestions')}</h3>
          <p>{t('stillHaveQuestionsDesc')}</p>
          <a href='mailto:hello@samsports.io' className='faq-contact-link'>
            {t('contactEmail')}
          </a>
        </div>
      </div>

      <div className='faq-footer'>
        <p>&copy; {new Date().getFullYear()} Samsports.io {t('allRightsReserved')}</p>
      </div>
    </div>
  )
}

export default FAQ
