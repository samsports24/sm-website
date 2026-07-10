import React from 'react'
import ClockComponent from './ClockComponent'
import RoundComponent from './RoundComponent'
import DraftComponent from './DraftComponent'
import RosterDetail from './RosterDetail'
import TableComponent from './TableComponent'
import Header from '../../components/Header'
import SubmitButton from './SubmitButton'

const ProfessionalDraft = () => {
  return (
    <>
      <Header />
      <div className='draft_container'>
        <div className='d_left'>
          <ClockComponent />
          <RoundComponent height={'380px'} />
          <SubmitButton />
        </div>
        <div className='d_center'>
          <RosterDetail />
          <TableComponent professionalDraft tableScroll={{ x: 730, y: 329 }} />
        </div>
        <div className='d_right'>
          <DraftComponent title={'Draft Queue'} height={'95px'} close />
          <DraftComponent title={'Draft History'} height={'137px'} header />
          <DraftComponent title={'Team Rosters'} height={'137px'} selectBox />
        </div>
      </div>
    </>
  )
}

export default ProfessionalDraft
