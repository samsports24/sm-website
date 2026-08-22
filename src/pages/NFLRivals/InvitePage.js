import React from 'react'
import { UsergroupAddOutlined } from '@ant-design/icons'
import NFLRivalsInvite from './NFLRivalsInvite'
import './nfl-rivals.css'

/**
 * Invite My Friends — its own tab.
 *
 * The card started life buried at the bottom of Overview, which is not how you
 * get anyone to share anything. It has a nav slot now, and the page says what
 * the reward is and what has to happen to earn it, so nobody has to guess.
 */
const InvitePage = () => (
  <div className="nflr-page">
    <div className="nflr-page-hd">
      <h1 className="nflr-page-title"><UsergroupAddOutlined /> Invite My Friends</h1>
      <p className="nflr-page-sub">
        Share your link. When someone signs up on it, the reward lands in your wallet.
      </p>
    </div>

    <NFLRivalsInvite />

    <div className="nflr-invite-how">
      <h3>How it works</h3>
      <ol>
        <li>Copy your link, or hit share to send it straight from your phone.</li>
        <li>They open it and land on Rivals, not a generic signup page.</li>
        <li>They create an account. The reward is credited to you at signup.</li>
        <li>They build a roster and take a pod place, and you have a rival.</li>
      </ol>
      <p className="nflr-invite-note">
        The link only pays for a new account. Someone who already has one keeps
        their own, and nothing is credited.
      </p>
    </div>
  </div>
)

export default InvitePage
