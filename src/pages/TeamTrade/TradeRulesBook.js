import React from 'react'
import { Modal } from 'antd'
import {
  ReadOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  DollarOutlined,
  TeamOutlined,
  LockOutlined,
  FireOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'

/*
 * TradeRulesBook — read-only "Trade Rules Book" surfaced from the New Trade page.
 * Additive only. Shows REAL league settings where the field exists on the league
 * object; otherwise clearly labels a rule as the standard/default behavior.
 *
 * Props:
 *   open            bool
 *   onClose         () => void
 *   currentLeague   league object from redux (state.league.currentLeague)
 *   tradeWindow     result of computeTradeWindow() — { open, deadline, label }
 *   defaultWeek     DEFAULT_TRADE_DEADLINE_WEEK (number)
 *   isCommissioner  bool
 *   blockCount      number of players on the league trade block
 *   onEditDeadline  () => void  — reuse the EXISTING deadline control (Trade Settings modal)
 */

const SOURCE = {
  REAL: { label: 'League setting', cls: 'real' },
  DEFAULT: { label: 'League default', cls: 'default' },
  STANDARD: { label: 'Standard rule', cls: 'standard' },
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

const TradeRulesBook = ({
  open,
  onClose,
  currentLeague,
  tradeWindow,
  defaultWeek = 8,
  isCommissioner = false,
  blockCount = 0,
  onEditDeadline,
}) => {
  // Always render the rules (real values fill in when the league is present;
  // standard rules + Week-8 default otherwise) — never show an empty popup.
  const leagueLoaded = true

  // ── Real deadline value (currentLeague.tradeDeadline) or documented default ──
  const hasRealDeadline = !!currentLeague?.tradeDeadline
  const deadlineLabel = tradeWindow?.label || `Week ${defaultWeek}`
  const windowOpen = tradeWindow?.open !== false

  // ── Commissioner review — real league flag (League.commissionerApproval, default true) ──
  const hasApprovalFlag = typeof currentLeague?.commissionerApproval === 'boolean'
  const commissionerApproval = hasApprovalFlag ? currentLeague.commissionerApproval : true

  const Rule = ({ icon, title, source, children }) => (
    <section className='tt-rb-rule'>
      <div className='tt-rb-rule-h'>
        <span className='tt-rb-rule-ic'>{icon}</span>
        <h4 className='tt-rb-rule-title'>{title}</h4>
        <span className={`tt-rb-source ${source.cls}`}>{source.label}</span>
      </div>
      <div className='tt-rb-rule-b'>{children}</div>
    </section>
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={680}
      className='tt-confirm tt-rb-modal'
      title={
        <span className='tt-rb-title'>
          <ReadOutlined /> Trade Rules Book
        </span>
      }
      aria-label='Trade Rules Book'
    >
      {!leagueLoaded ? (
        // ── Skeleton / empty handling while the league loads ──
        <div className='tt-rb-body' aria-busy='true'>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className='tt-skel' style={{ height: 78, marginBottom: 10 }} />
          ))}
        </div>
      ) : (
        <div className='tt-rb-body'>
          <p className='tt-rb-lead'>
            How trades work in <b>{currentLeague?.name || 'your league'}</b>. Values marked
            <span className='tt-rb-source real inline'>League setting</span> come from your
            league&apos;s current configuration; other rules are the standard behavior applied to
            every league.
          </p>

          {/* 1 — Trade Window & Deadline (REAL: currentLeague.tradeDeadline) */}
          <Rule
            icon={<ClockCircleOutlined />}
            title='Trade Window & Deadline'
            source={hasRealDeadline ? SOURCE.REAL : SOURCE.DEFAULT}
          >
            <p>
              This league&apos;s trade deadline is{' '}
              <b>
                {hasRealDeadline ? deadlineLabel : `Week ${defaultWeek} (default)`}
              </b>
              .{' '}
              {windowOpen
                ? 'The trade window is currently open.'
                : 'The trade window is currently closed.'}
            </p>
            <p>
              New offers and acceptances are locked once the deadline passes. If your commissioner
              has not set an explicit date, the window defaults to the end of Week {defaultWeek}.
            </p>
            {isCommissioner && (
              <button className='tt-rb-edit' onClick={onEditDeadline} type='button'>
                <EditOutlined /> Edit deadline in Trade Settings
              </button>
            )}
          </Rule>

          {/* 2 — Max Trades Per Day (no backing field → standard text) */}
          <Rule icon={<TeamOutlined />} title='Max Trades Per Day' source={SOURCE.DEFAULT}>
            <p>
              There is no per-day trade limit unless one is set by your commissioner. By default you
              may propose as many trades as you like, though each still passes every validation check
              before it can complete.
            </p>
          </Rule>

          {/* 3 — Commissioner Review (REAL: currentLeague.commissionerApproval + AI flag) */}
          <Rule
            icon={<UserOutlined />}
            title='Commissioner Review'
            source={hasApprovalFlag ? SOURCE.REAL : SOURCE.STANDARD}
          >
            <p>
              Commissioner approval is currently{' '}
              <b>{commissionerApproval ? 'ON' : 'OFF'}</b> for this league.{' '}
              {commissionerApproval
                ? 'After both teams agree, the trade waits for the commissioner to approve it before it executes.'
                : 'Agreed trades execute without a manual approval step.'}
            </p>
            <p>
              Regardless of that setting, any trade the AI Commissioner flags as lopsided
              (<b>flagged for review</b>) is routed to the commissioner before it can go through.
            </p>
          </Rule>

          {/* 4 — SamPoints in Trades (REAL behavior — wallet balance) */}
          <Rule icon={<DollarOutlined />} title='SamPoints in Trades' source={SOURCE.STANDARD}>
            <p>
              Either side may include SamPoints (SP) in a package, up to the sender&apos;s available
              balance. The amount is verified against your wallet when the trade is accepted, and is
              transferred as part of executing the trade.
            </p>
          </Rule>

          {/* 5 — Draft Pick Restrictions (REAL behavior — ownership sync) */}
          <Rule icon={<TeamOutlined />} title='Draft Pick Restrictions' source={SOURCE.STANDARD}>
            <p>
              Only picks you currently own can be added to a trade. A pick that was already acquired
              via trade shows a <b>Via Trade</b> tag, and pick ownership is re-synced after every
              trade so the same pick cannot be traded twice.
            </p>
          </Rule>

          {/* 6 — Player Lock Rules (REAL status logic — matches trade selectors) */}
          <Rule icon={<LockOutlined />} title='Player Lock Rules' source={SOURCE.STANDARD}>
            <p>A player&apos;s trade status uses the same badges shown on the trade cards:</p>
            <ul className='tt-rb-list'>
              <li>
                <span className='tt-rb-dot' style={{ background: '#06b6d4' }} />
                <b>Locked</b> — a protected player (protected roster spot) is held out of trades.
              </li>
              <li>
                <span className='tt-rb-dot' style={{ background: '#f6c453' }} />
                <b>Practice</b> — practice-squad players are flagged before you include them.
              </li>
              <li>
                <span className='tt-rb-dot' style={{ background: '#8a93a6' }} />
                <b>Inactive</b> — inactive players are flagged so both sides know their status.
              </li>
              <li>
                <span className='tt-rb-dot' style={{ background: '#24d26c' }} />
                <b>Active</b> — freely tradable, subject to the other rules here.
              </li>
            </ul>
          </Rule>

          {/* 7 — Trade Block (REAL flag) */}
          <Rule icon={<FireOutlined />} title='Trade Block' source={SOURCE.REAL}>
            <p>
              Players you add to the trade block are marked <b>ON BLOCK</b> and are openly available
              to offers from other GMs.{' '}
              {blockCount > 0
                ? `There ${blockCount === 1 ? 'is' : 'are'} currently ${blockCount} player${
                    blockCount === 1 ? '' : 's'
                  } on the block league-wide.`
                : 'No players are on the block right now.'}{' '}
              Putting a player on the block does not commit you to a trade.
            </p>
          </Rule>

          {/* 8 — Trade Safety / Collusion (REAL behavior — validation at acceptance) */}
          <Rule
            icon={<SafetyOutlined />}
            title='Trade Safety & Collusion'
            source={SOURCE.STANDARD}
          >
            <p>
              Trades may be reviewed by the AI Commissioner and, when required, by the league
              commissioner. Salary-cap, roster and pick-ownership rules are enforced server-side, and
              final validation runs at the moment of acceptance.
            </p>
            <p>
              If ownership is no longer valid at acceptance — for example an asset has already moved
              — the offer is cancelled rather than executed. Nothing is final until both teams and
              (if required) the commissioner approve.
            </p>
          </Rule>

          <div className='tt-rb-foot'>
            <ExclamationCircleOutlined /> Some rules are set by your commissioner. Where a value is
            shown as <span className='tt-rb-source default inline'>League default</span> or{' '}
            <span className='tt-rb-source standard inline'>Standard rule</span>, no league-specific
            override is configured.
          </div>
        </div>
      )}
    </Modal>
  )
}

export default TradeRulesBook
