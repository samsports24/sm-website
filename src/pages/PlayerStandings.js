import { useEffect, useState } from 'react'
import { Button, Table } from 'antd'
const { Column, ColumnGroup } = Table

import { useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'
import HeadingAndWeek from '../components/Pagination/HeadingAndWeek'

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
    const point = array?.playerScoreBreakDown?.find((v) => v?.metric === value)
    return point?.total?.toFixed(2) || '-'
  }
  const getOlPoints = (array, value) => {
    const newValue = array?.playerScoreBreakDown?.[0][value]
    return newValue?.toFixed(2) || null
  }

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />
      <HeadingAndWeek />

      <hr className='divider' />

      <section className='squad_card_container transparent player_standing_page'>
        <div className='header'>
          <h2>PLAYER STANDING</h2>

          <div className='player_standing_filter_button'>
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'PK', 'DT', 'DE', 'LB', 'CB', 'S', 'PN'].map(
              (v) => {
                return (
                  <Button
                    className={`${activeButton === v ? 'activeFilterBtn' : ''}`}
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
          scroll={{ x: 2000, y: 500 }}
          bordered
          rowKey='_id'
        >
          <Column title='NAME' dataIndex='Name' key='name' />
          <Column
            title='POSITION / TEAM'
            dataIndex='Team'
            key='team'
            render={(_, obj) => (
              <p>
                {obj?.Position}-{obj?.Team}({obj?.Number}){' '}
                {obj.UpcomingGameOpponent && `VS ${obj.UpcomingGameOpponent}`}
              </p>
            )}
          />
          <ColumnGroup title='FANTASY'>
            <Column title='PTS' dataIndex='playerScore' key='fantasy-pts' />
          </ColumnGroup>
          <ColumnGroup title='RUSHING'>
            <Column
              title='ATT'
              dataIndex='points'
              key='rushing-att'
              render={(_, obj) => <p>{getPoints(obj, 'RushingAttempts')}</p>}
            />
            <Column
              title='YD'
              dataIndex='yd'
              key='rushing-yd'
              render={(_, obj) => (
                <p>
                  {getOlPoints(obj, 'RushingYards')
                    ? getOlPoints(obj, 'RushingYards')
                    : getPoints(obj, 'RushingYards')}
                </p>
              )}
            />
            <Column
              title='TD'
              dataIndex='td'
              key='rushing-td'
              render={(_, obj) => (
                <p>
                  {getOlPoints(obj, 'RushingTouchdowns')
                    ? getOlPoints(obj, 'RushingTouchdowns')
                    : getPoints(obj, 'RushingTouchdowns')}
                </p>
              )}
            />
          </ColumnGroup>
          <ColumnGroup title='RECEIVING'>
            <Column
              title='REC'
              dataIndex='rec'
              key='receiving-rec'
              render={(_, obj) => <p>{getPoints(obj, 'Receptions')}</p>}
            />
            <Column
              title='TAR'
              dataIndex='tar'
              key='receiving-tar'
              render={(_, obj) => <p>{getPoints(obj, 'ReceivingTargets')}</p>}
            />
            <Column
              title='YD'
              dataIndex='yd2'
              key='receiving-yd'
              render={(_, obj) => <p>{getPoints(obj, 'ReceivingYards')}</p>}
            />
            <Column
              title='TD'
              dataIndex='td2'
              key='receiving-td'
              render={(_, obj) => <p>{getPoints(obj, 'ReceivingTouchdowns')}</p>}
            />
          </ColumnGroup>
          <ColumnGroup title='PASSING'>
            <Column
              title='CMP'
              dataIndex='cmp'
              key='passing-rec'
              render={(_, obj) => <p>{getPoints(obj, 'PassingCompletions')}</p>}
            />
            <Column
              title='ATT'
              dataIndex='att2'
              key='passing-tar'
              render={(_, obj) => <p>{getPoints(obj, 'PassingAttempts')}</p>}
            />
            <Column
              title='YD'
              dataIndex='yd3'
              key='passing-yd'
              render={(_, obj) => <p>{getPoints(obj, 'PassingYards')}</p>}
            />
            <Column
              title='TD'
              dataIndex='td3'
              key='passing-td'
              render={(_, obj) => (
                <p>
                  {getOlPoints(obj, 'PassingTouchdowns')
                    ? getOlPoints(obj, 'PassingTouchdowns')
                    : getPoints(obj, 'PassingTouchdowns')}
                </p>
              )}
            />
          </ColumnGroup>
          <Column
            title='Times Sacked'
            dataIndex='times-sacked'
            key='times-sacked'
            render={(_, obj) => (
              <p>{getOlPoints(obj, 'TimesSacked') ? getOlPoints(obj, 'TimesSacked') : '-'}</p>
            )}
          />
          <Column
            title='Snap Percentage'
            dataIndex='player-snap'
            key='player-snap'
            render={(_, obj) => (
              <p>{getOlPoints(obj, 'playerSnap') ? `${getOlPoints(obj, 'playerSnap')}%` : '-'}</p>
            )}
          />
          <Column
            title='Team Score'
            dataIndex='team-score'
            key='team-score'
            render={(_, obj) => (
              <p>{getOlPoints(obj, 'teamScore') ? getOlPoints(obj, 'teamScore') : '-'}</p>
            )}
          />
        </Table>
      </section>
    </div>
  )
}

export default PlayerStandings
