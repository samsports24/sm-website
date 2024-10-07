import React, { useEffect, useState } from 'react'
import { Col, Row, notification } from 'antd'
import logo from '../../assets/sam-football.png'
import { useNavigate } from 'react-router-dom'
import CreateLeague from '../../components/modal/CreateLeague'
import { useSelector } from 'react-redux'
import { getTeamSchedule } from '../../redux/actions/teamActions'

import LobbyMatchOfTheWeek from '../../components/MatchUpOfTheWeek/LobbyMatchOfTheWeek'
import moment from 'moment'

const Lobby = () => {
  const isAuthenticated = localStorage.getItem('token')
  const [data, setData] = useState([])
  const navigate = useNavigate()
  const week = useSelector((state) => state.user?.setting?.week)
  const league =useSelector((state)=> state.user?.userDetails?.team?.currentLeague?.leagueType)
  

// console.log('USER',USER);

//  console.log('league',league);




useEffect(() => {
  getData()
}, [
  week,

])


  // console.log('my check',data);

// console.log('data?.opponentOne.name',data?.opponentOne.name);



const getData = async () => {
  // setLoading(true)
  // const res = await getTeamSchedule({ teamFilter: selectedTeam })
  const res = await getTeamSchedule({ teamFilter: '', week })
    console.log('rws',res[0]);
  //   const today = moment().startOf('day');
  //   console.log('today',today);
    

  // // Filter the array
  // const filteredData = res?.filter(item => moment(item?.matchStartDate).isAfter(today));

  // console.log('filteredData',filteredData);
  
  // console.log('c',res[0]);
  
  setData(res)
  // setLoading(false)
}


  return (
    <div className='lobby_container'>
      <h1>LOBBY</h1>
      <div className='lobby_content'>
        {/* {!isAuthenticated && (
          <div
            className='overlay'
            // style={{background: 'red'}}
            onClick={() => {
              notification.error({
                message: 'Please log in first',
                duration: 3,
              })
            }}
          />
        )} */}
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12} xl={8}>
            <Row gutter={[10, 10]}>
              <div style={{ position: 'relative', width: '100%' }}>
                {!isAuthenticated && (
                  <div
                    className='overlay'
                    // style={{background: 'red'}}
                    onClick={() => {
                      notification.error({
                        message: 'Please log in first',
                        duration: 3,
                      })
                    }}
                  />
                )}
                <Card1 
                league={league}
               
                 />
                <CreateLeague
                  button={
                    <Card2
                      cursor
                      isImage
                      text={{
                        text1: 'Create',
                        text2: 'Leagues',
                      }}
                      paddingBlock={'70px'}
                      
                    />
                  }
                />
              </div>
            </Row>
          </Col>
          <Col xs={24} lg={12} xl={8}>
            <Row gutter={[10, 10]}>
            {!isAuthenticated && (
                <div
                  className='overlay'
                  // style={{background: 'red'}}
                  onClick={() => {
                    notification.error({
                      message: 'Please log in first',
                      duration: 3,
                    })
                  }}
                />
              )}
              <Card2
                cursor
                flip
                onClick={() => navigate('/popular-league')}
                text={{
                  text1: 'Popular',
                  text2: 'Leagues',
                }}
              />
              <div style={{ position: 'relative', width: '100%' }}>
                {!isAuthenticated && (
                  <div
                    className='overlay'
                    // style={{background: 'red'}}
                    onClick={() => {
                      notification.error({
                        message: 'Please log in first',
                        duration: 3,
                      })
                    }}
                  />
                )}
                <Card3 />
              </div>
            </Row>
          </Col>
          <Col xs={24} lg={24} xl={8}>
            <div className='left_column' style={{ position: 'relative', width: '100%' }}>
              {!isAuthenticated && (
                <div
                  className='overlay'
                  // style={{background: 'red'}}
                  onClick={() => {
                    notification.error({
                      message: 'Please log in first',
                      duration: 3,
                    })
                  }}
                />
              )}
              <Card2
                cursor
                flip
                onClick={() => navigate('/my-league')}
                text={{
                  text1: 'My Leagues',
                }}
              />
              <Card2
                alignCenter
                text={{
                  text1: 'GM Challenge',
                  text3:
                    'Rank yourself against your peers and be the ultimate best GM, rise the ranks and get your chance to GM a pro team!',
                }}
              />
 <Card2
    alignCenter
    proScoring
    flip
    isAuthenticated
    week
    data={data}
    text={
        !isAuthenticated && week ? 
        {
            text1: 'PRO SCORING',
            text3: 'FOLLOW YOUR FAVORITE',
            text4: 'PRO TEAM PERFORMANCE',
        } : 
        {
            text1: `Week ${week}`
        }
    }
>






</Card2>


            </div>
            {/* <Row gutter={[10, 10]}>
              <Card2
                cursor
                flip
                onClick={() => navigate('/my-league')}
                text={{
                  text1: 'My Leagues',
                }}
              />
              <Card2
                alignCenter
                text={{
                  text1: 'GM Challenge',
                  text3:
                    'Rank yourself against your peers and be the ultimate best GM, rise the ranks and get your chance to GM a pro team!',
                }}
              />
              <Card2
                alignCenter
                proScoring
                flip
                text={{
                  text1: 'PRO SCORING',
                  text3: 'FOLLOW YOUR FAVORITE',
                  text4: 'PRO TEAM PERFORMANCE',
                }}
              />
            </Row> */}
          </Col>
        </Row>
      </div>
    </div>
  )
}

// const Card1 = ({ flip,isAuthenticated,week }) => {
//   return (


    
//     <div className={`card1 ${flip ? 'flip' : ''}`}>
//       <div>
//         <h1>SAM Ultimate</h1>
//       </div>
//     </div>
//   )
// }

const Card1 = ({ flip,league }) => {
  return (
    <>
 
        <div className={`card1 ${flip ? 'flip' : ''}`}>
          <div>
            <h1>{league || 'SFL'}</h1>
          </div>
        </div>
      
    </>
  );
};

const Card2 = ({ isImage, text, alignCenter, cursor, onClick, flip, paddingBlock,isAuthenticated,week,data }) => {



  return (
    <div
      className={`card2 ${flip ? 'flip' : ''}`}
      style={{
        cursor: cursor ? 'pointer' : 'initial',
        paddingBlock: paddingBlock ? paddingBlock : '30px',
      }}
      onClick={onClick}
    >
      <div className='content'>
        {isImage && <img src={logo} />}

        
        <div>
          {text?.text1 && (
            <h1 style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text1}</h1>
          )}
          {text?.text2 && (
            <h2 style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text2}</h2>
          )}
          {text?.text3 && (
            <p style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text3}</p>
          )}
          {text?.text4 && (
            <p style={{ textAlign: alignCenter ? 'center' : 'initial' }}>{text?.text4}</p>
          )}

{(isAuthenticated && week && data?.length > 0) ? (
    <LobbyMatchOfTheWeek key={0} data={{ ...data[0] }} />
) : (
    <p></p>
)}


        </div>
   

      </div>
    </div>
  )
}
const Card3 = ({ flip }) => {
  const USER = useSelector((state) => state.user.userDetails?.team)
  const navigate=useNavigate()


  
  return (
    <div  className={`card3 ${flip ? 'flip' : ''}`}>

      
{USER ? (
  <div className='team-content-info' onClick={() => navigate('/player-roster')} >
    <p>{USER?.name}</p>
    <h1>Roster</h1>
    <img width={50} src={USER?.logo} alt="User Logo" />
  </div>
) : (
  <div className='content'>
    <div>
      <img src={logo} alt="Logo" />
      <h1>SFL</h1>
    </div>
    <h1>PRO</h1>
  </div>
)}


      {/* <div className='content'>
        <div>
          <img src={logo} />
          <h1>SFL</h1>
        </div>
        <h1>PRO</h1>
      </div> */}
    </div>
  )
}

export default Lobby
