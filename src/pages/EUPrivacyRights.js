import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const EUPrivacyRights = () => {
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
          <div className='legal-header-badge'>EU</div>
          <h1>EU Privacy Rights</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. Overview</h2>
            <p>
              Samsports.io (&quot;SamSports,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects the privacy rights
              of individuals located in the European Economic Area (EEA), the United Kingdom (UK), and
              Switzerland. This page supplements our Privacy Policy and explains your specific rights under
              the General Data Protection Regulation (GDPR) and related data-protection legislation.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Legal Basis for Processing</h2>
            <p>We process your personal data only when we have a lawful basis, including:</p>
            <ul className='legal-list'>
              <li><strong>Consent</strong> &mdash; Where you have given explicit consent (e.g., marketing emails, non-essential cookies).</li>
              <li><strong>Contract Performance</strong> &mdash; To fulfill our contract with you (e.g., providing fantasy leagues, processing payments).</li>
              <li><strong>Legitimate Interests</strong> &mdash; To operate, improve, and secure the Service, provided these interests are not overridden by your rights.</li>
              <li><strong>Legal Obligation</strong> &mdash; To comply with applicable law (e.g., tax reporting, fraud prevention).</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>3. Your Rights Under the GDPR</h2>
            <p>If you are located in the EEA, UK, or Switzerland, you have the following rights:</p>

            <h3>3.1 Right of Access</h3>
            <p>
              You may request a copy of the personal data we hold about you, including what data is being
              processed, the purposes, and the categories of recipients.
            </p>

            <h3>3.2 Right to Rectification</h3>
            <p>
              You may request that we correct inaccurate or incomplete personal data. You can also update
              most information directly through your SamSports account settings.
            </p>

            <h3>3.3 Right to Erasure (&quot;Right to Be Forgotten&quot;)</h3>
            <p>
              You may request deletion of your personal data when it is no longer necessary for the purposes
              for which it was collected, when you withdraw consent, or when there is no overriding legitimate
              reason for continued processing.
            </p>

            <h3>3.4 Right to Restrict Processing</h3>
            <p>
              You may request that we limit the processing of your personal data in certain circumstances,
              for example while we verify the accuracy of contested data.
            </p>

            <h3>3.5 Right to Data Portability</h3>
            <p>
              You may request to receive your personal data in a structured, commonly used, machine-readable
              format so you can transmit it to another controller without hindrance.
            </p>

            <h3>3.6 Right to Object</h3>
            <p>
              You may object to processing based on legitimate interests, including profiling. You may also
              object to the use of your personal data for direct marketing at any time.
            </p>

            <h3>3.7 Right Not to Be Subject to Automated Decision-Making</h3>
            <p>
              You have the right not to be subject to decisions based solely on automated processing, including
              profiling, which produce legal effects concerning you or similarly significantly affect you.
            </p>
          </section>

          <section className='legal-section'>
            <h2>4. International Data Transfers</h2>
            <p>
              SamSports is based in the United States. When we transfer personal data from the EEA, UK, or
              Switzerland to the US or other countries, we rely on appropriate safeguards including:
            </p>
            <ul className='legal-list'>
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions where applicable</li>
              <li>Your explicit consent where no other mechanism is available</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in
              our Privacy Policy, unless a longer retention period is required or permitted by law. When your
              account is deleted, we will erase or anonymize your personal data within 30 days, except where
              retention is required for legal, tax, or audit purposes.
            </p>
          </section>

          <section className='legal-section'>
            <h2>6. How to Exercise Your Rights</h2>
            <p>
              To exercise any of the rights described above, please contact our Data Protection Officer at:
            </p>
            <ul className='legal-list'>
              <li>Email: <a href='mailto:hello@samsports.io'>hello@samsports.io</a></li>
              <li>Subject line: &quot;EU Privacy Rights Request&quot;</li>
            </ul>
            <p>
              We will respond to your request within 30 days. In certain cases, we may need to verify your
              identity before processing the request. If we are unable to fulfill your request, we will
              explain the reason.
            </p>
          </section>

          <section className='legal-section'>
            <h2>7. Right to Lodge a Complaint</h2>
            <p>
              If you believe that our processing of your personal data violates the GDPR, you have the right
              to lodge a complaint with a supervisory authority in the EU member state of your habitual
              residence, place of work, or place of the alleged infringement.
            </p>
          </section>

          <section className='legal-section'>
            <h2>8. Contact</h2>
            <p>
              For questions about this EU Privacy Rights notice or our privacy practices, please contact us
              at <a href='mailto:hello@samsports.io'>hello@samsports.io</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default EUPrivacyRights
