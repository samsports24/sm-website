import React, { useEffect, useState } from 'react'
import { FiClock, FiX } from 'react-icons/fi'
import { getAllNewsFeed, getArticleSummary } from '../../redux'
import Header from '../../components/Header'
import moment from 'moment'

const FALLBACK_IMG = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png&w=400'

const TEAM_COLORS = {
  ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D',
  CAR: '#0085CA', CHI: '#C83200', CIN: '#FB4F14', CLE: '#311D00',
  DAL: '#003594', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
  HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837',
  LAC: '#0080C6', LAR: '#003594', LV: '#A5ACAF', MIA: '#008E97',
  MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#0B2265',
  NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SF: '#AA0000',
  SEA: '#002244', TB: '#D50A0A', TEN: '#0C2340', WAS: '#5A1414',
}

const isHot = (dateStr) => {
  if (!dateStr) return false
  return moment().diff(moment(dateStr), 'hours') < 2
}

const SummaryLoading = () => (
  <div className='news_modal_loading'>
    <div className='news_modal_loading_icon'>
      <div className='news_modal_spinner'></div>
    </div>
    <p className='news_modal_loading_text'>SAM News AI is reading this article...</p>
    <div className='skeleton_line skeleton_line_long' style={{ height: 12, marginTop: 16 }}>
      <div className='skeleton_shimmer' />
    </div>
    <div className='skeleton_line skeleton_line_long' style={{ height: 12, marginTop: 8 }}>
      <div className='skeleton_shimmer' />
    </div>
    <div className='skeleton_line skeleton_line_short' style={{ height: 12, marginTop: 8 }}>
      <div className='skeleton_shimmer' />
    </div>
  </div>
)

const AllNews = () => {
  const [allnews, setAllNews] = useState([])
  const [imgErrors, setImgErrors] = useState({})
  const [modalArticle, setModalArticle] = useState(null)
  const [modalSummary, setModalSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      let data = await getAllNewsFeed()
      setAllNews(data || [])
    })()
  }, [])

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  const getTeamColor = (abv) => TEAM_COLORS[abv] || '#22C55E'

  const openArticle = async (e, article) => {
    e.preventDefault()
    setModalArticle(article)
    setModalSummary('')

    if (article.hasSummary && article.description && !article.description.startsWith('Read more:')) {
      setModalSummary(article.description)
      return
    }

    setSummaryLoading(true)
    try {
      const result = await getArticleSummary(article.NewsID)
      if (result && result.summary) {
        setModalSummary(result.summary)
      } else {
        setModalSummary('Unable to generate summary at this time. Please try again later.')
      }
    } catch (err) {
      setModalSummary('Unable to generate summary at this time.')
    }
    setSummaryLoading(false)
  }

  const closeModal = () => {
    setModalArticle(null)
    setModalSummary('')
    setSummaryLoading(false)
  }

  const hero = allnews.length > 0 ? allnews[0] : null
  const rest = allnews.length > 1 ? allnews.slice(1) : []
  const tickerHeadlines = allnews.slice(0, 5).map((n) => n.headline).filter(Boolean)

  return (
    <>
      <Header />
      <div className='all_news_page' style={{ marginTop: '60px' }}>
        {/* ── THE SAM NEWS banner with ticker ── */}
        <div className='news_header_top'>
          <div className='news_header_inner'>
            <div className='news_brand'>
              <span className='news_brand_icon'>S</span>
              <div>
                <h1>THE SAM NEWS</h1>
                <p className='news_tagline'>Your latest sport</p>
              </div>
            </div>
            <div className='news_header_right'>
              {allnews.length > 0 && (
                <span className='news_count_pill'>{allnews.length} stories</span>
              )}
              <div className='news_live_badge'>
                <span className='live_dot'></span> LIVE
              </div>
            </div>
          </div>

          {tickerHeadlines.length > 0 && (
            <div className='news_ticker_bar'>
              <span className='news_ticker_label'>BREAKING</span>
              <div className='news_ticker_track'>
                <div className='news_ticker_content'>
                  {tickerHeadlines.map((h, i) => (
                    <span key={i} className='news_ticker_item'>
                      {h}<span className='news_ticker_dot'>&#x2022;</span>
                    </span>
                  ))}
                  {tickerHeadlines.map((h, i) => (
                    <span key={`dup-${i}`} className='news_ticker_item'>
                      {h}<span className='news_ticker_dot'>&#x2022;</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='all_news_page_header'>
          <h2>A.Football NEWS</h2>
          <span>{allnews.length} articles</span>
        </div>

        {allnews.length === 0 && (
          <div className='news_empty_state'><p>No news available yet</p></div>
        )}

        <div className='all_news_grid'>
          {hero && (
            <div className='all_news_card all_news_hero' onClick={(e) => openArticle(e, hero)}>
              <div style={{ overflow: 'hidden' }}>
                <img
                  src={imgErrors[hero.NewsID] ? FALLBACK_IMG : (hero.image || FALLBACK_IMG)}
                  alt={hero.headline}
                  onError={() => handleImgError(hero.NewsID)}
                  className='all_news_card_img'
                />
              </div>
              <div className='all_news_card_body'>
                {hero.teamAbv && (
                  <span className='news_team_badge' style={{
                    background: getTeamColor(hero.teamAbv),
                    position: 'static', display: 'inline-block', width: 'fit-content', marginBottom: '4px',
                  }}>{hero.teamAbv}</span>
                )}
                <h3 className='all_news_card_title'>{hero.headline}</h3>
                <div className='all_news_card_meta'>
                  <span className='news_meta_time'>
                    <FiClock size={11} />{moment(hero.lastModified).fromNow()}
                  </span>
                  {hero.byline && <span className='news_meta_source'>{hero.byline}</span>}
                  <span className='news_meta_link'>Read Full Story</span>
                </div>
              </div>
            </div>
          )}

          {rest.map((v) => (
            <div key={v.NewsID} className='all_news_card' onClick={(e) => openArticle(e, v)}>
              <div style={{ overflow: 'hidden' }}>
                <img
                  src={imgErrors[v.NewsID] ? FALLBACK_IMG : (v.image || FALLBACK_IMG)}
                  alt={v.headline}
                  onError={() => handleImgError(v.NewsID)}
                  className='all_news_card_img'
                />
              </div>
              <div className='all_news_card_body'>
                {v.teamAbv && (
                  <span className='news_team_badge' style={{
                    background: getTeamColor(v.teamAbv),
                    position: 'static', display: 'inline-block', width: 'fit-content', marginBottom: '2px',
                  }}>{v.teamAbv}</span>
                )}
                <h3 className='all_news_card_title'>{v.headline}</h3>
                <div className='all_news_card_meta'>
                  <span className='news_meta_time'>
                    <FiClock size={11} />{moment(v.lastModified).fromNow()}
                  </span>
                  {v.byline && <span className='news_meta_source'>{v.byline}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Article Preview Modal with AI Summary ═══ */}
      {modalArticle && (
        <div className='news_modal_overlay' onClick={closeModal}>
          <div className='news_modal_container news_modal_preview' onClick={(e) => e.stopPropagation()}>
            <button className='news_modal_close' onClick={closeModal}>
              <FiX size={20} />
            </button>

            <div className='news_modal_img_wrap'>
              <img
                src={imgErrors[modalArticle.NewsID] ? FALLBACK_IMG : (modalArticle.image || FALLBACK_IMG)}
                alt={modalArticle.headline}
                onError={() => handleImgError(modalArticle.NewsID)}
              />
              <div className='news_modal_img_overlay'></div>
              <div className='news_modal_img_badges'>
                {modalArticle.teamAbv && (
                  <span className='news_team_badge' style={{ background: getTeamColor(modalArticle.teamAbv) }}>
                    {modalArticle.teamAbv}
                  </span>
                )}
                {isHot(modalArticle.lastModified) && <span className='news_hot_badge'>HOT</span>}
              </div>
            </div>

            <div className='news_modal_body'>
              <h2 className='news_modal_headline'>{modalArticle.headline}</h2>

              <div className='news_modal_meta_row'>
                <span className='news_meta_time'>
                  <FiClock size={13} />
                  {moment(modalArticle.lastModified).format('MMM D, YYYY [at] h:mm A')}
                </span>
                {modalArticle.byline && (
                  <span className='news_modal_byline'>{modalArticle.byline}</span>
                )}
              </div>

              {summaryLoading ? (
                <SummaryLoading />
              ) : (
                modalSummary && (
                  <div className='news_modal_summary'>
                    <div className='news_modal_ai_badge'>
                      <span className='news_ai_dot'></span> SAM News AI Summary
                    </div>
                    {modalSummary.split('\n').filter(Boolean).map((paragraph, i) => (
                      <p key={i} className='news_modal_description'>{paragraph}</p>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AllNews
