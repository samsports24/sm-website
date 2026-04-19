import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const DataRights = () => {
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
          <div className='legal-header-badge'>DR</div>
          <h1>Data Rights</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. Overview</h2>
            <p>
              SamSports respects your right to control your personal data. This page explains how you can
              exercise your data rights regardless of where you are located. Depending on your jurisdiction,
              you may have additional rights under the GDPR, UK GDPR, CCPA/CPRA, or other applicable laws.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Your Data Rights</h2>

            <h3>2.1 Right to Know</h3>
            <p>
              You can request information about what personal data we have collected, the categories of sources,
              the business purpose for collection, and the categories of third parties with whom we share data.
            </p>

            <h3>2.2 Right to Access</h3>
            <p>
              You can request a copy of the personal data we hold about you. We will provide this in a
              portable, commonly used format (JSON or CSV) within 30 days.
            </p>

            <h3>2.3 Right to Correct</h3>
            <p>
              You can update or correct inaccurate personal data. Many fields can be updated directly in your
              SamSports account settings. For data you cannot change yourself, submit a request and we will
              correct it promptly.
            </p>

            <h3>2.4 Right to Delete</h3>
            <p>
              You can request that we delete your personal data. Upon receiving a verified request, we will
              delete your data within 30 days, except where retention is required by law (e.g., tax records,
              fraud prevention, or legal disputes).
            </p>

            <h3>2.5 Right to Opt Out</h3>
            <p>
              You can opt out of the sale or sharing of your personal data at any time. SamSports does not
              sell personal data. You can opt out of marketing communications via your account settings or
              the unsubscribe link in any marketing email.
            </p>

            <h3>2.6 Right to Non-Discrimination</h3>
            <p>
              We will not discriminate against you for exercising your data rights. You will receive equal
              service and pricing regardless of whether you exercise these rights.
            </p>
          </section>

          <section className='legal-section'>
            <h2>3. How to Submit a Request</h2>
            <p>You can exercise your data rights through any of the following methods:</p>
            <ul className='legal-list'>
              <li><strong>Email:</strong> <a href='mailto:hello@samsports.io'>hello@samsports.io</a></li>
              <li><strong>In-app:</strong> Account Settings &rarr; Privacy &rarr; Data Rights</li>
              <li><strong>Mail:</strong> Samsports.io — Attn: Data Rights, [address on file]</li>
            </ul>
            <p>
              Please include your full name, the email address associated with your account, and a description
              of the right you wish to exercise. We may need to verify your identity before processing the request.
            </p>
          </section>

          <section className='legal-section'>
            <h2>4. Response Timeline</h2>
            <p>
              We will acknowledge your request within 5 business days and provide a substantive response
              within 30 days. If we need additional time (up to 60 days for complex requests), we will
              notify you of the extension and the reason.
            </p>
          </section>

          <section className='legal-section'>
            <h2>5. Data Portability</h2>
            <p>
              You can request an export of your SamSports data, including your profile, league history,
              draft records, trade history, lineup history, and scoring data. Exports are delivered in
              machine-readable format (JSON or CSV).
            </p>
          </section>

          <section className='legal-section'>
            <h2>6. Account Deletion</h2>
            <p>
              To permanently delete your SamSports account and all associated data, go to Account Settings
              &rarr; Privacy &rarr; Delete Account. Alternatively, email{' '}
              <a href='mailto:hello@samsports.io'>hello@samsports.io</a> with the subject line
              &quot;Account Deletion Request.&quot; Account deletion is irreversible. Active league memberships and
              outstanding balances must be resolved before deletion.
            </p>
          </section>

          <section className='legal-section'>
            <h2>7. Jurisdiction-Specific Rights</h2>
            <ul className='legal-list'>
              <li><strong>EU/UK residents:</strong> See our <a href='/eu-privacy' style={{ color: '#3b82f6' }}>EU Privacy Rights</a> and <a href='/gdpr' style={{ color: '#3b82f6' }}>GDPR Compliance</a> pages.</li>
              <li><strong>California residents:</strong> Under the CCPA/CPRA, you have the right to know, delete, correct, and opt out. SamSports does not sell your personal data.</li>
              <li><strong>Other US states:</strong> We comply with state-level privacy laws including the Virginia CDPA, Colorado CPA, Connecticut CTDPA, and others as applicable.</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>8. Contact</h2>
            <p>
              For questions about your data rights or to submit a request, contact us at{' '}
              <a href='mailto:hello@samsports.io'>hello@samsports.io</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DataRights
