import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Spin, Empty, Tag, Select } from 'antd'
import Header from '../../components/Header'
import { getRosterTags, getPostseasonState } from '../../redux/actions/postseasonAction'
import { getRoster } from '../../redux/actions/rosterAction'

const { Option } = Select

const RosterBoard = () => {
  const { rosterTags, state: ps, loading } = useSelector((s) => s.postseason)
  const user = useSelector((s) => s.user)
  const [viewTeam, setViewTeam] = useState(null)

  useEffect(() => {
    getPostseasonState()
  }, [])

  useEffect(() => {
    const teamId = viewTeam || user?.team?._id
    if (teamId) {
      getRosterTags(teamId)
    }
  }, [viewTeam, user?.team?._id])

  // Separate into groups
  const dynastyPlayers = rosterTags.filter((t) => t.source === 'dynasty' && !t.nflTeamEliminated)
  const supplementalPlayers = rosterTags.filter((t) => t.source === 'supplemental' && !t.nflTeamEliminated)
  const eliminatedPlayers = rosterTags.filter((t) => t.nflTeamEliminated)

  // Group by position
  const groupByPosition = (players) => {
    const groups = {}
    for (const tag of players) {
      const pos = tag.player?.Position || 'Unknown'
      if (!groups[pos]) groups[pos] = []
      groups[pos].push(tag)
    }
    return groups
  }

  const survivingTeams = ps?.qualifiedTeams?.filter((t) => !t.isEliminated) || []

  return (
    <div className="postseason-page">
      <Header />
      <main className="postseason-main ps-roster-main">
        <Spin spinning={loading}>
          {/* Header */}
          <div className="ps-roster-header">
            <div>
              <h1>Roster Board</h1>
              <p>Week {ps?.currentWeek || '—'} Postseason Roster</p>
            </div>
            <Select
              value={viewTeam || user?.team?._id}
              onChange={(val) => setViewTeam(val)}
              className="ps-team-select"
              placeholder="Select Team"
            >
              {survivingTeams.map((entry) => (
                <Option key={String(entry.team?._id || entry.team)} value={String(entry.team?._id || entry.team)}>
                  #{entry.seed} {entry.team?.name || 'Team'}
                </Option>
              ))}
            </Select>
          </div>

          {/* Legend */}
          <div className="ps-roster-legend">
            <div className="ps-legend-item">
              <div className="ps-legend-swatch ps-swatch-gold" />
              <span>Dynasty Asset (Original)</span>
            </div>
            <div className="ps-legend-item">
              <div className="ps-legend-swatch ps-swatch-blue" />
              <span>Supplemental Draft</span>
            </div>
            <div className="ps-legend-item">
              <div className="ps-legend-swatch ps-swatch-gray" />
              <span>Eliminated (NFL team out)</span>
            </div>
          </div>

          {rosterTags.length > 0 ? (
            <div className="ps-roster-sections">
              {/* Dynasty Assets */}
              <RosterSection
                title="Dynasty Assets"
                borderClass="ps-border-gold"
                groups={groupByPosition(dynastyPlayers)}
                emptyText="No dynasty assets remaining"
              />

              {/* Supplemental Players */}
              <RosterSection
                title="Supplemental Drafted"
                borderClass="ps-border-blue"
                groups={groupByPosition(supplementalPlayers)}
                emptyText="No supplemental players yet"
              />

              {/* Eliminated */}
              {eliminatedPlayers.length > 0 && (
                <RosterSection
                  title="Eliminated Players"
                  borderClass="ps-border-gray"
                  groups={groupByPosition(eliminatedPlayers)}
                  emptyText=""
                  isEliminated
                />
              )}
            </div>
          ) : (
            <Empty description="No roster data available" />
          )}
        </Spin>
      </main>
    </div>
  )
}

const RosterSection = ({ title, borderClass, groups, emptyText, isEliminated }) => {
  const positions = Object.keys(groups).sort()

  return (
    <div className={`ps-roster-section ${borderClass}`}>
      <h3 className="ps-section-title">{title}</h3>
      {positions.length > 0 ? (
        <div className="ps-roster-grid">
          {positions.map((pos) => (
            <div key={pos} className="ps-pos-group">
              <div className="ps-pos-label">{pos}</div>
              {groups[pos].map((tag) => (
                <PlayerCard
                  key={tag._id}
                  player={tag.player}
                  source={tag.source}
                  week={tag.acquiredWeek}
                  isEliminated={isEliminated || tag.nflTeamEliminated}
                  borderClass={borderClass}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="ps-empty-section">{emptyText}</p>
      )}
    </div>
  )
}

const PlayerCard = ({ player, source, week, isEliminated, borderClass }) => {
  if (!player) return null

  return (
    <div className={`ps-player-card ${borderClass} ${isEliminated ? 'ps-card-eliminated' : ''}`}>
      <div
        className="ps-player-avatar"
        style={{ backgroundImage: `url(${player.HostedHeadshotNoBackgroundUrl || ''})` }}
      />
      <div className="ps-player-info">
        <span className={`ps-player-name ${isEliminated ? 'ps-name-strike' : ''}`}>
          {player.Name || 'Unknown'}
        </span>
        <span className="ps-player-meta">
          {player.Position} &middot; {player.Team || 'FA'}
        </span>
      </div>
      <div className="ps-player-right">
        <span className="ps-player-pts">{player.pf?.toFixed(1) || '0.0'}</span>
        {isEliminated && (
          <Tag color="red" className="ps-elim-tag">ELIMINATED</Tag>
        )}
        {source === 'supplemental' && week && (
          <Tag color="blue" className="ps-wk-tag">Wk {week}</Tag>
        )}
      </div>
    </div>
  )
}

export default RosterBoard
