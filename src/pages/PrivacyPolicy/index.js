import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy — SAMSports';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'SAMSports Privacy Policy. How we collect, use, and protect your data. Learn about your rights, cookies, data retention, and how to contact us.');
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
      <h1 style={s.title}>Privacy Policy</h1>
      <div style={s.lastUpdated}>Last updated: April 13, 2026</div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>Introduction</h2>
        <p style={s.bodyText}>
          SAMSports ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>1. Information We Collect</h2>
        <p style={s.bodyText}>
          We collect information from you in several ways:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}><strong>Account Information</strong> - Name, email address, username, and other account credentials you provide during registration</li>
          <li style={s.listItem}><strong>Profile Information</strong> - Profile picture, bio, preferred sports, and other details you add to your profile</li>
          <li style={s.listItem}><strong>Payment Information</strong> - Billing address and payment method details are processed securely through Stripe; we do not store full credit card numbers</li>
          <li style={s.listItem}><strong>Communications</strong> - Messages, league chat, and communications you send through our platform</li>
          <li style={s.listItem}><strong>Usage Data</strong> - Information about how you interact with the platform, including pages visited, features used, and actions taken</li>
          <li style={s.listItem}><strong>Device Information</strong> - Device type, operating system, browser type, IP address, and unique device identifiers</li>
          <li style={s.listItem}><strong>Cookies and Tracking Technologies</strong> - We use cookies, pixels, and similar technologies to improve your experience</li>
        </ul>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>2. How We Use Your Information</h2>
        <p style={s.bodyText}>
          We use the information we collect for various purposes:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}>To provide, maintain, and improve the SAMSports platform</li>
          <li style={s.listItem}>To process your account registration and subscriptions</li>
          <li style={s.listItem}>To process payments and send related information</li>
          <li style={s.listItem}>To send you service-related announcements and updates</li>
          <li style={s.listItem}>To respond to your inquiries and provide customer support</li>
          <li style={s.listItem}>To personalize your experience and deliver relevant content</li>
          <li style={s.listItem}>To analyze usage patterns and improve platform functionality</li>
          <li style={s.listItem}>To comply with legal obligations and enforce our terms</li>
          <li style={s.listItem}>To detect, prevent, and address fraud and security issues</li>
        </ul>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>3. Information Sharing</h2>
        <p style={s.bodyText}>
          We may share your information in the following circumstances:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}><strong>Other Users in Your Leagues</strong> - Your profile name, team name, and performance statistics are visible to other players in your leagues</li>
          <li style={s.listItem}><strong>Stripe Payment Processor</strong> - Payment information is shared with Stripe to process transactions securely</li>
          <li style={s.listItem}><strong>Legal Requirements</strong> - We may disclose information when required by law, court order, or to protect our legal rights</li>
          <li style={s.listItem}><strong>Service Providers</strong> - We may share information with third-party service providers who assist in operating our platform, subject to confidentiality agreements</li>
        </ul>
        <p style={s.bodyText}>
          We do not sell or rent your personal information to third parties for marketing purposes.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>4. Data Security</h2>
        <p style={s.bodyText}>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure. While we strive to protect your data, we cannot guarantee absolute security.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>5. Data Retention</h2>
        <p style={s.bodyText}>
          We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. You may request deletion of your account and associated data at any time by contacting us, subject to legal retention requirements.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>6. Your Rights</h2>
        <p style={s.bodyText}>
          Depending on your location, you may have certain rights regarding your personal information, including the right to:
        </p>
        <ul style={s.list}>
          <li style={s.listItem}>Access and review your personal information</li>
          <li style={s.listItem}>Correct inaccurate information</li>
          <li style={s.listItem}>Request deletion of your information</li>
          <li style={s.listItem}>Opt out of certain data uses</li>
          <li style={s.listItem}>Request a portable copy of your data</li>
        </ul>
        <p style={s.bodyText}>
          To exercise these rights, please contact us at{' '}
          <a href="mailto:hello@samsports.io" style={s.link}>hello@samsports.io</a>.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>7. Cookies</h2>
        <p style={s.bodyText}>
          We use cookies and similar tracking technologies to enhance your experience on SAMSports. Cookies help us remember your preferences, understand how you use the platform, and deliver personalized content. You can control cookie settings through your browser, though disabling cookies may affect platform functionality.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>8. Children's Privacy</h2>
        <p style={s.bodyText}>
          SAMSports is intended for users 18 years of age and older. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete such information and terminate the child's account.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>9. International Transfers</h2>
        <p style={s.bodyText}>
          Your personal information may be transferred to, stored in, and processed in countries other than your country of residence. By using SAMSports, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection rules.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>10. Changes to This Privacy Policy</h2>
        <p style={s.bodyText}>
          We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated Privacy Policy and updating the "Last updated" date. Your continued use of SAMSports following the posting of revised terms means you accept and agree to the changes.
        </p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionHeading}>11. Contact Us</h2>
        <p style={s.bodyText}>
          If you have questions about this Privacy Policy or our privacy practices, please contact us at{' '}
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

export default PrivacyPolicy;
