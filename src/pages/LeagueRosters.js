import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { Input, Spin } from 'antd'
import { BiSearchAlt } from 'react-icons/bi'
import CustomCarousel from '../components/Carousel/CustomCarousel'
import { getProfessionalLeagueRanks } from '../redux'
import { useSelector } from 'react-redux'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import { getPositionColor, sortedObject } from '../config/helperFunctions'
import { getLeagueRoster, getTeamRoster } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'
import { getTeamByPlayerName } from '../redux/actions/teamActions'

const LeagueRosters = () => {
  const SETTING = useSelector((state) => state.user)
  const [isLoading, setIsLoading] = useState('all')
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState(null)
  const [filterTeams, setFilterTeams] = useState(null)
  const [teamRosters, setTeamRosters] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [foundTeam, setFoundTeam] = useState(null)

  useEffect(() => {
    getAll()
    return () => {
      localStorage.removeItem('lrTeamId')
    }
  }, [])

  const getAll = async () => {
    const id = localStorage.getItem('lrTeamId')
    const currTeamId = SETTING?.userDetails?.team?._id
    setIsLoading('all')
    await getTeam()
    const res = await getTeamRosters(id ? id : currTeamId)
    if (res) {
      setIsLoading('')
    }
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
    setIsLoading('single-team')
    const res = await getTeamRosters(id)
    if (res) {
      setIsLoading('')
    }
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

  const filters = [
    {
      name: 'ACTIVE',
      color: '#fff',
    },
    {
      name: 'NON-ACTIVE',
      color: 'orange',
    },
    {
      name: 'PRACTICE',
      color: '#7ed957',
    },
    {
      name: 'PROTECTED',
      color: '#0097b2',
    },
    {
      name: 'INJURIES RESERVE',
      color: '#ff3131',
    },
    {
      name: 'RETIRED',
      color: 'purple',
    },
  ]

  return (
    <div className='league_roster_container'>
      <Header />

      <div className='lr_header'>
        <h2>
          TEAM<b>ROSTERS</b>
        </h2>
        <div className='input_box'>
          <Input
            placeholder='Search'
            value={search}
            suffix={<BiSearchAlt onClick={handleSearchClick} color='#fff' size={20} />}
            onChange={(e) => {
              if (e.target.value?.trim() === '') {
                setFilterTeams(teams)
              }
              setFoundTeam(null)
              setSearch(e.target.value)
            }}
            onKeyUp={handleSearch}
          />
        </div>
      </div>

      {isLoading === 'all' ? (
        <Loader />
      ) : (
        <div className='lr_wrapper'>
          <div className='lr_body'>
            <div className='p_found_box'>
              {foundTeam && foundTeam?.length > 0 && (
                <p>
                  {`The player '${search}' is found in '${foundTeam?.length}' ${
                    foundTeam?.length > 1 ? 'teams' : 'team'
                  }.`}
                </p>
              )}
            </div>

            <div className='rosters_team_box'>
              <CustomCarousel height={'70px'}>
                {isLoading === 'team-filter' ? (
                  <div className='empty_team'>
                    <Spin />
                  </div>
                ) : filterTeams?.teams?.length > 0 ? (
                  filterTeams?.teams?.map((v, i) => {
                    return (
                      <div key={i} className='team_card' onClick={() => handleChangeTeam(v?._id)}>
                        <img src={v?.logo} />
                      </div>
                    )
                  })
                ) : (
                  <div className='empty_team'>
                    <p>No player found</p>
                  </div>
                )}
              </CustomCarousel>
            </div>

            <div className='filters_header'>
              {filters.map((v) => {
                return (
                  <div key={v?.name} className='filter_card'>
                    <div className='filter_color' style={{ backgroundColor: v?.color }}></div>
                    <p>{v?.name}</p>
                  </div>
                )
              })}
            </div>

            {isLoading === 'single-team' ? (
              <Loader />
            ) : (
              <div className='lr_team_details'>
                <div
                  className='lrtd_header'
                  style={{
                    backgroundColor: currentTeam?.teamColor
                      ? currentTeam?.teamColor
                      : 'var(--primaryPurple)',
                  }}
                >
                  <div className='t_img_box'>
                    <img src={currentTeam?.logo} />
                  </div>
                  <h2>{currentTeam?.name}</h2>
                </div>
                <div className='rosters_details'>
                  {teamRosters?.map((v, i) => {
                    return <CardRow key={i} data={v} currentTeam={currentTeam} search={search} />
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const CardRow = ({ data, currentTeam, search }) => {
  const SETTING = useSelector((state) => state.user)
  const getStatusColor = (obj) => {
    const isActive = obj?.players?.isActive
    const inPractice = obj?.players?.inPracticeSquad
    const isProtected = obj?.players?.isPlayerProtected
    const isIR = obj?.players?.isPlayerInjured
    const isRetired = obj?.players?.isRetired

    let color = null
    if (isActive && !isProtected && !isIR && !inPractice && !isRetired) {
      color = '#fff'
    } else if (inPractice && !isProtected && !isIR && !isRetired) {
      color = '#7ed957'
    } else if (isProtected && !isIR && !isRetired) {
      color = '#0097b2'
    } else if (isIR) {
      color = '#ff3131'
    } else if (!isActive && !isProtected && !isIR && !inPractice && !isRetired) {
      color = 'orange'
    } else if (isRetired) {
      color = 'purple'
    }
    return color
  }

  const highlightSearch = (text, searchInput) => {
    if (!searchInput) {
      return text
    }
    const escapedSearchInput = searchInput.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearchInput})`, 'gi')
    return text.replace(
      regex,
      (match) => `<span style="background-color: black; color: yellow">${match}</span>`,
    )
  }

  return (
    <div className='roster_row'>
      <div className='roster_position'>
        <span
          style={{
            color: getPositionColor(Object.keys(data)),
          }}
        >
          {Object.keys(data)}
        </span>
      </div>
      <div className='roster_content'>
        {data[Object.keys(data)]?.map((v, i) => {
          const isOwnTeam = currentTeam?._id === SETTING?.userDetails?.team?._id
          const isCurrentTeam = isOwnTeam
            ? { isOwnRoster: { status: true } }
            : { isTeamRoster: { status: true } }

          return (
            <PlayerDetailsModal
              key={i}
              button={
                // <span style={{ color: getStatusColor(v) }}>{v?.players?.Name}</span>
                <span
                  style={{ color: getStatusColor(v) }}
                  dangerouslySetInnerHTML={{
                    __html: highlightSearch(v?.players?.Name, search),
                  }}
                />
              }
              state={{
                ...isCurrentTeam,
                playerID: v?.players?.PlayerID,
                teamId: isOwnTeam ? null : currentTeam?._id,
                teamName: v?.team?.name ? v?.team?.name : '',
                teamLogo: v?.team?.logo ? v?.team?.logo : null,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default LeagueRosters
