import React, { useEffect, useState } from 'react';
import { useMatchDetail } from './hooks/useESPNData';
import { useAFMatchDetail } from './hooks/useAPIFootball';
import { TeamBadge } from './MatchCard';
import FormationPitch from './FormationPitch';
import { buildSAMScores } from './samMetricCalc';
import { getArticlesByFixture } from '../../soccer/services/articleService';

const Spinner = () => (
  <div className="ls-spinner">
    <div className="ls-spinner-ring"></div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ESPN Match Detail (non-soccer sports + ESPN soccer fallback)
   ═══════════════════════════════════════════════════════════ */
const MatchDetailContent = ({ data, sport }) => {
  if (!data) return null;

  const competition = data.header?.competitions?.[0];
  const competitors = competition?.competitors || [];
  const homeTeam = competitors.find(c => c.homeAway === 'home') || competitors[1];
  const awayTeam = competitors.find(c => c.homeAway === 'away') || competitors[0];

  const getTeamName = (team) => team?.team?.displayName || team?.team?.shortDisplayName || team?.team?.name || team?.displayName || team?.name || '—';
  const getTeamId = (team) => team?.team?.id || team?.id || '';

  const homeTeamName = getTeamName(homeTeam);
  const awayTeamName = getTeamName(awayTeam);
  const homeTeamId = getTeamId(homeTeam);

  // Extract match events
  const matchEvents = [];

  if (sport === 'soccer') {
    if (data.keyEvents?.length > 0) {
      data.keyEvents.forEach((evt) => {
        const play = evt?.play || evt;
        const minute = play?.clock?.displayValue || play?.gameMinute || '';
        const participants = play?.participants || [];
        const playerName = participants[0]?.athlete?.displayName || play?.text || '';
        const assistName = participants[1]?.athlete?.displayName || '';
        const teamId = play?.team?.id || '';
        const type = play?.type?.text || play?.type || '';
        const typeLower = (typeof type === 'string' ? type : '').toLowerCase();
        let eventType = null;
        if (typeLower.includes('own goal')) eventType = 'owngoal';
        else if (typeLower.includes('goal')) eventType = 'goal';
        else if (typeLower.includes('second yellow') || (typeLower.includes('yellow') && typeLower.includes('red'))) eventType = 'red';
        else if (typeLower.includes('yellow')) eventType = 'yellow';
        else if (typeLower.includes('red')) eventType = 'red';
        if (eventType) matchEvents.push({ type: eventType, minute, player: playerName, assist: assistName, teamId: String(teamId), side: String(teamId) === String(homeTeamId) ? 'home' : 'away' });
      });
    }
    if (matchEvents.length === 0 && data.rosters) {
      (data.rosters || []).forEach((roster, rosterIdx) => {
        const entries = roster?.roster || [];
        const statLabels = roster?.stats?.labels || [];
        entries.forEach((entry) => {
          const player = entry?.athlete || entry;
          const pName = player?.displayName || player?.shortName || '';
          const stats = entry?.stats || entry?.statistics || [];
          stats.forEach((val, sIdx) => {
            const label = (statLabels[sIdx] || '').toLowerCase();
            const numVal = parseInt(val) || 0;
            if (numVal > 0) {
              let eventType = null;
              if (label === 'g' || label === 'goals') eventType = 'goal';
              else if (label === 'yc' || label === 'yellowcards') eventType = 'yellow';
              else if (label === 'rc' || label === 'redcards') eventType = 'red';
              if (eventType) for (let n = 0; n < numVal; n++) matchEvents.push({ type: eventType, minute: '', player: pName, assist: '', teamId: '', side: rosterIdx === 0 ? 'home' : 'away' });
            }
          });
        });
      });
    }
  } else {
    const scoringPlays = data.scoringPlays || [];
    scoringPlays.forEach((play) => {
      const teamId = play?.team?.id || '';
      const clock = play?.clock?.displayValue || play?.displayClock || '';
      const period = play?.period?.number || play?.quarter || '';
      const text = play?.text || play?.description || '';
      const type = play?.type?.text || play?.scoringType?.displayName || play?.type?.abbreviation || '';
      const score = play?.homeScore != null && play?.awayScore != null ? `${play.homeScore}-${play.awayScore}` : '';
      let periodLabel = '';
      if (sport === 'football') periodLabel = period ? `Q${period}` : '';
      else if (sport === 'basketball') periodLabel = period ? `Q${period}` : '';
      else if (sport === 'hockey') periodLabel = period ? `P${period}` : '';
      else if (sport === 'baseball') periodLabel = period ? `Inn ${period}` : '';
      matchEvents.push({ type: 'scoring', minute: [periodLabel, clock].filter(Boolean).join(' '), player: text, assist: type, teamId: String(teamId), side: String(teamId) === String(homeTeamId) ? 'home' : 'away', score });
    });
    if (matchEvents.length === 0 && data.drives) {
      (data.drives?.previous || []).forEach((drive) => {
        const result = drive?.result || '';
        if (result.toLowerCase().includes('touchdown') || result.toLowerCase().includes('field goal')) {
          const teamId = drive?.team?.id || '';
          const plays = drive?.plays || [];
          const lastPlay = plays[plays.length - 1];
          matchEvents.push({ type: 'scoring', minute: [lastPlay?.period?.number ? `Q${lastPlay.period.number}` : '', lastPlay?.clock?.displayValue || ''].filter(Boolean).join(' '), player: lastPlay?.text || drive?.description || result, assist: result, teamId: String(teamId), side: String(teamId) === String(homeTeamId) ? 'home' : 'away' });
        }
      });
    }
  }

  const goals = matchEvents.filter(e => e.type === 'goal' || e.type === 'owngoal');
  const yellowCards = matchEvents.filter(e => e.type === 'yellow');
  const redCards = matchEvents.filter(e => e.type === 'red');
  const scoringEvents = matchEvents.filter(e => e.type === 'scoring');

  const statKeysMap = {
    soccer: ['possessionPct', 'shotsOnTarget', 'shots', 'corners', 'fouls', 'yellowCards', 'offsides'],
    football: ['totalYards', 'passingYards', 'rushingYards', 'firstDowns', 'turnovers'],
    basketball: ['fieldGoalPct', 'threePointPct', 'freeThrowPct', 'rebounds', 'assists', 'turnovers'],
    hockey: ['shotsOnGoal', 'faceOffWinPct', 'powerPlayGoals', 'hits'],
  };
  const statKeys = statKeysMap[sport] || [];
  const teamStats = data.boxscore?.teams || [];
  const getStatValue = (team, statKey) => { const stat = team?.statistics?.find(s => s.name === statKey); return stat?.displayValue || stat?.value || '—'; };

  const formatStatLabel = (key) => {
    const labels = { possessionPct: 'Possession', shotsOnTarget: 'Shots on Target', shots: 'Shots', corners: 'Corners', fouls: 'Fouls', yellowCards: 'Yellow Cards', offsides: 'Offsides', totalYards: 'Total Yards', passingYards: 'Passing Yards', rushingYards: 'Rushing Yards', firstDowns: 'First Downs', turnovers: 'Turnovers', fieldGoalPct: 'Field Goal %', threePointPct: '3-Point %', freeThrowPct: 'Free Throw %', rebounds: 'Rebounds', assists: 'Assists', shotsOnGoal: 'Shots on Goal', faceOffWinPct: 'Face Off Win %', powerPlayGoals: 'Power Play Goals', hits: 'Hits' };
    return labels[key] || key;
  };

  const renderEventSection = (title, events, icon) => {
    if (!events?.length) return null;
    const homeEvents = events.filter(e => e.side === 'home');
    const awayEvents = events.filter(e => e.side === 'away');
    const maxRows = Math.max(homeEvents.length, awayEvents.length);
    if (!maxRows) return null;
    return (
      <div style={{ margin: '0 16px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 9, fontWeight: 700, color: 'var(--ls-gdim)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{homeTeamName}</span>
          <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: 'var(--ls-wdim)' }}>{icon} {title}</span>
          <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 9, fontWeight: 700, color: 'var(--ls-gdim)', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'right' }}>{awayTeamName}</span>
        </div>
        {Array.from({ length: maxRows }).map((_, idx) => {
          const hEvt = homeEvents[idx]; const aEvt = awayEvents[idx];
          return (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', padding: '8px 16px', borderBottom: idx < maxRows - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}>
              <div style={{ textAlign: 'left' }}>{hEvt && <><span style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 12, fontWeight: 600, color: '#fff' }}>{hEvt.player}</span>{hEvt.assist && <span style={{ fontSize: 10, color: 'var(--ls-gray)', marginLeft: 4 }}>({hEvt.assist})</span>}</>}</div>
              <div style={{ textAlign: 'center', fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: 'var(--ls-gdim)' }}>{hEvt?.minute || aEvt?.minute || ''}</div>
              <div style={{ textAlign: 'right' }}>{aEvt && <><span style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 12, fontWeight: 600, color: '#fff' }}>{aEvt.player}</span>{aEvt.assist && <span style={{ fontSize: 10, color: 'var(--ls-gray)', marginLeft: 4 }}>({aEvt.assist})</span>}</>}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Score Hero */}
      {homeTeam && awayTeam && (
        <div style={MS.hero}>
          <div style={MS.heroGrid}>
            <div style={MS.teamCol}><div style={MS.badgeWrap}><TeamBadge team={homeTeam} size={60} /></div><div style={MS.teamName}>{homeTeamName}</div></div>
            <div style={MS.scoreCol}><div style={MS.score}>{homeTeam.score} <span style={{ fontSize: '0.55em', verticalAlign: 'middle', color: 'rgba(255,255,255,0.35)' }}>:</span> {awayTeam.score}</div></div>
            <div style={MS.teamCol}><div style={MS.badgeWrap}><TeamBadge team={awayTeam} size={60} /></div><div style={MS.teamName}>{awayTeamName}</div></div>
          </div>
          {data.gameInfo?.venue && <div style={MS.venue}>{data.gameInfo.venue.name}</div>}
        </div>
      )}

      {/* Events */}
      <div style={{ padding: '16px 0' }}>
        {sport === 'soccer' && renderEventSection('Goals', goals, 'G')}
        {sport === 'soccer' && renderEventSection('Yellow Cards', yellowCards, 'YC')}
        {sport === 'soccer' && renderEventSection('Red Cards', redCards, 'RC')}
        {sport !== 'soccer' && scoringEvents.length > 0 && (
          <div style={{ margin: '0 16px' }}>
            {scoringEvents.map((evt, idx) => (
              <div key={idx} style={{ padding: '10px 16px', margin: '0 0 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', borderLeft: evt.side === 'home' ? '3px solid #22C55E' : '3px solid #3B82F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: 'var(--ls-gdim)' }}>{evt.minute}</span>
                  {evt.score && <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 11, fontWeight: 800, color: '#22C55E' }}>{evt.score}</span>}
                </div>
                <div style={{ fontFamily: 'var(--ls-font-bd)', fontSize: 11.5, color: 'var(--ls-wdim)', marginTop: 3 }}>{evt.player}</div>
                {evt.assist && <div style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 10, color: 'var(--ls-gray)', marginTop: 1 }}>{evt.assist}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {statKeys.length > 0 && teamStats.length >= 2 && (
        <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ padding: '12px 16px', fontFamily: 'var(--ls-font-hd)', fontSize: 12, fontWeight: 700, color: 'var(--ls-wdim)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>Statistics</div>
          {statKeys.map((statKey) => {
            const hv = getStatValue(teamStats[0], statKey); const av = getStatValue(teamStats[1], statKey);
            const hN = parseFloat(String(hv).replace('%', '')) || 0; const aN = parseFloat(String(av).replace('%', '')) || 0;
            const mx = Math.max(hN, aN) || 1;
            return (
              <div key={statKey} style={{ padding: '10px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 13, fontWeight: 800, color: hN >= aN ? '#22C55E' : 'var(--ls-wdim)' }}>{hv}</span>
                  <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 9, fontWeight: 600, color: 'var(--ls-gdim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{formatStatLabel(statKey)}</span>
                  <span style={{ fontFamily: 'var(--ls-font-cd)', fontSize: 13, fontWeight: 800, color: aN > hN ? '#3B82F6' : 'var(--ls-wdim)' }}>{av}</span>
                </div>
                <div style={{ display: 'flex', height: 5, gap: 3, borderRadius: 3 }}>
                  <div style={{ width: `${(hN / mx) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #16a34a)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                  <div style={{ flex: 1 }} />
                  <div style={{ width: `${(aN / mx) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: 3, transition: 'width 0.6s ease', marginLeft: 'auto' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Modern Shared Styles
   ═══════════════════════════════════════════════════════════ */
const MS = {
  hero: {
    position: 'relative',
    padding: '32px 24px 20px',
    background: 'linear-gradient(180deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 40%, transparent 100%)',
  },
  heroGrid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 },
  teamCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  badgeWrap: { width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' },
  teamName: { fontFamily: 'var(--ls-font-hd)', fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.3, maxWidth: 130 },
  scoreCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  score: { fontFamily: 'var(--ls-font-hd)', fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: 6, lineHeight: 1, textShadow: '0 2px 24px rgba(34,197,94,0.25)' },
  statusPill: (isLive, isFT) => ({
    padding: '4px 14px',
    borderRadius: 20,
    fontFamily: 'var(--ls-font-cd)',
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: isLive ? 'rgba(239,68,68,0.12)' : isFT ? 'rgba(255,255,255,0.04)' : 'rgba(34,197,94,0.08)',
    color: isLive ? '#EF4444' : isFT ? 'var(--ls-gray)' : '#22C55E',
    border: `1px solid ${isLive ? 'rgba(239,68,68,0.25)' : isFT ? 'rgba(255,255,255,0.06)' : 'rgba(34,197,94,0.2)'}`,
    backdropFilter: 'blur(8px)',
  }),
  liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' },
  venue: { textAlign: 'center', padding: '10px 0 0', fontFamily: 'var(--ls-font-cd)', fontSize: 10.5, color: 'var(--ls-gdim)', letterSpacing: 0.3 },
  // Pill tabs
  tabBar: { display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  tab: (active) => ({
    flex: 1,
    padding: '8px 0',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--ls-font-cd)',
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: active ? '#fff' : 'var(--ls-gdim)',
    background: active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    border: active ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.2s ease',
  }),
  // Event card
  evCard: (isGoal) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
    margin: '0 16px 6px',
    background: isGoal ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
    borderRadius: 10,
    border: isGoal ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.03)',
    transition: 'background 0.15s',
  }),
  evMin: (isGoal) => ({
    minWidth: 38,
    padding: '3px 0',
    fontFamily: 'var(--ls-font-cd)',
    fontSize: 11,
    fontWeight: 800,
    color: isGoal ? '#22C55E' : 'var(--ls-gdim)',
    background: isGoal ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
    borderRadius: 6,
    textAlign: 'center',
  }),
  evIcon: { fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 2 },
  evBody: { flex: 1, minWidth: 0 },
  evPlayer: (bold) => ({ fontFamily: 'var(--ls-font-hd)', fontSize: 12.5, fontWeight: bold ? 700 : 500, color: bold ? '#fff' : 'var(--ls-wdim)', lineHeight: 1.3 }),
  evDetail: { fontFamily: 'var(--ls-font-bd)', fontSize: 10.5, color: 'var(--ls-gray)', marginTop: 2 },
  evBadge: { width: 20, height: 20, objectFit: 'contain', borderRadius: 4, flexShrink: 0, marginTop: 2 },
  // Commentary
  cmtCard: (isHL) => ({
    display: 'flex',
    gap: 12,
    padding: '10px 16px',
    margin: '0 16px 4px',
    background: isHL ? 'rgba(34,197,94,0.06)' : 'transparent',
    borderRadius: isHL ? 10 : 0,
    border: isHL ? '1px solid rgba(34,197,94,0.12)' : 'none',
    borderBottom: isHL ? 'none' : '1px solid rgba(255,255,255,0.02)',
  }),
  cmtTime: (isHL) => ({
    minWidth: 38,
    fontFamily: 'var(--ls-font-cd)',
    fontSize: 10,
    fontWeight: 800,
    color: isHL ? '#22C55E' : 'var(--ls-gdim)',
    paddingTop: 2,
    flexShrink: 0,
  }),
  cmtText: (bold) => ({
    fontFamily: 'var(--ls-font-bd)',
    fontSize: 11.5,
    color: bold ? '#fff' : 'rgba(255,255,255,0.75)',
    fontWeight: bold ? 600 : 400,
    lineHeight: 1.55,
  }),
  // Stats
  statWrap: {
    margin: '4px 16px 16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  statTeamHd: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    padding: '12px 16px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  statBadgeSm: { width: 22, height: 22, objectFit: 'contain' },
  statRow: { padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.02)' },
  statHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statVal: (highlight) => ({ fontFamily: 'var(--ls-font-cd)', fontSize: 14, fontWeight: 800, color: highlight ? '#22C55E' : 'var(--ls-wdim)' }),
  statValA: (highlight) => ({ fontFamily: 'var(--ls-font-cd)', fontSize: 14, fontWeight: 800, color: highlight ? '#3B82F6' : 'var(--ls-wdim)' }),
  statLabel: { fontFamily: 'var(--ls-font-cd)', fontSize: 9, fontWeight: 600, color: 'var(--ls-gdim)', textTransform: 'uppercase', letterSpacing: 0.5 },
  statBarWrap: { display: 'flex', height: 5, gap: 3, borderRadius: 3 },
  statBarH: (w) => ({ width: `${w}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #16a34a)', borderRadius: 3, transition: 'width 0.6s ease' }),
  statBarA: (w) => ({ width: `${w}%`, height: '100%', background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: 3, transition: 'width 0.6s ease' }),
  // Lineups
  luTeamHd: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px 10px',
    margin: '0 16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px 12px 0 0',
    border: '1px solid rgba(255,255,255,0.04)',
    borderBottom: 'none',
  },
  luBadge: { width: 26, height: 26, objectFit: 'contain' },
  luName: { fontFamily: 'var(--ls-font-hd)', fontSize: 13, fontWeight: 700, color: '#fff', flex: 1 },
  luFormation: { fontFamily: 'var(--ls-font-cd)', fontSize: 10, fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.15)' },
  luRow: (alt) => ({
    display: 'grid',
    gridTemplateColumns: '32px 1fr auto',
    alignItems: 'center',
    gap: 8,
    padding: '7px 16px',
    margin: '0 16px',
    background: alt ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.005)',
    borderLeft: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
  }),
  luNum: { fontFamily: 'var(--ls-font-cd)', fontSize: 11, fontWeight: 800, color: 'var(--ls-gdim)', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '2px 0' },
  luPlayerName: { fontFamily: 'var(--ls-font-bd)', fontSize: 12, color: '#fff' },
  luPos: { fontFamily: 'var(--ls-font-cd)', fontSize: 9, fontWeight: 700, color: 'var(--ls-gdim)', textTransform: 'uppercase', letterSpacing: 0.3, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4 },
  luSubLabel: {
    padding: '10px 16px 6px',
    margin: '0 16px',
    fontFamily: 'var(--ls-font-cd)',
    fontSize: 9,
    fontWeight: 700,
    color: 'var(--ls-gdim)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderLeft: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(255,255,255,0.01)',
  },
  luBottom: {
    margin: '0 16px 16px',
    height: 1,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '0 0 12px 12px',
    border: '1px solid rgba(255,255,255,0.04)',
    borderTop: 'none',
    padding: 4,
  },
  empty: { padding: '40px 20px', textAlign: 'center', fontFamily: 'var(--ls-font-cd)', fontSize: 11, color: 'var(--ls-gdim)' },
};

/* ═══════════════════════════════════════════════════════════
   API-Football Match Detail, Premium Modern Design
   ═══════════════════════════════════════════════════════════ */
const AFMatchDetailContent = ({ data }) => {
  const [activeTab, setActiveTab] = useState('events')
  const [articles, setArticles] = useState([])
  const [articlesLoaded, setArticlesLoaded] = useState(false)
  if (!data?.fixture) return null

  const f = data.fixture
  const home = f.teams?.home || {}
  const away = f.teams?.away || {}
  const goals = f.goals || {}
  const status = f.fixture?.status || {}
  const venue = f.fixture?.venue || {}
  const isLive = ['1H', '2H', 'ET'].includes(status.short)
  const isFT = ['FT', 'AET', 'PEN'].includes(status.short)
  const fixtureId = f.fixture?.id

  // Fetch articles for this fixture when article tab is selected
  useEffect(() => {
    if (activeTab === 'article' && fixtureId && !articlesLoaded) {
      getArticlesByFixture(fixtureId)
        .then((res) => setArticles(res.data?.data?.articles || []))
        .catch(() => setArticles([]))
        .finally(() => setArticlesLoaded(true))
    }
  }, [activeTab, fixtureId, articlesLoaded])

  const tabs = [
    { key: 'events', label: 'Events' },
    { key: 'commentary', label: 'Commentary' },
    { key: 'stats', label: 'Stats' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'article', label: 'Article' },
  ]

  const EvIcon = ({ ev }) => {
    const base = { width: 18, height: 18, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, fontFamily: 'var(--ls-font-cd)', flexShrink: 0 }
    if (ev.type === 'Goal') {
      if (ev.detail === 'Missed Penalty') return <span style={{ ...base, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>MP</span>
      return <span style={{ ...base, background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '50%' }}>G</span>
    }
    if (ev.type === 'Card') {
      if (ev.detail === 'Red Card') return <span style={{ ...base, background: '#DC2626', borderRadius: 3, width: 14, height: 18 }} />
      return <span style={{ ...base, background: '#EAB308', borderRadius: 3, width: 14, height: 18 }} />
    }
    if (ev.type === 'subst') return <span style={{ ...base, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '50%', fontSize: 10 }}>S</span>
    if (ev.type === 'Var') return <span style={{ ...base, background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.25)' }}>V</span>
    return <span style={{ ...base, background: 'rgba(255,255,255,0.05)', color: 'var(--ls-gdim)' }}>-</span>
  }

  const evDetail = (ev) => {
    if (ev.type === 'Goal') {
      if (ev.detail === 'Own Goal') return 'Own Goal'
      if (ev.detail === 'Penalty') return 'Penalty'
      if (ev.detail === 'Missed Penalty') return 'Penalty Missed'
      if (ev.assist?.name) return `Assist: ${ev.assist.name}`
      return 'Goal'
    }
    if (ev.type === 'Card') return ev.detail || 'Card'
    if (ev.type === 'subst') return `On for ${ev.player?.name || '—'}`
    if (ev.type === 'Var') return ev.detail || 'VAR Decision'
    return ev.detail || ''
  }

  const renderStats = () => {
    if (!data.statistics?.length) return <div style={MS.empty}>Statistics not available yet</div>
    const hs = data.statistics.find(s => s.team?.id === home.id)?.statistics || []
    const as = data.statistics.find(s => s.team?.id === away.id)?.statistics || []
    const priority = ['Ball Possession', 'Total Shots', 'Shots on Goal', 'Shots off Goal', 'Corner Kicks', 'Fouls', 'Yellow Cards', 'Red Cards', 'Offsides', 'Passes %', 'Total passes', 'expected_goals']
    const stats = priority.map(n => { const h = hs.find(s => s.type === n); const a = as.find(s => s.type === n); if (!h && !a) return null; return { name: n, h: h?.value ?? '—', a: a?.value ?? '—' } }).filter(Boolean)
    if (!stats.length) return <div style={MS.empty}>No stats yet</div>

    return (
      <div style={MS.statWrap}>
        <div style={MS.statTeamHd}>
          <div style={{ textAlign: 'center' }}>{home.logo && <img src={home.logo} alt="" style={MS.statBadgeSm} />}</div>
          <div />
          <div style={{ textAlign: 'center' }}>{away.logo && <img src={away.logo} alt="" style={MS.statBadgeSm} />}</div>
        </div>
        {stats.map((s, i) => {
          const hN = parseFloat(String(s.h).replace('%', '')) || 0
          const aN = parseFloat(String(s.a).replace('%', '')) || 0
          const mx = Math.max(hN, aN) || 1
          return (
            <div key={i} style={MS.statRow}>
              <div style={MS.statHeader}>
                <span style={MS.statVal(hN >= aN)}>{s.h}</span>
                <span style={MS.statLabel}>{s.name.replace(/_/g, ' ')}</span>
                <span style={MS.statValA(aN > hN)}>{s.a}</span>
              </div>
              <div style={MS.statBarWrap}>
                <div style={MS.statBarH((hN / mx) * 100)} />
                <div style={{ flex: 1 }} />
                <div style={MS.statBarA((aN / mx) * 100)} />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--ls-bg)' }}>
      {/* ── Score Hero ── */}
      <div style={MS.hero}>
        <div style={MS.heroGrid}>
          <div style={MS.teamCol}>
            <div style={MS.badgeWrap}>
              {home.logo ? <img src={home.logo} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} /> : <div style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 18, fontWeight: 700, color: 'var(--ls-gray)' }}>{(home.name || '?').slice(0, 2)}</div>}
            </div>
            <div style={MS.teamName}>{home.name}</div>
          </div>
          <div style={MS.scoreCol}>
            <div style={MS.score}>{goals.home ?? '—'} <span style={{ fontSize: '0.55em', verticalAlign: 'middle', color: 'rgba(255,255,255,0.35)' }}>:</span> {goals.away ?? '—'}</div>
            <div style={MS.statusPill(isLive, isFT)}>
              {isLive && <span style={MS.liveDot} />}
              {status.long || status.short || ''}{status.elapsed ? ` · ${status.elapsed}'` : ''}
            </div>
          </div>
          <div style={MS.teamCol}>
            <div style={MS.badgeWrap}>
              {away.logo ? <img src={away.logo} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} /> : <div style={{ fontFamily: 'var(--ls-font-hd)', fontSize: 18, fontWeight: 700, color: 'var(--ls-gray)' }}>{(away.name || '?').slice(0, 2)}</div>}
            </div>
            <div style={MS.teamName}>{away.name}</div>
          </div>
        </div>
        {venue.name && <div style={MS.venue}>{venue.name}{venue.city ? `, ${venue.city}` : ''}</div>}
      </div>

      {/* ── Pill Tab Bar ── */}
      <div style={MS.tabBar}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={MS.tab(activeTab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Events Tab ── */}
      {activeTab === 'events' && (
        <div style={{ padding: '12px 0 16px' }}>
          {data.events?.length > 0 ? data.events
            .filter(ev => ['Goal', 'Card', 'Var', 'subst'].includes(ev.type))
            .sort((a, b) => (a.time?.elapsed || 0) - (b.time?.elapsed || 0))
            .map((ev, i) => {
              const isGoal = ev.type === 'Goal' && ev.detail !== 'Missed Penalty'
              const min = `${ev.time?.elapsed || ''}${ev.time?.extra ? `+${ev.time.extra}` : ''}'`
              return (
                <div key={i} style={MS.evCard(isGoal)}>
                  <div style={MS.evMin(isGoal)}>{min}</div>
                  <div style={MS.evIcon}><EvIcon ev={ev} /></div>
                  <div style={MS.evBody}>
                    <div style={MS.evPlayer(isGoal)}>{ev.type === 'subst' ? (ev.assist?.name || '—') : (ev.player?.name || '—')}</div>
                    <div style={MS.evDetail}>{evDetail(ev)}</div>
                  </div>
                  {ev.team?.logo && <img src={ev.team.logo} alt="" style={MS.evBadge} />}
                </div>
              )
            }) : <div style={MS.empty}>No match events yet</div>}
        </div>
      )}

      {/* ── Commentary Tab ── */}
      {activeTab === 'commentary' && (
        <div style={{ padding: '12px 0 16px' }}>
          {data.commentary?.length > 0 ? data.commentary.slice().reverse().map((c, i) => {
            const isHL = c.type === 'Goal' || (c.type === 'Card' && (c.detail === 'Red Card' || c.detail === 'Second Yellow card'))
            return (
              <div key={i} style={MS.cmtCard(isHL)}>
                <span style={MS.cmtTime(isHL)}>{c.timestamp}</span>
                {c.icon && <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--ls-font-cd)', color: 'var(--ls-gdim)', marginRight: 6, verticalAlign: 'top', lineHeight: 1.4 }}>{c.icon === '⚽' ? 'GOAL' : c.icon === '🟨' ? 'YC' : c.icon === '🟥' ? 'RC' : c.icon === '🔄' ? 'SUB' : ''}</span>}
                <span style={MS.cmtText(isHL)}>{c.text}</span>
              </div>
            )
          }) : <div style={MS.empty}>Commentary updates during the match</div>}
        </div>
      )}

      {/* ── Stats Tab ── */}
      {activeTab === 'stats' && <div style={{ paddingTop: 8 }}>{renderStats()}</div>}

      {/* ── Lineups Tab, Visual Formation Pitch + SAM Scores ── */}
      {activeTab === 'lineups' && (() => {
        const samScores = buildSAMScores(
          data.playerStats,
          goals.away ?? 0,  // goals conceded by home = away goals
          goals.home ?? 0,  // goals conceded by away = home goals
        )
        return (
          <div style={{ padding: '12px 0 16px' }}>
            {data.lineups?.length > 0 ? (
              <FormationPitch lineups={data.lineups} events={data.events} samScores={samScores} />
            ) : (
              <div style={MS.empty}>Lineups not available yet</div>
            )}
          </div>
        )
      })()}

      {/* ── Article Tab ── */}
      {activeTab === 'article' && (
        <div style={{ padding: '12px 0 16px' }}>
          {!articlesLoaded ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Loading...</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
              <p style={{ marginBottom: 4 }}>No article available for this match yet.</p>
              <p style={{ fontSize: 12 }}>Articles are auto-generated before and after matches.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article._id} style={{
                background: 'rgba(30,41,59,0.6)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                border: '1px solid rgba(71,85,105,0.3)',
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: article.type === 'post_match' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
                    color: article.type === 'post_match' ? '#f59e0b' : '#8b5cf6',
                  }}>
                    {article.type === 'post_match' ? 'Post-Match Review' : 'Pre-Match Preview'}
                  </span>
                  {article.readTimeMinutes && (
                    <span style={{ fontSize: 10, color: '#64748b' }}>{article.readTimeMinutes} min read</span>
                  )}
                </div>
                <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3 }}>
                  {article.title}
                </h3>
                {article.subtitle && (
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 12px', fontStyle: 'italic' }}>
                    {article.subtitle}
                  </p>
                )}
                <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {article.content}
                </div>
                {article.topPerformers?.length > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(71,85,105,0.2)' }}>
                    <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Top Performers</div>
                    {article.topPerformers.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                        <span style={{ color: '#cbd5e1', fontSize: 13 }}>{p.name} <span style={{ color: '#64748b', fontSize: 11 }}>({p.position})</span></span>
                        <span style={{
                          fontWeight: 700, fontSize: 13,
                          color: p.samRating >= 8 ? '#10b981' : p.samRating >= 7 ? '#3b82f6' : '#f59e0b',
                        }}>{p.samRating}/10</span>
                      </div>
                    ))}
                  </div>
                )}
                {article.tags?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {article.tags.map((t, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, background: 'rgba(71,85,105,0.3)', color: '#94a3b8' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MatchDrawer, Routes between ESPN and API-Football detail

   Soccer always uses the API-Football widget (Events/Commentary/
   Stats/Lineups tabs). ESPN widget only for non-soccer sports.
   ═══════════════════════════════════════════════════════════ */
const MatchDrawer = ({ isOpen, onClose, eventId, sport, league, leagueName }) => {
  const hasAFPrefix = typeof eventId === 'string' && eventId.startsWith('af-')
  const afFixtureId = hasAFPrefix ? eventId.replace('af-', '') : null

  // Use API-Football only if we have a valid AF fixture ID
  // ESPN soccer events (no af- prefix) fall through to ESPN path
  const useAF = hasAFPrefix && afFixtureId
  const useESPN = !useAF

  const espnResult = useMatchDetail(useESPN ? eventId : null, sport, league, isOpen && useESPN)
  const afResult = useAFMatchDetail(isOpen && useAF ? afFixtureId : null)

  const loading = useAF ? afResult.loading : espnResult.loading
  const data = useAF ? afResult.data : espnResult.data
  const error = useESPN ? espnResult.error : null

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div className={`ls-drawer ${isOpen ? 'open' : ''}`}>
      <div className="ls-drawer-backdrop" onClick={onClose} />
      <div className="ls-drawer-panel">
        <div className="ls-drawer-hd">
          <span className="ls-drawer-league">{leagueName}</span>
          <button className="ls-drawer-close" onClick={onClose}>✕ Close</button>
        </div>
        <div className="ls-drawer-body">
          {loading && <Spinner />}
          {error && <div className="ls-error-msg">Unable to load match details</div>}
          {!loading && data && useAF && <AFMatchDetailContent data={data} />}
          {!loading && data && useESPN && <MatchDetailContent data={data} sport={sport} />}
        </div>
      </div>
    </div>
  );
};

export default MatchDrawer;
