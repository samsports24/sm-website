import React from 'react'
import { Row, Col, Typography } from 'antd'

const DraftTeamSection = () => {
  const data = [
    {
      title: 'DRAFT YOUR TEAM',
      description: `Draft your full-size fantasy roster by scouting players and future stars of tomorrow. Set your starting lineup and bench and play in the most realistic fantasy league for prize pools based on your players' real-life performance.`,
    },
    {
      title: 'STRENGTHEN YOUR SQUAD',
      description: `Draft, buy, sell, auction, or trade your assets in SAM Marketplace, featuring all free agents and players based on real-life transfers and trade windows. Improve your lineups by poaching a top performer for an immediate roster boost or draft the next-generation stars for long-term development.`,
    },
    {
      title: 'EARN REWARDS AND COMPETE FOR SFL PRIZE POOLS',
      description: `Each move made in your league is feeding up your league prize pool, making it bigger along the season. Earn SFL rewards to attend some of the most exciting games, earn jerseys from your favorite players and much more`,
    },
  ]
  return (
    <div className='draft_team'>
      <Row>
        <Col xs={24} lg={12}>
          <div className='dt_left paddingInline'>
            {data.map((v) => {
              return (
                <div key={v?.title} className='text_box'>
                  <Typography.Title level={1}>{v?.title}</Typography.Title>
                  <Typography.Title level={2}>{v?.description}</Typography.Title>
                </div>
              )
            })}
          </div>
        </Col>
        <Col xs={24} lg={12} className='dt_right_col'>
          <div className='dt_right'></div>
        </Col>
      </Row>
    </div>
  )
}

export default DraftTeamSection
