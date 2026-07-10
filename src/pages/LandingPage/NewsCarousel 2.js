import React, { useState, useRef, useEffect } from 'react';

const FALLBACK_SLIDES = [
  {
    title: 'Premier League 2025/26, Live Scores & Standings',
    img: 'https://a.espncdn.com/photo/2024/0814/r1368367_1296x729_16-9.jpg',
    badge: '⚽ Soccer',
    meta: 'Live Now',
  },
  {
    title: 'NBA Playoffs Race Heats Up',
    img: 'https://a.espncdn.com/photo/2024/0212/r1289498_1296x729_16-9.jpg',
    badge: '🏀 NBA',
    meta: 'Season 2025',
  },
  {
    title: 'A.Football Draft 2026, Top Prospects',
    img: 'https://a.espncdn.com/photo/2023/0428/r1173267_1296x729_16-9.jpg',
    badge: '🏈 A.Football',
    meta: 'Draft Coverage',
  },
];

// Sport-themed gradient fallbacks when images fail to load
const SPORT_GRADIENTS = [
  'linear-gradient(135deg, #1a3a2a 0%, #0d1f17 50%, #1a2a1a 100%)',
  'linear-gradient(135deg, #1a2a3a 0%, #0d1722 50%, #1a1a2a 100%)',
  'linear-gradient(135deg, #2a1a1a 0%, #1f0d0d 50%, #2a1a2a 100%)',
  'linear-gradient(135deg, #1a1a3a 0%, #0d0d22 50%, #1a2a3a 100%)',
];

const SlideImage = ({ src, index }) => {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || failed) {
    return (
      <div
        className="ls-nc-slide-fallback"
        style={{ background: SPORT_GRADIENTS[index % SPORT_GRADIENTS.length] }}
      />
    )
  }

  return (
    <>
      {!loaded && (
        <div
          className="ls-nc-slide-fallback"
          style={{ background: SPORT_GRADIENTS[index % SPORT_GRADIENTS.length] }}
        />
      )}
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        style={loaded ? {} : { opacity: 0, position: 'absolute' }}
      />
    </>
  )
}

const NewsCarousel = ({ articles = [], activeSport = null, onArticleClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const trackRef = useRef(null);

  // Prepare slides: use articles or fallback
  const slides = articles && articles.length > 0
    ? articles.slice(0, 6).map(a => ({
        title: a.headline || a.title || '',
        img: a.images?.[0]?.url || '',
        badge: a._icon ? `${a._icon} ${a._label}` : (a.source || ''),
        meta: a.published ? new Date(a.published).toLocaleDateString() : '',
        link: a.links?.web?.href || '#',
        // Pass full article data for the popup
        _article: a,
      }))
    : FALLBACK_SLIDES;

  const maxIndex = Math.max(0, slides.length - 3);

  useEffect(() => {
    if (trackRef.current) {
      // Each slide is ~33.333% width + gap, so shift by one card width
      const slideWidth = 100 / 3;
      const offset = currentIndex * -slideWidth;
      trackRef.current.style.transform = `translateX(calc(${offset}% - ${currentIndex * 14 / 3}px))`;
    }
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const end = e.changedTouches[0].clientX;
    if (touchStart - end > 50) goToNext();
    if (touchStart - end < -50) goToPrevious();
  };

  const handleSlideClick = (e, slide) => {
    e.preventDefault();
    if (onArticleClick && slide._article) {
      onArticleClick(slide._article);
    } else if (slide.link && slide.link !== '#') {
      window.open(slide.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="ls-news-carousel-wrap">
      <div className="ls-news-carousel-hd">📰 Key Stories</div>

      <div
        className="ls-news-carousel-track-wrap"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} className="ls-news-carousel-track">
          {slides.map((slide, index) => (
            <a
              key={index}
              className="ls-nc-slide"
              href={slide.link || '#'}
              onClick={(e) => handleSlideClick(e, slide)}
              style={{ cursor: 'pointer' }}
            >
              <SlideImage src={slide.img} index={index} />
              <div className="ls-nc-slide-overlay" />
              <div className="ls-nc-slide-content">
                <div className="ls-nc-slide-badge">{slide.badge}</div>
                <h3 className="ls-nc-slide-title">{slide.title}</h3>
                <p className="ls-nc-slide-meta">{slide.meta}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Arrow Buttons */}
      {slides.length > 3 && (
        <>
          <button
            className="ls-news-carousel-arrow left"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            className="ls-news-carousel-arrow right"
            onClick={goToNext}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default NewsCarousel;
