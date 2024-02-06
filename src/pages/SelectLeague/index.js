import React from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Button, Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

const SelectLeague = () => {
  const data = [
    {
      title: 'Professional',
      subTitle: 'League',
      description:
        "The SAM Pro League, an exclusive dynasty with 30 teams, features intense competition as teams, owners, and GMs vie for success throughout the season and playoffs. Notably, scouting plays a crucial role in player recruitment. The league uniquely ties its prize pool to each sport's profits, with teams actively contributing to potential earnings. This innovative approach enhances competitiveness and aligns the league's prosperity with the financial success of individual sports within the SAM Pro framework.",
      isDisabled: true,
      align: 'left',
      navigateTo: '/create-join-league',
    },
    {
      title: 'Public',
      subTitle: 'Weekly H2H',
      description:
        'Similar to the Pro league, each leagues are made of 30 teams and 6 divisions. These leagues allow you to play like the pro without the financial risks. Our token allows you to pay to improve your teams and give you more chances to win at the end of season.',
      isDisabled: false,
      align: 'right',
      navigateTo: '/create-join-league',
    },
  ]

  return (
    <div className='select_game_container select_league_container'>
      <SelectGameLeft logo={localStorage.getItem('imagePath')} />
      <SelectGameRight>
        <div className='select_league_body'>
          <div className='button_box'>
            <Button type='primary'>Step 1</Button>
            <Button type='primary' className='inactive'>
              Step 2
            </Button>
          </div>
          <div className='card_conatiner'>
            <Row gutter={[30, 30]}>
              {data.map((v, i) => {
                return (
                  <Col key={i} xs={24} lg={12}>
                    <LeagueJoiningCard data={v} />
                  </Col>
                )
              })}
            </Row>
          </div>
        </div>
      </SelectGameRight>
    </div>
  )
}

const LeagueJoiningCard = ({ data }) => {
  const { title, subTitle, description, align, isDisabled, navigateTo } = data
  const navigate = useNavigate()

  return (
    <div className='league_joining_card'>
      <div className={`header ${align === 'left' ? 'headerLeft' : 'headerRight'}`}>
        <p className='text1'>{title}</p>
        <p className='text2'>{subTitle}</p>
      </div>
      <div className='description'>
        <p>{description}</p>
      </div>
      <Button disabled={isDisabled} type='primary' onClick={() => navigate(navigateTo)}>
        APPLY
      </Button>
    </div>
  )
}

export default SelectLeague
