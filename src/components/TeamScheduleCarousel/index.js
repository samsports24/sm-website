import React from 'react'
import moment from 'moment'
import Carousel from 'react-multi-carousel'
import { useSelector } from 'react-redux'
import CustomCarousel from '../Carousel/CustomCarousel'

const TeamScheduleCarousel = ({ data }) => {
  const SETTING = useSelector((state) => state.user)
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 12,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1900 },
      items: 8.5,
    },
    desktop1: {
      breakpoint: { max: 1900, min: 1400 },
      items: 6.5,
    },
    desktop2: {
      breakpoint: { max: 1400, min: 1300 },
      items: 5.5,
    },
    desktop3: {
      breakpoint: { max: 1300, min: 1150 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1150, min: 900 },
      items: 2,
    },
    tablet2: {
      breakpoint: { max: 900, min: 600 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  }

  const findAndGet = (data) => {
    const { userDetails, currentWeek } = SETTING
    const { team } = userDetails || {}
    const { _id: teamId } = team || {}
    const { opponentOne, opponentTwo, matchStartDate, scoreOne, scoreTwo, week } = data

    const myTeam = teamId === opponentOne?._id
    const isWeek = currentWeek >= week
    const formattedMatchDate = moment(matchStartDate).format('MMM-DD')
    const formattedScoreOne = scoreOne
    const formattedScoreTwo = scoreTwo

    const obj = {
      logo: myTeam ? opponentTwo?.logo : opponentOne?.logo,
      teamScore: isWeek
        ? scoreOne > scoreTwo
          ? `W ${formattedScoreOne} - ${formattedScoreTwo}`
          : scoreOne == scoreTwo
          ? `T ${formattedScoreOne} - ${formattedScoreTwo}`
          : `L ${formattedScoreOne} - ${formattedScoreTwo}`
        : formattedMatchDate,
    }

    if (!myTeam) {
      obj.logo = opponentOne?.logo
    }

    return obj
  }

  return (
    <div className='tsc_box'>
      <Carousel responsive={responsive} arrows={false} infinite={true}>
        {data
          ?.sort((a, b) => a?.week - b?.week)
          ?.map((v, i) => {
            findAndGet(v)
            return (
              <div
                key={i}
                className={`tsc_card ${SETTING?.currentWeek == v?.week ? 'activeWeek' : ''}`}
              >
                <div className='tsc_card_left'>
                  <p className='week_text'>Week {v?.week}</p>
                  <p className='point_text'>{findAndGet(v)?.teamScore}</p>
                </div>
                <div
                  className='tsc_card_right'
                  style={{ backgroundImage: `url(${findAndGet(v)?.logo})` }}
                />
              </div>
            )
          })}
      </Carousel>
    </div>
  )
}
export default TeamScheduleCarousel

const TeamScheduleCustomCarousel = ({ data }) => {
  const SETTING = useSelector((state) => state.user)

  const findAndGet = (data) => {
    const { userDetails, currentWeek } = SETTING
    const { team } = userDetails || {}
    const { _id: teamId } = team || {}
    const { opponentOne, opponentTwo, matchStartDate, scoreOne, scoreTwo, week } = data

    const myTeam = teamId === opponentOne?._id
    const isWeek = currentWeek >= week
    const formattedMatchDate = moment(matchStartDate).format('MMM-DD')
    const formattedScoreOne = scoreOne
    const formattedScoreTwo = scoreTwo

    const obj = {
      logo: myTeam ? opponentTwo?.logo : opponentOne?.logo,
      teamScore: isWeek
        ? scoreOne > scoreTwo
          ? `W ${formattedScoreOne} - ${formattedScoreTwo}`
          : scoreOne == scoreTwo
          ? `T ${formattedScoreOne} - ${formattedScoreTwo}`
          : `L ${formattedScoreOne} - ${formattedScoreTwo}`
        : formattedMatchDate,
    }

    if (!myTeam) {
      obj.logo = opponentOne?.logo
    }

    return obj
  }

  return (
    <CustomCarousel height={'100px'}>
      {data
        ?.sort((a, b) => a?.week - b?.week)
        ?.map((v, i) => {
          return (
            <div
              key={i}
              className={`tsc_card ${SETTING?.currentWeek == v?.week ? 'tsc_activeWeek' : ''}`}
            >
              <div className='tsc_card_left'>
                <p className='week_text'>Week {v?.week}</p>
                <p className='point_text'>{findAndGet(v)?.teamScore}</p>
              </div>
              <div
                className='tsc_card_right'
                style={{ backgroundImage: `url(${findAndGet(v)?.logo})` }}
              />
            </div>
          )
        })}

      {!data.some((v) => SETTING?.currentWeek === v?.week) && (
        <div className='tsc_card'>
          <div className='tsc_card_left'>
            <p className='week_text'>Week {SETTING?.currentWeek}</p>
            <p className='point_text'>By Week</p>
          </div>
        </div>
      )}
    </CustomCarousel>
  )
}

export { TeamScheduleCustomCarousel }
