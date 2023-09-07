import React, { useEffect, useState } from 'react'
import { Modal, Spin, Button } from 'antd'

import { GiAmericanFootballPlayer } from 'react-icons/gi'
import { assignPlayerToStarter, getPlayersByPosition } from '../../redux/actions/depthChartAction'

const DepthChart = ({ openModal, setOpenModal, data: propsData, getDepthChartData }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [starter, setStarter] = useState(null)
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
    })
    if (res) {
      setStarter(res?.starterPlayer)
      setData(res?.bench)
    }
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [openModal])

  const handleStarter = async (id) => {
    setPlayerId(id)
    const res = await assignPlayerToStarter({
      oldPlayerId: starter?._id ? starter?.player?._id : '',
      playerId: id,
      classKey: propsData?.classKey,
      isBackup: propsData?.Position === 'backup qb' ? true : false,
    })
    if (res) {
      await getData()
      await getDepthChartData()
    }
  }

  const Spinner = () => {
    return (
      <div className='depth_modal_spinner'>
        <Spin />
      </div>
    )
  }

  const Card = ({ data, button = false }) => {
    const { _id, ImageUrl, team, Position, Name, InjuryStatus, UpcomingGameOpponent, Projection } =
      data
    return (
      <div className='content_body'>
        <div className='image_box'>
          {ImageUrl ? (
            <img src={ImageUrl} />
          ) : (
            <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
          )}
        </div>
        <div>
          <p className='text1'>Team</p>
          <p className='text2'>{team?.name || '-'}</p>
        </div>
        <div>
          <p className='text1'>POS</p>
          <p className='text2'>{Position || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Name</p>
          <p className='text2'>{Name || '-'}</p>
        </div>
        <div>
          <p className='text1'>Injury</p>
          <p className='text2'>{InjuryStatus || '-'}</p>
        </div>
        <div>
          <p className='text1'>OPP</p>
          <p className='text2'>{UpcomingGameOpponent || '-'}</p>
        </div>
        <div>
          <p className='text1'>Projection</p>
          <p className='text2'>{Projection || '-'}</p>
        </div>
        {button && (
          <Button
            type='primary'
            className='add_starter_button'
            loading={playerId === _id ? true : false}
            onClick={() => handleStarter(_id)}
          >
            {propsData?.Position === 'backup qb' ? 'Add to Backup' : 'Add to Starter'}
          </Button>
        )}
      </div>
    )
  }

  // const EmptyCard = () => {
  //   return (
  //     <div className='content_body'>
  //       <div className='image_box'>
  //         <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
  //       </div>
  //     </div>
  //   )
  // }

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
            <div className='header' style={{ marginBottom: starter ? '0px' : '20px' }}>
              <h2>Starter</h2>
              <h2 style={{ textTransform: 'uppercase' }}>{propsData?.Position}</h2>
            </div>
            {loading ? <Spinner /> : !!starter && <Card data={starter?.player} />}
          </div>
        )}
        {propsData?.Position === 'backup qb' && (
          <div className='card_box'>
            <div className='header' style={{ marginBottom: starter ? '0px' : '20px' }}>
              <h2>Back-up</h2>
              <h2 style={{ textTransform: 'uppercase' }}>{propsData?.Position}</h2>
            </div>
            <div className='scroll_section'>
              {loading ? <Spinner /> : !!starter && <Card data={starter?.player} />}
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
                return <Card button={true} key={i} data={v} handleStarter={handleStarter} />
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DepthChart
