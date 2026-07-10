import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

const EmpireSaleRules = () => {
  const navigate = useNavigate()

  return (
    <div className='rb-page'>
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>MTO <span>SALES</span></h1>
            <span className='rb-page-subtitle'>PORTFOLIO LIQUIDATION</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      <div className='rbl-content'>
        {/* OVERVIEW */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#EAB308' }}>1</span>
            <h2 className='rbl-rule-title'>What is an MTO Sale?</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Sell your <strong>entire portfolio of teams</strong> at once</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Choose between <strong>Bundle Mode</strong> or <strong>Individual Mode</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Only one active MTO sale per seller at a time</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />MTO sale expires after 30 days</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Teams under ownership lock (120 days) are <strong>excluded</strong></div>
          </div>
        </div>

        {/* BUNDLE MODE */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#F97316' }}>2</span>
            <h2 className='rbl-rule-title'>Bundle Mode</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />All teams listed as <strong>one package</strong>, a single buyer acquires everything</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />You set <strong>any price you want</strong>, no percentage cap applies</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Buyers can <strong>Buy Now</strong> or <strong>Make Offer</strong> on the whole bundle</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />All teams transfer in one atomic transaction, all or nothing</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Each team gets its own transaction record with proportional pricing</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />All AI Coach subscriptions terminated across every team</div>
          </div>
        </div>

        {/* INDIVIDUAL MODE */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#3B82F6' }}>3</span>
            <h2 className='rbl-rule-title'>Individual Mode</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Each team gets its own <strong>separate listing</strong> on The Exchange</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Multiple buyers can pick and choose individual teams</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Default price = market value (you can adjust individual prices later)</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Each team follows all standard Exchange rules</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Buyers can Buy Now or Make Offer on each team separately</div>
          </div>
        </div>

        {/* DORMANT ACCOUNT */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#8B5CF6' }}>4</span>
            <h2 className='rbl-rule-title'>Dormant Account</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />When <strong>ALL</strong> your teams are sold, your account goes <strong>dormant</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />You <strong>keep all your SamPoints</strong>, funds are never lost</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Limited platform access while dormant</div>
            <div className='rbl-rule-item'><span className='rbl-dot' /><strong>Reactivate anytime</strong> by buying a team on The Exchange</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Full account access restored immediately on reactivation</div>
          </div>
        </div>

        {/* DELISTING */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#EF4444' }}>5</span>
            <h2 className='rbl-rule-title'>Delisting an MTO Sale</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />You can delist your MTO sale at any time</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />In Bundle mode: all pending offers are auto-rejected</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />In Individual mode: all associated Exchange listings are also removed</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Teams return to your MTO, nothing changes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmpireSaleRules
