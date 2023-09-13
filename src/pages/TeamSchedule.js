import React, { useEffect, useState } from 'react'

import {
  Button,
  Breadcrumb,
  Row,
  Col,
  // Select
} from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import MatchUpOfTheWeek from '../components/MatchUpOfTheWeek'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import {
  //  getAllTeam,
  getTeamSchedule,
} from '../redux/actions/teamActions'
import { useSelector } from 'react-redux'
// import { useSelector } from 'react-redux'
// import { GrFormClose } from 'react-icons/gr'

const TeamSchedule = () => {
  const { week } = useSelector((state) => state.user.setting)
  const [data, setData] = useState([])
  // const [allTeam, setAllTeam] = useState([])
  const [loading, setLoading] = useState(true)
  // const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    getData()
  }, [
    week,
    // selectedTeam
  ])

  const getData = async () => {
    setLoading(true)
    // const res = await getTeamSchedule({ teamFilter: selectedTeam })
    const res = await getTeamSchedule({ teamFilter: '', week })
    setData(res)
    setLoading(false)
  }

  // useEffect(() => {
  //   getTeams()
  // }, [])

  // const getTeams = async () => {
  //   const teams = await getAllTeam()
  //   let updated = []
  //   if (teams) {
  //     teams?.forEach((v) => {
  //       user?.team?._id !== v?._id &&
  //         updated.push({
  //           _id: v?._id,
  //           name: v?.name,
  //         })
  //     })
  //   }
  //   setAllTeam(updated)
  // }

  // const handleTeamChange = (e) => {
  //   setSelectedTeam(e)
  // }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <Row gutter={[30, 30]}>
          <Col xs={24}>
            <div className='header'>
              <h2>TEAM SCHEDULE</h2>

              <div className='right'>
                {/* <p>YOUR TEAM</p> */}
                {/* <Select
                  placeholder='Team'
                  style={{ minWidth: 130 }}
                  onChange={handleTeamChange}
                  allowClear={{ clearIcon: <GrFormClose size={25} onClick={()=> setSelectedTeam("")} /> }}
                  options={allTeam?.map((v) => {
                    return {
                      value: v?._id,
                      label: v?.name,
                    }
                  })}
                /> */}
              </div>
            </div>
          </Col>
          {loading ? (
            <Loader />
          ) : data?.length > 0 ? (
            data?.map((v, i) => (
              <Col key={i} xs={24} lg={12}>
                <MatchUpOfTheWeek data={{ ...v }} />
              </Col>
            ))
          ) : (
            <p className='no_schedule_text'>No Schedule..</p>
          )}
        </Row>
      </section>
    </div>
  )
}

export default TeamSchedule
