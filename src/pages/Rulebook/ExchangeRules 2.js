import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

const ExchangeRules = () => {
  const navigate = useNavigate()

  return (
    <div className='rb-page'>
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>THE EXCHANGE <span>TRADING RULES</span></h1>
            <span className='rb-page-subtitle'>FRANCHISE TRADING FLOOR</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      <div className='rbl-content'>
        {/* LISTING A TEAM */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#F97316' }}>1</span>
            <h2 className='rbl-rule-title'>Listing a Team</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />You must own the team to list it on The Exchange</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Set any asking price in <strong>SamPoints</strong>, no price cap</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Only <strong>one active listing</strong> per team at a time</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Listings automatically expire after <strong>30 days</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />You can delist at any time, all pending offers get auto-rejected</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Teams under ownership lock (120 days) cannot be listed</div>
          </div>
        </div>

        {/* BUYING A TEAM */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#22C55E' }}>2</span>
            <h2 className='rbl-rule-title'>Buying a Team</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' /><strong>Buy Now</strong>, Acquires the franchise instantly at the asking price</div>
            <div className='rbl-rule-item'><span className='rbl-dot' /><strong>Make Offer</strong>, Submit a custom bid with a message to the seller</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />You need enough <strong>earned SamPoints</strong> (transferable SP) to complete the purchase</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Base SamPoints (300M) <strong>cannot</strong> be used on the Exchange</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />You cannot buy your own team or make offers on your own listings</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />One active offer per buyer per listing, withdraw first to resubmit</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />If you don&rsquo;t have enough SP, the purchase is blocked with a warning</div>
          </div>
        </div>

        {/* WHAT TRANSFERS */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#3B82F6' }}>3</span>
            <h2 className='rbl-rule-title'>What Happens on Sale</h2>
          </div>
          <div className='rbl-rule-columns'>
            <div className='rbl-rule-col'>
              <h3 className='rbl-rule-col-title rbl-green'>Stays With the Team</h3>
              <div className='rbl-rule-list'>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>League and division placement</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Current season record, position, standings</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Full roster, contracts, and stats</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Stadium and facilities</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Season history and trophy cabinet</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Scheduled fixtures</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Team name, branding, colors</div>
                <div className='rbl-rule-item'><span className='rbl-check'>&#10003;</span>Financial structure and salary cap</div>
              </div>
            </div>
            <div className='rbl-rule-col'>
              <h3 className='rbl-rule-col-title rbl-red'>Changes on Sale</h3>
              <div className='rbl-rule-list'>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>Ownership transfers to the buyer</div>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>AI Coach subscriptions <strong>terminated immediately</strong></div>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>Seller loses <strong>100% access</strong> instantly</div>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>All pending offers auto-rejected</div>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>AI autopilot reset, new owner must configure</div>
                <div className='rbl-rule-item'><span className='rbl-cross'>&#10007;</span>In-progress AI decisions cancelled</div>
              </div>
            </div>
          </div>
        </div>

        {/* OWNERSHIP LOCK */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#EF4444' }}>4</span>
            <h2 className='rbl-rule-title'>Ownership Lock (Anti-Flip)</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />After buying a team, you must wait <strong>120 days (~1 season)</strong> before re-listing</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />This prevents rapid franchise flipping and promotes committed ownership</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Locked teams cannot be included in MTO Sales</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Works with <strong>any league size</strong>, 8, 16, 20, 32 teams or more</div>
          </div>
        </div>

        {/* DM SYSTEM */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#8B5CF6' }}>5</span>
            <h2 className='rbl-rule-title'>Direct Messages</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Private 1-on-1 messaging between buyers and sellers</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />DMs are linked to specific listings for context</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Real-time messaging with typing indicators</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Negotiate deals and discuss terms before committing</div>
          </div>
        </div>

        {/* TRANSACTION SAFETY */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#06B6D4' }}>6</span>
            <h2 className='rbl-rule-title'>Transaction Safety</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />All transactions are <strong>atomic</strong>, either fully completes or fully rolls back</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />No partial states, you never lose SP without getting the team</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Complete audit trail for every trade with wallet balances before and after</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Full transparency, both parties can view the transaction record</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangeRules
