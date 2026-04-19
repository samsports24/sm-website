import React, { useMemo } from 'react'
import moment from 'moment'
import Carousel from 'react-multi-carousel'
import { useSelector } from 'react-redux'
import CustomCarousel from '../Carousel/CustomCarousel'

/* ── NFL season structure (fallback if backend doesn't provide full calendar) ── */
const REGULAR_SEASON_WEEKS = 18
const PLAYOFF_ROUNDS = [
  { week: 19, label: 'WILD CARD', type: 'wildcard' },
  { week: 20, label: 'DIVISIONAL', type: 'divisional' },
  { week: 21, label: 'CONF. CHAMP', type: 'conference' },
  { week: 22, label: 'SUPER BOWL', type: 'superbowl' },
]

/* ── Normalize a single entry into display data ── */
const useNormalize = () => {
  const SETTING = useSelector((state) => state.user)

  return (entry) => {
    const { userDetails, currentWeek } = SETTING
    const myId = userDetails?.team?._id

    // ── NEW API format (from /get-full-team-schedule) ──
    if (entry.label !== undefined || entry.type !== undefined) {
      const isPlayoff = entry.type !== 'regular'
      const hasMatchup = entry.opponentOne && entry.opponentTwo

      if (!hasMatchup) {
        return {
          weekNum: entry.week,
          week: entry.week,
          label: entry.label || `WK ${entry.week}`,
          opponentName: null,
          opponentLogo: null,
          date: entry.startDate ? moment(entry.startDate).format('MMM DD') : null,
          myScore: null,
          oppScore: null,
          result: null,
          played: false,
          isCurrent: currentWeek === entry.week,
          isFuture: currentWeek < entry.week,
          isBye: !!entry.isBye,
          isPlayoff,
          playoffLabel: isPlayoff ? entry.label : null,
        }
      }

      const isMyTeamOne = myId === entry.opponentOne?._id
      const opponent = isMyTeamOne ? entry.opponentTwo : entry.opponentOne
      const myScore = isMyTeamOne ? entry.scoreOne : entry.scoreTwo
      const oppScore = isMyTeamOne ? entry.scoreTwo : entry.scoreOne
      const played = currentWeek >= entry.week && (entry.scoreOne > 0 || entry.scoreTwo > 0)

      let result = null
      if (played) {
        if (myScore > oppScore) result = 'W'
        else if (myScore < oppScore) result = 'L'
        else result = 'T'
      }

      return {
        weekNum: entry.week,
        week: entry.week,
        label: entry.label || `WK ${entry.week}`,
        opponentName: opponent?.abbreviation || (opponent?.name ? opponent.name.substring(0, 3).toUpperCase() : ''),
        opponentLogo: opponent?.logo,
        date: entry.startDate
          ? moment(entry.startDate).format('MMM DD')
          : entry.matchStartDate
            ? moment(entry.matchStartDate).format('MMM DD')
            : null,
        myScore: played ? myScore : null,
        oppScore: played ? oppScore : null,
        result,
        played,
        isCurrent: currentWeek === entry.week,
        isFuture: currentWeek < entry.week,
        isBye: false,
        isPlayoff,
        playoffLabel: isPlayoff ? entry.label : null,
      }
    }

    // ── OLD API format (from /get-team-schedule), backwards compatible ──
    const {
      opponentOne,
      opponentTwo,
      matchStartDate,
      scoreOne,
      scoreTwo,
      week,
    } = entry

    const isMyTeamOne = myId === opponentOne?._id
    const opponent = isMyTeamOne ? opponentTwo : opponentOne
    const myScore = isMyTeamOne ? scoreOne : scoreTwo
    const oppScore = isMyTeamOne ? scoreTwo : scoreOne
    const played = currentWeek >= week && (scoreOne > 0 || scoreTwo > 0)

    let result = null
    if (played) {
      if (myScore > oppScore) result = 'W'
      else if (myScore < oppScore) result = 'L'
      else result = 'T'
    }

    return {
      weekNum: week,
      week,
      label: `WK ${week}`,
      opponentName: opponent?.abbreviation || (opponent?.name ? opponent.name.substring(0, 3).toUpperCase() : ''),
      opponentLogo: opponent?.logo,
      date: matchStartDate ? moment(matchStartDate).format('MMM DD') : null,
      myScore: played ? myScore : null,
      oppScore: played ? oppScore : null,
      result,
      played,
      isCurrent: currentWeek === week,
      isFuture: currentWeek < week,
      isBye: false,
      isPlayoff: week > REGULAR_SEASON_WEEKS,
      playoffLabel: PLAYOFF_ROUNDS.find(r => r.week === week)?.label || null,
    }
  }
}

/* ── Build full 22-week array, fills gaps if old API is used ── */
const useFullSchedule = (data) => {
  const SETTING = useSelector((state) => state.user)
  const normalize = useNormalize()

  return useMemo(() => {
    const currentWeek = SETTING?.currentWeek || 1

    if (!data || data.length === 0) {
      // No data at all, render empty 22-week skeleton
      const weeks = []
      for (let w = 1; w <= REGULAR_SEASON_WEEKS; w++) {
        weeks.push({
          weekNum: w, week: w, label: `WK ${w}`,
          opponentName: null, opponentLogo: null, date: null,
          myScore: null, oppScore: null, result: null,
          played: false, isCurrent: currentWeek === w, isFuture: currentWeek < w,
          isBye: true, isPlayoff: false, playoffLabel: null,
        })
      }
      for (const round of PLAYOFF_ROUNDS) {
        weeks.push({
          weekNum: round.week, week: round.week, label: round.label,
          opponentName: null, opponentLogo: null, date: null,
          myScore: null, oppScore: null, result: null,
          played: false, isCurrent: currentWeek === round.week, isFuture: currentWeek < round.week,
          isBye: false, isPlayoff: true, playoffLabel: round.label,
        })
      }
      return weeks
    }

    // Check if data is already the full calendar (has entries with labels/types)
    const isFullCalendar = data.length >= 20 && data[0]?.type !== undefined

    if (isFullCalendar) {
      return data
        .sort((a, b) => a.week - b.week)
        .map((entry) => normalize(entry))
    }

    // Old API data, only has actual matchup entries, need to fill gaps
    const byWeek = {}
    for (const entry of data) {
      if (entry?.week) byWeek[entry.week] = normalize(entry)
    }

    const weeks = []
    for (let w = 1; w <= REGULAR_SEASON_WEEKS; w++) {
      if (byWeek[w]) {
        weeks.push(byWeek[w])
      } else {
        weeks.push({
          weekNum: w, week: w, label: `WK ${w}`,
          opponentName: null, opponentLogo: null, date: null,
          myScore: null, oppScore: null, result: null,
          played: false, isCurrent: currentWeek === w, isFuture: currentWeek < w,
          isBye: true, isPlayoff: false, playoffLabel: null,
        })
      }
    }
    for (const round of PLAYOFF_ROUNDS) {
      if (byWeek[round.week]) {
        weeks.push(byWeek[round.week])
      } else {
        weeks.push({
          weekNum: round.week, week: round.week, label: round.label,
          opponentName: null, opponentLogo: null, date: null,
          myScore: null, oppScore: null, result: null,
          played: false, isCurrent: currentWeek === round.week, isFuture: currentWeek < round.week,
          isBye: false, isPlayoff: true, playoffLabel: round.label,
        })
      }
    }
    return weeks
  }, [data, SETTING?.currentWeek])
}

/* ═══════════════════════════════════════════════════════
   CARD, individual week matchup
   ═══════════════════════════════════════════════════════ */
const ScheduleWeekCard = ({ match }) => {
  const resultClass = match.result === 'W'
    ? 'sch-result-win'
    : match.result === 'L'
      ? 'sch-result-loss'
      : match.result === 'T'
        ? 'sch-result-tie'
        : ''

  const weekLabel = match.isPlayoff
    ? match.playoffLabel || match.label
    : `WK ${match.weekNum}`

  return (
    <div className={`sch-card ${match.isCurrent ? 'sch-card-active' : ''} ${match.isFuture ? 'sch-card-future' : ''} ${match.isPlayoff ? 'sch-card-playoff' : ''}`}>
      <div className='sch-card-week'>
        <span className={`sch-week-num ${match.isPlayoff ? 'sch-week-playoff' : ''}`}>
          {weekLabel}
        </span>
        {match.isCurrent && <span className='sch-live-dot' />}
      </div>

      <div className='sch-card-logo-wrap'>
        {match.opponentLogo ? (
          <img src={match.opponentLogo} alt={match.opponentName} className='sch-card-logo' />
        ) : match.isBye ? (
          <div className='sch-card-logo-placeholder sch-bye-icon'>BYE</div>
        ) : match.isPlayoff && !match.opponentName ? (
          <div className='sch-card-logo-placeholder sch-playoff-icon'>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
            </svg>
          </div>
        ) : (
          <div className='sch-card-logo-placeholder'>
            {match.opponentName ? match.opponentName[0]?.toUpperCase() : 'TBD'}
          </div>
        )}
      </div>

      {match.played ? (
        <div className='sch-card-score'>
          <span className={`sch-result-badge ${resultClass}`}>{match.result}</span>
          <span className='sch-score-text'>{match.myScore} - {match.oppScore}</span>
        </div>
      ) : match.isBye ? (
        <div className='sch-card-date'>
          <span className='sch-date-text sch-bye-text'>Bye Week</span>
        </div>
      ) : match.date ? (
        <div className='sch-card-date'>
          <span className='sch-date-text'>{match.date}</span>
        </div>
      ) : (
        <div className='sch-card-date'>
          <span className='sch-date-text sch-tbd-text'>TBD</span>
        </div>
      )}

      <div className='sch-card-opp-name'>
        {match.isBye ? '' : match.opponentName}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT, react-multi-carousel version
   ═══════════════════════════════════════════════════════ */
const TeamScheduleCarousel = ({ data }) => {
  const fullSchedule = useFullSchedule(data)

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 12 },
    desktop: { breakpoint: { max: 3000, min: 1900 }, items: 9 },
    desktop1: { breakpoint: { max: 1900, min: 1400 }, items: 7 },
    desktop2: { breakpoint: { max: 1400, min: 1150 }, items: 5 },
    desktop3: { breakpoint: { max: 1150, min: 900 }, items: 4 },
    tablet: { breakpoint: { max: 900, min: 600 }, items: 3 },
    mobile: { breakpoint: { max: 600, min: 0 }, items: 2 },
  }

  return (
    <div className='sch-box'>
      <Carousel responsive={responsive} arrows={false} infinite={true}>
        {fullSchedule.map((match, i) => (
          <ScheduleWeekCard key={i} match={match} />
        ))}
      </Carousel>
    </div>
  )
}

export default TeamScheduleCarousel

/* ═══════════════════════════════════════════════════════
   CUSTOM CAROUSEL EXPORT, used on ProfessionalLeague
   ═══════════════════════════════════════════════════════ */
const TeamScheduleCustomCarousel = ({ data }) => {
  const fullSchedule = useFullSchedule(data)

  return (
    <div className='sch-box'>
      <CustomCarousel height={'120px'}>
        {fullSchedule.map((match, i) => (
          <ScheduleWeekCard key={i} match={match} />
        ))}
      </CustomCarousel>
    </div>
  )
}

export { TeamScheduleCustomCarousel }
