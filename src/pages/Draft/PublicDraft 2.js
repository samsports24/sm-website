import React from 'react'
import ClockComponent from './ClockComponent'
import RoundComponent from './RoundComponent'
import DraftComponent from './DraftComponent'
import RosterDetail from './RosterDetail'
import TeamFinancialsComponent from './TeamFinancialsComponent'
import TableComponent from './TableComponent'
import ManualBIdEntry from './ManualBIdEntry'
import Header from '../../components/Header'

const PublicDraft = () => {
  return (
    <>
      <Header />
      <div className='public_draft_container'>
        <div className='public_d_left'>
          <ClockComponent />
          <RoundComponent height={'523px'} />
          <ManualBIdEntry />
        </div>
        <div className='public_d_center'>
          <RosterDetail playerFinancials />
          <TableComponent publicDraft tableScroll={{ x: 730, y: 513 }} />
        </div>
        <div className='public_d_right'>
          <TeamFinancialsComponent />
          <DraftComponent title={'Draft Queue'} height={'95px'} close />
          <DraftComponent title={'Draft History'} height={'137px'} header />
          <DraftComponent title={'Team Rosters'} height={'137px'} selectBox />
        </div>
      </div>
    </>
  )
}

export default PublicDraft
