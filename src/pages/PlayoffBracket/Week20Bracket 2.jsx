import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import { getPostseasonState } from '../../redux/actions/postseasonAction';

/* ──────────────────────────────────────────────────────────────────
   Dynasty 32 — Week 20 Divisional Bracket with Dynamic Re-seeding
   ────────────────────────────────────────────────────────────────── */

// ── Helper: build conference data from postseason state ──────────
function buildConferenceData(postseasonState, confIndex) {
  if (!postseasonState?.conferences?.[confIndex]) return null;
  const conf = postseasonState.conferences[confIndex];
  const confLabel = conf.name || `Conference ${confIndex + 1}`;

  // Find the #1 seed (bye team)
  const seed1 = conf.seeds?.find(s => s.seed === 1) || { id: 'tbd', name: 'TBD', abbr: '?', seed: 1, wins: 0, losses: 0 };

  // Build wild card results from postseason matchups
  const wcMatchups = postseasonState.matchups?.filter(
    m => m.round === 'wild_card' && m.conference === confIndex
  ) || [];

  const wildCardResults = wcMatchups.map(m => ({
    winner: m.winner || m.home,
    loser: m.loser || m.away,
    score: m.homeScore && m.awayScore ? `${m.homeScore} – ${m.awayScore}` : 'Pending',
  }));

  return { label: confLabel, seed1, wildCardResults };
}


// ── Dynamic re-seeding logic ────────────────────────────────────
function reseedDivisional(seed1, wildCardResults) {
  const survivors = wildCardResults.map(r => r.winner);
  // Sort: highest seed number = lowest rank = plays #1
  const sorted = [...survivors].sort((a, b) => a.seed - b.seed);
  const lowest = sorted[sorted.length - 1];
  const remaining = sorted.filter(s => s.id !== lowest.id);

  return {
    game1: { home: seed1, away: lowest, label: 'Seed 1 vs Lowest Survivor' },
    game2: { home: remaining[0], away: remaining[1], label: 'Remaining Survivors' },
  };
}


// ── Sub-components ──────────────────────────────────────────────

function TeamCard({ team, isHome, isEliminated, isBye }) {
  const bg = isEliminated
    ? 'bg-gray-800/40 border-gray-700'
    : isHome
      ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border-indigo-500/50'
      : 'bg-gradient-to-r from-slate-900/60 to-gray-900/40 border-slate-500/40';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bg} transition-all duration-200 ${isEliminated ? 'opacity-40 line-through' : 'hover:scale-[1.02]'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
        isEliminated ? 'bg-gray-700 text-gray-500' :
        isBye ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/40' :
        'bg-indigo-600/30 text-indigo-300'
      }`}>
        #{team.seed}
      </div>
      <div className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center text-xs font-bold text-white/70 border border-white/10">
        {team.abbr}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isEliminated ? 'text-gray-600' : 'text-white'}`}>
          {team.name}
        </p>
        <p className="text-xs text-gray-400">{team.wins}-{team.losses}</p>
      </div>
      {isBye && (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          BYE
        </span>
      )}
      {isEliminated && (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">
          OUT
        </span>
      )}
    </div>
  );
}

function MatchupCard({ home, away, roundLabel, matchLabel, score, connector }) {
  return (
    <div className="relative">
      {connector && (
        <div className="absolute -left-6 top-1/2 w-6 h-px bg-gradient-to-r from-transparent to-indigo-500/50" />
      )}
      <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{roundLabel}</span>
          {matchLabel && (
            <span className="text-xs text-gray-500 italic">{matchLabel}</span>
          )}
        </div>
        <div className="space-y-2">
          <TeamCard team={home} isHome={true} />
          <div className="flex items-center gap-2 px-2">
            <div className="flex-1 h-px bg-gray-700/50" />
            <span className="text-xs font-bold text-gray-500">VS</span>
            <div className="flex-1 h-px bg-gray-700/50" />
          </div>
          <TeamCard team={away} />
        </div>
        {score && (
          <div className="mt-3 text-center text-xs text-gray-400 bg-black/20 rounded-md py-1">
            {score}
          </div>
        )}
      </div>
    </div>
  );
}

function WildCardResult({ result, index }) {
  return (
    <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3 flex items-center gap-3">
      <div className="text-xs text-gray-500 font-mono w-6">WC{index + 1}</div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs font-bold text-green-400">W</span>
        <span className="text-sm text-white font-medium">#{result.winner.seed} {result.winner.name}</span>
      </div>
      <span className="text-xs text-gray-500 font-mono">{result.score}</span>
      <div className="flex items-center gap-2 opacity-40">
        <span className="text-xs font-bold text-red-400">L</span>
        <span className="text-sm text-gray-500 line-through">#{result.loser.seed} {result.loser.name}</span>
      </div>
    </div>
  );
}

function ReseedingExplainer({ seed1, lowest }) {
  return (
    <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-yellow-400 text-sm">↻</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-indigo-300 mb-1">Dynamic Re-seeding Applied</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            The <span className="text-yellow-400 font-semibold">#{seed1.seed} seed</span> ({seed1.name})
            is matched against the <span className="text-orange-400 font-semibold">lowest surviving seed</span> (#{lowest.seed} {lowest.name}).
            This ensures the top seed always faces the weakest remaining opponent.
          </p>
        </div>
      </div>
    </div>
  );
}


// ── Conference Bracket Column ───────────────────────────────────
function ConferenceBracket({ data }) {
  const { game1, game2 } = useMemo(
    () => reseedDivisional(data.seed1, data.wildCardResults),
    [data]
  );

  return (
    <div className="flex-1 min-w-[340px]">
      {/* Conference header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
        <h2 className="text-lg font-bold text-white tracking-tight">{data.label}</h2>
      </div>

      {/* Re-seeding explainer */}
      <ReseedingExplainer seed1={game1.home} lowest={game1.away} />

      {/* Wild Card results summary */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Wild Card Results (Week 19)
        </h3>
        <div className="space-y-2">
          {data.wildCardResults.map((r, i) => (
            <WildCardResult key={i} result={r} index={i} />
          ))}
        </div>
      </div>

      {/* Divisional matchups */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Divisional Round (Week 20) — Re-seeded
        </h3>
        <div className="space-y-4">
          <MatchupCard
            home={game1.home}
            away={game1.away}
            roundLabel="Divisional"
            matchLabel={game1.label}
          />
          <MatchupCard
            home={game2.home}
            away={game2.away}
            roundLabel="Divisional"
            matchLabel={game2.label}
          />
        </div>
      </div>

      {/* Eliminated teams */}
      <div className="mt-5">
        <h3 className="text-xs font-bold text-red-500/60 uppercase tracking-widest mb-2">
          Eliminated (Wild Card)
        </h3>
        <div className="space-y-1">
          {data.wildCardResults.map((r, i) => (
            <TeamCard key={i} team={r.loser} isEliminated={true} />
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Main bracket component ──────────────────────────────────────
export default function Week20Bracket() {
  const [activeConf, setActiveConf] = useState('both');
  const [loading, setLoading] = useState(true);
  const postseasonState = useSelector((state) => state?.postseason?.state);
  const postseasonLoading = useSelector((state) => state?.postseason?.loading);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await getPostseasonState();
      setLoading(false);
    };
    load();
  }, []);

  const conf1Data = useMemo(() => buildConferenceData(postseasonState, 0), [postseasonState]);
  const conf2Data = useMemo(() => buildConferenceData(postseasonState, 1), [postseasonState]);

  const currentWeek = postseasonState?.currentWeek || 20;
  const weekTimeline = [
    { week: 19, label: 'Wild Card', status: currentWeek > 19 ? 'done' : currentWeek === 19 ? 'active' : 'upcoming' },
    { week: 20, label: 'Divisional', status: currentWeek > 20 ? 'done' : currentWeek === 20 ? 'active' : 'upcoming' },
    { week: 21, label: 'Conf Champ', status: currentWeek > 21 ? 'done' : currentWeek === 21 ? 'active' : 'upcoming' },
    { week: 23, label: 'Super Bowl', status: currentWeek >= 23 ? 'active' : 'upcoming' },
  ];

  // Draft pool stats from postseason state
  const poolStats = postseasonState?.supplementalPool || {};

  if (loading || postseasonLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!postseasonState || (!conf1Data && !conf2Data)) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="text-xl font-bold text-gray-400 mb-2">Postseason Not Started</h2>
          <p className="text-gray-500">The postseason bracket will appear once the commissioner initializes the playoff round.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Title bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Week {currentWeek} — Divisional Round
            </h1>
            <p className="text-sm text-gray-400 mt-1">Dynamic Re-seeding Active</p>
          </div>

          {/* Conference toggle */}
          <div className="flex bg-gray-800/60 rounded-lg p-1 border border-gray-700/50">
            {['both', 'conf1', 'conf2'].map(view => (
              <button
                key={view}
                onClick={() => setActiveConf(view)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeConf === view
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {view === 'both' ? 'Both' : view === 'conf1' ? 'Conf 1' : 'Conf 2'}
              </button>
            ))}
          </div>
        </div>

        {/* Week timeline */}
        <div className="flex items-center gap-1 mt-5 overflow-x-auto pb-2">
          {weekTimeline.map(({ week, label, status }) => (
            <div key={week} className="flex items-center gap-1">
              <div className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap ${
                status === 'done'    ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                status === 'active'  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ring-1 ring-indigo-500/20' :
                                       'bg-gray-800/40 text-gray-600 border border-gray-700/30'
              }`}>
                Wk {week}: {label}
              </div>
              {week !== 23 && <div className="w-4 h-px bg-gray-700/50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Bracket columns */}
      <div className="max-w-6xl mx-auto flex flex-wrap gap-8">
        {(activeConf === 'both' || activeConf === 'conf1') && conf1Data && (
          <ConferenceBracket data={conf1Data} />
        )}
        {(activeConf === 'both' || activeConf === 'conf2') && conf2Data && (
          <ConferenceBracket data={conf2Data} />
        )}
      </div>

      {/* Draft pool teaser */}
      <div className="max-w-6xl mx-auto mt-10">
        <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-cyan-400">Supplemental Draft Pool — Tuesday Redraft</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Liquidated Players</p>
              <p className="text-2xl font-bold text-white">{poolStats.liquidatedCount || 0}</p>
              <p className="mt-1">From eliminated fantasy teams</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Sanitized This Week</p>
              <p className="text-2xl font-bold text-orange-400">{poolStats.sanitizedCount || 0}</p>
              <p className="mt-1">NFL teams eliminated this round</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Draft Order (1.01)</p>
              <p className="text-lg font-bold text-yellow-400">{poolStats.firstPick?.teamName || 'TBD'}</p>
              <p className="mt-1">{poolStats.firstPick?.record || 'Pending seeding'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
