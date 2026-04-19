import { useNavigate } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const Footer = () => {
  const navigate = useNavigate()

  const go = (path) => (e) => {
    e.preventDefault()
    if (path.startsWith('http')) { window.open(path, '_blank', 'noopener'); return }
    navigate(path)
  }

  return (
    <footer className="ls-footer">
      <div className="ls-footer-inner">

        {/* ── Column 1: Brand ── */}
        <div className="ls-footer-col ls-footer-brand-col">
          <div className="ls-footer-logo" onClick={go('/')}>
            <span className="ls-footer-logo-sam">SAM</span>
            <span className="ls-footer-logo-sports">SPORTS</span>
          </div>
          <p className="ls-footer-tagline">Fantasy Sports Reimagined</p>
        </div>

        {/* ── Column 2: Fantasy ── */}
        <div className="ls-footer-col">
          <h4 className="ls-footer-heading">Fantasy</h4>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>American Football</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>England</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>Spain</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>Italy</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>Germany</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>France</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>Poland</a>
          <a href="/products/cl-fantasy" onClick={go('/products/cl-fantasy')}>Europe (CL)</a>
          <a href="/select-game" onClick={go('/select-game')}>World Cup 2026</a>
        </div>

        {/* ── Column 3: Products ── */}
        <div className="ls-footer-col">
          <h4 className="ls-footer-heading">Products</h4>
          <a href="/products/rivals" onClick={go('/products/rivals')}>SAM Rivals</a>
          <a href="/products/cl-fantasy" onClick={go('/products/cl-fantasy')}>CL Fantasy</a>
          <a href="/products/draft-leagues" onClick={go('/products/draft-leagues')}>Dynasty Fantasy</a>
          <a href="/products/predictor" onClick={go('/products/predictor')}>Predictor</a>
          <a href="/rule-book/gm-rating" onClick={go('/rule-book/gm-rating')}>GM Rankings</a>
          <a href="/select-game" onClick={go('/select-game')}>Sign Up Free</a>
        </div>

        {/* ── Column 4: Quick Links ── */}
        <div className="ls-footer-col">
          <h4 className="ls-footer-heading">Quick Links</h4>
          <a href="/about" onClick={go('/about')}>About SamSports</a>
          <a href="/products/how-it-works" onClick={go('/products/how-it-works')}>How It Works</a>
          <a href="/products/sam-metric" onClick={go('/products/sam-metric')}>SAM Metric</a>
          <a href="/products/sampoints" onClick={go('/products/sampoints')}>SamPoints</a>
          <a href="/faq" onClick={go('/faq')}>FAQ</a>
          <a href="/glossary" onClick={go('/glossary')}>Glossary</a>
        </div>

        {/* ── Column 5: Follow Us ── */}
        <div className="ls-footer-col">
          <h4 className="ls-footer-heading">Follow SamSports</h4>
          <a href="https://x.com/SamSports" onClick={go('https://x.com/SamSports')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Twitter/X
          </a>
          <a href="https://instagram.com/samsportsio" onClick={go('https://instagram.com/samsportsio')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Instagram
          </a>
          <a href="https://tiktok.com/@samsportsio" onClick={go('https://tiktok.com/@samsportsio')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.12a8.16 8.16 0 0 0 3.85.97V6.69z"/></svg>
            TikTok
          </a>
          <a href="https://youtube.com/@samsportsio" onClick={go('https://youtube.com/@samsportsio')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>
            YouTube
          </a>
          <a href="https://discord.gg/samsports" onClick={go('https://discord.gg/samsports')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
            Discord
          </a>
        </div>
      </div>

      {/* ── Bottom Bar: Legal ── */}
      <div className="ls-footer-bottom">
        <div className="ls-footer-bottom-inner">
          <div className="ls-footer-legal-links">
            <a href="/terms" onClick={go('/terms')}>Terms of Use</a>
            <span className="ls-footer-dot" />
            <a href="/privacy" onClick={go('/privacy')}>Privacy Policy</a>
            <span className="ls-footer-dot" />
            <a href="/eu-privacy" onClick={go('/eu-privacy')}>EU Privacy Rights</a>
            <span className="ls-footer-dot" />
            <a href="/cookies" onClick={go('/cookies')}>Cookie Policy</a>
            <span className="ls-footer-dot" />
            <a href="/gdpr" onClick={go('/gdpr')}>GDPR Compliance</a>
            <span className="ls-footer-dot" />
            <a href="/data-rights" onClick={go('/data-rights')}>Data Rights</a>
            <span className="ls-footer-dot" />
            <a href="/contact" onClick={go('/contact')}>Contact Us</a>
          </div>
          <p className="ls-footer-copy">
            &copy; {YEAR} SamSports.io &mdash; All rights reserved. SamSports is not affiliated with the NFL, UEFA, or any sports league.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
