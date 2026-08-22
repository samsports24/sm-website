import React, { useState, useEffect, useCallback } from 'react'
import { notification } from 'antd'
import { UsergroupAddOutlined, CopyOutlined, ShareAltOutlined, CheckOutlined } from '@ant-design/icons'
import { privateAPI, attachToken } from '../../config/constants'

/**
 * NFL Rivals invite card.
 *
 * The link is the account's persisted referral code pointed at /nfl-rivals, so
 * an invited person lands on Rivals instead of the generic /select-game the
 * /ref/<code> handler sends everyone to.
 *
 * The reward is paid at signup on this side (authController.register), not on
 * pod entry, so "Signed up" is the number that got paid. "In a pod" is shown
 * next to it because a signup that never builds a roster is not a player.
 */
const NFLRivalsInvite = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  useEffect(function () {
    var alive = true
    ;(async function () {
      try {
        attachToken()
        var res = await privateAPI.get('/nfl-rivals/invite')
        var d = (res && res.data && (res.data.data || res.data)) || null
        if (alive) setData(d)
      } catch (e) {
        // Say so. Returning null here meant a missing endpoint rendered as
        // empty space - the page looked finished and simply had no link on it,
        // which is how a broken share feature stays broken quietly.
        if (alive) setErr(e?.response?.status === 404
          ? 'Invite links are not switched on for this sport yet.'
          : 'Could not load your invite link. Refresh to try again.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return function () { alive = false }
  }, [])

  const copy = useCallback(function () {
    if (!data || !data.link) return
    var done = function () {
      setCopied(true)
      setTimeout(function () { setCopied(false) }, 2000)
    }
    // navigator.clipboard is undefined outside a secure context and in some
    // in-app browsers, so fall back rather than throwing at the user.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data.link).then(done).catch(function () { legacyCopy(data.link, done) })
    } else {
      legacyCopy(data.link, done)
    }
  }, [data])

  const share = useCallback(function () {
    if (!data || !data.link) return
    if (navigator.share) {
      navigator.share({ title: 'SAM NFL Rivals', text: data.shareText || '', url: data.link })
        .catch(function () { /* dismissed sheet is not an error */ })
    } else {
      copy()
    }
  }, [data, copy])

  if (loading) return null
  if (err || !data || !data.link) {
    return (
      <div className="nflr-invite nflr-invite-empty">
        <div className="nflr-invite-hd">
          <span className="nflr-invite-title"><UsergroupAddOutlined /> Invite</span>
        </div>
        <div className="nflr-invite-sub">{err || 'No invite link available yet.'}</div>
      </div>
    )
  }

  var reward = data.rewardPerJoin || 0
  var rewardLbl = reward >= 1e6 ? (reward / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : Math.round(reward / 1e3) + 'K'

  return (
    <div className="nflr-invite">
      <div className="nflr-invite-hd">
        <span className="nflr-invite-title"><UsergroupAddOutlined /> Invite to NFL Rivals</span>
        <span className="nflr-invite-reward">+{rewardLbl} SP each</span>
      </div>

      <div className="nflr-invite-sub">
        Share your link. When someone signs up on it, the reward lands in your wallet.
      </div>

      <div className="nflr-invite-linkrow">
        <input className="nflr-invite-link" value={data.link} readOnly onFocus={function (e) { e.target.select() }} />
        <button className="nflr-invite-btn" onClick={copy} title="Copy link">
          {copied ? <CheckOutlined /> : <CopyOutlined />}
        </button>
        <button className="nflr-invite-btn nflr-invite-btn-share" onClick={share} title="Share">
          <ShareAltOutlined />
        </button>
      </div>

      <div className="nflr-invite-stats">
        <div><b>{data.invitedCount || 0}</b><span>Signed up</span></div>
        <div><b>{data.joinedCount || 0}</b><span>In Rivals</span></div>
        <div><b>{data.creditedCount || 0}</b><span>Paid out</span></div>
      </div>
    </div>
  )
}

/* Old-school copy for browsers without the clipboard API. */
function legacyCopy(text, done) {
  try {
    var ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    done()
  } catch (e) {
    notification.info({ message: 'Copy the link', description: text })
  }
}

export default NFLRivalsInvite
