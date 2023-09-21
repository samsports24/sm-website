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
import { useSelector } from 'react-redux'
import PlayerInfoBottom from '../components/PlayerInfoBottom'

const PlayerInterface = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [player, setPlayer] = useState({})
  const [news, setNews] = useState(null)
  const [activePlayers, setActivePlayers] = useState([])
  const [practicePlayers, setPracticePlayers] = useState([])
  const [playerContract, setPlayerContract] = useState(null)
  const [loading, setLoading] = useState(true)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    setLoading(true)
    const res = await getRosterPlayer({
      id,
      week: SETTING?.week,
    })
    if (res) {
      setPlayer(res?.player)
      setNews(res?.news)
      setActivePlayers(res?.activePlayers)
      setPracticePlayers(res?.practicePlayers)
      setPlayerContract(res?.playerContract)
    }
    setLoading(false)
  }

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

      <ButtonsAndPagination noWeek={true} />

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
            news={news}
          />
          <PlayerInfoBottom
            player={player}
            contract={
              playerContract?.PlayerCap ? `$${playerContract?.PlayerCap?.toLocaleString()}` : '-'
            }
          />

          <section className='player_info_container'>
            <PlayerStats />
            <ContractInfo data={playerContract} />
          </section>
        </>
      )}
    </div>
  )
}

export default PlayerInterface
