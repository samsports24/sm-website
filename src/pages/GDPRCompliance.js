import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const GDPRCompliance = () => {
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
          <div className='legal-header-badge'>GD</div>
          <h1>GDPR Compliance</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. Our Commitment</h2>
            <p>
              Samsports.io (&quot;SamSports&quot;) is committed to complying with the General Data Protection
              Regulation (EU) 2016/679 (&quot;GDPR&quot;) and the UK GDPR. This page outlines our approach to data
              protection, the measures we take to safeguard your personal data, and how we meet our
              obligations as a data controller.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Data Controller</h2>
            <p>
              Samsports.io is the data controller for personal data processed through the SamSports
              platform. For inquiries regarding data protection, please contact:
            </p>
            <ul className='legal-list'>
              <li>Contact: <a href='mailto:hello@samsports.io'>hello@samsports.io</a></li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>3. Data Protection Principles</h2>
            <p>We adhere to the core principles of the GDPR:</p>
            <ul className='legal-list'>
              <li><strong>Lawfulness, fairness, and transparency</strong> &mdash; We process data lawfully and are transparent about our practices.</li>
              <li><strong>Purpose limitation</strong> &mdash; We collect data for specified, explicit, and legitimate purposes.</li>
              <li><strong>Data minimization</strong> &mdash; We only collect data that is necessary for the stated purpose.</li>
              <li><strong>Accuracy</strong> &mdash; We take steps to ensure personal data is accurate and up to date.</li>
              <li><strong>Storage limitation</strong> &mdash; We retain data only for as long as necessary.</li>
              <li><strong>Integrity and confidentiality</strong> &mdash; We protect data with appropriate security measures.</li>
              <li><strong>Accountability</strong> &mdash; We document compliance and can demonstrate it on request.</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>4. Technical and Organizational Measures</h2>
            <p>We implement appropriate safeguards to protect your personal data, including:</p>
            <ul className='legal-list'>
              <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls with role-based permissions and multi-factor authentication</li>
              <li>Secure, SOC 2-compliant cloud infrastructure</li>
              <li>Incident response procedures with notification within 72 hours of a breach</li>
              <li>Staff training on data protection and privacy awareness</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>5. Data Processing Activities</h2>
            <p>We maintain a Record of Processing Activities (ROPA) covering:</p>
            <ul className='legal-list'>
              <li><strong>Account management</strong> &mdash; Registration, authentication, profile data</li>
              <li><strong>Fantasy league operations</strong> &mdash; Draft picks, lineups, scores, trades, standings</li>
              <li><strong>Payment processing</strong> &mdash; Contest entries, SamPoints purchases (via Stripe)</li>
              <li><strong>Communications</strong> &mdash; In-app messaging, push notifications, email updates</li>
              <li><strong>Analytics</strong> &mdash; Usage patterns, feature engagement, performance monitoring</li>
              <li><strong>Support</strong> &mdash; Help requests, bug reports, feedback</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>6. Sub-Processors</h2>
            <p>
              We engage trusted sub-processors to help deliver the Service. Each sub-processor is bound by
              data-processing agreements that require GDPR-equivalent protections. Key sub-processors include:
            </p>
            <ul className='legal-list'>
              <li>DigitalOcean (hosting and infrastructure)</li>
              <li>MongoDB Atlas (database services)</li>
              <li>Stripe (payment processing)</li>
              <li>Google Analytics (website analytics)</li>
              <li>SendGrid (transactional email)</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>7. Data Breach Notification</h2>
            <p>
              In the event of a personal data breach that poses a risk to the rights and freedoms of
              individuals, we will notify the relevant supervisory authority within 72 hours of becoming
              aware of the breach. Where the breach is likely to result in a high risk to you, we will
              also notify you directly without undue delay.
            </p>
          </section>

          <section className='legal-section'>
            <h2>8. Data Protection Impact Assessments</h2>
            <p>
              We conduct Data Protection Impact Assessments (DPIAs) for processing activities that are
              likely to result in a high risk to individuals, including the introduction of new features
              involving automated decision-making, large-scale profiling, or sensitive data processing.
            </p>
          </section>

          <section className='legal-section'>
            <h2>9. Your Rights</h2>
            <p>
              For a full description of your rights under the GDPR, including access, rectification, erasure,
              portability, and the right to object, please see our{' '}
              <a href='/eu-privacy' style={{ color: '#3b82f6' }}>EU Privacy Rights</a> page.
            </p>
          </section>

          <section className='legal-section'>
            <h2>10. Contact</h2>
            <p>
              For GDPR-related inquiries or to make a data subject request, please contact us
              at <a href='mailto:hello@samsports.io'>hello@samsports.io</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default GDPRCompliance
