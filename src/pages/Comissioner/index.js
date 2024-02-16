import { Tabs } from 'antd'
import { useEffect, useState } from 'react'

import LeagueSetting from './LeagueSettings'
import TeamAndOwnership from './TeamAndOwnership'
import Trades from './Trades'
import { useSelector } from 'react-redux'

const Comissioner = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const user = useSelector((state) => state.user.userDetails)

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

  return (
    <>
      {isAuthenticated ? (
        <div className='total_payment_container comissioner'>
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
                label: `Team Trades (3)`,
                key: 3,
                children: <Trades />,
              },
            ]}
          />
        </div>
      ) : (
        <div />
      )}
    </>
  )
}

export default Comissioner
