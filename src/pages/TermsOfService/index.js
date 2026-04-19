import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms of Service — SAMSports';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read the SAMSports Terms of Service. Learn about account usage, platform rules, the SAM Metric, subscriptions, and your rights as a fantasy sports manager.');
    return () => { document.title = 'SAM Sports — Fantasy NFL League | Draft, Trade & Compete'; };
  }, []);

  const s = {
    container: {
      maxWidth: '760px',
      margin: '0 auto',
      padding: '60px 20px',
      fontFamily: 'inherit',
    },
    eyebrow: {
      color: '#22C55E',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: '16px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#f9fafb',
      marginBottom: '8px',
    },
    lastUpdated: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '40px',
    },
    section: {
      marginTop: '40px',
    },
    sectionHeading: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#e5e7eb',
      marginBottom: '16px',
      marginTop: '40px',
    },
    bodyText: {
      fontSize: '15px',
      lineHeight: '1.8',
      color: '#9ca3af',
      marginBottom: '16px',
    },
    list: {
      fontSize: '15px',
      lineHeight: '1.8',
      color: '#9ca3af',
      marginLeft: '20px',
      marginBottom: '16px',
    },
    listItem: {
      marginBottom: '8px',
    },
    link: {
      color: '#22C55E',
      textDecoration: 'none',
    },
    footer: {
      marginTop: '60px',
      paddingTop: '20px',
      borderTop: '1px solid #1f2937',
    },
    footerText: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '12px',
    },
    backLink: {
      color: '#22C55E',
      textDecoration: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      padding: '0',
      fontFamily: 'inherit',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.eyebrow}>LEGAL</div>
      <h1 style={s.title}>Terms of Service</h1>
      <div style={s.lastUpdated}>Last updated: April 13, 2026</div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>1. Acceptance of Terms</h2>
        <p style={s.bodyText}>
          By accessing and using the SAMSports platform, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you may not use our service.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>2. Account Registration</h2>
        <p style={s.bodyText}>
          You are responsible for maintaining the confidentiality of your account information and password. You agree to provide accurate, current, and complete information during the registration process. You are responsible for all activities that occur under your account.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>3. Platform Description</h2>
        <p style={s.bodyText}>
          SAMSports is a fantasy sports platform featuring multiple game modes and features including:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}><strong>SAM Metric</strong> - Our proprietary performance scoring system</li>
          <li style={s.listItem}><strong>Rivals H2H</strong> - Head-to-head competitive gameplay</li>
          <li style={s.listItem}><strong>Live Drafts</strong> - Real-time draft experiences</li>
          <li style={s.listItem}><strong>Transfer Market</strong> - Dynamic player trading</li>
          <li style={s.listItem}><strong>Stadium Management</strong> - Manage your virtual team</li>
          <li style={s.listItem}><strong>AI Coach</strong> - Intelligent coaching assistance</li>
        </ul>
        <p style={s.bodyText}>
          Currently available for Soccer and Football (live), with Basketball and Hockey coming soon.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>4. User Conduct</h2>
        <p style={s.bodyText}>
          You agree not to engage in any conduct that:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}>Is unlawful or violates any applicable laws or regulations</li>
          <li style={s.listItem}>Infringes upon the rights of others</li>
          <li style={s.listItem}>Is abusive, threatening, defamatory, obscene, or otherwise objectionable</li>
          <li style={s.listItem}>Attempts to disrupt or interfere with platform operations</li>
          <li style={s.listItem}>Constitutes fraud, deception, or misrepresentation</li>
          <li style={s.listItem}>Violates our fair play policies or attempts to gain unfair advantage</li>
        </ul>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>5. The SAM Metric</h2>
        <p style={s.bodyText}>
          The SAM Metric is our proprietary scoring system designed to evaluate player performance. While we strive for accuracy and fairness, the SAM Metric is provided on an "as-is" basis. SAMSports makes no warranty regarding the accuracy, timeliness, or completeness of SAM Metric calculations. Scores are for entertainment purposes and are not guarantees of actual performance or outcomes.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>6. Subscriptions and Payments</h2>
        <p style={s.bodyText}>
          Certain features of SAMSports require a subscription or payment. All payments are processed securely through Stripe. You agree to provide accurate billing information and authorize us to charge your payment method for the services you have selected. Subscription fees, if applicable, will be charged according to your selected plan. Refunds are subject to our refund policy.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>7. Intellectual Property</h2>
        <p style={s.bodyText}>
          All content on the SAMSports platform, including but not limited to text, graphics, logos, images, and software, is the property of SAMSports or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, transmit, or display any content without our prior written permission.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>8. User-Generated Content</h2>
        <p style={s.bodyText}>
          By submitting content to SAMSports (including league names, team names, messages, and other user-generated material), you grant SAMSports a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with the platform.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>9. Termination</h2>
        <p style={s.bodyText}>
          SAMSports reserves the right to terminate or suspend your account at any time for violation of these Terms of Service or any unlawful conduct. Upon termination, your right to use the platform ceases immediately.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>10. Disclaimers</h2>
        <p style={s.bodyText}>
          The SAMSports platform is provided "as-is" without warranty of any kind, express or implied. We do not warrant that the platform will be uninterrupted, error-free, or secure. Fantasy sports outcomes are unpredictable and involve risk.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>11. Limitation of Liability</h2>
        <p style={s.bodyText}>
          To the fullest extent permitted by law, SAMSports shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, revenue, or profits, arising from or related to your use of the platform.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>12. Governing Law</h2>
        <p style={s.bodyText}>
          These Terms of Service are governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in Delaware.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>13. Changes to Terms</h2>
        <p style={s.bodyText}>
          SAMSports reserves the right to modify these Terms of Service at any time. Your continued use of the platform following the posting of revised terms means that you accept and agree to the changes.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>14. Contact</h2>
        <p style={s.bodyText}>
          If you have questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:hello@samsports.io" style={s.link}>hello@samsports.io</a>.
        </p>
      </div>

      <div style={s.footer}>
        <div style={s.footerText}>© 2026 SAMSports. All rights reserved.</div>
        <button
          onClick={() => navigate('/')}
          style={s.backLink}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default TermsOfService;
