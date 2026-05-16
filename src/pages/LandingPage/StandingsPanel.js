import React, { useState, useEffect } from 'react';
import { STANDINGS_CONFIGS } from './constants';
import { useESPNStandings } from './hooks/useESPNData';
import { useAPIFootballStandings } from './hooks/useAPIFootball';

const SOCCER_BACKEND_URL = process.env.REACT_APP_SOCCER_API_URL || 'https://soccerbackend.samsports.io'

const Spinner = () => (
  <div className="ls-spin-wrap">
    <div className="ls-spinner" />
    <span className="ls-spin-lbl">Loading standings...</span>
  </div>
);

const ZONE_COLORS = {
  'zone-cl': 'Champion/Qualified',
  'zone-el': 'Europa League',
  'zone-rel': 'Relegation',
  'zone-playoff': 'Playoff',
};

const AF_KEY_MAP = {
  epl: 'premier_league',
  laliga: 'la_liga',
  bundesliga: 'bundesliga',
  seriea: 'serie_a',
  ligue1: 'ligue_1',
};

const LEADER_TABS = [
  { key: 'goals', label: 'Goals', icon: '⚽' },
  { key: 'assists', label: 'Assists', icon: '🅰️' },
  { key: 'yellowCards', label: 'Yellow Cards', icon: '🟨' },
  { key: 'redCards', label: 'Red Cards', icon: '🟥' },
];

/* ═══ Leaders Hook ═══ */
const useLeagueLeaders = (leagueKey) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!leagueKey) { setData(null); return }

    let cancelled = false
    const fetchLeaders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${SOCCER_BACKEND_URL}/api/v1/leagues/real-leaders/${leagueKey}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled && json.success) setData(json.data)
      } catch (err) {
        console.warn('[Leaders] Error:', err.message)
      }
      if (!cancelled) setLoading(false)
    }
    fetchLeaders()
    return () => { cancelled = true }
  }, [leagueKey])

  return { data, loading }
}

/* ═══ Leaders Panel Component ═══ */
const LeadersPanel = ({ leagueKey }) => {
  const [activeTab, setActiveTab] = useState('goals')
  const { data, loading } = useLeagueLeaders(leagueKey)

  if (!leagueKey) return null
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><Spinner /></div>
  if (!data) return null

  const players = data[activeTab] || []

  return (
    <div className="ls-leaders-panel">
      <div className="ls-leaders-title">Stat Leaders</div>

      <div className="ls-leaders-tabs">
        {LEADER_TABS.map(tab => (
          <button
            key={tab.key}
            className={`ls-leaders-tab ${tab.key === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="ls-leaders-list">
        {players.length > 0 ? players.map((p, idx) => (
          <div key={p.playerId || idx} className="ls-leader-row">
            <span className="ls-leader-rank">{idx + 1}</span>
            <div className="ls-leader-player">
              {p.photo && <img src={p.photo} alt={p.name} className="ls-leader-photo" />}
              <div className="ls-leader-info">
                <span className="ls-leader-name">{p.name}</span>
                <span className="ls-leader-team">
                  {p.teamLogo && <img src={p.teamLogo} alt="" className="ls-leader-team-logo" />}
                  {p.team}
                </span>
              </div>
            </div>
            <span className="ls-leader-value">{p.value}</span>
          </div>
        )) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No data available
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ Standings Table ═══ */
const StandingsTable = ({ table, config }) => {
  const isSoccer = config?.type === 'soccer';

  const getFormColor = (result) => {
    switch (result) {
      case 'W':
        return '#4caf50';
      case 'D':
        return '#ffc107';
      case 'L':
        return '#f44336';
      default:
        return '#999';
    }
  };

  const getStatByName = (stats, name) => {
    const stat = stats.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return stat ? stat.displayValue : '-';
  };

  const renderFormDots = (entry) => {
    if (!entry.form || entry.form.length === 0) return null;
    return (
      <div className="ls-stg-form">
        {entry.form.split('').map((result, i) => (
          <span
            key={i}
            className="ls-stg-form-dot"
            style={{ backgroundColor: getFormColor(result) }}
            title={result}
          />
        ))}
      </div>
    );
  };

  const renderTeamCell = (entry) => {
    return (
      <div className="ls-stg-team-cell">
        {entry.logo && <img src={entry.logo} alt={entry.team} className="ls-stg-team-logo" />}
        <span className="ls-stg-team-name">{entry.team}</span>
      </div>
    );
  };

  return (
    <div className="ls-stg-league-block">
      <div className="ls-stg-league-hd">
        {config?.emoji} {table.name} {table.season && `- ${table.season}`}
      </div>

      <table className="ls-stg-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            {isSoccer ? (
              <>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>PTS</th>
                <th>Form</th>
              </>
            ) : (
              <>
                <th>GP</th>
                <th>W</th>
                <th>L</th>
                <th>PCT</th>
                <th>GB</th>
                <th>Home</th>
                <th>Away</th>
                <th>Streak</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {table.entries && table.entries.length > 0 ? (
            table.entries.map((entry, idx) => {
              const zoneClass = entry.zone ? `zone-${entry.zone.toLowerCase()}` : '';
              return (
                <tr key={idx} className={`ls-stg-row ${zoneClass}`}>
                  <td className="ls-stg-position">{entry.position || idx + 1}</td>
                  <td>{renderTeamCell(entry)}</td>
                  {isSoccer ? (
                    <>
                      <td>{getStatByName(entry.stats, 'played')}</td>
                      <td>{getStatByName(entry.stats, 'wins')}</td>
                      <td>{getStatByName(entry.stats, 'draws')}</td>
                      <td>{getStatByName(entry.stats, 'losses')}</td>
                      <td>{getStatByName(entry.stats, 'goalsfor')}</td>
                      <td>{getStatByName(entry.stats, 'goalsagainst')}</td>
                      <td>{getStatByName(entry.stats, 'goalsdiff')}</td>
                      <td className="ls-stg-points">{getStatByName(entry.stats, 'points')}</td>
                      <td>{renderFormDots(entry)}</td>
                    </>
                  ) : (
                    <>
                      <td>{getStatByName(entry.stats, 'gamesplayed')}</td>
                      <td>{getStatByName(entry.stats, 'wins')}</td>
                      <td>{getStatByName(entry.stats, 'losses')}</td>
                      <td>{getStatByName(entry.stats, 'winpct')}</td>
                      <td>{getStatByName(entry.stats, 'gamesback')}</td>
                      <td>{getStatByName(entry.stats, 'home')}</td>
                      <td>{getStatByName(entry.stats, 'away')}</td>
                      <td>{getStatByName(entry.stats, 'streak')}</td>
                    </>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isSoccer ? 10 : 8} style={{ textAlign: 'center', padding: '20px' }}>
                No standings data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Zone Legend */}
      <div className="ls-stg-zone-legend">
        {Object.entries(ZONE_COLORS).map(([zoneKey, zoneLabel]) => (
          <div key={zoneKey} className="ls-stg-zone-item">
            <span className={`ls-stg-zone-indicator ${zoneKey}`} />
            <span>{zoneLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══ Main Standings Panel ═══ */
const StandingsPanel = ({ activeStanding = 'epl', onStandingChange }) => {
  const config = STANDINGS_CONFIGS[activeStanding];
  const isSoccerLeague = config?.type === 'soccer' && config?.afLeagueId;

  // Use API Football for soccer leagues, ESPN for everything else
  const afData = useAPIFootballStandings(isSoccerLeague ? config.afLeagueId : null);
  const espnData = useESPNStandings(config?.sport, config?.league);

  // For soccer: prefer API Football, fall back to ESPN if empty
  const tables = isSoccerLeague && afData.tables.length > 0 ? afData.tables : espnData.tables;
  const loading = isSoccerLeague ? (afData.loading && espnData.loading) : espnData.loading;

  // Leaders key for soccer leagues
  const leadersKey = isSoccerLeague ? AF_KEY_MAP[activeStanding] : null;

  return (
    <div className="ls-standings-panel">
      {/* Sport Navigation Buttons */}
      <div className="ls-stg-sport-nav">
        {Object.entries(STANDINGS_CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            className={`ls-stg-sport-btn ${key === activeStanding ? 'active' : ''}`}
            onClick={() => onStandingChange(key)}
          >
            {cfg.emoji} {cfg.label}
          </button>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner />
        </div>
      ) : (
        <div className="ls-stg-wrap">
          {tables && tables.length > 0 ? (
            tables.map((table, i) => (
              <StandingsTable key={i} table={table} config={config} />
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No standings data available
            </div>
          )}
        </div>
      )}

      {/* Stat Leaders — only for soccer leagues */}
      {leadersKey && <LeadersPanel leagueKey={leadersKey} />}
    </div>
  );
};

export default StandingsPanel;
