import React, { useState, useMemo } from 'react'
import { Modal, Empty } from 'antd'
import { PlusOutlined, CloseOutlined, TeamOutlined, CheckOutlined } from '@ant-design/icons'

/* pick is "traded" when its current owner differs from the original (mainTeam) */
const isPickTraded = (v) =>
  v?.mainTeam && v?.team && String(v.mainTeam._id || v.mainTeam) !== String(v.team._id || v.team)

/*
  Compact draft-pick picker — mirrors AddPlayerToTrade's trigger + modal shell.
  `picks` are the team's currently-available (not-yet-selected) picks; selecting
  one calls the existing add handler (`onSelect`) unchanged, then closes.
  Because the parent removes a selected pick from `picks`, a pick can never be
  added twice (the existing guard is preserved by the data flow).
*/
const AddPickToTrade = ({ picks, teamName, selectedCount = 0, onSelect }) => {
  const [open, setOpen] = useState(false)

  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  // group available picks by season (year), rounds sorted ascending within each
  const grouped = useMemo(() => {
    const bySeason = {}
    ;(picks || []).forEach((p) => {
      const s = p?.season ?? '—'
      if (!bySeason[s]) bySeason[s] = []
      bySeason[s].push(p)
    })
    return Object.keys(bySeason)
      .sort((a, b) => Number(a) - Number(b))
      .map((season) => ({
        season,
        rounds: bySeason[season].slice().sort((a, b) => (a?.round || 0) - (b?.round || 0)),
      }))
  }, [picks])

  const available = (picks || []).length

  const handlePick = (pick) => {
    onSelect(pick)
    closeModal()
  }

  return (
    <>
      <p onClick={showModal} style={{ cursor: 'pointer' }}>
        <PlusOutlined /> Add Pick
      </p>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='trade-add-player-modal'
        closable={false}
        width={560}
      >
        {/* Modal Header */}
        <div className='trade-modal-header'>
          <div className='trade-modal-header-left'>
            <div className='trade-modal-header-icon-wrap'>
              <TeamOutlined className='trade-modal-header-icon' />
            </div>
            <div>
              <h2 className='trade-modal-title'>SELECT DRAFT PICKS</h2>
              <span className='trade-modal-subtitle'>{teamName || 'Team Picks'}</span>
            </div>
          </div>
          <div className='trade-modal-close' onClick={closeModal}>
            <CloseOutlined />
          </div>
        </div>

        {/* Pick list grouped by year → round */}
        <div className='trade-modal-roster'>
          {available > 0 ? (
            grouped.map((group) => (
              <div key={group.season} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    padding: '6px 6px 4px',
                  }}
                >
                  {group.season}&#39; Rookie Draft
                </div>
                {group.rounds.map((pick, i) => {
                  const traded = isPickTraded(pick)
                  return (
                    <div
                      key={pick?._id || i}
                      className='trade-modal-player-row'
                      onClick={() => handlePick(pick)}
                    >
                      <div className='trade-modal-player-info'>
                        <span
                          className='trade-modal-player-pos'
                          style={{
                            background: 'rgba(139,92,246,0.15)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            color: '#8B5CF6',
                          }}
                        >
                          {`RD ${pick?.round}`}
                        </span>
                        <div className='trade-modal-player-details'>
                          <span className='trade-modal-player-name'>
                            {`${pick?.season}' Round ${pick?.round}`}
                          </span>
                          <span className='trade-modal-player-salary'>
                            {`Owner: ${pick?.team?.name || '—'}`}
                            {traded ? ` · Orig: ${pick?.mainTeam?.name || '—'}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className='trade-modal-player-right'>
                        <span className='trade-modal-player-badge-add'>
                          <PlusOutlined /> ADD
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <div className='trade-modal-empty'>
              <Empty
                description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No draft picks available</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className='trade-modal-footer'>
          <span className='trade-modal-footer-count'>
            {available} pick{available !== 1 ? 's' : ''} available
          </span>
          <span className='trade-modal-footer-selected'>
            {selectedCount} selected in trade
          </span>
        </div>
      </Modal>
    </>
  )
}

export default AddPickToTrade
