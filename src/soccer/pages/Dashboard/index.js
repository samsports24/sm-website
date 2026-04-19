import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Spin, notification, Input } from 'antd';
import {
  CrownOutlined, TeamOutlined, TrophyOutlined, FireOutlined,
  RiseOutlined, ThunderboltOutlined, BarChartOutlined, EditOutlined, CheckOutlined,
  StarOutlined, MedicineBoxOutlined, DollarOutlined, WalletOutlined,
  SwapOutlined, SearchOutlined, PlusCircleOutlined,
} from '@ant-design/icons';
import PitchView from '../../components/PitchView';
import CreateSoccerLeague from '../../components/CreateSoccerLeague';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken, SQUAD_SIZE, ACADEMY_SIZE } from '../../config/constants';
import '../../styles/global.css';
import '../../../pages/NFLRivals/nfl-rivals.css';

/* Soccer uses the same rv2- CSS classes as NFL Rivals with green accents */

const SoccerDashboard = () => {
  const navigate = useNavigate();
  const { leagueName, leagueFlag, leagueColor, teamName, season, matchweek, team, league } = useSoccerLeague();
  const walletData = useSelector((state) => state.user?.SamPoints);
  const samPoints = (walletData?.SamPoints || 0) + (walletData?.preAuctionPoints || 0);

  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState('4-3-3');
  const [squadSize, setSquadSize] = useState(0);
  const [squadValue, setSquadValue] = useState(0);
  const [squadValid, setSquadValid] = useState(false);
  const [ranking, setRanking] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [standings, setStandings] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [editingName, setEditingName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      attachSoccerToken();
      const leagueId = league?._id;
      const [squadRes, standingsRes] = await Promise.allSettled([
        soccerAPI.get('/api/v1/teams/squad'),
        leagueId ? soccerAPI.get(`/api/v1/leagues/standings/${leagueId}`) : Promise.reject('no league'),
      ]);

      if (squadRes.status === 'fulfilled' && squadRes.value?.data?.data) {
        const sq = squadRes.value.data.data;
        setFormation(sq.formation || team?.formation || '4-3-3');
        const size = sq.players?.length || sq.squadSize || 0;
        setSquadSize(size);
        setSquadValid(size >= 11);
        setSquadValue(sq.totalMarketValue || sq.squadValue || 0);
      }

      if (standingsRes.status === 'fulfilled' && standingsRes.value?.data?.data) {
        const st = Array.isArray(standingsRes.value.data.data) ? standingsRes.value.data.data : [];
        setTotalTeams(st.length);
        setStandings(st.slice(0, 5));
        const myEntry = st.find(s => String(s.teamId || s.team?._id) === String(team?._id));
        if (myEntry) {
          setRanking(myEntry.position || st.indexOf(myEntry) + 1);
          setMyStats({
            wins: myEntry.wins || myEntry.w || 0,
            draws: myEntry.draws || myEntry.d || 0,
            losses: myEntry.losses || myEntry.l || 0,
            points: myEntry.points || myEntry.fantasyPoints || 0,
          });
        }
      }
    } catch { /* APIs may not be ready */ }
    finally { setLoading(false); }
  }, [team, league]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSaveTeamName = async () => {
    if (!newTeamName.trim()) return;
    try {
      setSavingName(true);
      attachSoccerToken();
      const res = await soccerAPI.put('/api/v1/teams/name', { teamName: newTeamName.trim() });
      if (res.data?.success) {
        setEditingName(false);
        notification.success({ message: 'Team name updated!' });
      }
    } catch { notification.error({ message: 'Failed to update name' }); }
    finally { setSavingName(false); }
  };

  if (loading) return <div className="nflr-loading"><Spin size="large" /></div>;

  const accentColor = leagueColor || '#4CAF50';
  const spDisplay = samPoints >= 1e6 ? `${(samPoints / 1e6).toFixed(1)}M` : samPoints >= 1e3 ? `${(samPoints / 1e3).toFixed(0)}K` : String(samPoints);

  return (
    <div className="nflr-page">

      {/* ═══ HERO BANNER ═══ */}
      <div className="rv2-hero" style={{ '--div-glow': accentColor }}>
        <div className="rv2-hero-stripe" style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }} />
        <div className="rv2-hero-content">
          {/* Badge + Identity */}
          <div className="rv2-hero-left">
            <div className="rv2-hero-badge" style={{ borderColor: accentColor, boxShadow: `0 0 30px ${accentColor}40` }}>
              <span style={{ fontSize: 22 }}>{leagueFlag || '⚽'}</span>
              <span className="rv2-hero-badge-num" style={{ color: accentColor }}>#{ranking || '?'}</span>
            </div>
            <div className="rv2-hero-identity">
              <div className="rv2-hero-team-row">
                {editingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input className="rv2-hero-edit-input" value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveTeamName(); }}
                      maxLength={30} autoFocus />
                    <CheckOutlined onClick={handleSaveTeamName} style={{ color: accentColor, cursor: 'pointer', fontSize: 18 }} />
                  </div>
                ) : (
                  <>
                    <h2 className="rv2-hero-team-name">{teamName || 'MY TEAM'}</h2>
                    <EditOutlined className="rv2-hero-edit-btn" onClick={() => { setNewTeamName(teamName || ''); setEditingName(true); }} />
                  </>
                )}
              </div>
              <h1 className="rv2-hero-division" style={{ color: accentColor }}>{leagueName || 'LEAGUE'}</h1>
              <div className="rv2-hero-tags">
                <span className="rv2-tag">{season ? `SEASON ${season}` : 'PRE-SEASON'}</span>
                {matchweek && <span className="rv2-tag rv2-tag-live">MW {matchweek}</span>}
                <span className="rv2-tag">{formation}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="rv2-hero-stats">
            <div className="rv2-stat rv2-stat-win">
              <span className="rv2-stat-num">{myStats.wins || 0}</span>
              <span className="rv2-stat-lbl">WIN</span>
            </div>
            <div className="rv2-stat rv2-stat-draw">
              <span className="rv2-stat-num">{myStats.draws || 0}</span>
              <span className="rv2-stat-lbl">DRW</span>
            </div>
            <div className="rv2-stat rv2-stat-loss">
              <span className="rv2-stat-num">{myStats.losses || 0}</span>
              <span className="rv2-stat-lbl">LOSS</span>
            </div>
            <div className="rv2-stat-sep" />
            <div className="rv2-stat rv2-stat-pts">
              <span className="rv2-stat-num">{typeof myStats.points === 'number' ? myStats.points.toFixed(1) : '0.0'}</span>
              <span className="rv2-stat-lbl">PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ QUICK ACTIONS BAR ═══ */}
      <div className="rv2-quick-bar">
        <button className="rv2-quick-btn rv2-quick-primary" onClick={() => navigate('/soccer/squad')}>
          <TeamOutlined /> MY SQUAD
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/soccer/transfers')}>
          <SwapOutlined /> TRANSFERS
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/soccer/lineup')}>
          <BarChartOutlined /> LINEUP
        </button>
        <button className="rv2-quick-btn" onClick={() => navigate('/soccer/league')}>
          <TrophyOutlined /> TABLE
        </button>
      </div>

      {/* ═══ FEED-STYLE DASHBOARD ═══ */}
      <div className="rv2-feed">

        {/* Left column: main cards */}
        <div className="rv2-feed-main">

          {/* Featured: Squad status */}
          <div className="rv2-card-featured" onClick={() => navigate('/soccer/squad')}>
            <div className="rv2-card-featured-stripe" />
            <div className="rv2-card-featured-body">
              <div className="rv2-card-featured-icon" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}>
                <TeamOutlined />
              </div>
              <div className="rv2-card-featured-text">
                <span className="rv2-card-featured-title">Squad</span>
                <span className="rv2-card-featured-sub">
                  {squadValid
                    ? `${squadSize}/${SQUAD_SIZE + ACADEMY_SIZE} · ${squadValue >= 1e6 ? `$${(squadValue / 1e6).toFixed(0)}M` : `$${(squadValue / 1e3).toFixed(0)}K`} value`
                    : 'Build your roster to compete'}
                </span>
              </div>
              {!squadValid && <span className="rv2-card-featured-cta">GET STARTED</span>}
            </div>
          </div>

          {/* Two-col action grid */}
          <div className="rv2-action-grid">
            <div className="rv2-action-card" onClick={() => navigate('/soccer/league')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}><FireOutlined /></div>
              <span className="rv2-action-title">Standings</span>
              <span className="rv2-action-sub">{totalTeams > 0 ? `${totalTeams} teams` : 'View table'}</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/soccer/lineup')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}><BarChartOutlined /></div>
              <span className="rv2-action-title">Set Lineup</span>
              <span className="rv2-action-sub">{matchweek ? `MW ${matchweek} active` : 'No active week'}</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/soccer/profile')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}><TrophyOutlined /></div>
              <span className="rv2-action-title">Profile</span>
              <span className="rv2-action-sub">Season stats & trophies</span>
            </div>
            <div className="rv2-action-card" onClick={() => navigate('/soccer/transfers')}>
              <div className="rv2-action-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}><SearchOutlined /></div>
              <span className="rv2-action-title">Market</span>
              <span className="rv2-action-sub">Buy & sell players</span>
            </div>
          </div>
        </div>

        {/* Right column: sidebar widgets */}
        <div className="rv2-feed-side">

          {/* Wallet widget */}
          <div className="rv2-widget">
            <div className="rv2-widget-header">
              <WalletOutlined style={{ color: '#2dd4bf' }} />
              <span>Rivals Wallet</span>
            </div>
            <div className="rv2-wallet-balance">
              <span className="rv2-wallet-amount">{spDisplay}</span>
              <span className="rv2-wallet-unit">SP</span>
            </div>
            <button className="rv2-wallet-buy" onClick={() => navigate('/buy-sam-points?from=soccer', { state: { fromRivals: true } })}>
              <DollarOutlined /> Buy SamPoints
            </button>
          </div>

          {/* League Standings widget */}
          <div className="rv2-widget">
            <div className="rv2-widget-header">
              <TrophyOutlined style={{ color: '#f97316' }} />
              <span>League Table</span>
              <button className="rv2-widget-link" onClick={() => navigate('/soccer/league')}>View All</button>
            </div>
            {standings.length > 0 ? (
              <div className="rv2-pod-list">
                {standings.map((s, idx) => {
                  const isMe = String(s.teamId || s.team?._id) === String(team?._id);
                  const tName = s.teamName || s.team?.name || 'Team';
                  return (
                    <div key={s.teamId || idx} className={`rv2-pod-row ${isMe ? 'rv2-pod-me' : ''}`}>
                      <span className="rv2-pod-rank">{s.position || idx + 1}</span>
                      <span className="rv2-pod-name">{tName}</span>
                      <span className="rv2-pod-record">
                        <span className="rv2-pod-w">{s.wins || s.w || 0}</span>
                        <span className="rv2-pod-sep">-</span>
                        <span className="rv2-pod-d">{s.draws || s.d || 0}</span>
                        <span className="rv2-pod-sep">-</span>
                        <span className="rv2-pod-l">{s.losses || s.l || 0}</span>
                      </span>
                      <span className="rv2-pod-pts">{(s.points || s.fantasyPoints || 0).toFixed ? (s.points || s.fantasyPoints || 0).toFixed(1) : (s.points || 0)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rv2-widget-empty">
                {squadValid ? 'Standings loading…' : 'Build your squad to join the league'}
              </div>
            )}
          </div>

          {/* Create League CTA widget */}
          <CreateSoccerLeague
            onSuccess={() => { loadAll(); }}
            button={
              <div className="rv2-widget rv2-widget-cta" style={{ cursor: 'pointer' }}>
                <PlusCircleOutlined className="rv2-widget-cta-icon" style={{ color: '#22c55e' }} />
                <div>
                  <div className="rv2-widget-cta-title">Create League</div>
                  <div className="rv2-widget-cta-sub">Start a new soccer league</div>
                </div>
                <span className="rv2-widget-cta-arrow">›</span>
              </div>
            }
          />

          {/* Transfer Market CTA widget */}
          <div className="rv2-widget rv2-widget-cta" onClick={() => navigate('/soccer/transfers')}>
            <SwapOutlined className="rv2-widget-cta-icon" />
            <div>
              <div className="rv2-widget-cta-title">Transfer Market</div>
              <div className="rv2-widget-cta-sub">Find & sign new players</div>
            </div>
            <span className="rv2-widget-cta-arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoccerDashboard;
