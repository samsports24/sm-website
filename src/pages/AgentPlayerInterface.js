import { Button, Breadcrumb } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import Arrow from '../assets/arrow-right.svg'

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
import GmCard from '../components/playerInterface/FreeAgentGmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import { useEffect, useState } from 'react'
import { getRosterPlayer } from '../redux/actions/rosterAction'
import Loader from '../components/Loader'

const AgentPlayerInterface = () => {
  const [player, setPlayer] = useState({})
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    setLoading(true)
    const res = await getRosterPlayer(id)
    if (res) {
      setPlayer(res?.player)
      setNews(res?.news)
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
      <Button className='back_button' type='primary' onClick={() => navigate('/free-agent')}>
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

      {/* MODALS */}
      {/* <section className='filter_box'>
        <AuctionPlayer />

        <span className='divider_bar'>|</span>

        <TradePlayer />

        <span className='divider_bar'>|</span>

        <ReleasePlayer />

        <span className='divider_bar'>|</span>

        <MoveToInjured />

        <span className='divider_bar'>|</span>

        <ActivateFromPracticeSquad />

        <span className='divider_bar'>|</span>

        <MoveToPracticeSquad />

        <span className='divider_bar'>|</span>

        <h2
          onClick={() => {
            navigate('/team-trade')
          }}
          className='modal_button_text'
        >
          MAKE OFFER
        </h2>

        <span className='divider_bar'>|</span>

        <PoachPlayer />
      </section> */}

      {loading ? (
        <Loader />
      ) : (
        <>
          <GmCard playerData={player} news={news} />
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

export default AgentPlayerInterface
