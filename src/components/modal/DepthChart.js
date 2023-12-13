import React, { useEffect, useState } from 'react'
import { Modal, Spin, Button } from 'antd'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { DeleteOutlined } from '@ant-design/icons'
import {
  assignPlayerToStarter,
  getPlayersByPosition,
  removePlayerFromStarter,
} from '../../redux/actions/depthChartAction'
import { useSelector } from 'react-redux'

const DepthChart = ({ openModal, setOpenModal, data: propsData, getDepthChartData }) => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [data, setData] = useState([])
  const [starter, setStarter] = useState(null)
  const [scores, setScores] = useState(null)
  const [playerId, setPlayerId] = useState('')

  const closeModal = () => {
    setOpenModal(false)
    setData([])
    setStarter(null)
  }

  const getData = async () => {
    setLoading(true)
    const res = await getPlayersByPosition({
      position:
        propsData.Position && propsData.Position === 'backup qb'
          ? 'QB'
          : propsData.Position?.toUpperCase(),
      classKey: propsData?.classKey && propsData?.classKey,
      week: SETTING?.week,
    })
    if (res) {
      setStarter(res?.starterPlayer)
      setData(res?.bench)
      setScores(res?.scores)
    }
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [openModal])

  const handleStarter = async (id) => {
    setPlayerId(id)
    const res = await assignPlayerToStarter({
      oldPlayerId: starter?.players?._id ? starter?.players?._id : '',
      playerId: id,
      classKey: propsData?.classKey,
      isBackup: propsData?.Position === 'backup qb' ? true : false,
      week: SETTING?.week,
    })
    if (res) {
      // await getData()
      await getDepthChartData()
    }
  }

  const handleRemoveStarter = async (id) => {
    setDeleteLoading(true)
    const res = await removePlayerFromStarter(id)
    if (res) {
      // await getData()
      await getDepthChartData()
    }
    setDeleteLoading(false)
  }

  const Spinner = () => {
    return (
      <div className='depth_modal_spinner'>
        <Spin />
      </div>
    )
  }

  const Card = ({ data, button = false, scores }) => {
    const { players: p } = data

    return (
      <div className='content_body'>
        <div className='image_box'>
          {p?.HostedHeadshotNoBackgroundUrl ? (
            <img src={p?.HostedHeadshotNoBackgroundUrl} />
          ) : (
            <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
          )}
        </div>
        {/* <div>
          <p className='text1'>Team</p>
          <p className='text2'>{data?.team?.name || '-'}</p>
        </div> */}
        <div>
          <p className='text1'>POS</p>
          <p className='text2'>{p?.Position || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Name</p>
          <p className='text2'>{p?.Name || '-'}</p>
        </div>
        <div>
          <p className='text1'>Injury</p>
          <p className='text2'>{p?.InjuryStatus || '-'}</p>
        </div>
        <div>
          <p className='text1'>OPP</p>
          <p className='text2'>{p?.UpcomingGameOpponent || '-'}</p>
        </div>
        <div>
          <p className='text1'>PF</p>
          <p className='text2'>{p?.pf || scores?.pf?.[p?.PlayerID] || '-'}</p>
        </div>
        <div>
          <p className='text1'>APF</p>
          <p className='text2'>{p?.avgPf || scores?.apf?.[p?.PlayerID] || '-'}</p>
        </div>
        <div>
          <p className='text1'>Snap%</p>
          <p className='text2'>{p?.Snap || '-'}</p>
        </div>
        <div>
          <p className='text1'>Projection</p>
          <p className='text2'>{p?.Projection || '-'}</p>
        </div>
        {!button && (
          <span>
            {deleteLoading ? (
              <Spin />
            ) : (
              <Button
                shape='circle'
                icon={
                  <DeleteOutlined
                    style={{
                      fontSize: '20px',
                      color: 'red',
                    }}
                  />
                }
                onClick={() => handleRemoveStarter(data?._id)}
              ></Button>
            )}
          </span>
        )}
        {button && (
          <Button
            type='primary'
            className='add_starter_button'
            loading={playerId === p?._id ? true : false}
            onClick={() => handleStarter(p?._id)}
          >
            {propsData?.Position === 'backup qb' ? 'Add to Backup' : 'Add to Starter'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Modal
      centered
      open={openModal}
      onCancel={closeModal}
      footer={null}
      closeIcon={false}
      className='depth_modal'
      closable={false}
    >
      <div className='depth_modal_content'>
        {propsData?.Position !== 'backup qb' && (
          <div className='card_box'>
            <div className='header' style={{ marginBottom: starter?.player ? '0px' : '20px' }}>
              <h2>Starter</h2>
              <h2 style={{ textTransform: 'uppercase' }}>{propsData?.Position}</h2>
            </div>
            {loading ? <Spinner /> : starter?.player && <Card data={starter} />}
          </div>
        )}
        {propsData?.Position === 'backup qb' && (
          <div className='card_box'>
            <div className='header' style={{ marginBottom: starter?.player ? '0px' : '20px' }}>
              <h2>Back-up</h2>
              <h2 style={{ textTransform: 'uppercase' }}>{propsData?.Position}</h2>
            </div>
            <div className='scroll_section'>
              {loading ? <Spinner /> : starter?.player && <Card data={starter} />}
            </div>
          </div>
        )}
        <div className='card_box'>
          <div className='header'>
            <h2>Bench</h2>
          </div>
          <div className='scroll_section'>
            {loading ? (
              <Spinner />
            ) : (
              data?.length > 0 &&
              data?.map((v, i) => {
                return (
                  <Card
                    button={true}
                    key={i}
                    data={v}
                    handleStarter={handleStarter}
                    scores={scores}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DepthChart
