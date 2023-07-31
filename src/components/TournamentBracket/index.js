import React from 'react'
import { Image } from 'antd'
import {
  SingleEliminationBracket,
  //   DoubleEliminationBracket,
  //   Match,
  //   SVGViewer,
} from '@g-loot/react-tournament-brackets'

import TeamLogo1 from '../../assets/Heat Wave Square 2.png'
import DefianceLogo from '../../assets/Defiance 60x60.png'
import StormLogo from '../../assets/Storm 60x60.png'
import RageLogo from '../../assets/Rage 60x60.png'
import TroutLogo from '../../assets/Trout 60x60.png'

const singleMatches = [
  {
    id: 26000,
    name: 'Quarter Final - Match',
    nextMatchId: 260005, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'Heat Wave',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 26000,
    name: 'Quarter Final - Match',
    nextMatchId: 260005, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Defiance',
        logo: DefianceLogo,
        label: 'Square (1)',
      },
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'Storm Breakers',
        logo: StormLogo,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 26001,
    name: 'Quarter Final - Match',
    nextMatchId: 260005, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'Rage',
        logo: RageLogo,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Trout',
        logo: TroutLogo,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 26002,
    name: 'Quarter Final - Match',
    nextMatchId: 260005, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'Heat Wave',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Heat Wave',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 26003,
    name: 'Quarter Final - Match',
    nextMatchId: 260007, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'giacomo123',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Ant',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 260005,
    name: 'Semi Final - Match',
    nextMatchId: 260007, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'giacomo123',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Ant',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 260006,
    name: 'Semi Final - Match',
    nextMatchId: 260007, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'XOXO',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Defiance',
        logo: DefianceLogo,
        label: 'Square (1)',
      },
    ],
  },
  {
    id: 260007,
    name: 'Final - Match',
    nextMatchId: null, // Id for the nextMatch in the bracket, if it's final match it must be null OR undefined
    tournamentRoundText: '4', // Text for Round Header
    startTime: '2021-05-30',
    state: 'DONE', // 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [
      {
        id: 'c016cb2a-fdd9-4c40-a81f-0cc6bdf4b9cc', // Unique identifier of any kind
        resultText: 'WON', // Any string works
        isWinner: false,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | null
        name: 'giacomo123',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
      {
        id: '9ea9ce1a-4794-4553-856c-9a3620c0531b',
        resultText: null,
        isWinner: true,
        status: null, // 'PLAYED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY'
        name: 'Final Team 2',
        logo: TeamLogo1,
        label: 'Square (1)',
      },
    ],
  },
]

const TournamentBracket = () => {
  return (
    <div>
      {/* <SingleEliminationBracket
        matches={singleMatches}
        matchComponent={Match}
      /> */}
      <SingleEliminationBracket
        matches={singleMatches}
        options={{
          style: {
            roundHeader: { backgroundColor: '#AAA', isShown: false },
            // connectorColor: '#FF8C00',
            connectorColor: '#6E698066',
            connectorColorHighlight: '#6E698066',
            boxHeight: 144,
          },
        }}
        // svgWrapper={({ children, ...props }) => (
        //   <SvgViewer
        //     background='#FFF'
        //     SVGBackground='#FFF'
        //     width={finalWidth}
        //     height={finalHeight}
        //     {...props}
        //   >
        //     {children}
        //   </SvgViewer>
        // )}
        matchComponent={({
          //   match,
          //   onMatchClick,
          //   onPartyClick,
          onMouseEnter,
          //   onMouseLeave,
          topParty,
          bottomParty,
          //   topWon,
          //   bottomWon,
          //   topHovered,
          //   bottomHovered,
          //   topText,
          //   bottomText,
          //   connectorColor,
          //   computedStyles,
          teamNameFallback,
          //   resultFallback,
        }) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: '#000',
              width: '100%',
              height: bottomParty.id ? '100%' : '72px',
              background: '#30215D66',
              border: '1px solid #6E698066',
            }}
          >
            {console.log('bottomParty', bottomParty)}
            <div
              onMouseEnter={() => onMouseEnter(topParty.id)}
              style={{ display: 'flex', columnGap: '1rem' }}
            >
              <div style={{ background: '#FFFFFF' }}>
                <Image src={topParty?.logo} style={{ width: '70px', height: '70px' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  rowGap: '0.5rem',
                }}
              >
                <p style={{ color: '#FFFFFF', fontSize: '16px', textTransform: 'capitalize' }}>
                  {topParty?.name || teamNameFallback}
                </p>
                <p style={{ color: '#FFFFFF', fontSize: '16px' }}>
                  {topParty?.label || teamNameFallback}
                </p>
              </div>
            </div>
            <div style={{ height: '1px', width: '100%', background: '#6E698066' }} />
            {bottomParty.id && (
              <div
                onMouseEnter={() => onMouseEnter(bottomParty.id)}
                style={{ display: 'flex', columnGap: '1rem' }}
              >
                <div style={{ background: '#FFFFFF' }}>
                  <Image src={bottomParty?.logo} style={{ width: '70px', height: '70px' }} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    rowGap: '0.5rem',
                  }}
                >
                  <p style={{ color: '#FFFFFF', fontSize: '16px', textTransform: 'capitalize' }}>
                    {bottomParty?.name || teamNameFallback}
                  </p>
                  <p style={{ color: '#FFFFFF', fontSize: '16px' }}>
                    {bottomParty?.label || teamNameFallback}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default TournamentBracket
