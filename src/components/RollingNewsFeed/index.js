import React, { useEffect, useState, useRef, useCallback } from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'
import { FiClock, FiExternalLink, FiX, FiTrendingUp } from 'react-icons/fi'
import { getNewsFeed, getArticleSummary } from '../../redux'
import { useNavigate } from 'react-router-dom'
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

const SkeletonLoader = () => (
  <div className='news_skeleton'>
    <div className='news_skeleton_hero'>
      <div className='skeleton_shimmer' />
    </div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className='news_skeleton_row'>
        <div className='news_skeleton_thumb'><div className='skeleton_shimmer' /></div>
        <div className='news_skeleton_text'>
          <div className='skeleton_line skeleton_line_long'><div className='skeleton_shimmer' /></div>
          <div className='skeleton_line skeleton_line_short'><div className='skeleton_shimmer' /></div>
        </div>
      </div>
    ))}
  </div>
)

/* ── Modal loading shimmer for summary ── */
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

const RollingNewsFeed = ({ height = '380px' }) => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState({})
  const [modalArticle, setModalArticle] = useState(null)
  const [modalSummary, setModalSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const listRef = useRef(null)
  const scrollIntervalRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let data = await getNewsFeed()
      setNews(data || [])
      setLoading(false)
    })()
  }, [])

  const startAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) return
    scrollIntervalRef.current = setInterval(() => {
      if (listRef.current && !isHovered) {
        const el = listRef.current
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
          el.scrollTop = 0
        } else {
          el.scrollTop += 1
        }
      }
    }, 60)
  }, [isHovered])

  useEffect(() => {
    if (news.length > 4) startAutoScroll()
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
    }
  }, [news, startAutoScroll])

  const navigate = useNavigate()

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  const getTeamColor = (abv) => TEAM_COLORS[abv] || '#22C55E'

  /* ── Open article: show modal and fetch AI summary ── */
  const openArticle = async (e, article) => {
    e.preventDefault()
    setModalArticle(article)
    setModalSummary('')

    // If the article already has a description that's a real summary (not a link), use it
    if (article.hasSummary && article.description && !article.description.startsWith('Read more:')) {
      setModalSummary(article.description)
      return
    }

    // Otherwise, call the AI summarizer
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

  const hero = news.length > 0 ? news[0] : null
  const rest = news.length > 1 ? news.slice(1) : []
  const tickerHeadlines = news.slice(0, 5).map((n) => n.headline).filter(Boolean)

  return (
    <>
      <div className='rolling_news_feed'>
        <header>
          <h3>
            <FiTrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            A.Football Rolling News Feed
          </h3>
          <p onClick={() => navigate('/all-news')}>
            View All <BiRightArrowAlt size={18} />
          </p>
        </header>

        <section className='news_content_body' style={{ maxHeight: height }}>
          {loading && <SkeletonLoader />}

          {!loading && (!news || news.length === 0) && (
            <div className='news_empty_state'>
              <p>No news available yet</p>
            </div>
          )}

          {!loading && hero && (
            <div className='news_hero_card' onClick={(e) => openArticle(e, hero)}>
              <div className='news_hero_img_wrap'>
                <img
                  src={imgErrors[hero.NewsID] ? FALLBACK_IMG : (hero.image || FALLBACK_IMG)}
                  alt={hero.headline}
                  onError={() => handleImgError(hero.NewsID)}
                />
                <div className='news_hero_overlay'></div>
                <div className='news_hero_badges'>
                  {isHot(hero.lastModified) && <span className='news_hot_badge'>HOT</span>}
                  {hero.teamAbv && (
                    <span className='news_team_badge' style={{ background: getTeamColor(hero.teamAbv) }}>
                      {hero.teamAbv}
                    </span>
                  )}
                </div>
              </div>
              <div className='news_hero_text'>
                <h2>{hero.headline}</h2>
                <div className='news_hero_meta'>
                  <span className='news_meta_time'>
                    <FiClock size={12} />{moment(hero.lastModified).fromNow()}
                  </span>
                  {hero.byline && <span className='news_meta_source'>{hero.byline}</span>}
                  <span className='news_meta_link'>Read Full Story</span>
                </div>
              </div>
            </div>
          )}

          {!loading && rest.length > 0 && (
            <div
              className='news_article_list'
              ref={listRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {rest.map((v, idx) => (
                <div
                  key={v.NewsID}
                  className='news_article_card'
                  onClick={(e) => openArticle(e, v)}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className='news_article_thumb_wrap'>
                    <img
                      src={imgErrors[v.NewsID] ? FALLBACK_IMG : (v.image || FALLBACK_IMG)}
                      alt={v.headline}
                      onError={() => handleImgError(v.NewsID)}
                      className='news_article_thumb'
                    />
                    {isHot(v.lastModified) && <span className='news_hot_badge_sm'>HOT</span>}
                    {v.teamAbv && (
                      <span className='news_team_badge_sm' style={{ background: getTeamColor(v.teamAbv) }}>
                        {v.teamAbv}
                      </span>
                    )}
                  </div>
                  <div className='news_article_info'>
                    <h4>{v.headline}</h4>
                    <div className='news_article_meta'>
                      <span className='news_meta_time'>
                        <FiClock size={11} />{moment(v.lastModified).fromNow()}
                      </span>
                      {v.byline && <span className='news_meta_source'>{v.byline}</span>}
                    </div>
                  </div>
                  <FiExternalLink className='news_article_link_icon' size={14} />
                </div>
              ))}
            </div>
          )}
        </section>
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

              {/* AI Summary or Loading */}
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

export default RollingNewsFeed
