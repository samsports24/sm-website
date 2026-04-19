import { useEffect, useState } from 'react'
// import { Button, Breadcrumb } from 'antd'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import GmCard from '../components/playerInterface/FreeAgentGmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
import Loader from '../components/Loader'
import PlayerInfoBottom from '../components/PlayerInfoBottom'
import { getFreeAgentRosterPlayer } from '../redux/actions/rosterAction'

const AgentPlayerInterface = () => {
  const SETTING = useSelector((state) => state?.user?.setting)
  const [player, setPlayer] = useState({})
  const [news, setNews] = useState(null)
  const [playerContract, setPlayerContract] = useState(null)
  const [loading, setLoading] = useState(true)

  // const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    setLoading(true)
    const res = await getFreeAgentRosterPlayer({ id: Number(id), week: SETTING?.week })
    if (res) {
      setPlayerContract(null)
      setPlayer(res?.player)
      setNews(res?.news)
    }
    setLoading(false)
  }

  return (
    <div className='player_interface_container'>
      {/* BREADCRUMB */}
      {/* <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate('/free-agent')}>
          Back
        </Button>
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
      </section> */}

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      {loading ? (
        <Loader />
      ) : (
        <>
          <GmCard playerData={player} news={news} />

          <PlayerInfoBottom
            player={player}
            contract={
              playerContract?.PlayerCap ? `${playerContract?.PlayerCap?.toLocaleString()} SP` : '-'
            }
          />

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
