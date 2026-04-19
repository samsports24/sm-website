import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { Input, Spin } from 'antd'
import { SearchOutlined, TeamOutlined, LoadingOutlined } from '@ant-design/icons'
import { getProfessionalLeagueRanks } from '../redux'
import { useSelector } from 'react-redux'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import { getPositionColor, sortedObject } from '../config/helperFunctions'
import { getLeagueRoster } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'
import { getTeamByPlayerName } from '../redux/actions/teamActions'

const STATUS_MAP = [
  { key: 'isRetired', label: 'RET', color: '#A855F7', bg: 'rgba(168,85,247,0.10)' },
  { key: 'isPlayerInjured', label: 'IR', color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
  { key: 'isPlayerProtected', label: 'PROT', color: '#06B6D4', bg: 'rgba(6,182,212,0.10)' },
  { key: 'inPracticeSquad', label: 'PS', color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
  { key: 'notActive', label: 'NA', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
]

const getPlayerStatus = (obj) => {
  const p = obj?.players
  if (p?.isRetired) return STATUS_MAP[0]
  if (p?.isPlayerInjured) return STATUS_MAP[1]
  if (p?.isPlayerProtected) return STATUS_MAP[2]
  if (p?.inPracticeSquad) return STATUS_MAP[3]
  if (!p?.isActive) return STATUS_MAP[4]
  return { key: 'active', label: 'ACT', color: '#22C55E', bg: 'rgba(34,197,94,0.10)' }
}

const LeagueRosters = () => {
  const SETTING = useSelector((state) => state.user)
  const [isLoading, setIsLoading] = useState('all')
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState(null)
  const [filterTeams, setFilterTeams] = useState(null)
  const [teamRosters, setTeamRosters] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [foundTeam, setFoundTeam] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState(null)

  useEffect(() => {
    getAll()
    return () => { localStorage.removeItem('lrTeamId') }
  }, [])

  const getAll = async () => {
    const id = localStorage.getItem('lrTeamId')
    const currTeamId = SETTING?.userDetails?.team?._id
    const initialId = id || currTeamId
    setSelectedTeamId(initialId)
    setIsLoading('all')
    await getTeam()
    const res = await getTeamRosters(initialId)
    if (res) setIsLoading('')
  }

  const getTeam = async () => {
    let teamsRes = await getProfessionalLeagueRanks(SETTING?.setting?.week)
    setTeams(teamsRes)
    setFilterTeams(teamsRes)
    return teamsRes
  }

  const getTeamRosters = async (id) => {
    const res = await getLeagueRoster({ week: SETTING?.setting?.week, team: id })
    if (res) {
      const uniquePositionsSet = new Set(res?.players?.map((v) => v?.players?.Position))
      const uniquePositionsArray = [...uniquePositionsSet]
      let newObj = {}
      uniquePositionsArray?.map((v) => {
        newObj[v] = res?.players?.filter((x) => x?.players?.Position === v)
      })
      setTeamRosters(sortedObject(newObj))
      setCurrentTeam(res?.team)
    }
    return res
  }

  const handleChangeTeam = async (id) => {
    localStorage.setItem('lrTeamId', id)
    setSelectedTeamId(id)
    setIsLoading('single-team')
    const res = await getTeamRosters(id)
    if (res) setIsLoading('')
  }

  const handleSearch = async (event) => {
    if (event.keyCode === 13 && event.target.value?.trim() !== '') {
      setIsLoading('team-filter')
      const res = await getTeamByPlayerName({ name: event.target.value })
      if (res) {
        setFoundTeam(res)
        const filteredTeam = teams?.teams?.filter((v) => res?.includes(v?._id))
        setFilterTeams((pre) => ({ ...pre, teams: filteredTeam }))
        if (res?.length === 1) {
          await handleChangeTeam(filteredTeam[0]?._id)
        }
      }
      setIsLoading('')
    }
  }

  const handleSearchClick = async () => {
    if (search?.trim() !== '') {
      setIsLoading('team-filter')
      const res = await getTeamByPlayerName({ name: search })
      if (res) {
        setFoundTeam(res)
        const filteredTeam = teams?.teams?.filter((v) => res?.includes(v?._id))
        setFilterTeams((pre) => ({ ...pre, teams: filteredTeam }))
        if (res?.length === 1) {
          await handleChangeTeam(filteredTeam[0]?._id)
        }
      }
      setIsLoading('')
    }
  }

  const totalPlayers = teamRosters
    ? teamRosters.reduce((sum, group) => {
        const key = Object.keys(group)[0]
        return sum + (group[key]?.length || 0)
      }, 0)
    : 0

  return (
    <div className='lr-page'>
      <link href='https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap' rel='stylesheet' />
      <Header />

      <div className='lr-inner'>
        {/* ── Top bar: title + search ── */}
        <div className='lr-topbar'>
          <h1 className='lr-title'>Rosters</h1>
          <div className='lr-search-wrap'>
            <SearchOutlined className='lr-search-ico' />
            <Input
              className='lr-search'
              placeholder='Search player...'
              value={search}
              onChange={(e) => {
                if (e.target.value?.trim() === '') setFilterTeams(teams)
                setFoundTeam(null)
                setSearch(e.target.value)
              }}
              onKeyUp={handleSearch}
              onPressEnter={handleSearchClick}
              allowClear
              bordered={false}
            />
          </div>
        </div>

        {isLoading === 'all' ? (
          <div className='lr-loader'><Loader /></div>
        ) : (
          <>
            {/* ── Search result banner ── */}
            {foundTeam && foundTeam?.length > 0 && (
              <div className='lr-found'>
                Found <strong>&ldquo;{search}&rdquo;</strong> on {foundTeam.length} {foundTeam.length > 1 ? 'teams' : 'team'}
              </div>
            )}

            {/* ── Team selector strip ── */}
            <div className='lr-strip'>
              {isLoading === 'team-filter' ? (
                <div className='lr-strip-load'>
                  <Spin indicator={<LoadingOutlined spin style={{ color: '#22C55E' }} />} />
                </div>
              ) : filterTeams?.teams?.length > 0 ? (
                <div className='lr-strip-scroll'>
                  {filterTeams.teams.map((v, i) => {
                    const isActive = selectedTeamId === v?._id
                    return (
                      <div
                        key={i}
                        className={`lr-chip ${isActive ? 'lr-chip--on' : ''}`}
                        onClick={() => handleChangeTeam(v?._id)}
                      >
                        {v?.logo ? (
                          <img src={v.logo} alt='' className='lr-chip-img' />
                        ) : (
                          <div className='lr-chip-ph'>
                            {(v?.abbreviation || v?.name || '?')[0]}
                          </div>
                        )}
                        <span className='lr-chip-txt'>
                          {v?.abbreviation || v?.name?.substring(0, 3)?.toUpperCase() || ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='lr-strip-empty'>No teams found</div>
              )}
            </div>

            {/* ── Roster table ── */}
            {isLoading === 'single-team' ? (
              <div className='lr-loader'><Loader /></div>
            ) : currentTeam ? (
              <div className='lr-roster'>
                {/* Team header row */}
                <div className='lr-roster-hdr'>
                  <div className='lr-roster-hdr-left'>
                    {currentTeam?.logo && (
                      <img src={currentTeam.logo} alt='' className='lr-roster-logo' />
                    )}
                    <div>
                      <h2 className='lr-roster-name'>{currentTeam?.name}</h2>
                      <span className='lr-roster-sub'>
                        {currentTeam?.abbreviation && <span className='lr-roster-abbr'>{currentTeam.abbreviation}</span>}
                        {totalPlayers > 0 && <span>{totalPlayers} players</span>}
                      </span>
                    </div>
                  </div>

                  {/* Inline legend */}
                  <div className='lr-legend'>
                    {[
                      { label: 'Active', color: '#22C55E' },
                      { label: 'IR', color: '#EF4444' },
                      { label: 'PS', color: '#3B82F6' },
                      { label: 'Prot', color: '#06B6D4' },
                      { label: 'NA', color: '#F59E0B' },
                      { label: 'Ret', color: '#A855F7' },
                    ].map(s => (
                      <span key={s.label} className='lr-legend-item'>
                        <span className='lr-legend-dot' style={{ background: s.color }} />
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Column labels */}
                <div className='lr-col-hdr'>
                  <span className='lr-col-pos'>POS</span>
                  <span className='lr-col-name'>PLAYER</span>
                  <span className='lr-col-status'>STATUS</span>
                </div>

                {/* Position groups */}
                <div className='lr-rows'>
                  {teamRosters?.map((v, i) => (
                    <PosGroup key={i} data={v} currentTeam={currentTeam} search={search} />
                  ))}
                  {(!teamRosters || teamRosters.length === 0) && (
                    <div className='lr-empty'>No roster data available</div>
                  )}
                </div>
              </div>
            ) : (
              <div className='lr-empty-state'>
                <TeamOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.15)' }} />
                <p>Select a team to view their roster</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Safe highlight function that returns React elements instead of HTML strings
const highlightText = (text, query) => {
  if (!query || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(34,197,94,0.3)', color: '#fff', padding: '0 2px', borderRadius: 2 }}>{part}</mark>
      : part
  )
}

const PosGroup = ({ data, currentTeam, search }) => {
  const SETTING = useSelector((state) => state.user)
  const posKey = Object.keys(data)[0]
  const players = data[posKey] || []

  return (
    <>
      {players.map((v, i) => {
        const status = getPlayerStatus(v)
        const isOwnTeam = currentTeam?._id === SETTING?.userDetails?.team?._id
        const isCurrentTeam = isOwnTeam
          ? { isOwnRoster: { status: true } }
          : { isTeamRoster: { status: true } }

        return (
          <PlayerDetailsModal
            key={`${posKey}-${i}`}
            button={
              <div className='lr-player-row'>
                <span className='lr-player-pos' style={{ color: getPositionColor(posKey) }}>
                  {posKey}
                </span>
                <span className='lr-player-name'>
                  {highlightText(v?.players?.Name || 'Unknown', search)}
                </span>
                <span className='lr-player-status' style={{ color: status.color, background: status.bg }}>
                  {status.label}
                </span>
              </div>
            }
            state={{
              ...isCurrentTeam,
              playerID: v?.players?.PlayerID,
              teamId: isOwnTeam ? null : currentTeam?._id,
              teamName: v?.team?.name || '',
              teamLogo: v?.team?.logo || null,
            }}
          />
        )
      })}
    </>
  )
}

export default LeagueRosters
