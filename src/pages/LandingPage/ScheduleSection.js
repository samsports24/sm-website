import React, { useState } from 'react'
import { Col, Row } from 'antd'

import NewLeagueScoreCard from '../../components/NewLeagueScoreCard'
import { getScheduleByWeek } from '../../redux'

const ScheduleSection = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDataByWeek()
  }, [SETTING?.week])

  const getDataByWeek = async () => {
    setLoading(true)
    const res = await getScheduleByWeek(SETTING?.week)
    setData(res)
    setLoading(false)
  }
  return (
    <div className='schedule_section'>
      <Row>
        {data?.map((value, index) => (
          <Col xs={24} xl={12} key={index}>
            <NewLeagueScoreCard data={{ ...value, index }} />
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default ScheduleSection
