import moment from 'moment'
import JoinLeague from '../modal/JoinLeague'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/sam-football.png'

const NewPopularLeagueCard = ({ data, yourLeague, active, fromHome }) => {
  const navigate = useNavigate()
  const { name, draftStart, leagueType, leagueLevel, entryFee, leagueLogo, totalPlayers } = data

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

  return (
    <div
      className={`ulc-card ${active ? 'ulc-active' : ''}`}
      style={{ borderColor: borderAccent }}
    >
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
          <span className="ulc-stat-value">
            {moment.tz ? moment.tz(draftStart, moment.tz.guess()).tz('CST6CDT').format('MMM D, YY') : moment(draftStart).format('MMM D, YY')}
          </span>
          <span className="ulc-stat-sub">
            {moment.tz ? moment.tz(draftStart, moment.tz.guess()).tz('CST6CDT').format('h A') : moment(draftStart).format('h A')} CST
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="ulc-actions">
        {yourLeague ? (
          <button className={`ulc-btn ${active ? 'ulc-btn-active' : 'ulc-btn-joined'}`}>
            {active ? 'Active' : 'Joined'}
          </button>
        ) : fromHome ? (
          <button
            className="ulc-btn ulc-btn-join"
            onClick={() => navigate('/select-game')}
          >
            Join Now
          </button>
        ) : (
          <JoinLeague data={data} />
        )}
      </div>
    </div>
  )
}

export default NewPopularLeagueCard
