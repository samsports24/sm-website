import React, { useState, useMemo } from 'react'
import { Button, Modal, Input, Empty } from 'antd'
import { PlusOutlined, SearchOutlined, CloseOutlined, UserOutlined, CheckOutlined } from '@ant-design/icons'
import { positions, matchesPositionFilter } from '../../../config/constants'

const POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'OL', 'DL', 'LB', 'CB', 'S', 'DB']

const POS_COLORS = {
  QB: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
  RB: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22C55E' },
  WR: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6' },
  TE: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
  K: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#A855F7' },
  DEF: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)', text: '#9CA3AF' },
  OL: { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', text: '#14B8A6' },
  DL: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#EC4899' },
  LB: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', text: '#F97316' },
  CB: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', text: '#8B5CF6' },
  S: { bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', text: '#0EA5E9' },
  DB: { bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', text: '#06B6D4' },
}

const DEFAULT_POS = { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#22C55E' }

const AddPlayerToTrade = ({ data, teamName, selected, setSelected }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')

  const showModal = () => {
    setOpen(true)
    setSearch('')
    setPosFilter('ALL')
  }
  const closeModal = () => setOpen(false)

  function mapPosition(position) {
    return positions[position] || position
  }

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((v) => {
      const player = v?.players
      if (!player) return false
      if (search && !player.Name?.toLowerCase().includes(search.toLowerCase())) return false
      if (posFilter !== 'ALL') {
        if (!matchesPositionFilter(player.Position, posFilter)) return false
      }
      return true
    })
  }, [data, search, posFilter])

  const getPosStyle = (pos) => POS_COLORS[pos] || DEFAULT_POS

  return (
    <>
      <p onClick={showModal} style={{ cursor: 'pointer' }}>
        <PlusOutlined /> Add Player
      </p>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='trade-add-player-modal'
        closable={false}
        width={680}
      >
        {/* Modal Header */}
        <div className='trade-modal-header'>
          <div className='trade-modal-header-left'>
            <div className='trade-modal-header-icon-wrap'>
              <UserOutlined className='trade-modal-header-icon' />
            </div>
            <div>
              <h2 className='trade-modal-title'>SELECT PLAYERS</h2>
              <span className='trade-modal-subtitle'>{teamName || 'Team Roster'}</span>
            </div>
          </div>
          <div className='trade-modal-close' onClick={closeModal}>
            <CloseOutlined />
          </div>
        </div>

        {/* Search & Position Filters */}
        <div className='trade-modal-filters'>
          <Input
            prefix={<SearchOutlined style={{ color: 'rgba(34,197,94,0.5)' }} />}
            placeholder='Search players...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='trade-modal-search'
            allowClear
          />
          <div className='trade-modal-pos-pills'>
            {POSITION_FILTERS.map((pos) => {
              const isActive = posFilter === pos
              const posStyle = pos === 'ALL' ? DEFAULT_POS : getPosStyle(pos)
              return (
                <button
                  key={pos}
                  className={`trade-pos-pill ${isActive ? 'trade-pos-pill-active' : ''}`}
                  onClick={() => setPosFilter(pos)}
                  style={isActive ? {
                    background: posStyle.bg,
                    borderColor: posStyle.border,
                    color: posStyle.text,
                  } : undefined}
                >
                  {pos}
                </button>
              )
            })}
          </div>
        </div>

        {/* Player List */}
        <div className='trade-modal-roster'>
          {filteredData.length > 0 ? (
            filteredData.map((v, i) => {
              const isDisabled = selected?.some((x) => x?.players?._id === v?.players?._id)
              const mappedPos = mapPosition(v?.players?.Position)
              const posStyle = getPosStyle(mappedPos)
              const headshotUrl = v?.players?.HostedHeadshotNoBackgroundUrl

              return (
                <div
                  key={i}
                  className={`trade-modal-player-row ${isDisabled ? 'trade-modal-player-disabled' : ''}`}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelected((pre) => [...pre, v])
                      closeModal()
                    }
                  }}
                >
                  <div className='trade-modal-player-info'>
                    {/* Player Headshot */}
                    <div className='trade-modal-player-avatar'>
                      {headshotUrl ? (
                        <img
                          src={headshotUrl}
                          alt={v?.players?.Name}
                          className='trade-modal-player-img'
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div
                        className='trade-modal-player-initials'
                        style={{
                          display: headshotUrl ? 'none' : 'flex',
                          background: posStyle.bg,
                          color: posStyle.text,
                          border: `1px solid ${posStyle.border}`,
                        }}
                      >
                        {(v?.players?.Name || '?').charAt(0)}
                      </div>
                    </div>

                    {/* Position Badge */}
                    <span
                      className='trade-modal-player-pos'
                      style={{
                        background: posStyle.bg,
                        border: `1px solid ${posStyle.border}`,
                        color: posStyle.text,
                      }}
                    >
                      {mappedPos}
                    </span>

                    {/* Name + Salary on two lines */}
                    <div className='trade-modal-player-details'>
                      <span className='trade-modal-player-name'>{v?.players?.Name}</span>
                      <span className='trade-modal-player-salary'>
                        {(v?.players?.currentYearSalaryCap || 0).toLocaleString()} SP
                      </span>
                    </div>
                  </div>

                  <div className='trade-modal-player-right'>
                    {isDisabled ? (
                      <span className='trade-modal-player-badge-selected'>
                        <CheckOutlined /> ADDED
                      </span>
                    ) : (
                      <span className='trade-modal-player-badge-add'>
                        <PlusOutlined /> ADD
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='trade-modal-empty'>
              <Empty
                description={<span style={{ color: 'rgba(255,255,255,0.3)' }}>No players found</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>

        {/* Footer count */}
        <div className='trade-modal-footer'>
          <span className='trade-modal-footer-count'>{filteredData.length} player{filteredData.length !== 1 ? 's' : ''} available</span>
          <span className='trade-modal-footer-selected'>{selected?.length || 0} selected in trade</span>
        </div>
      </Modal>
    </>
  )
}

export default AddPlayerToTrade
