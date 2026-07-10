import React, { useEffect, useState } from 'react'
import { Button, Col, Image, Row } from 'antd'
import Ultimate from '../../assets/myultimate.png'
import pro from '../../assets/proleague.png'
import premium from '../../assets/premiumleague.png'
import { joinleaguePaymenttrue } from '../../redux'
import { useNavigate } from 'react-router-dom'

const SS = {
  page: {
    minHeight: '100vh',
    background: '#0A0F1A',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  topbar: {
    width: '100%',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },
  logoSam: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 2,
  },
  logoSports: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 900,
    color: '#22C55E',
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    maxWidth: 960,
    margin: '12px auto 48px',
    padding: '36px 40px 28px',
    background: 'linear-gradient(135deg, #111827 0%, #0D1321 100%)',
    border: '1px solid rgba(34,197,94,0.18)',
    borderRadius: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Rajdhani', sans-serif",
    margin: '0 0 28px',
  },
}

const SelectLeague = () => {
  const [localStorageKey, setLocalStorageKey] = useState(null);
  const [ispaid, seTIspaid] = useState(null);
  const [Invitationtype,setInvitationtype]=useState(null)

  const navigate=useNavigate()

  useEffect(() => {
    const storedKey = localStorage.getItem('AssignLeague');
    const paid=localStorage.getItem('paid');
    const invitationtype=localStorage.getItem('myinvitationtype');
    if (storedKey) {
      setLocalStorageKey(storedKey);
    }
    if (paid) {
      seTIspaid(paid);
    }
    if(invitationtype){
      setInvitationtype(invitationtype.toLowerCase());
    }
  }, []);

  const leaguejoinwithpayment =async()=>{
    let email = localStorage.getItem('email');
    let AssignLeague=localStorage.getItem('AssignLeague')

    try {
      const payload = {
        email,
        AssignLeague,
      }
      localStorage.setItem('selectedGame', 'football');
     const data = await joinleaguePaymenttrue(payload)
      navigate('/homepage')
    } catch (error) {
      console.error('Error in Joining League:', error)
    }
  }

  const data = [
    {
      title: 'Private',
      subTitle: 'League',
      keywords: 'SamSports Private Leagues',
      isDisabled: localStorageKey ? false : true,
      navigateTo: () => (ispaid ? leaguejoinwithpayment() : navigate('/homepage')),
      description:
        'provide an elite experience for users to manage their own A.Football team. Tailored for those with a deep understanding of fantasy A.Football who want to elevate their skills in an exclusive setting. You\'ll receive 300M SamPoints to draft your team.',
      align: 'left',
      imageurl: Ultimate,
    },
    {
      title: 'Public',
      subTitle: 'Weekly H2H',
      keywords: 'SamSports Public Leagues',
      description:
        'offer a fantasy A.Football experience for all players, combining realistic GM simulation, advanced drafting tools, and competitive gameplay. You\'ll receive 300M SamPoints to draft your team.',
      isDisabled: localStorageKey || Invitationtype === 'freemium' ? true : false,
      align: 'right',
      navigateTo: () => (navigate('/homepage')),
      imageurl: pro,
    },
    {
      title: 'Public',
      subTitle: 'Free League',
      keywords: 'SamSports Free Leagues',
      description: 'provide free basic fantasy A.Football play. Join, customize, and compete. You\'ll receive 300M SamPoints to draft your team.',
      isDisabled: localStorageKey || Invitationtype === 'private' ? true : false,
      align: 'right',
      navigateTo: () => (navigate('/homepage')),
      imageurl: premium,
    },
  ]

  return (
    <div style={SS.page}>
      <div style={SS.topbar} onClick={() => navigate('/')}>
        <span style={SS.logoSam}>SAM</span>
        <span style={SS.logoSports}>SPORTS</span>
      </div>

      <div style={SS.card}>
        <h1 style={SS.h1}>Choose Your League Type!</h1>
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
    </div>
  )
}

const LeagueJoiningCard = ({ data }) => {
  const { imageurl, subTitle, keywords, description, align, isDisabled, navigateTo } = data

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
