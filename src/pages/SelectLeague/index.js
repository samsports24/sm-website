import React, { useEffect, useState } from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Button, Col, Image, Row } from 'antd'
import Ultimate from '../../assets/myultimate.png'
import pro from '../../assets/proleague.png'
import premium from '../../assets/premiumleague.png'
import { joinleaguePaymenttrue } from '../../redux'
import { useNavigate } from 'react-router-dom'

const SelectLeague = () => {
  const [localStorageKey, setLocalStorageKey] = useState(null);
  const [ispaid, seTIspaid] = useState(null);

  const navigate=useNavigate()

  console.log('ispaid',ispaid);

  useEffect(() => {
    const storedKey = localStorage.getItem('AssignLeague');
    const paid=localStorage.getItem('paid');
    if (storedKey) {
      setLocalStorageKey(storedKey);
    }
    if (paid) {
      seTIspaid(paid);
    }

  }, []);


  const leaguejoinwithpayment =async()=>{



    // console.log('in the fucntion');
    let email = localStorage.getItem('email');
    let AssignLeague=localStorage.getItem('AssignLeague')

    try {
      const payload = {
        email,
        AssignLeague,
      }  
  
      console.log('payload',payload);
      localStorage.setItem('selectedGame', 'football');
  
     const data = await joinleaguePaymenttrue(payload)
     console.log('League Join successfully:', data)
      navigate('/fantasy-league')
      // cancel()
    } catch (error) {
      console.error('Error in Joining League:', error)
    }
  }



  const data = [
    {
      title: 'Professional',
      subTitle: 'League',
      keywords: 'The SamSports Ultimate League',
      // description:
      //   "The SAM Pro League, an exclusive dynasty with 30 teams, features intense competition as teams, owners, and GMs vie for success throughout the season and playoffs. Notably, scouting plays a crucial role in player recruitment. The league uniquely ties its prize pool to each sport's profits, with teams actively contributing to potential earnings. This innovative approach enhances competitiveness and aligns the league's prosperity with the financial success of individual sports within the SAM Pro framework.",
      // isDisabled: true,
      isDisabled: localStorageKey ? false : true,
      // navigateTo: '/proleague',
      // navigateTo:  ispaid ? leaguejoinwithpayment() : '/proleague',
      navigateTo: () => (ispaid ? leaguejoinwithpayment() : navigate('/proleague')),
  
      description:
        'aspires to be the NFL of fantasy football, providing an elite experience for users to manage their own NFL-like team. It is tailored for those with a deep understanding of fantasy football who want to elevate their skills.',
      align: 'left',
     // navigateTo: '/create-join-league',
      imageurl: Ultimate,
    },
    {
      title: 'Public',
      subTitle: 'Weekly H2H',
      keywords: 'samSports Pro Leagues',
      description:
        'offer an exclusive fantasy football experience for serious players, combining realistic GM simulation, advanced drafting tools, and cash prize pools. Members pay an annual fee for access to GM ratings, a trade calculator, and competitive gameplay against top enthusiasts. Join to compete, strategize, and immerse yourself in the ultimate fantasy football challenge!',
      // description:
      //   'Similar to the Pro league, each leagues are made of 30 teams and 6 divisions. These leagues allow you to play like the pro without the financial risks. Our token allows you to pay to improve your teams and give you more chances to win at the end of season.',
      // isDisabled: false,
      isDisabled: localStorageKey ? true : false,
      align: 'right',
      // navigateTo: '/create-join-league',
      navigateTo: () => (navigate('/proleague')),
      //  navigateTo: '/proleague',
    
      imageurl: pro,
    },

    {
      title: 'Public',
      subTitle: 'Weekly H2H',
      keywords:'SamSports Freemium Leagues',
      description:"provide free basic fantasy football play. Join, customize, and compete",
      // description:
      //   'Similar to the Pro league, each leagues are made of 30 teams and 6 divisions. These leagues allow you to play like the pro without the financial risks. Our token allows you to pay to improve your teams and give you more chances to win at the end of season.',
      isDisabled: true,
      align: 'right',
     // navigateTo: '/create-join-league',
     navigateTo: '/proleague',
      imageurl:premium
    },
  ]

  return (
    <div className='select_game_container select_league_container'>
      <SelectGameLeft logo={localStorage.getItem('imagePath')} />
      <SelectGameRight>
        <div className='select_league_body'>
          {/* <div className='button_box'>
            <Button type='primary'>Step 1</Button>
            <Button type='primary' className='inactive'>
              Step 2
            </Button>
          </div> */}

          <h1>Choose Your League Type!</h1>
          <div className='card_conatiner'>
            <Row gutter={[30, 30]}>
              {data.map((v, i) => {
                return (
                  <Col key={i} xs={24} lg={12}>
                    <LeagueJoiningCard data={v} />
                  </Col>
                )
              })}
            </Row>
          </div>
        </div>
      </SelectGameRight>
    </div>
  )
}

const LeagueJoiningCard = ({ data }) => {
  const { imageurl, subTitle, keywords, description, align, isDisabled, navigateTo } = data

  console.log('data', data)
  const navigate = useNavigate()

  return (
    <div className='new-league_joining_card'>
      <div className='firstbox'>
        <div className='circle'>
          <Image className='myimg' src={imageurl} alt='league' />
        </div>
        <div className='description'>
          <p>
            <span className='text1'>{keywords}</span> {description}
          </p>
        </div>

        <Button disabled={isDisabled} type='primary' onClick={navigateTo}>
          JOIN
        </Button>
      </div>
    </div>
  )
}

export default SelectLeague



// const LeagueJoiningCard = ({ data }) => {
//   const { title, subTitle, description, align, isDisabled, navigateTo } = data

//   console.log('data',data);
//   const navigate = useNavigate()

//   return (
//     <div className='league_joining_card'>
//       <div className={`header ${align === 'left' ? 'headerLeft' : 'headerRight'}`}>
//         <p className='text1'>{title}</p>
//         <p className='text2'>{subTitle}</p>
//       </div>
//       <div className='description'>
//         <p>{description}</p>
//       </div>
//       <Button disabled={isDisabled} type='primary' onClick={() => navigate(navigateTo)}>
//         APPLY
//       </Button>
//     </div>
//   )
// }
