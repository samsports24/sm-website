import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const PrivacyPolicy = () => {
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
          <div className='legal-header-badge'>PP</div>
          <h1>Privacy Policy</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. Introduction</h2>
            <p>
              Samsports.io (&quot;SamSports,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy
              of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              personal information when you access or use the SamSports website, mobile application, and
              related services (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By using the Service, you consent to the practices described in this Privacy Policy. If you
              do not agree, please discontinue use of the Service.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>When you create an account, enter contests, or interact with the Service, we may collect:</p>
            <ul className='legal-list'>
              <li>Name, email address, date of birth, and mailing address</li>
              <li>Username and password</li>
              <li>Payment information (processed securely by third-party payment providers)</li>
              <li>League preferences, team names, and fantasy roster selections</li>
              <li>Communications you send to us (support inquiries, feedback, chat messages)</li>
              <li>State of residence (for eligibility verification in paid contests)</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you use the Service, we may automatically collect:</p>
            <ul className='legal-list'>
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>IP address and approximate geolocation</li>
              <li>Usage data (pages visited, features used, time spent, click patterns)</li>
              <li>Cookies and similar tracking technologies (see Section 7)</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information from third-party services you connect to your SamSports account,
              sports data providers, payment processors, and identity verification services.
            </p>
          </section>

          <section className='legal-section'>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className='legal-list'>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process contest entries, calculate scores, and distribute prizes</li>
              <li>Manage your account and authenticate your identity</li>
              <li>Process payments and prevent fraud</li>
              <li>Verify eligibility for paid contests based on age and jurisdiction</li>
              <li>Communicate with you about your account, contests, and Service updates</li>
              <li>Send promotional messages (with your consent, where required)</li>
              <li>Analyze usage trends to improve user experience and develop new features</li>
              <li>Enforce our Terms of Service and protect the safety and integrity of contests</li>
              <li>Comply with legal obligations and respond to lawful requests</li>
            </ul>
          </section>

          <section className='legal-section'>
            <h2>4. How We Share Your Information</h2>
            <p>
              We do not sell your personal information. We may share your information in the following
              circumstances:
            </p>

            <h3>4.1 With Other Users</h3>
            <p>
              Certain information is visible to other users as part of the fantasy sports experience,
              including your username, team name, league standings, roster selections, trade history, and
              contest results. Chat messages within leagues are visible to league members.
            </p>

            <h3>4.2 With Service Providers</h3>
            <p>
              We share information with trusted third-party vendors who assist us in operating the Service,
              including payment processors, hosting providers, analytics services, and customer support
              tools. These providers are contractually obligated to use your data only as necessary to
              provide their services to us.
            </p>

            <h3>4.3 For Legal Reasons</h3>
            <p>
              We may disclose your information if required by law, subpoena, or legal process, or if we
              believe in good faith that disclosure is necessary to protect the rights, property, or safety
              of SamSports, our users, or the public.
            </p>

            <h3>4.4 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, reorganization, or sale of assets, your information
              may be transferred as part of that transaction. We will notify you of any such change and
              any choices you may have regarding your information.
            </p>
          </section>

          <section className='legal-section'>
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These
              measures include encryption of data in transit and at rest, secure server infrastructure,
              access controls, and regular security assessments.
            </p>
            <p>
              However, no method of transmission over the Internet or electronic storage is completely
              secure. While we strive to protect your information, we cannot guarantee its absolute
              security.
            </p>
          </section>

          <section className='legal-section'>
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to
              provide the Service. We may also retain information to comply with legal obligations, resolve
              disputes, enforce our agreements, and for legitimate business purposes such as maintaining
              historical contest records and league archives.
            </p>
            <p>
              When your data is no longer needed, we will securely delete or anonymize it in accordance
              with our data retention policies.
            </p>
          </section>

          <section className='legal-section'>
            <h2>7. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and
              deliver relevant content. Types of cookies we use include:
            </p>
            <ul className='legal-list'>
              <li><strong>Essential cookies:</strong> Required for the Service to function (authentication, security, session management)</li>
              <li><strong>Analytics cookies:</strong> Help us understand how users interact with the Service</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences (theme, league defaults)</li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings. Disabling certain cookies
              may affect the functionality of the Service.
            </p>
          </section>

          <section className='legal-section'>
            <h2>8. Your Rights &amp; Choices</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className='legal-list'>
              <li>Access and receive a copy of the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Object to or restrict certain processing of your data</li>
              <li>Data portability (receive your data in a structured, machine-readable format)</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at hello@samsports.io. We will respond to
              your request within the timeframe required by applicable law.
            </p>

            <h3>8.1 California Residents (CCPA)</h3>
            <p>
              California residents have additional rights under the California Consumer Privacy Act,
              including the right to know what personal information is collected, request deletion, and
              opt out of the sale of personal information. SamSports does not sell personal information
              as defined by the CCPA.
            </p>

            <h3>8.2 European Users (GDPR)</h3>
            <p>
              If you are located in the European Economic Area, you have additional rights under the
              General Data Protection Regulation, including the right to lodge a complaint with a
              supervisory authority.
            </p>
          </section>

          <section className='legal-section'>
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly collect
              personal information from minors. If we become aware that a user under 18 has provided us
              with personal information, we will take steps to delete that information promptly. If you
              believe a minor has submitted personal data to us, please contact us at hello@samsports.io.
            </p>
          </section>

          <section className='legal-section'>
            <h2>10. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites or services, including sports data
              providers, news sources, and social media platforms. We are not responsible for the privacy
              practices of these third parties. We encourage you to review the privacy policies of any
              third-party services you access.
            </p>
          </section>

          <section className='legal-section'>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will
              notify you by posting the updated policy on this page with a revised effective date. For
              significant changes, we may also provide additional notice through the Service or via email.
            </p>
          </section>

          <section className='legal-section'>
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please
              contact us at:
            </p>
            <div className='legal-contact'>
              <p><strong>Samsports.io</strong></p>
              <p>Email: hello@samsports.io</p>
            </div>
          </section>
        </div>
      </div>

      <div className='legal-footer'>
        <p>&copy; {new Date().getFullYear()} Samsports.io All rights reserved.</p>
      </div>
    </div>
  )
}

export default PrivacyPolicy
