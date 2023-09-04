import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'
import { useParams, useNavigate } from 'react-router-dom'

// Component
import Header from '../components/Header'

// import {
//   ActivateFromPracticeSquad,
//   AuctionPlayer,
//   MoveToInjured,
//   PoachPlayer,
//   ReleasePlayer,
//   MoveToPracticeSquad,
//   TradePlayer,
// } from '../components/modal/PlayerInterfaceModals'
import GmCard from '../components/playerInterface/GmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { getRosterPlayer } from '../redux/actions/rosterAction'
import { useEffect, useState } from 'react'
import Loader from '../components/Loader'

const PlayerInterface = () => {
  const [player, setPlayer] = useState({})
  const [activePlayers, setActivePlayers] = useState([])
  const [practicePlayers, setPracticePlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    setLoading(true)
    const res = await getRosterPlayer(id)
    if (res) {
      setPlayer(res?.player)
      setActivePlayers(res?.activePlayers)
      setPracticePlayers(res?.practicePlayers)
    }
    setLoading(false)
  }

  let infoData = [
    {
      title: 'Postion',
      value: player?.Position || '-',
    },
    {
      title: 'Height',
      value: player?.Height || '-',
    },
    {
      title: 'Years in League',
      value: player?.Experience <= 1 ? `${player?.Experience} Year` : `${player?.Experience} Years`,
    },
    {
      title: 'Player College',
      value: player?.College,
    },
    {
      title: 'Age',
      value: `${player?.Age} (${player?.BirthDateString})`,
    },
  ]

  return (
    <div className='player_interface_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary' onClick={() => navigate('/player-roster')}>
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

      {loading ? (
        <Loader />
      ) : (
        <>
          <GmCard
            playerData={player}
            activePlayers={activePlayers}
            practicePlayers={practicePlayers}
            getData={getData}
          />
          <div className='info-card'>
            {infoData.map((item, index) => (
              <h3 key={index}>
                {item.title} : <span>{item.value}</span>
              </h3>
            ))}
          </div>
          <hr className='divider' />

          <section className='player_info_container'>
            <PlayerStats />
            <ContractInfo />
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerInterface
