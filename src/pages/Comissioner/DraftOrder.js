import { Button, Select, Table, notification } from 'antd'
import React, { useEffect, useState } from 'react'
import { getAllTeamsList } from '../../redux/actions/teamActions'
import { useSelector } from 'react-redux'
import {
  createDraftRound,
  createRandomizedDraftRound,
  deleteDraftRound,
  generateAllRound,
  getDraftRound,
} from '../../redux/actions/draftAction'

const DraftOrder = () => {
  const positionLength = 3 // 32  // 5
  const roundLength = 3 // 40  // 5
  const { loading, draftRounds } = useSelector((state) => state.draft)
  const { currentLeague } = useSelector((state) => state.league)
  const [data, setData] = useState([])
  const [teams, setTeams] = useState([])
  const [ids, setIds] = useState(
    Object.fromEntries(Array.from({ length: roundLength }, (_, i) => [i + 1, []])),
  )
  const [btnLoading, setBtnLoading] = useState(false)

  const getMock = () => {
    const _data = []

    for (let i = 1; i <= positionLength; i++) {
      const obj = {
        position: i,
        rounds: [],
      }
      for (let n = 1; n <= roundLength; n++) {
        obj.rounds.push({
          round: n,
          //   disabled: n !== 1 ? true : false,
          disabled: false,
          team: '',
          _id: '',
        })
      }
      _data.push(obj)
    }
    return _data
  }

  useEffect(() => {
    // _getDraftRound()
    _getTeams()
  }, [])

  useEffect(() => {
    getData()

    return () => {
      setIds(Object.fromEntries(Array.from({ length: roundLength }, (_, i) => [i + 1, []])))
    }
  }, [draftRounds])

  const getData = () => {
    const mockData = [...getMock()]
    draftRounds?.forEach((v) => {
      // console.log('round',v?.round);
      const positionIndex = mockData?.findIndex((x) => v?.position === x?.position)
      const roundIndex = mockData[positionIndex].rounds?.findIndex((x) => v?.round === x?.round)
      mockData[positionIndex].rounds[roundIndex].team = v?.team?._id
      mockData[positionIndex].rounds[roundIndex]._id = v?._id
      
      setIds((prevIds) => {
        const updatedRound = [...prevIds[roundIndex + 1]]
        if (!updatedRound.includes(v?.team?._id)) {
          updatedRound.push(v?.team?._id)
        }
        return {
          ...prevIds,
          [roundIndex + 1]: updatedRound,
        }
      })
    })
    setData(mockData)
  }

  const _getTeams = async () => {
    const res = await getAllTeamsList()
    setTeams(res)
    await getDraftRound()
  }

  const handleSelect = async (value, position, round) => {
    const temp = [...data]
    temp[position - 1].rounds[round - 1].team = value
    setData(temp)

    // SET TEAM IDS
    setIds((prevIds) => ({
      ...prevIds,
      [round]: [...prevIds[round], value],
    }))

    await createDraftRound({
      team: value,
      position,
      round,
    })
  }

  const handleClear = async (value, position, round, teamId) => {
    const temp = [...data]
    temp[position - 1].rounds[round - 1].team = ''
    setData(temp)

    // SET TEAM IDS
    setIds((prevIds) => ({
      ...prevIds,
      [round]: prevIds[round].filter((id) => id !== teamId),
    }))

    await deleteDraftRound(value)
  }

  const handleRandomized = async () => {
    setBtnLoading(2)
    if (teams?.length === positionLength) {
      const _rounds = []
      if (teams?.length > 0) {
        teams?.forEach((v, i) => {
          _rounds.push({
            position: i + 1,
            round: 1,
            league: currentLeague?._id,
            team: v?._id,
          })
        })
      }
      await createRandomizedDraftRound({ rounds: _rounds })
      getData()
      setBtnLoading(-1)
    } else {
      notification.error({
        message: `The teams is not complete yet. (${teams?.length}/${positionLength})`,
        duration: 3,
      })
    }
  }

  const handleGenerateAllRound = async () => {
    setBtnLoading(1)
    await getDraftRound(false)
    const isComplete = draftRounds?.filter((v) => v?.round === 1)
    if (isComplete?.length === positionLength) {
      await generateAllRound()
    } else {
      notification.error({
        message: 'First complete round one.',
        duration: 3,
      })
    }
    setBtnLoading(-1)
  }

  const columns = [
    {
      title: ' ',
      dataIndex: `key`,
      key: `key`,
      render: (_, obj, i) => <p>{i + 1}</p>,
    },
    ...Array(roundLength)
      .fill({})
      .map((v, i) => {
        const index = i + 1
        return {
          title: `Round${index}`,
          dataIndex: `round${index}`,
          key: `round${index}`,
          render: (_, record) => {
            const obj = record.rounds.find((v) => v?.round === index)

            return (
              <Select
                size={'middle'}
                placeholder=' '
                style={{
                  width: '170px',
                }}
                disabled={obj?.disabled}
                value={obj?.team}
                onChange={(value) => {
                  if (value !== undefined) {
                    handleSelect(value, record?.position, obj?.round)
                  }
                }}
                allowClear
                onClear={() => handleClear(obj?._id, record?.position, obj?.round, obj?.team)}
                options={teams?.map((v) => {
                  return {
                    value: v?._id,
                    label: v?.name,
                    // disabled: ids[obj?.round]?.includes(v?._id),
                  }
                })}
              />
            )
          },
          width: 170,
        }
      }),
  ]

  return (
    <div className='team_ownership_container'>
      <div style={{ display: 'flex', gap: '10px', marginBlock: '20px' }}>
        <Button
          loading={btnLoading == 2}
          type='primary'
          onClick={handleRandomized}
          disabled={false}
        >
          RANDOMIZED DRAFT ORDER
        </Button>
        <Button loading={btnLoading == 1} type='primary' onClick={handleGenerateAllRound}>
          GENERATE FOR ALL ROUNDS
        </Button>
      </div>
      <div className='t_o_form_box'>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          // scroll={{ x: 7000 }}
        />
      </div>
    </div>
  )
}

export default DraftOrder
