import { useEffect, useState } from 'react'
import { Button, Breadcrumb, Table } from 'antd'
const { Column, ColumnGroup } = Table

import { useNavigate } from 'react-router-dom'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

import { getPlayerStandings } from '../redux'
import { useSelector } from 'react-redux'

const PlayerStandings = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const USER = useSelector((state) => state?.user)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [activeButton, setActiveButton] = useState('ALL')
  const [filterData, setFilterData] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    USER?.userDetails && getData()
  }, [SETTING.week])

  useEffect(() => {
    if (activeButton === 'ALL') {
      setFilterData(data)
    } else if (activeButton === 'OL') {
      setFilterData(data?.filter((v) => v?.FantasyPosition === activeButton))
    } else if (activeButton === 'PK') {
      setFilterData(data?.filter((v) => v?.Position === 'K'))
    } else if (activeButton === 'PN') {
      setFilterData(data?.filter((v) => v?.Position === 'P'))
    } else {
      setFilterData(data?.filter((v) => v?.Position === activeButton))
    }
  }, [activeButton])

  const getData = async () => {
    !isLoading && setIsLoading(true)
    const res = await getPlayerStandings({
      week: SETTING.week,
    })

    setData(res)
    setFilterData(res)
    setIsLoading(false)
  }

  const getPoints = (array, value) => {
    if (array.length > 0) {
      const point = array.find((v) => v?.metric === value)
      return point?.total?.toFixed(2)
    } else {
      return '-'
    }
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate()}>
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

      <section className='squad_card_container transparent player_standing_page'>
        <div className='header'>
          <h2>PLAYER STANDING</h2>

          <div className='player_standing_filter_button'>
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'PK', 'DT', 'DE', 'LB', 'CB', 'S', 'PN'].map(
              (v) => {
                return (
                  <Button
                    className={`${activeButton === v && 'activeFilterBtn'}`}
                    key={v}
                    type='primary'
                    onClick={() => setActiveButton(v)}
                  >
                    {v}
                  </Button>
                )
              },
            )}
          </div>
        </div>

        <Table
          loading={isLoading}
          dataSource={filterData}
          pagination={{ showSizeChanger: false }}
          scroll={{ x: 1500, y: 500 }}
          bordered
        >
          {/* <Column
            title=' ' // Empty with space
            dataIndex='HostedHeadshotNoBackgroundUrl'
            key='image'
            render={(value) => {
              return (
                <div className='image_box'>
                  <img src={value ? value : require('../assets/player-img-6.png')} />
                </div>
              )
            }}
          /> */}
          <Column title='NAME' dataIndex='Name' key='name' />
          <Column
            title='POSITION/TEAM'
            dataIndex='Team'
            key='team'
            render={(_, obj) => {
              return (
                <p>
                  {obj?.Position}-{obj?.Team}({obj?.Number}){' '}
                  {obj.UpcomingGameOpponent && `VS ${obj.UpcomingGameOpponent}`}
                </p>
              )
            }}
          />
          <ColumnGroup title='FANTASY'>
            <Column title='PTS' dataIndex='playerScore' key='fantasy-pts' />
          </ColumnGroup>
          <ColumnGroup title='RUSHING'>
            <Column
              title='ATT'
              dataIndex='points'
              key='rushing-att'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'RushingAttempts')}</p>
              }}
            />
            <Column
              title='YD'
              dataIndex='yd'
              key='rushing-yd'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'RushingYards')}</p>
              }}
            />
            <Column
              title='TD'
              dataIndex='td'
              key='rushing-td'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'RushingTouchdowns')}</p>
              }}
            />
          </ColumnGroup>
          <ColumnGroup title='RECEIVING'>
            <Column
              title='REC'
              dataIndex='rec'
              key='receiving-rec'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'Receptions')}</p>
              }}
            />
            <Column
              title='TAR'
              dataIndex='tar'
              key='receiving-tar'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'ReceivingTargets')}</p>
              }}
            />
            <Column
              title='YD'
              dataIndex='yd2'
              key='receiving-yd'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'ReceivingYards')}</p>
              }}
            />
            <Column
              title='TD'
              dataIndex='td2'
              key='receiving-td'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'ReceivingTouchdowns')}</p>
              }}
            />
          </ColumnGroup>
          <ColumnGroup title='PASSING'>
            <Column
              title='CMP'
              dataIndex='cmp'
              key='passing-rec'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'PassingCompletions')}</p>
              }}
            />
            <Column
              title='ATT'
              dataIndex='att2'
              key='passing-tar'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'PassingAttempts')}</p>
              }}
            />
            <Column
              title='YD'
              dataIndex='yd3'
              key='passing-yd'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'PassingYards')}</p>
              }}
            />
            <Column
              title='TD'
              dataIndex='td3'
              key='passing-td'
              render={(_, obj) => {
                return <p>{getPoints(obj?.playerScoreBreakDown, 'PassingTouchdowns')}</p>
              }}
            />
          </ColumnGroup>
        </Table>
      </section>
    </div>
  )
}

export default PlayerStandings
