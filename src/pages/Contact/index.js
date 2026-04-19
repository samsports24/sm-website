import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Contact — SAMSports';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Get in touch with SAMSports. Email us at hello@samsports.io for support, feedback, or partnership inquiries.');
    return () => { document.title = 'SAM Sports — Fantasy NFL League | Draft, Trade & Compete'; };
  }, []);

  const s = {
    container: {
      maxWidth: '760px',
      margin: '0 auto',
      padding: '80px 20px',
      fontFamily: 'inherit',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
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
      fontSize: '36px',
      fontWeight: '700',
      color: '#f9fafb',
      marginBottom: '12px',
    },
    subtitle: {
      fontSize: '18px',
      lineHeight: '1.6',
      color: '#9ca3af',
      marginBottom: '40px',
      maxWidth: '500px',
      margin: '0 auto 40px',
    },
    emailLink: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#22C55E',
      textDecoration: 'none',
      transition: 'opacity 0.2s ease',
    },
    emailLinkHover: {
      opacity: '0.8',
    },
    description: {
      fontSize: '15px',
      color: '#9ca3af',
      lineHeight: '1.8',
      marginTop: '40px',
      maxWidth: '500px',
      margin: '40px auto 0',
    },
    footer: {
      marginTop: '80px',
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
      <div style={s.eyebrow}>Get in Touch</div>
      <h1 style={s.title}>Contact Us</h1>
      <p style={s.subtitle}>
        Have questions about SAMSports? We&apos;d love to hear from you.
      </p>

      <a
        href="mailto:hello@samsports.io"
        style={s.emailLink}
        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        hello@samsports.io
      </a>

      <p style={s.description}>
        Send us a message with any questions, feedback, or inquiries about our fantasy sports platform. We typically respond within 24 hours.
      </p>

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

export default Contact;
