import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const CookiePolicy = () => {
  const navigate = useNavigate()

  return (
    <div className='legal-page'>
      <div className='legal-topbar'>
        <button className='legal-back' onClick={() => navigate(-1)}>
          <LeftOutlined /> Back
        </button>
        <div className='legal-logo'>
          <span>SAMSPORTS</span>
        </div>
        <div className='legal-topbar-spacer' />
      </div>

      <div className='legal-container'>
        <div className='legal-header'>
          <div className='legal-header-badge'>CK</div>
          <h1>Cookie Policy</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are
              widely used to make websites work efficiently and to provide information to site owners.
              SamSports uses cookies and similar technologies (local storage, pixels, beacons) to operate,
              secure, and improve the Service.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Types of Cookies We Use</h2>

            <h3>2.1 Essential Cookies</h3>
            <p>
              These cookies are strictly necessary for the Service to function. They enable core features
              such as authentication, session management, security, and load balancing. Without these cookies,
              the Service cannot operate. These cookies do not require your consent.
            </p>
            <ul className='legal-list'>
              <li><strong>Session tokens</strong> &mdash; Keep you logged in during your visit</li>
              <li><strong>CSRF tokens</strong> &mdash; Protect against cross-site request forgery</li>
              <li><strong>Load balancer cookies</strong> &mdash; Route requests to the correct server</li>
            </ul>

            <h3>2.2 Functional Cookies</h3>
            <p>
              These cookies remember your preferences and choices to provide a more personalized experience,
              such as your preferred sport, league display settings, dark/light mode, and language.
            </p>

            <h3>2.3 Analytics Cookies</h3>
            <p>
              We use analytics cookies to understand how visitors interact with the Service. This helps us
              improve performance, fix bugs, and prioritize features. Data collected is aggregated and
              anonymized where possible.
            </p>
            <ul className='legal-list'>
              <li><strong>Google Analytics</strong> &mdash; Page views, session duration, navigation paths</li>
              <li><strong>Internal analytics</strong> &mdash; Feature usage, draft completion rates, engagement</li>
            </ul>

            <h3>2.4 Marketing Cookies</h3>
            <p>
              These cookies are used to deliver relevant advertisements and measure advertising campaign
              performance. They may be placed by third-party advertising partners. You may opt out of
              marketing cookies at any time.
            </p>
          </section>

          <section className='legal-section'>
            <h2>3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We do not control
              these cookies. Third parties that may set cookies through the Service include:
            </p>
            <ul className='legal-list'>
              <li>Google (Analytics, Ads)</li>
              <li>Stripe (payment processing)</li>
              <li>Social media platforms (when you use social sharing features)</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>4. Managing Your Cookie Preferences</h2>
            <p>You can control cookies in several ways:</p>
            <ul className='legal-list'>
              <li><strong>Browser settings</strong> &mdash; Most browsers allow you to refuse or delete cookies. Consult your browser&apos;s help documentation for instructions.</li>
              <li><strong>Cookie banner</strong> &mdash; When you first visit the Service, you can accept or customize which categories of cookies you allow.</li>
              <li><strong>Opt-out links</strong> &mdash; For Google Analytics, visit <em>tools.google.com/dlpage/gaoptout</em>.</li>
            </ul>
            <p>
              Please note that disabling essential cookies may prevent you from using key features of the
              Service, including logging in and managing your fantasy teams.
            </p>
          </section>

          <section className='legal-section'>
            <h2>5. Cookie Retention</h2>
            <p>
              Session cookies are deleted when you close your browser. Persistent cookies remain on your
              device for a set period (typically 30 days to 2 years) or until you delete them. Analytics
              cookies are retained for up to 26 months.
            </p>
          </section>

          <section className='legal-section'>
            <h2>6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with
              an updated &quot;Last Updated&quot; date. Continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section className='legal-section'>
            <h2>7. Contact</h2>
            <p>
              For questions about our use of cookies, please contact us at{' '}
              <a href='mailto:hello@samsports.io'>hello@samsports.io</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CookiePolicy
