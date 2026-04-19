import React from 'react'

const LeftSidebar = ({ headlines = [], onViewAllNews, onArticleClick }) => (
  <aside className="ls-left-sidebar">
    {/* Headlines Card */}
    <div className="ls-lsb-card">
      <div className="ls-lsb-hd">
        <span className="ls-lsb-hd-title">HEADLINES</span>
        <span className="ls-lsb-hd-link" onClick={onViewAllNews}>VIEW ALL</span>
      </div>
      <div className="ls-headlines-list">
        {headlines.slice(0, 10).map((article, i) => (
          <a
            key={i}
            href={article.links?.web?.href || '#'}
            onClick={(e) => {
              e.preventDefault();
              if (onArticleClick) {
                onArticleClick(article);
              } else if (article.links?.web?.href) {
                window.open(article.links.web.href, '_blank', 'noopener,noreferrer');
              }
            }}
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

    {/* SAM RIVALS Promo */}
    <div className="ls-lsb-ad" onClick={() => window.location.href='/select-game'}>
      <div className="ls-lsb-ad-glow" />
      <div className="ls-lsb-ad-shimmer" />
      <div className="ls-lsb-ad-inner">
        <span className="ls-lsb-ad-badge">NEW</span>
        <div className="ls-lsb-ad-title">SAM <span className="ls-lsb-ad-hl">RIVALS</span></div>
        <div className="ls-lsb-ad-sub">Climb divisions &middot; H2H Matchups &middot; Earn SamPoints</div>
        <div className="ls-lsb-ad-pills">
          <span className="ls-lsb-ad-pill active">Soccer</span>
          <span className="ls-lsb-ad-pill active" style={{background: 'rgba(124,58,237,0.2)', borderColor: 'rgba(124,58,237,0.4)', color: '#A78BFA'}}>A.Football</span>
        </div>
        <a href="/select-game" className="ls-lsb-ad-btn" onClick={e => e.stopPropagation()}>Enter Rivals</a>
      </div>
    </div>
  </aside>
)

export default LeftSidebar
