import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { Input } from 'antd'
import { BiSearchAlt } from 'react-icons/bi'
import CustomCarousel from '../components/Carousel/CustomCarousel'
import { getProfessionalLeagueRanks } from '../redux'
import { useSelector } from 'react-redux'

const LeagueRosters = () => {
  const SETTING = useSelector((state) => state.user)
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState(null)
  const [search, setSearch] = useState('')
  console.log('teams>>>', teams)

  useEffect(() => {
    getAll()
  }, [])

  const getAll = async () => {
    setIsLoading(true)
    await getTeam()
    setIsLoading(false)
  }

  const getTeam = async () => {
    let res = await getProfessionalLeagueRanks(SETTING?.setting?.week)
    setTeams(res)
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

      <div className='league_roster_header'>
        <h2>
          TEAM<b>ROSTERS</b>
        </h2>
        <div className='input_box'>
          <Input placeholder='Search' suffix={<BiSearchAlt color='#fff' size={20} />} />
        </div>
      </div>

      <div className='league_roster_body'>
        <div className='rosters_team_box'>
          <CustomCarousel height={'70px'}>
            {teams?.teams?.map((v, i) => {
              return (
                <div key={i} className='team_card'>
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

        <div className='team_details'>{/* start work from here */}</div>
      </div>
    </div>
  )
}

export default LeagueRosters
