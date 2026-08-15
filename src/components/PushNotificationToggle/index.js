import React, { useEffect, useState } from 'react'
import { notification } from 'antd'
import { BellOutlined, CheckCircleFilled } from '@ant-design/icons'
import { oneSignalConfigured, oneSignalPermission, promptOneSignal } from '../../utils/oneSignal'
import { privateAPI, attachToken } from '../../config/constants'

// Persistent notifications control for Settings. Unlike the dismissible draft
// banner, this always lets a user turn web push on — or see that it's already on
// (or blocked at the browser level, which only the user can undo in site
// settings). Reads the live browser permission so the state is always accurate.
export default function PushNotificationToggle() {
  const configured = oneSignalConfigured()
  const [perm, setPerm] = useState('default') // 'granted' | 'denied' | 'default'
  const [busy, setBusy] = useState(false)
  const [testing, setTesting] = useState(false)

  const sendTest = async () => {
    setTesting(true)
    try {
      attachToken()
      const { data } = await privateAPI.get('/notification/push-test')
      const r = data?.data || {}
      if (r.configured === false) {
        notification.warning({ message: 'Push not set up on the server', description: 'The server is missing its OneSignal key — contact the admin.', duration: 6 })
      } else if (r.recipients > 0) {
        notification.success({ message: `Test sent to ${r.recipients} device(s)`, description: 'Check your notifications. If nothing appears, check your OS/Do-Not-Disturb settings.', duration: 6 })
      } else {
        notification.error({ message: 'No subscribed device found', description: 'This device isn’t registered for push under your account yet. Toggle notifications off and on again here, and make sure you allowed them in the browser prompt.', duration: 8 })
      }
    } catch (e) {
      notification.error({ message: 'Test failed', description: e?.response?.data?.message || 'Could not reach the server.', duration: 5 })
    } finally {
      setTesting(false)
    }
  }

  const refresh = () => {
    if (typeof Notification !== 'undefined') {
      setPerm(Notification.permission)
      return
    }
    oneSignalPermission().then((p) => setPerm(p === 'granted' ? 'granted' : 'default'))
  }

  useEffect(() => { refresh() }, [])

  if (!configured) return null

  const enable = async () => {
    setBusy(true)
    await promptOneSignal()
    setBusy(false)
    refresh()
  }

  const isOn = perm === 'granted'
  const isBlocked = perm === 'denied'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '18px 20px', marginBottom: 24,
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#22C55E', fontSize: 20,
      }}>
        <BellOutlined />
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>
          Push Notifications
        </div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginTop: 2 }}>
          {isOn
            ? "You're set — we'll alert you when you're on the clock, get outbid, or receive a trade, even with the tab closed."
            : isBlocked
              ? 'Notifications are blocked in your browser. Re-enable them for this site in your browser’s site settings, then reload.'
              : "Get alerts when you're on the clock, outbid in an auction, or sent a trade — even with the tab closed."}
        </div>
      </div>

      {isOn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#22C55E', fontWeight: 700, fontSize: 13,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)',
            borderRadius: 10, padding: '9px 16px',
          }}>
            <CheckCircleFilled /> Enabled
          </span>
          <button
            onClick={sendTest}
            disabled={testing}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 12,
              borderRadius: 10, padding: '9px 14px', cursor: testing ? 'default' : 'pointer',
            }}
          >
            {testing ? 'Sending…' : 'Send test'}
          </button>
        </div>
      ) : isBlocked ? (
        <span style={{
          flexShrink: 0, color: '#ef4444', fontWeight: 700, fontSize: 13,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '9px 16px',
        }}>
          Blocked
        </span>
      ) : (
        <button
          onClick={enable}
          disabled={busy}
          style={{
            flexShrink: 0, background: 'linear-gradient(135deg,#22C55E,#16A34A)', border: 'none',
            color: '#0A0F1A', fontWeight: 800, fontSize: 13, borderRadius: 10,
            padding: '10px 20px', cursor: busy ? 'default' : 'pointer', letterSpacing: 0.3,
          }}
        >
          {busy ? 'Enabling…' : 'Enable notifications'}
        </button>
      )}
    </div>
  )
}
