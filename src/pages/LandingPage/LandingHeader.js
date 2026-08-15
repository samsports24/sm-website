import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePartner } from '../../contexts/PartnerContext';

const LandingHeader = ({ isAuthenticated, onLoginClick, onLogout }) => {
  const navigate = useNavigate();
  // FANTASY is two products on two domains. The dropdown splits them: NFL stays
  // here on samsports.io, soccer lives on football.samsports.io.
  const [fantasyOpen, setFantasyOpen] = useState(false);
  const SOCCER_FANTASY = 'https://football.samsports.io';

  const fantasyItemStyle = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
    background: 'transparent', border: 'none', color: '#E8EBF0', cursor: 'pointer',
    padding: '10px 12px', borderRadius: 8, transition: 'background 0.12s ease',
  };
  const { lang, changeLang, t } = useLanguage();
  const { isPartnerSite, logo, businessName } = usePartner();

  const languages = ['en', 'fr', 'es', 'pt'];

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLanguageChange = (newLang) => {
    changeLang(newLang);
  };

  return (
    <>
    <header className="ls-header">
      {/* Logo Section */}
      <a href="#" onClick={(e) => { e.preventDefault(); handleLogoClick(); }} className="ls-logo">
        <img
          src={isPartnerSite && logo ? logo : "/samsports-logo.svg"}
          alt={isPartnerSite ? businessName : "SAMSports"}
          className="ls-logo-icon"
          style={isPartnerSite && logo ? { borderRadius: 6, objectFit: 'contain' } : {}}
        />
        <span className="ls-logo-text">{isPartnerSite ? businessName.toUpperCase() : 'SAMSPORTS'}</span>
      </a>

      {/* Sport nav removed per request — sport switching lives in the
          Live & Upcoming panel's in-panel tabs. */}
      <div className="ls-sport-tabs" />

      {/* Right Section - Language Switcher, Auth Buttons & Badges */}
      <div className="ls-hdr-right">
        {/* Fantasy — a dropdown, because it's two products on two domains. */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setFantasyOpen(true)}
          onMouseLeave={() => setFantasyOpen(false)}
        >
          {/* Clicking FANTASY goes straight to the NFL fantasy page
              (samsports.io/fantasy). Hovering still opens the dropdown to pick
              NFL vs Soccer — so the default click does the common thing and the
              menu is there for the choice. */}
          <button
            onClick={() => { setFantasyOpen(false); navigate('/fantasy'); }}
            style={{
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.45)',
              color: '#22C55E', borderRadius: 8, padding: '7px 16px', fontWeight: 800,
              fontSize: 12, letterSpacing: 0.5, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            FANTASY ▾
          </button>

          {fantasyOpen && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
                minWidth: 200, background: '#0F131C', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => { setFantasyOpen(false); navigate('/fantasy'); }}
                style={fantasyItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 15 }}>🏈</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 800 }}>NFL Fantasy</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                    Values · Injuries · Predictor · Mock draft
                  </span>
                </span>
              </button>
              <button
                onClick={() => { setFantasyOpen(false); window.location.href = SOCCER_FANTASY; }}
                style={fantasyItemStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 15 }}>⚽</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 800 }}>Soccer Fantasy</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                    World Cup · Leagues · Transfer/Keep/Loan
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="ls-lang-switcher">
          {languages.map((language) => (
            <button
              key={language}
              className={`ls-lang-btn ${lang === language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language)}
            >
              {language.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Status Badges */}
        <div className="ls-badge ls-badge-live">{t('live')}</div>

        {/* Fantasy Auth Buttons */}
        {!isAuthenticated ? (
          <div className="ls-auth-btns">
            <button className="ls-auth-btn ls-auth-btn--login" onClick={onLoginClick}>
              {t('logIn')}
            </button>
            <button className="ls-auth-btn ls-auth-btn--signup" onClick={() => navigate('/select-game')}>
              {t('signUp')}
            </button>
          </div>
        ) : (
          <div className="ls-auth-btns">
            <button className="ls-auth-btn ls-auth-btn--play" onClick={() => navigate('/hub')}>
              {t('frontOffice')}
            </button>
            <button className="ls-auth-btn ls-auth-btn--logout" onClick={onLogout}>
              {t('logOut')}
            </button>
          </div>
        )}
      </div>
    </header>
    </>
  );
};

export default LandingHeader;
