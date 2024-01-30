import { useEffect, useState } from 'react'
import { Table, Pagination as AntPagination } from 'antd'
const { Column, ColumnGroup } = Table
import { useSelector } from 'react-redux'

// Component
import { getPlayerForWeeklyScoring } from '../redux'
import Header from '../components/Header'
import PlayerDetailsModal from '../components/modal/PlayerDetailsModal'

const PlayerStandingWeekly = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [data, setData] = useState([])
  const [weeks, setWeeks] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const getData = async () => {
    const res = await getPlayerForWeeklyScoring({ page })
    setTotalCount(res?.total)
    return res?.players
  }

  const getWeeklyScoring = async () => {
    setLoading(true)
    let tempWeeks = []
    // for (let i = 1; i <= SETTING?.week; i++) {
    for (let i = 1; i <= 18; i++) {
      tempWeeks.push(i)
    }
    setWeeks(tempWeeks)

    const res = await getData()

    let tempResultArr = []
    res?.map((item) => {
      let tempObj = {}

      tempWeeks?.map((week) => {
        const filteredObj = item?.weeklyScoring?.filter(
          (wScore) => Number(wScore?.week) == Number(week),
        )?.[0]
        tempObj = {
          ...tempObj,
          [`week_${week}_score`]: filteredObj?.score,
          week,
        }
      })

      tempObj = {
        ...tempObj,
        name: item?.Name,
        PlayerID: item?.PlayerID,
        position: item?.Position,
        pf: item?.pf?.toFixed(2),
        avgPf: item?.avgPf?.toFixed(2),
      }

      tempResultArr.push(tempObj)
    })

    setData(tempResultArr)

    setLoading(false)
  }

  useEffect(() => {
    getWeeklyScoring()
  }, [page])

  const handlePagination = (val) => setPage(val)

  return (
    <div className='practice_squad_container team_trade_main'>
      <Header />

      <hr className='divider' />

      <section className='squad_card_container transparent player_standing_page'>
        <div className='header'>
          <h2>PLAYER STANDING WEEKLY</h2>

          {/* <div className='player_standing_filter_button'>
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
          </div> */}
        </div>

        {data && (
          <>
            <Table
              loading={loading}
              dataSource={data}
              scroll={{ x: 2000, y: 500 }}
              bordered
              rowKey='_id'
            >
              <Column
                title='NAME'
                dataIndex='name'
                key='name'
                width={150}
                // render={(v) => <p style={{cursor: 'pointer'}}>{v}</p>}
                render={(v, b) => (
                  <PlayerDetailsModal
                    button={v}
                    state={{
                      isFreeAgent: {
                        status: true,
                      },
                      playerID: b?.PlayerID,
                    }}
                    tableRow={true}
                  />
                )}
              />
              <Column title='POS' dataIndex='position' key='position' />
              <Column title='PF' dataIndex='pf' key='pf' />
              <Column title='APF' dataIndex='avgPf' key='avgPf' />
              <ColumnGroup title='Weekly'>
                {weeks?.map((v, index) => (
                  <Column
                    key={index}
                    title={`week ${v}`}
                    dataIndex={`week_${v}_score`}
                    render={(a) => {
                      return typeof a == 'number' ? a : '-'
                    }}
                  />
                ))}
              </ColumnGroup>
            </Table>

            <div className='custom_pagination_box pagination_box'>
              <AntPagination
                defaultCurrent={page}
                total={totalCount}
                showSizeChanger={false}
                onChange={handlePagination}
                pageSize={10}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default PlayerStandingWeekly
