import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { Input } from 'antd'
import { BiSearchAlt } from 'react-icons/bi'
import CustomCarousel from '../components/Carousel/CustomCarousel'
import { getProfessionalLeagueRanks } from '../redux'
import { useSelector } from 'react-redux'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'
import { getPositionColor, sortedObject } from '../config/helperFunctions'
import { getTeamRoster } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'

const LeagueRosters = () => {
  const SETTING = useSelector((state) => state.user)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoading2, setIsLoading2] = useState(false)
  const [teams, setTeams] = useState(null)
  const [filterTeams, setFilterTeams] = useState(null)
  const [teamRosters, setTeamRosters] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAll()
  }, [SETTING?.userDetails?.team?._id])

  const getAll = async () => {
    setIsLoading(true)
    const teamsRes = await getTeam()
    await getTeamRosters(SETTING?.userDetails?.team?._id, teamsRes)
    setIsLoading(false)
  }

  const getTeam = async () => {
    let teamsRes = await getProfessionalLeagueRanks(SETTING?.setting?.week)
    setTeams(teamsRes)
    setFilterTeams(teamsRes)
    return teamsRes
  }

  const getTeamRosters = async (id, teamsArr) => {
    const res = await getTeamRoster({ week: SETTING?.setting?.week, team: id })
    if (res) {
      const mergedArray = [...res?.active, ...res?.practice, ...res?.retired]
      const uniquePositionsSet = new Set(mergedArray?.map((v) => v?.players?.Position))
      const uniquePositionsArray = [...uniquePositionsSet]
      let newObj = {}
      uniquePositionsArray?.map((v) => {
        newObj[v] = mergedArray?.filter((x) => x?.players?.Position === v)
      })
      setTeamRosters(sortedObject(newObj))
      setCurrentTeam(
        teamsArr && teamsArr?.length > 0
          ? teamsArr?.find((v) => v?._id === id)
          : teams?.teams?.find((v) => v?._id === id),
      )
    }
    return res
  }

  const handleChangeTeam = async (id) => {
    setIsLoading2(true)
    await getTeamRosters(id)
    setIsLoading2(false)
  }

  const filters = [
    {
      name: 'ACTIVE',
      color: '#fff',
    },
    {
      name: 'PRACTICE SQUAD',
      color: '#7ed957',
    },
    {
      name: 'PROTECTED SQUAD',
      color: '#0097b2',
    },
    {
      name: 'INJURIES RESERVE',
      color: '#ff3131',
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
            suffix={<BiSearchAlt color='#fff' size={20} />}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className='lr_body'>
          <div className='rosters_team_box'>
            <CustomCarousel height={'70px'}>
              {filterTeams?.teams?.map((v, i) => {
                return (
                  <div key={i} className='team_card' onClick={() => handleChangeTeam(v?._id)}>
                    <img src={v?.logo} />
                  </div>
                )
              })}
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

          {isLoading2 ? (
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
    let color = null
    if (isActive && !isProtected && !isIR && !inPractice) {
      color = '#fff'
    } else if (inPractice) {
      color = '#7ed957'
    } else if (isProtected) {
      color = '#0097b2'
    } else if (isIR) {
      color = '#ff3131'
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
