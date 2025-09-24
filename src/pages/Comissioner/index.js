import { Button, Col, Row, Select, Tabs } from 'antd'
import { useEffect, useState } from 'react'

import LeagueSetting from './LeagueSettings'
import TeamAndOwnership from './TeamAndOwnership'
import Trades from './Trades'
import { useSelector } from 'react-redux'
import DraftOrder from './DraftOrder'
import { getProfessionalLeagueRanks, impersonateUser, updateCommissionersInLeague } from '../../redux'

const Comissioner = () => {
  const [loading, setLoading] = useState(false)
  const [goingToBeCommissioner, setGoingToBeCommissioner] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teams, setTeams] = useState(null)
  const SETTING = useSelector((state) => state.user.setting)
  const user = useSelector((state) => state.user.userDetails)
  const userLeague = useSelector((state) => state.user.SamPoints.league)

  useEffect(() => {
    const currentUser = user?._id
    const createdBy = user?.team?.currentLeague?.createdBy
    const comissioner = user?.team?.currentLeague?.coComissioner
    if (currentUser === createdBy || currentUser === comissioner) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [user])

  useEffect(() => {
      if (localStorage.getItem('token')) {
        getProLeagueRank()
      }
    }, [SETTING?.week])

  const getProLeagueRank = async () => {
      let data = await getProfessionalLeagueRanks(SETTING?.week)
      console.log("data for proLeague:", data)
      setTeams(data?.teams)
    }

    const handleImpersonate = async (userId) => {

      const impersonatedToken = await impersonateUser(userId, userLeague, user?.email);

      if (impersonatedToken) {
        // Save impersonation token and reload dashboard
        localStorage.setItem("originalToken", localStorage.getItem("token"));
        localStorage.setItem("token", impersonatedToken);
        window.location.href = "/professional-league";
      }
      
    // const res = await fetch("/admin/impersonate", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   },
    //   body: JSON.stringify({ userId }),
    // });
    // const data = await res.json();
    // if (data.token) {
    //   // Save impersonation token and reload dashboard
    //   localStorage.setItem("token", data.token);
    //   window.location.href = "/dashboard";
    // }
  };

  const makeCommissionerHandler = (values) => {
    // let teamsArr = [...users];
    // Build updated commissioner list based on values array
    // let updatedCommissionerTobe = values.map(val => {
    //   const teamObj = teamsArr.find(t => t?._id == val);
    //   return {
    //     team: teamObj?._id,
    //     user: teamObj?.user?._id
    //   };
    // });

    setGoingToBeCommissioner(values);
  };

  useEffect(() => {
    console.log("goingToBeCommissioner :", goingToBeCommissioner)
  },[goingToBeCommissioner])

  const updateLeagueCommissioners = async () => {
    setLoading(true)
    await updateCommissionersInLeague({
      leagueId: userLeague,
      users: goingToBeCommissioner
    })
    setGoingToBeCommissioner([])
    setLoading(false)
  }

  return (
    <>
      {/* {isAuthenticated ? ( */}
        {/* <div className='total_payment_container comissioner'>
          <h1 className='heading'>Managing Your League</h1>
          <h1 className='heading'>
            Hello Comissioner{' '}
            {user?.team?.currentLeague?.leagueId ? `(${user?.team?.currentLeague?.leagueId})` : ''}
          </h1>

          <Tabs
            defaultActiveKey={1}
            size='large'
            type='card'
            centered
            items={[
              {
                label: `General League Setting`,
                key: 1,
                children: <LeagueSetting />,
              },
              {
                label: `Teams & Ownerships`,
                key: 2,
                children: <TeamAndOwnership />,
              },
              {
                label: `Team Trades`,
                key: 3,
                children: <Trades />,
                disabled: true,
              },
              {
                label: `Set Draft Order`,
                key: 4,
                children: <DraftOrder />,
              },
            ]}
          />
        </div> */}

        {user?.isCommissioner && 
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          <div style={{ display: 'flex', flexDirection: "column", gap: "10px"}}>
            <p>Make Others Commissioner</p>

            <Select placeholder='Select Users' mode="multiple" value={goingToBeCommissioner} allowClear onChange={makeCommissionerHandler}>
              {
                teams?.map((item) => item?.user && <Select.Option value={item?.user?._id}>{`${item?.user?.userName} (${item?.name})`}</Select.Option>)
              }
            </Select>
            <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
              <Button 
                style={{color: 'orange'}} 
                disabled={goingToBeCommissioner?.length === 0 || loading}
                onClick={updateLeagueCommissioners}
                // loading={loading}
                loading={loading}
              >
                Save
              </Button>
            </div>
          </div>
          <Row gutter={[20, 20]}>
          {teams?.length > 0 && teams?.map((team, index) => {
            return (
              <Col key={index} lg={8} md={12}>
                <div key={index} onClick={() => handleImpersonate(team?.user)} style={{cursor: 'pointer' ,border: '1px solid #6e6980', borderRadius: '16px', padding: '20px', background: 'var(--secondaryPurple)', display: 'flex', flexDirection: 'column', gap: '10px'}} >
                  <h2>{team?.name}</h2>
                  <p>Abb: {team?.abbreviation}</p>
                  <p>Town: {team?.hometown}</p>
                </div>
              </Col>
            )
          })}
          </Row>
        </div>
        }
      {/* ) : (
        <div />
      )} */}
    </>
  )
}

export default Comissioner
