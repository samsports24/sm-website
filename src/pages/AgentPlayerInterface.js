import { Button, Breadcrumb } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'

import {
  ActivateFromPracticeSquad,
  AuctionPlayer,
  MoveToInjured,
  PoachPlayer,
  ReleasePlayer,
  MoveToPracticeSquad,
  TradePlayer,
  MakeOffer,
} from '../components/modal/PlayerInterfaceModals'
import GmCard from '../components/playerInterface/GmCard'
import PlayerStats from '../components/playerInterface/PlayerStats'
import ContractInfo from '../components/playerInterface/ContractInfo'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'

const AgentPlayerInterface = () => {
  let infoData = [
    {
      title: 'Postion',
      value: 'Gridiron Seals (UFAFL)',
    },
    {
      title: 'Height',
      value: `6'4"`,
    },
    {
      title: 'Years in League',
      value: '3 Years',
    },
    {
      title: 'Player College',
      value: 'College Name',
    },
    {
      title: 'Age',
      value: '28 (Mar 21, 1995)',
    },
  ]

  return (
    <div className='player_interface_container'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
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
      <section className='filter_box'>
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

        <MakeOffer />

        <span className='divider_bar'>|</span>

        <PoachPlayer />
      </section>

      <GmCard isButton />
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
    </div>
  )
}

export default AgentPlayerInterface
