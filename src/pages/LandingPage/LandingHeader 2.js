import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPORT_TABS } from './constants';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePartner } from '../../contexts/PartnerContext';

const LandingHeader = ({ activeSport, onSportChange, isAuthenticated, onLoginClick, onLogout }) => {
  const navigate = useNavigate();
  const tabsContainerRef = useRef(null);
  const { lang, changeLang, t } = useLanguage();
  const { isPartnerSite, logo, businessName } = usePartner();

  const languages = ['en', 'fr', 'es', 'pt'];

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleTabClick = (sportKey) => {
    onSportChange(sportKey);
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

      {/* Sport Tabs Section */}
      <div className="ls-sport-tabs" ref={tabsContainerRef}>
        {SPORT_TABS.map((sport) => (
          <button
            key={sport.key}
            className={`ls-stab ${activeSport === sport.key ? 'active' : ''} ${sport.special === 'worldcup' ? 'ls-stab-wc' : ''}`}
            onClick={() => handleTabClick(sport.key)}
            title={sport.label}
          >
            <span className="tab-emoji">{sport.emoji}</span>
            <span className="tab-label">{sport.label}</span>
          </button>
        ))}
      </div>

      {/* Right Section - Language Switcher, Auth Buttons & Badges */}
      <div className="ls-hdr-right">
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

    {/* Mobile-only sport tab bar, horizontal scrollable */}
    <div className="ls-mobile-sport-tabs">
      {SPORT_TABS.map((sport) => (
        <button
          key={sport.key}
          className={`ls-mstab ${activeSport === sport.key ? 'active' : ''} ${sport.special === 'worldcup' ? 'ls-mstab-wc' : ''}`}
          onClick={() => handleTabClick(sport.key)}
        >
          <span>{sport.emoji}</span>
          <span>{sport.label}</span>
        </button>
      ))}
    </div>
    </>
  );
};

export default LandingHeader;
