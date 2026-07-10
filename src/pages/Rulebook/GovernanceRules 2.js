import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

const GovernanceRules = () => {
  const navigate = useNavigate()

  return (
    <div className='rb-page'>
      <div className='rb-page-header'>
        <div className='rb-page-header-bg' />
        <div className='rb-page-header-content'>
          <div className='rb-page-title'>
            <h1>COMMISSIONER <span>GOVERNANCE</span></h1>
            <span className='rb-page-subtitle'>LEAGUE DEMOCRACY</span>
          </div>
          <button className='rbl-back-btn' onClick={() => navigate('/rule-book')}>
            <ArrowLeftOutlined /> Back to Rulebook
          </button>
        </div>
      </div>

      <div className='rbl-content'>
        {/* COMMISSIONER ROLE */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#8B5CF6' }}>1</span>
            <h2 className='rbl-rule-title'>Commissioner Role</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Every league has a <strong>Commissioner</strong> who manages league operations</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner has full powers: rule enforcement, trade reviews, dispute resolution, draft management, season renewal</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner <strong>CANNOT</strong> stop a league unilaterally, pausing requires a 66% league vote</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner <strong>CAN</strong> voluntarily transfer rights to another league member at any time</div>
          </div>
        </div>

        {/* VOTE OF NO CONFIDENCE */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#EF4444' }}>2</span>
            <h2 className='rbl-rule-title'>Vote of No Confidence</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Any league member can initiate a <strong>Vote of No Confidence</strong> against the commissioner</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />League must have <strong>3+ members</strong> for a no-confidence vote</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Passes at <strong>50% + 1</strong> of total league members (not just voters)</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />72-hour voting window, members vote <strong>Yes</strong>, <strong>No</strong>, or <strong>Abstain</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Early pass: motion passes as soon as threshold is reached</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Early fail: motion fails if mathematically impossible to pass</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Only one active no-confidence process per league at a time</div>
          </div>
        </div>

        {/* AI COMMISSIONER */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#3B82F6' }}>3</span>
            <h2 className='rbl-rule-title'>AI Commissioner</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />On successful no-confidence vote, an <strong>AI Commissioner</strong> takes over with <strong>full powers</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />AI Commissioner handles: schedules, fixtures, rule enforcement, trade reviews, dispute resolution, draft management, season renewal</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />League settings remain unchanged, AI does not modify league rules</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />AI Commissioner stays in charge until a <strong>new commissioner is elected</strong></div>
            <div className='rbl-rule-item'><span className='rbl-dot' />If no candidates volunteer, AI Commissioner remains indefinitely</div>
          </div>
        </div>

        {/* COMMISSIONER ELECTION */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#22C55E' }}>4</span>
            <h2 className='rbl-rule-title'>Commissioner Election</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' /><strong>Nomination phase (48 hours)</strong>, members volunteer as candidates with a statement (max 500 chars)</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />The removed commissioner <strong>cannot</strong> run in the follow-up election</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />If <strong>0 candidates</strong>: AI Commissioner stays in charge</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />If <strong>1 candidate</strong>: auto-appointed as new commissioner</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />If <strong>2+ candidates</strong>: election voting opens for 48 hours</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Each member votes for <strong>one candidate</strong>, simple majority wins</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Winner is appointed and AI Commissioner deactivates</div>
          </div>
        </div>

        {/* COMMISSIONER TRANSFER */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#F97316' }}>5</span>
            <h2 className='rbl-rule-title'>Commissioner Transfer</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner can <strong>voluntarily transfer</strong> rights to any league member</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Transfer is <strong>immediate</strong>, no vote required</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Old commissioner <strong>loses all commissioner rights</strong> instantly</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />New commissioner gains full control immediately</div>
          </div>
        </div>

        {/* LEAGUE PAUSE */}
        <div className='rbl-rule-section'>
          <div className='rbl-rule-header'>
            <span className='rbl-rule-icon' style={{ background: '#EAB308' }}>6</span>
            <h2 className='rbl-rule-title'>League Pause</h2>
          </div>
          <div className='rbl-rule-list'>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner can <strong>propose</strong> pausing the league</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Requires <strong>66% of total league members</strong> voting &ldquo;Yes&rdquo; to pass</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />League must have <strong>2+ members</strong> for a pause vote</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />72-hour voting window</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Leagues are <strong>never deleted</strong>, only paused (can be reactivated later)</div>
            <div className='rbl-rule-item'><span className='rbl-dot' />Commissioner <strong>cannot</strong> stop a league without this vote</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GovernanceRules
