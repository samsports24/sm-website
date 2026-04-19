import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getArticles, getArticleBySlug, getArticlesByLeague, getArticlesGroupedByLeague, getTranslatedArticle, getPlatformSettings } from "../../services/articleService";

const LEAGUES = [
  { value: "", label: "All Leagues" },
  { value: "premier_league", label: "English Premier" },
  { value: "la_liga", label: "Spanish First Division" },
  { value: "serie_a", label: "Italian First Division" },
  { value: "bundesliga", label: "German First Division" },
  { value: "ligue_1", label: "French First Division" },
  { value: "ekstraklasa", label: "Polish First Division" },
  { value: "champions_league", label: "European Cup" },
  { value: "mls", label: "MLS" },
  { value: "liga_portugal", label: "Liga Portugal" },
];

const LEAGUE_LABELS = LEAGUES.reduce((acc, l) => { if (l.value) acc[l.value] = l.label; return acc; }, {});

/* ── Article Card ── */
const ArticleCard = ({ article, onClick, showLogos = true }) => {
  const isPost = article.type === "post_match";

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30,41,59,0.8)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid rgba(71,85,105,0.4)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Teams header */}
      <div style={{
        background: isPost
          ? "linear-gradient(135deg, #f59e0b20, #ef444420)"
          : "linear-gradient(135deg, #8b5cf620, #3b82f620)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}>
        {showLogos && article.homeTeamLogo ? (
          <img src={article.homeTeamLogo} alt={article.homeTeam} style={{ width: 28, height: 28, objectFit: "contain" }} />
        ) : (
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, textAlign: "right", flex: 1 }}>{article.homeTeam || "Home"}</span>
        )}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          {isPost && article.homeScore != null ? (
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>
              {article.homeScore} - {article.awayScore}
            </div>
          ) : (
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>VS</div>
          )}
        </div>
        {showLogos && article.awayTeamLogo ? (
          <img src={article.awayTeamLogo} alt={article.awayTeam} style={{ width: 28, height: 28, objectFit: "contain" }} />
        ) : (
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, textAlign: "left", flex: 1 }}>{article.awayTeam || "Away"}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            background: isPost ? "rgba(245,158,11,0.15)" : "rgba(139,92,246,0.15)",
            color: isPost ? "#f59e0b" : "#8b5cf6",
          }}>
            {isPost ? "Review" : "Preview"}
          </span>
          <span style={{
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            background: "rgba(59,130,246,0.15)",
            color: "#3b82f6",
          }}>
            {LEAGUE_LABELS[article.realLeague] || article.realLeague}
          </span>
        </div>

        <h3 style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>
          {article.title}
        </h3>

        {article.summary && (
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 10px", lineHeight: 1.4 }}>
            {article.summary}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748b", fontSize: 11 }}>
          <span>{article.readTimeMinutes || 2} min read</span>
          {article.matchweek && <span>MW{article.matchweek}</span>}
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const TRANSLATION_LANGUAGES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "es", label: "Espa\u00f1ol", flag: "ES" },
  { code: "fr", label: "Fran\u00e7ais", flag: "FR" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "it", label: "Italiano", flag: "IT" },
  { code: "pt", label: "Portugu\u00eas", flag: "PT" },
  { code: "pl", label: "Polski", flag: "PL" },
  { code: "nl", label: "Nederlands", flag: "NL" },
  { code: "tr", label: "T\u00fcrk\u00e7e", flag: "TR" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", flag: "AR" },
  { code: "ja", label: "\u65e5\u672c\u8a9e", flag: "JA" },
  { code: "ko", label: "\ud55c\uad6d\uc5b4", flag: "KO" },
  { code: "zh", label: "\u4e2d\u6587", flag: "ZH" },
];

/* ── Article Detail View ── */
const ArticleDetail = ({ slug, onBack, showLogos = true }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [originalArticle, setOriginalArticle] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getArticleBySlug(slug);
        const art = res.data?.data?.article || null;
        setArticle(art);
        setOriginalArticle(art);
      } catch {
        setArticle(null);
      }
      setLoading(false);
    };
    fetch();
    setSelectedLang("en");
  }, [slug]);

  const handleLanguageChange = async (langCode) => {
    if (langCode === selectedLang) return;
    setSelectedLang(langCode);

    if (langCode === "en") {
      setArticle(originalArticle);
      return;
    }

    setTranslating(true);
    try {
      const res = await getTranslatedArticle(slug, langCode);
      const translated = res.data?.data?.article;
      if (translated) {
        setArticle({ ...originalArticle, ...translated });
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
    setTranslating(false);
  };

  if (loading) return <div style={{ color: "#94a3b8", padding: 40, textAlign: "center" }}>Loading article...</div>;
  if (!article) return <div style={{ color: "#94a3b8", padding: 40, textAlign: "center" }}>Article not found.</div>;

  const isPost = article.type === "post_match";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", color: "#3b82f6", cursor: "pointer",
            fontSize: 14, padding: 0,
          }}
        >
          &larr; Back to Articles
        </button>

        {/* Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#64748b", marginRight: 4 }}>
            {translating ? "Translating..." : "Read in:"}
          </span>
          {TRANSLATION_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={translating}
              title={lang.label}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: translating ? "wait" : "pointer",
                border: selectedLang === lang.code
                  ? "1px solid #3b82f6"
                  : "1px solid rgba(71,85,105,0.4)",
                background: selectedLang === lang.code
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(30,41,59,0.6)",
                color: selectedLang === lang.code ? "#3b82f6" : "#94a3b8",
                transition: "all 0.2s",
                opacity: translating && selectedLang !== lang.code ? 0.5 : 1,
              }}
            >
              {lang.flag}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{
        background: isPost
          ? "linear-gradient(135deg, #f59e0b20, #ef444420)"
          : "linear-gradient(135deg, #8b5cf620, #3b82f620)",
        borderRadius: 14,
        padding: 24,
        marginBottom: 24,
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
          {showLogos && article.homeTeamLogo ? (
            <img src={article.homeTeamLogo} alt={article.homeTeam} style={{ width: 40, height: 40, objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, textAlign: "right", flex: 1 }}>{article.homeTeam}</span>
          )}
          <div style={{ flexShrink: 0 }}>
            {isPost && article.homeScore != null ? (
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 24 }}>{article.homeScore} - {article.awayScore}</div>
            ) : (
              <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>VS</div>
            )}
          </div>
          {showLogos && article.awayTeamLogo ? (
            <img src={article.awayTeamLogo} alt={article.awayTeam} style={{ width: 40, height: 40, objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, textAlign: "left", flex: 1 }}>{article.awayTeam}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
        {article.title}
      </h1>
      {article.subtitle && (
        <h2 style={{ color: "#94a3b8", fontSize: 16, fontWeight: 400, marginBottom: 20 }}>
          {article.subtitle}
        </h2>
      )}

      {/* Meta */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", color: "#64748b", fontSize: 12 }}>
        <span style={{ padding: "2px 8px", borderRadius: 6, background: isPost ? "rgba(245,158,11,0.15)" : "rgba(139,92,246,0.15)", color: isPost ? "#f59e0b" : "#8b5cf6", fontWeight: 600 }}>
          {isPost ? "Post-Match Review" : "Pre-Match Preview"}
        </span>
        <span>{LEAGUE_LABELS[article.realLeague] || article.realLeague}</span>
        {article.matchweek && <span>Matchweek {article.matchweek}</span>}
        <span>{article.readTimeMinutes || 2} min read</span>
        <span>{article.views || 0} views</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Content */}
      <div style={{
        color: "#cbd5e1",
        fontSize: 15,
        lineHeight: 1.75,
        whiteSpace: "pre-wrap",
      }}>
        {article.content}
      </div>

      {/* Top Performers */}
      {article.topPerformers?.length > 0 && (
        <div style={{
          marginTop: 32,
          background: "rgba(30,41,59,0.8)",
          borderRadius: 12,
          padding: 20,
          border: "1px solid rgba(71,85,105,0.4)",
        }}>
          <h3 style={{ color: "#fff", fontSize: 16, marginBottom: 12, fontWeight: 700 }}>Top Performers</h3>
          {article.topPerformers.map((p, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: i < article.topPerformers.length - 1 ? "1px solid rgba(71,85,105,0.3)" : "none",
            }}>
              <div>
                <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>{p.position} | {p.club}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {p.keyStats && <span style={{ color: "#94a3b8", fontSize: 12 }}>{p.keyStats}</span>}
                <span style={{
                  background: p.samRating >= 8 ? "rgba(16,185,129,0.2)" : p.samRating >= 7 ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                  color: p.samRating >= 8 ? "#10b981" : p.samRating >= 7 ? "#3b82f6" : "#f59e0b",
                  padding: "2px 10px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                }}>
                  {p.samRating}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {article.tags.map((tag, i) => (
            <span key={i} style={{
              padding: "3px 10px",
              borderRadius: 12,
              fontSize: 11,
              background: "rgba(71,85,105,0.3)",
              color: "#94a3b8",
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* AI attribution */}
      <div style={{ marginTop: 32, padding: "12px 16px", borderRadius: 8, background: "rgba(59,130,246,0.08)", borderLeft: "3px solid #3b82f6", color: "#64748b", fontSize: 12 }}>
        This SAM Report was generated using real match data and SAM ratings.
      </div>
    </div>
  );
};

/* ── League Carousel Constants ── */
const LEAGUE_GRADIENTS = {
  premier_league: "linear-gradient(135deg, #3d195b 0%, #1a0d2e 50%, #2d1650 100%)",
  la_liga: "linear-gradient(135deg, #1a237e 0%, #0d1240 50%, #1a1a3a 100%)",
  serie_a: "linear-gradient(135deg, #024494 0%, #01224a 50%, #013366 100%)",
  bundesliga: "linear-gradient(135deg, #8b0a0a 0%, #1a0d0d 50%, #2a1a1a 100%)",
  ligue_1: "linear-gradient(135deg, #091c3e 0%, #0d1722 50%, #0f1f30 100%)",
  ekstraklasa: "linear-gradient(135deg, #8b1a0a 0%, #1a0d0d 50%, #2a1a1a 100%)",
  champions_league: "linear-gradient(135deg, #0d1b4a 0%, #0a1230 50%, #0d1940 100%)",
  mls: "linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 50%, #1a2a1a 100%)",
  liga_portugal: "linear-gradient(135deg, #004d29 0%, #002d19 50%, #003d20 100%)",
};

const LEAGUE_BADGE_COLORS = {
  premier_league: "#3d195b",
  la_liga: "#e53935",
  serie_a: "#024494",
  bundesliga: "#d20515",
  ligue_1: "#091c3e",
  ekstraklasa: "#e63312",
  champions_league: "#1a73e8",
  mls: "#2d6a2e",
  liga_portugal: "#004d29",
};

const TYPE_BADGES = {
  pre_match: "PREVIEW",
  post_match: "REVIEW",
  custom: "SAM REPORT",
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

/* ── Articles Page League Carousel ── */
const ArticlesLeagueCarousel = ({ league, articles, onArticleClick, showLogos = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const trackRef = useRef(null);

  const visibleCount = 3;
  const maxIndex = Math.max(0, articles.length - visibleCount);

  useEffect(() => {
    if (trackRef.current) {
      const slideWidth = 100 / visibleCount;
      const offset = currentIndex * -slideWidth;
      trackRef.current.style.transform = `translateX(calc(${offset}% - ${currentIndex * 14 / visibleCount}px))`;
    }
  }, [currentIndex]);

  const goToPrevious = () => setCurrentIndex((p) => (p === 0 ? maxIndex : p - 1));
  const goToNext = () => setCurrentIndex((p) => (p >= maxIndex ? 0 : p + 1));

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    const end = e.changedTouches[0].clientX;
    if (touchStart - end > 50) goToNext();
    if (touchStart - end < -50) goToPrevious();
  };

  const gradient = LEAGUE_GRADIENTS[league] || LEAGUE_GRADIENTS.premier_league;
  const badgeColor = LEAGUE_BADGE_COLORS[league] || "#3d195b";
  const leagueName = LEAGUE_LABELS[league] || league;

  return (
    <div style={{ position: "relative", marginBottom: 28 }}>
      {/* League header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: badgeColor }} />
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#94a3b8",
          }}>
            {leagueName}
          </span>
          <span style={{ fontSize: 11, color: "#475569" }}>
            {articles.length} {articles.length === 1 ? "report" : "reports"}
          </span>
        </div>
      </div>

      {/* Carousel */}
      <div style={{ overflow: "hidden" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={trackRef} style={{
          display: "flex",
          gap: 14,
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}>
          {articles.map((article) => {
            const badge = TYPE_BADGES[article.type] || "SAM REPORT";

            return (
              <div
                key={article._id}
                onClick={() => onArticleClick(article.slug)}
                style={{
                  flex: `0 0 calc(${100 / visibleCount}% - ${14 * (visibleCount - 1) / visibleCount}px)`,
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  aspectRatio: "16 / 9",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {/* Gradient bg */}
                <div style={{ position: "absolute", inset: 0, background: gradient }} />

                {/* Team watermark (logos or names) */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  zIndex: 1,
                  opacity: showLogos ? 0.15 : 0.08,
                  pointerEvents: "none",
                }}>
                  {showLogos && article.homeTeamLogo ? (
                    <img src={article.homeTeamLogo} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: "brightness(2) grayscale(0.5)" }} />
                  ) : (
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>{article.homeTeam}</span>
                  )}
                  <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>vs</span>
                  {showLogos && article.awayTeamLogo ? (
                    <img src={article.awayTeamLogo} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: "brightness(2) grayscale(0.5)" }} />
                  ) : (
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>{article.awayTeam}</span>
                  )}
                </div>

                {/* Dark overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)",
                  zIndex: 2,
                }} />

                {/* Content */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "14px 16px 16px",
                  zIndex: 3,
                }}>
                  <div style={{
                    display: "inline-block",
                    background: badgeColor,
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    padding: "3px 8px",
                    borderRadius: 3,
                    marginBottom: 7,
                  }}>
                    {badge}
                  </div>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.3,
                    margin: 0,
                    textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {article.title}
                  </h3>
                  <p style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 5,
                    margin: "5px 0 0",
                  }}>
                    {formatDate(article.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows */}
      {articles.length > visibleCount && (
        <>
          <button onClick={goToPrevious} style={{
            position: "absolute", top: "55%", left: 8, transform: "translateY(-50%)",
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(13,11,30,0.8)", border: "1px solid rgba(71,85,105,0.4)",
            color: "#fff", fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 10,
            backdropFilter: "blur(8px)", transition: "all 0.2s",
          }}>&lsaquo;</button>
          <button onClick={goToNext} style={{
            position: "absolute", top: "55%", right: 8, transform: "translateY(-50%)",
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(13,11,30,0.8)", border: "1px solid rgba(71,85,105,0.4)",
            color: "#fff", fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 10,
            backdropFilter: "blur(8px)", transition: "all 0.2s",
          }}>&rsaquo;</button>
        </>
      )}
    </div>
  );
};

/* ── Main Articles Page ── */
const ArticlesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedSlug = searchParams.get("article");
  const selectedLeague = searchParams.get("league") || "";
  const selectedType = searchParams.get("type") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leagueGroups, setLeagueGroups] = useState([]);
  const [showLogos, setShowLogos] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (selectedLeague) params.league = selectedLeague;
      if (selectedType) params.type = selectedType;
      const res = await getArticles(params);
      setArticles(res.data?.data?.articles || []);
      setPagination(res.data?.data?.pagination || null);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  }, [currentPage, selectedLeague, selectedType]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // Fetch platform setting for logo toggle
  useEffect(() => {
    (async () => {
      try {
        const res = await getPlatformSettings();
        const d = res?.data?.data || res?.data || {};
        setShowLogos(d.articleTeamLogosEnabled !== false);
      } catch { /* default true */ }
    })();
  }, []);

  // Fetch grouped articles for carousels (only on initial load / no filters)
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await getArticlesGroupedByLeague(6);
        setLeagueGroups(res.data?.data?.leagues || []);
      } catch {
        setLeagueGroups([]);
      }
    };
    loadGroups();
  }, []);

  // If viewing a single article
  if (selectedSlug) {
    return (
      <div style={{ padding: "24px 20px", minHeight: "100vh", background: "#0f172a" }}>
        <ArticleDetail
          slug={selectedSlug}
          showLogos={showLogos}
          onBack={() => {
            searchParams.delete("article");
            setSearchParams(searchParams);
          }}
        />
      </div>
    );
  }

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete("page"); // Reset page on filter change
    setSearchParams(newParams);
  };

  return (
    <div style={{ padding: "24px 20px", minHeight: "100vh", background: "#0f172a" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>
            SAM Reports
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "6px 0 0" }}>
            Match previews and post-match reviews powered by real SAM data.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <select
            value={selectedLeague}
            onChange={(e) => updateFilter("league", e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(71,85,105,0.5)",
              background: "#1e293b",
              color: "#e2e8f0",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {LEAGUES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => updateFilter("type", e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(71,85,105,0.5)",
              background: "#1e293b",
              color: "#e2e8f0",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value="">All Types</option>
            <option value="pre_match">Pre-Match Previews</option>
            <option value="post_match">Post-Match Reviews</option>
          </select>
        </div>

        {/* Per-League Carousels (shown when no league filter is active) */}
        {!selectedLeague && leagueGroups.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            {leagueGroups.map((group) => (
              <ArticlesLeagueCarousel
                key={group.league}
                league={group.league}
                articles={group.articles}
                showLogos={showLogos}
                onArticleClick={(slug) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("article", slug);
                  setSearchParams(newParams);
                }}
              />
            ))}
          </div>
        )}

        {/* All Articles Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: "#3b82f6" }} />
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#94a3b8",
          }}>
            {selectedLeague ? (LEAGUE_LABELS[selectedLeague] || "All") : "All"} Reports
          </span>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading articles...</div>
        ) : articles.length === 0 ? (
          <div style={{ color: "#64748b", textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No articles found</p>
            <p style={{ fontSize: 13 }}>Articles are automatically generated before and after matches.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {articles.map((a) => (
              <ArticleCard
                key={a._id}
                article={a}
                showLogos={showLogos}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("article", a.slug);
                  setSearchParams(newParams);
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", String(currentPage - 1))}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(71,85,105,0.5)",
                background: "#1e293b", color: "#e2e8f0", cursor: currentPage <= 1 ? "default" : "pointer",
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ color: "#94a3b8", padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center" }}>
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              disabled={currentPage >= pagination.pages}
              onClick={() => updateFilter("page", String(currentPage + 1))}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(71,85,105,0.5)",
                background: "#1e293b", color: "#e2e8f0", cursor: currentPage >= pagination.pages ? "default" : "pointer",
                opacity: currentPage >= pagination.pages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
export { ArticleCard };
