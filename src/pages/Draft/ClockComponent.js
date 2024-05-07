import React from 'react'
// import { FaArrowsRotate } from 'react-icons/fa6'
import Countdown from 'react-countdown'
import { useSelector, useDispatch } from 'react-redux'

const ClockComponent = () => {
  const { currentLeague } = useSelector((state) => state.league)
  console.log("🚀 ~ ClockComponent ~ currentLeague:", currentLeague)
  const {
    draftRounds,
    draftCounter,
    onTheClock,
    completed: _completed,
  } = useSelector((state) => state.draft)

  const dispatch = useDispatch()

  const beforeRenderer = ({ days, hours, minutes, seconds, completed }) => {
    const d = String(days)
    const h = String(hours)
    const m = String(minutes).padStart(2, '0')
    const s = String(seconds).padStart(2, '0')

    const draftLiveMessage = currentLeague?.isDraftLive && (
      <>
        <h2 className='textLive'>Draft is Live!</h2>
        <br />
      </>
    )

    return (
      <>
        {draftLiveMessage}
        {completed ? (
          <p>00:00</p>
        ) : (
          <>
            {(d || h) && (
              <h2 style={{ marginBottom: '40px' }}>
                Day: {d} Hour: {h}
              </h2>
            )}
            {/* <div style={{ height: '40px' }} /> */}
            {/* <br /> */}
            <p>{`${m}:${s}`}</p>
          </>
        )}
      </>
    )
  }
  const afterRenderer = ({ minutes, seconds, completed }) => {
    const m = String(minutes).padStart(2, '0')
    const s = String(seconds).padStart(2, '0')

    const draftLiveMessage = currentLeague?.isDraftLive && (
      <>
        <h2 className='textLive' style={{ marginBottom: '20px' }}>
          Draft is Live!
        </h2>
        {/* {_completed && <p>Time is up running auto player pick.</p>} */}
      </>
    )

    // if (completed && !_completed) {
    //   dispatch(setCompleted(true))
    // }
    // if (s > 0 && _completed) {
    //   dispatch(setCompleted(false))
    // }

    return (
      <>
        {draftLiveMessage}
        {completed ? <p>00:00</p> : <p>{`${m}:${s}`}</p>}
      </>
    )
  }

  const Timer = () => {
    return (
      <Countdown
        date={new Date(
          onTheClock && currentLeague?.isDraftLive ? draftCounter?.time : currentLeague?.draftStart,
        ).getTime()}
        renderer={onTheClock && currentLeague?.isDraftLive ? afterRenderer : beforeRenderer}
      />
    )
  }

  return (
    <div className='clock_box'>
      <div className='time_box'>
        <Timer />
      </div>
      {onTheClock && currentLeague?.isDraftLive && (
        <div className='clock_box_bottom'>
          <div className='cbb_right' style={{ backgroundImage: `url(${onTheClock?.team?.logo})` }}>
            {/* <FaArrowsRotate color='var(--primary)' size={30} /> */}
          </div>
          <div className='cbb_center'>
            <p>On The Clock</p>
            <p>{onTheClock?.team?.name}</p>
          </div>
          <div className='cbb_left'>
            {/* <p>#73</p> */}
            <p>#{draftRounds?.findIndex((v) => v?._id === onTheClock?._id) + 1}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClockComponent
