import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const ComingSoon = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1A' }}>
      <Header />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
          border: '2px solid rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 36 }}>🏗️</span>
        </div>

        {/* Title */}
        <h1 style={{
          color: '#fff',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          margin: '0 0 8px',
          letterSpacing: '0.5px',
        }}>
          Coming Soon
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 15,
          maxWidth: 420,
          lineHeight: 1.6,
          margin: '0 0 32px',
        }}>
          We are building something great here. This feature is currently under
          development and will be available soon.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Rajdhani', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Rajdhani', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 16px rgba(34,197,94,0.25)',
            }}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
