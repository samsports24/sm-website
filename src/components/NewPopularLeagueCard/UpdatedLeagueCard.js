import moment from 'moment'
import JoinLeague from '../modal/JoinLeague'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/sam-football.png'
import { deleteLeagueCommissioner, joinLeague, resetLeagueCommissioner, selectLeague } from '../../redux'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import Loader from '../Loader'
import EditLeague from '../modal/EditLeague'
import DeleteLeague from '../modal/DeleteLeague'
import ResetLeague from '../modal/ResetLeague'

const UpdatedLeagueCard = ({ data, yourLeague, active, fromHome, totalTeams, isFutureLeague = false }) => {
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.userDetails)
  const userId = localStorage.getItem('userId')

  const { name, draftStart, leagueType, leagueLevel, entryFee, leagueLogo, totalPlayers, leagueId } = data

  const leaguejoin = async () => {
    setLoading(true)
    try {
      const payload = {
        email: user?.email,
        leagueId: leagueId,
        leagueType: leagueType,
        teamName: `team ${user?.userName}`,
        userId,
      }
      localStorage.setItem('selectedGame', 'football')
      await joinLeague(payload)
      setLoading(false)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error in Joining League:', error)
      setLoading(false)
    }
  }

  const deleteHandler = async () => {
    setDeleteLoading(true)
    await deleteLeagueCommissioner({ _id: data?._id })
    setDeleteLoading(false)
  }

  const resetHandler = async () => {
    setDeleteLoading(true)
    await resetLeagueCommissioner({ _id: data?._id })
    setDeleteLoading(false)
  }

  const teamCount = data?.teams?.length || totalPlayers || 0
  const maxTeams = data?.numberOfTeams || 32
  const fillPercent = Math.min((teamCount / maxTeams) * 100, 100)

  const typeColor =
    leagueType === 'private' ? '#4ADE80'
    : leagueType === 'public' ? '#34d399'
    : '#60a5fa'

  const borderAccent =
    active ? 'rgba(120, 80, 255, 0.6)'
    : leagueType === 'private' ? 'rgba(167, 139, 250, 0.25)'
    : 'rgba(255, 255, 255, 0.06)'

  if (loading) {
    return (
      <div className="ulc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <Loader />
      </div>
    )
  }

  return (
    <div
      className={`ulc-card ${active ? 'ulc-active' : ''} ${isFutureLeague ? 'ulc-future' : ''}`}
      style={{ borderColor: borderAccent }}
    >
      {/* Commissioner edit button */}
      {user?.isCommissioner && (
        <div className="ulc-edit-wrap">
          <EditLeague data={data} isCommissioner={user?.isCommissioner} />
        </div>
      )}

      {/* Top section: Logo + Info */}
      <div className="ulc-top">
        <div className="ulc-logo-wrap">
          <img
            src={leagueLogo || Logo}
            alt={name}
            className="ulc-logo"
            onError={(e) => { e.target.src = Logo }}
          />
        </div>
        <div className="ulc-info">
          <div className="ulc-type-badge" style={{ color: typeColor, borderColor: typeColor }}>
            {leagueType || 'League'}
          </div>
          <h3 className="ulc-name">{name}</h3>
        </div>
      </div>

      {/* Stats row */}
      <div className="ulc-stats">
        <div className="ulc-stat">
          <span className="ulc-stat-label">Players</span>
          <span className="ulc-stat-value">{teamCount}<span className="ulc-stat-dim">/{maxTeams}</span></span>
          <div className="ulc-bar">
            <div className="ulc-bar-fill" style={{ width: `${fillPercent}%`, background: typeColor }} />
          </div>
        </div>
        <div className="ulc-stat">
          <span className="ulc-stat-label">Draft</span>
          <span className="ulc-stat-value">{moment(draftStart).format('MMM D, YY')}</span>
          <span className="ulc-stat-sub">{moment(draftStart).format('h A')} CST</span>
        </div>
      </div>

      {/* Actions */}
      <div className="ulc-actions">
        {/* Commissioner controls */}
        {user?.isCommissioner && data?.mainCommissioner === user?._id && (
          <ResetLeague deleteHandler={resetHandler} deleteLoading={deleteLoading} />
        )}
        {user?.isCommissioner && data?.teams?.length === 0 && data?.users?.length === 0 && (
          <DeleteLeague deleteHandler={deleteHandler} deleteLoading={deleteLoading} />
        )}

        {yourLeague ? (
          <button
            className={`ulc-btn ${active ? 'ulc-btn-active' : 'ulc-btn-joined'}`}
            onClick={async () => {
              if (!active) {
                await selectLeague({ leagueId: data?._id }, navigate)
              }
            }}
          >
            {active ? 'Active' : 'Joined'}
          </button>
        ) : fromHome ? (
          <button className="ulc-btn ulc-btn-join" onClick={leaguejoin}>
            Join League
          </button>
        ) : (
          <JoinLeague data={data} />
        )}
      </div>
    </div>
  )
}

export default UpdatedLeagueCard
