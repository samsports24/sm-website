import React from 'react'
import rivalsPromo from '../../assets/rivals-promo.png'

const LeftSidebar = ({ headlines = [], onViewAllNews, onArticleClick, ad }) => {
  const handleClick = (article) => (e) => {
    e.preventDefault()
    if (onArticleClick) {
      onArticleClick(article)
    } else if (article.links?.web?.href) {
      window.open(article.links.web.href, '_blank', 'noopener,noreferrer')
    }
  }

  const featured = headlines[0]
  const rest = headlines.slice(1, 5)

  return (
  <aside className="ls-left-sidebar">
    {/* Headlines Card */}
    <div className="ls-lsb-card">
      <div className="ls-lsb-hd">
        <span className="ls-lsb-hd-title">HEADLINES</span>
        <span className="ls-lsb-hd-link" onClick={onViewAllNews}>VIEW ALL</span>
      </div>
      <div className="ls-headlines-list">
        {/* Featured story — large image + AI summary */}
        {featured && (
          <a
            href={featured.links?.web?.href || '#'}
            onClick={handleClick(featured)}
            className="ls-hl-featured"
          >
            <div className="ls-hl-feat-img-wrap">
              {featured.images?.[0]?.url ? (
                <img
                  src={featured.images[0].url}
                  alt=""
                  className="ls-hl-feat-img"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="ls-hl-feat-img-ph">{featured._icon || '📰'}</div>
              )}
              <div className="ls-hl-feat-img-overlay" />
              <span className="ls-hl-feat-tag">
                <span className="ls-hl-feat-tag-dot" />SAM AI
              </span>
            </div>
            <div className="ls-hl-feat-body">
              <div className="ls-hl-feat-title">{featured.headline || featured.title}</div>
              {featured.description && (
                <div className="ls-hl-feat-summary">{featured.description}</div>
              )}
              <div className="ls-hl-meta ls-hl-feat-meta">
                {featured.source && <span>{featured.source}</span>}
                {featured.source && <span className="ls-hl-meta-dot">&middot;</span>}
                <span>{featured._timeAgo}</span>
              </div>
            </div>
          </a>
        )}

        {/* Four smaller stories */}
        {rest.map((article, i) => (
          <a
            key={i}
            href={article.links?.web?.href || '#'}
            onClick={handleClick(article)}
            className="ls-hl-item"
            style={{ cursor: 'pointer' }}
          >
            <div className="ls-hl-icon-circle" style={article.images?.[0]?.url ? { padding: 0, overflow: 'hidden', background: 'transparent', border: 'none' } : {}}>
              {article.images?.[0]?.url ? (
                <img
                  src={article.images[0].url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = article._icon || '📰' }}
                />
              ) : (
                <span>{article._icon || '📰'}</span>
              )}
            </div>
            <div className="ls-hl-content">
              <div className="ls-hl-text">
                {article.headline || article.title}
              </div>
              <div className="ls-hl-meta">
                {article.source && <span>{article.source}</span>}
                {article.source && <span className="ls-hl-meta-dot">&middot;</span>}
                <span>{article._timeAgo}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>

    {/* Advert — admin-configured ad if present, otherwise the SAM Rivals promo */}
    {ad && ad.imageUrl ? (
      <div className="ls-lsb-ad ls-lsb-ad--img" onClick={() => { if (ad.linkUrl) window.location.href = ad.linkUrl }} role="button" aria-label="Advertisement">
        <img src={ad.imageUrl} alt="Advertisement" className="ls-lsb-ad-img" />
      </div>
    ) : (
      <div className="ls-lsb-ad ls-lsb-ad--img" onClick={() => window.location.href='/select-game'} role="button" aria-label="Enter SAM Rivals">
        <img src={rivalsPromo} alt="SAM Rivals — Enter Rivals" className="ls-lsb-ad-img" />
      </div>
    )}
  </aside>
  )
}

export default LeftSidebar
