import { Col, Row, Tabs } from 'antd'
import { useEffect, useState } from 'react'

import LeagueSetting from './LeagueSettings'
import TeamAndOwnership from './TeamAndOwnership'
import Trades from './Trades'
import { useSelector } from 'react-redux'
import DraftOrder from './DraftOrder'
import { getProfessionalLeagueRanks, impersonateUser } from '../../redux'

const Comissioner = () => {
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

      const impersonatedToken = await impersonateUser(userId, userLeague);

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

        <div>
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
      {/* ) : (
        <div />
      )} */}
    </>
  )
}

export default Comissioner
