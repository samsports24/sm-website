import React from 'react'

import { Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const LeagueStandingCard = ({ data, index, teams }) => {
  const USER = useSelector((state) => state.user.userDetails)
  const navigate = useNavigate()

  // Table Column
  const columns = [
    {
      title: 'W-L-T',
      dataIndex: 'wlt',
      key: 'wlt',
    },
    {
      title: 'PCT',
      dataIndex: 'pct',
      key: 'pct',
    },
    {
      title: 'GB',
      dataIndex: 'gb',
      key: 'gb',
    },
    // {
    //   title: 'STRK',
    //   dataIndex: 'strk',
    //   key: 'strk',
    // },
    {
      title: 'PF',
      dataIndex: 'pf',
      key: 'pf',
    },
    {
      title: 'AVG PF',
      dataIndex: 'avgpf',
      key: 'avgpf',
    },
    {
      title: 'PA',
      dataIndex: 'pa',
      key: 'pa',
    },
    {
      title: 'AVG PA',
      dataIndex: 'avgpa',
      key: 'avgpa',
    },
    {
      title: 'DIV W-L-T',
      dataIndex: 'divwlt',
      key: 'divwlt',
    },
    {
      title: 'CONF W-L-T',
      dataIndex: 'confwlt',
      key: 'confwlt',
    },
  ]

  const handleNavigate = (id) => {
    if (USER?.team?._id === id) {
      navigate(`/player-roster`)
    } else {
      navigate(`/team-roster/${id}`)
    }
  }
  const handleStartersNavigate = (id, teamName) => {
    if (USER?.team?._id === id) {
      navigate(`/depth-chart`)
    } else {
      navigate(`/team-starters/${id}`, {
        state: {
          teamName,
        },
      })
    }
  }


  return (
    <div className='league_standing_card' style={{ marginTop: index === 0 && '0px' }}>
      <h3 className='text'>
        {data?.conference} - {data?._id}
      </h3>
      {data?.standing

        ?.sort((a, b) => {
          // First, sort by wins
          const winDifference = b?.teamScore?.win - a?.teamScore?.win
          if (winDifference !== 0) return winDifference

          // If wins are the same, sort by avgPf
          return b?.teamScore?.avgPf - a?.teamScore?.avgPf
        })

        ?.map((v) => {
          let separatedObjects = {}
          let divisionName = v.team.division.name

          if (!separatedObjects[divisionName]) {
            separatedObjects[divisionName] = []
          }

          separatedObjects[divisionName].push(data)

          const firstKey = Object.keys(separatedObjects)[0]

          // Extracting teams from the dynamic key
          let teams = separatedObjects[firstKey][0].standing

          // Find the highest number of wins
          let highestWins = Math.max(...teams.map((team) => team.teamScore.win))
          let lowestWins = Math.min(...teams.map((team) => team.teamScore.lose))

          // Calculate gb for each team
          let gbResults = teams.map((team) => {
            const wins = team.teamScore.win
            const losses = team.teamScore.lose

            const gb = (highestWins - wins + (losses - lowestWins)) / 2

            return {
              teamId: team.teamId,
              gb: gb,
            }
          })

          const getGbValue = (teamId) => {

            const found = gbResults.find((item) => String(item.teamId) === String(teamId))
            return found ? found.gb : '-' // Return gb or '-' if not found
          }

          // let calculatestrk =
          //   v.teamScore.win + v.teamScore.lose + v.teamScore.tie === 0
          //     ? '-' // If all are zero, show '-'
          //     : v.teamScore.win === 0 && v.teamScore.lose === 0
          //     ? '-' // If both win and lose are zero, also show '-'
          //     : v.teamScore.win === 0
          //     ? `${v.teamScore.lose} L` // If win is zero, show losses
          //     : v.teamScore.lose === 0
          //     ? `${v.teamScore.win} W` // If lose is zero, show wins
          //     : `${v.teamScore.win} W, ${v.teamScore.lose} L`

          // const team = teams.find((x) => v?.teamId === x?._id)
          return (
            <div key={v?.team?.name} className='table_card'>
              <div className='table_header'>
                <h3 onClick={() => handleNavigate(v?.teamId)}>{v?.team?.name}</h3>
                <div>
                  <h4 onClick={() => handleStartersNavigate(v?.teamId, v?.team?.name)}>
                    View Starters
                  </h4>
                </div>
              </div>
              <div className='table_body'>
                <div
                  className='table_image'
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigate(v?.teamId)}
                >
                  <img src={v?.team?.logo} alt={v?.team?.name} />
                </div>
                <div className='main_ls_table'>
                  <Table
                    dataSource={[
                      {
                        key: v?._id,
                        wlt: `${v?.teamScore?.win}-${v?.teamScore?.lose}-${v?.teamScore?.tie}`,
                        // pct: v?.teamScore?.pct,
                        // pct:
                        //   v?.teamScore?.win /
                        //   (v?.teamScore?.win + v?.teamScore?.lose + v?.teamScore?.tie || 1),
                        pct: (
                          (v?.teamScore?.win / 
                           (v?.teamScore?.win + v?.teamScore?.lose + v?.teamScore?.tie || 1))
                        ).toFixed(3),
                        

                        // gb: v?.teamScore?.gb,
                        gb: getGbValue(v.teamId),
                        // strk: v?.teamScore?.strk ? v?.teamScore?.strk : '-',

                        // strk: calculatestrk,
                        pf: v?.teamScore?.pf?.toFixed(2),
                        avgpf: v?.teamScore?.avgPf?.toFixed(2),
                        pa: v?.teamScore?.pa?.toFixed(2),
                        avgpa: v?.teamScore?.avgPa?.toFixed(2),
                        divwlt: `${v?.teamScore?.divWin}-${v?.teamScore?.divLose}-${v?.teamScore?.divTie}`,
                        confwlt: `${v?.teamScore?.confWin}-${v?.teamScore?.confLose}-${v?.teamScore?.confTie}`,
                      },
                    ]}
                    columns={columns}
                    bordered={false}
                    pagination={false}
                    size='small'
                    scroll={{ x: 800 }}
                  />
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default LeagueStandingCard
