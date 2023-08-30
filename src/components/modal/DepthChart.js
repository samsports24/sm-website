import React, { useEffect, useState } from 'react'
import { Modal, Spin, Popover, Button } from 'antd'

import barIcon from '../../assets/bar-icon.svg'
import { GiAmericanFootballPlayer } from 'react-icons/gi'

const mock = [
  {
    _id: '12345671',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
    starter: true,
  },
  {
    _id: '12345672',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345673',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345674',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345675',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345676',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345677',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345678',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345679',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
  {
    _id: '12345680',
    team: 'KCC',
    position: 'KCC',
    playerName: 'KCC',
    injury: 'KCC',
    gameInfo: 'KCC',
    projection: '7:05',
  },
]

const DepthChart = ({ openModal, setOpenModal, data: propsData }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [starter, setStarter] = useState({})

  const getData = () => {
    setTimeout(() => {
      const starter = mock?.find((v) => v?.starter === true)
      const others = mock?.filter((v) => v?.starter !== true)
      setStarter(starter)
      setData(others)
      setLoading(false)
    }, 2000)
  }

  useEffect(() => {
    getData()
  }, [])

  const handleStarter = (id) => {
    console.log(id)
  }

  const Spinner = () => {
    return (
      <div className='depth_modal_spinner'>
        <Spin />
      </div>
    )
  }

  const Card = ({ data }) => {
    const { _id, imageUrl, team, position, playerName, injury, gameInfo, projection } = data
    return (
      <div className='content_body' onClick={() => handleStarter(_id)}>
        <div className='image_box'>
          {imageUrl ? (
            <img src={imageUrl} />
          ) : (
            <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
          )}
        </div>
        <div>
          <p className='text1'>Team</p>
          <p className='text2'>{team || '-'}</p>
        </div>
        <div>
          <p className='text1'>POS</p>
          <p className='text2'>{position || '-'}</p>
        </div>
        <div>
          <p className='text1'>Player Name</p>
          <p className='text2'>{playerName || '-'}</p>
        </div>
        <div>
          <p className='text1'>Injury</p>
          <p className='text2'>{injury || '-'}</p>
        </div>
        <div>
          <p className='text1'>Game Info</p>
          <p className='text2'>{gameInfo || '-'}</p>
        </div>
        <div>
          <p className='text1'>Projection</p>
          <p className='text2'>{projection || '-'}</p>
        </div>
        <Popover
          placement='left'
          title={starter?._id === _id ? 'Already Selected' : 'Select for Starter'}
          content={
            starter?._id !== _id ? (
              <Button type='primary' className='add_starter_button'>
                Add
              </Button>
            ) : (
              ''
            )
          }
        >
          <img src={barIcon} style={{ cursor: 'pointer' }} />
        </Popover>
      </div>
    )
  }

  const EmptyCard = () => {
    return (
      <div className='content_body'>
        <div className='image_box'>
          <GiAmericanFootballPlayer size={35} color={'#c4c4c4'} />
        </div>
        <img src={barIcon} />
      </div>
    )
  }

  return (
    <Modal
      centered
      open={openModal}
      onCancel={() => setOpenModal(false)}
      footer={null}
      closeIcon={false}
      className='depth_modal'
      closable={false}
    >
      <div className='depth_modal_content'>
        <div className='card_box'>
          <div className='header'>
            <h2>Starter</h2>
            <h2 style={{ textTransform: 'uppercase' }}>{propsData?.text}</h2>
          </div>
          {loading ? (
            <Spinner />
          ) : Object.entries(starter)?.length ? (
            <Card data={starter} />
          ) : (
            <EmptyCard />
          )}
        </div>
        <div className='card_box'>
          <div className='header'>
            <h2>Back-up</h2>
          </div>
          <div className='scroll_section'>{loading ? <Spinner /> : <EmptyCard />}</div>
        </div>
        <div className='card_box'>
          <div className='header'>
            <h2>Bench</h2>
          </div>
          <div className='scroll_section'>
            {loading ? (
              <Spinner />
            ) : data?.length <= 0 ? (
              <EmptyCard />
            ) : (
              data?.map((v, i) => {
                return <Card key={i} data={v} handleStarter={handleStarter} />
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DepthChart
