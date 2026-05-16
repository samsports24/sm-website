import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { notification } from 'antd';
import { TrophyOutlined, ThunderboltOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import * as quizAPI from '../../services/quizService';
import '../../styles/pages/quiz.css';

/* ═══════════════════════════════════════════════════════════════
   WEEKLY QUIZ — User-facing quiz page

   Features:
   - League selector with colorful badges
   - 15-second countdown timer with ring animation
   - A/B/C/D answer buttons with instant feedback
   - Live 2x bonus indicator
   - Results screen with score + leaderboard
   - Multi-language support via ?lang= param
   ═══════════════════════════════════════════════════════════════ */

const LEAGUES = [
  { key: 'premier_league', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', glow: 'rgba(124,58,237,0.25)' },
  { key: 'la_liga', label: 'La Liga', flag: '🇪🇸', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', glow: 'rgba(239,68,68,0.25)' },
  { key: 'serie_a', label: 'Serie A', flag: '🇮🇹', color: '#10B981', bg: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.25)' },
  { key: 'bundesliga', label: 'Bundesliga', flag: '🇩🇪', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.25)' },
  { key: 'ligue_1', label: 'Ligue 1', flag: '🇫🇷', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', glow: 'rgba(59,130,246,0.25)' },
  { key: 'nfl', label: 'NFL', flag: '🏈', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.25)' },
  { key: 'world_cup', label: 'World Cup 2026', flag: '🏆', color: '#D4AF37', bg: 'rgba(212,175,55,0.15)', glow: 'rgba(212,175,55,0.25)' },
];

const TIMER_SECONDS = 15;
const CATEGORY_COLORS = {
  history: { bg: 'rgba(139,92,246,0.15)', color: '#A78BFA' },
  stats: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
  transfers: { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7' },
  tactics: { bg: 'rgba(245,158,11,0.15)', color: '#FBBF24' },
  records: { bg: 'rgba(236,72,153,0.15)', color: '#F472B6' },
  current_form: { bg: 'rgba(6,182,212,0.15)', color: '#67E8F9' },
  head_to_head: { bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
  live_event: { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
};

const Quiz = () => {
  const user = useSelector((s) => s.user);
  const userId = user?._id || user?.user?._id;

  const [selectedLeague, setSelectedLeague] = useState('premier_league');
  const [quiz, setQuiz] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);

  // Game state
  const [phase, setPhase] = useState('idle'); // idle | playing | feedback | results
  const [currentQ, setCurrentQ] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Feedback
  const [feedback, setFeedback] = useState(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  // Results
  const [fullResults, setFullResults] = useState(null);

  const leagueInfo = LEAGUES.find((l) => l.key === selectedLeague) || LEAGUES[0];

  // ── Load quiz ──
  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setPhase('idle');
    setQuiz(null);
    setUpcoming(null);
    try {
      const res = await quizAPI.getActiveQuiz(selectedLeague);
      const data = res.data?.data;
      if (data) {
        setQuiz(data);
        setQuestions(data.questions || []);
      } else {
        setUpcoming(res.data?.upcoming || null);
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }

    // Load leaderboard
    try {
      const lbRes = await quizAPI.getLeaderboard(selectedLeague, userId);
      setLeaderboard(lbRes.data?.data?.leaderboard || []);
      setUserRank(lbRes.data?.data?.userRank || null);
    } catch { /* ignore */ }

    setLoading(false);
  }, [selectedLeague, userId]);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  // ── Timer logic ──
  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (phase === 'playing' && timeLeft <= 0) {
      handleTimedOut();
    }
  }, [phase, timeLeft]);

  const startTimer = () => {
    setTimeLeft(TIMER_SECONDS);
    startTimeRef.current = Date.now();
  };

  // ── Start quiz ──
  const handleStart = async () => {
    if (!quiz) return;
    try {
      const res = await quizAPI.startQuiz(quiz._id);
      const data = res.data?.data;
      if (data?.quiz?.questions) {
        setQuestions(data.quiz.questions);
      }
      setCurrentQ(0);
      setAnswers([]);
      setTotalPoints(0);
      setCorrectCount(0);
      setFeedback(null);
      setPhase('playing');
      startTimer();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      notification.error({ message: 'Cannot start quiz', description: msg });
    }
  };

  // ── Submit answer ──
  const handleAnswer = async (letter) => {
    if (phase !== 'playing') return;
    clearTimeout(timerRef.current);

    const timeSpentMs = Date.now() - (startTimeRef.current || Date.now());
    const question = questions[currentQ];
    setPhase('feedback');

    try {
      const res = await quizAPI.submitAnswer(quiz._id, question.questionNumber, letter, timeSpentMs);
      const result = res.data?.data;

      setFeedback({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        pointsEarned: result.pointsEarned,
        wasLiveBonus: result.wasLiveBonus,
      });

      setAnswers((prev) => [...prev, { questionNumber: question.questionNumber, selected: letter, ...result }]);

      if (result.isCorrect) {
        setCorrectCount((c) => c + 1);
        setTotalPoints((p) => p + (result.pointsEarned || 0));
      }

      if (result.runningTotal) {
        setTotalPoints(result.runningTotal.earnedPoints || 0);
        setCorrectCount(result.runningTotal.correct || 0);
      }
    } catch (err) {
      notification.error({ message: 'Failed to submit answer' });
      setPhase('playing');
    }
  };

  // ── Timed out ──
  const handleTimedOut = async () => {
    const question = questions[currentQ];
    setPhase('feedback');

    try {
      const res = await quizAPI.submitAnswer(quiz._id, question.questionNumber, null, 15000);
      const result = res.data?.data;
      setFeedback({
        isCorrect: false,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        pointsEarned: 0,
        timedOut: true,
      });
      setAnswers((prev) => [...prev, { questionNumber: question.questionNumber, selected: null, timedOut: true }]);
    } catch {
      setFeedback({ isCorrect: false, timedOut: true, explanation: 'Time ran out!' });
    }
  };

  // ── Next question ──
  const handleNext = async () => {
    if (currentQ + 1 >= questions.length) {
      // Quiz complete — show results
      setPhase('results');
      try {
        const res = await quizAPI.getQuizResult(quiz._id);
        setFullResults(res.data?.data || null);
      } catch { /* ignore */ }
      // Refresh leaderboard
      try {
        const lbRes = await quizAPI.getLeaderboard(selectedLeague, userId);
        setLeaderboard(lbRes.data?.data?.leaderboard || []);
        setUserRank(lbRes.data?.data?.userRank || null);
      } catch { /* ignore */ }
      return;
    }

    setCurrentQ((q) => q + 1);
    setFeedback(null);
    setPhase('playing');
    startTimer();
  };

  // ── Timer ring SVG ──
  const TimerRing = () => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / TIMER_SECONDS) * circumference;
    const color = timeLeft <= 5 ? '#EF4444' : timeLeft <= 10 ? '#F59E0B' : leagueInfo.color;

    return (
      <div className="quiz-timer-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span className={`timer-text${timeLeft <= 5 ? ' urgent' : ''}`}>{timeLeft}</span>
      </div>
    );
  };

  // ── Render ──
  const cssVars = {
    '--quiz-accent': leagueInfo.color,
    '--quiz-accent-bg': leagueInfo.bg,
    '--quiz-glow': leagueInfo.glow,
  };

  return (
    <div className="quiz-page" style={cssVars}>
      {/* League Selector */}
      <div className="quiz-league-bar">
        {LEAGUES.map((l) => (
          <button
            key={l.key}
            className={`quiz-league-btn${selectedLeague === l.key ? ' active' : ''}`}
            onClick={() => { setSelectedLeague(l.key); setPhase('idle'); }}
            style={selectedLeague === l.key ? { '--quiz-accent': l.color, '--quiz-accent-bg': l.bg, '--quiz-glow': l.glow, borderColor: l.color, background: l.bg } : {}}
          >
            <span>{l.flag}</span> {l.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="quiz-empty">
          <div style={{ color: leagueInfo.color, fontSize: 30 }}><ClockCircleOutlined spin /></div>
          <div className="quiz-empty-title" style={{ marginTop: 12 }}>Loading quiz...</div>
        </div>
      )}

      {/* No quiz available */}
      {!loading && !quiz && phase === 'idle' && (
        <div className="quiz-card">
          <div className="quiz-empty">
            <div className="quiz-empty-icon">🧠</div>
            <div className="quiz-empty-title">No quiz available yet</div>
            <div className="quiz-empty-text">
              {upcoming
                ? `Next quiz opens ${new Date(upcoming.opensAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
                : 'Check back on Tuesday for the weekly quiz!'}
            </div>
          </div>

          {/* Still show leaderboard */}
          {leaderboard.length > 0 && renderLeaderboard()}
        </div>
      )}

      {/* Quiz available — idle state */}
      {!loading && quiz && phase === 'idle' && (
        <div className="quiz-card">
          {quiz.liveBonusActive && (
            <div className="quiz-live-bonus">
              <FireOutlined /> LIVE BONUS ACTIVE — 2x POINTS <FireOutlined />
            </div>
          )}
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>{leagueInfo.flag}</div>
            <div className="quiz-card-title" style={{ fontSize: 26 }}>{quiz.title}</div>
            <div className="quiz-card-subtitle" style={{ marginBottom: 8 }}>
              {quiz.questions?.length || 10} questions · 15 seconds each · 10,000 SP per correct answer
            </div>
            <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 28 }}>
              Closes {new Date(quiz.closesAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="quiz-start-btn" onClick={handleStart} style={{ background: leagueInfo.color }}>
              <ThunderboltOutlined /> Start Quiz
            </button>
          </div>

          {leaderboard.length > 0 && renderLeaderboard()}
        </div>
      )}

      {/* Playing / Feedback */}
      {quiz && (phase === 'playing' || phase === 'feedback') && questions[currentQ] && (
        <div className="quiz-card">
          {quiz.liveBonusActive && (
            <div className="quiz-live-bonus">
              <FireOutlined /> LIVE 2x BONUS <FireOutlined />
            </div>
          )}

          <div className="quiz-card-header">
            <div>
              <div className="quiz-card-title">{leagueInfo.flag} {leagueInfo.label}</div>
              <div className="quiz-card-subtitle">Question {currentQ + 1} of {questions.length}</div>
            </div>
            {phase === 'playing' && <TimerRing />}
            {phase === 'feedback' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{feedback?.isCorrect ? '✅' : '❌'}</div>
                {feedback?.pointsEarned > 0 && (
                  <div style={{ color: '#FBBF24', fontFamily: 'var(--font-stats)', fontSize: 14, fontWeight: 700 }}>
                    +{feedback.pointsEarned.toLocaleString()} SP
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="quiz-question-area">
            {/* Progress bar */}
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentQ + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>

            {/* Category badge */}
            {questions[currentQ].category && (
              <span
                className="quiz-category-badge"
                style={{
                  background: CATEGORY_COLORS[questions[currentQ].category]?.bg || 'rgba(255,255,255,0.08)',
                  color: CATEGORY_COLORS[questions[currentQ].category]?.color || '#9CA3AF',
                }}
              >
                {questions[currentQ].category.replace('_', ' ')}
              </span>
            )}

            <div className="quiz-question-number">Question {currentQ + 1}</div>
            <div className="quiz-question-text">{questions[currentQ].question}</div>

            {/* Options */}
            <div className="quiz-options">
              {['A', 'B', 'C', 'D'].map((letter) => {
                let cls = 'quiz-option';
                if (phase === 'feedback') {
                  cls += ' disabled';
                  if (letter === feedback?.correctAnswer) cls += ' correct';
                  else if (letter === answers[answers.length - 1]?.selected && !feedback?.isCorrect) cls += ' wrong';
                }

                return (
                  <div
                    key={letter}
                    className={cls}
                    onClick={() => phase === 'playing' && handleAnswer(letter)}
                  >
                    <div className={`option-letter ${letter.toLowerCase()}`}>{letter}</div>
                    <div className="option-text">{questions[currentQ].options?.[letter] || '—'}</div>
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            {phase === 'feedback' && feedback && (
              <>
                <div className={`quiz-feedback ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
                  {feedback.timedOut && '⏰ Time ran out! '}
                  {feedback.isCorrect ? '🎉 Correct! ' : `The answer was ${feedback.correctAnswer}. `}
                  {feedback.explanation}
                  {feedback.wasLiveBonus && feedback.isCorrect && ' 🔥 2x Live Bonus applied!'}
                </div>
                <button className="quiz-next-btn" onClick={handleNext} style={{ borderColor: leagueInfo.color, color: leagueInfo.color }}>
                  {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                </button>
              </>
            )}
          </div>

          {/* Points bar */}
          <div className="quiz-points-bar">
            <div>
              <div className="quiz-points-earned">{totalPoints.toLocaleString()} SP</div>
              <div className="quiz-points-label">earned so far</div>
            </div>
            <div className="quiz-score-counter">
              <span style={{ color: '#10B981' }}>{correctCount}</span>
              <span style={{ color: '#4B5563' }}>/</span>
              <span>{currentQ + (phase === 'feedback' ? 1 : 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && (
        <div className="quiz-card">
          <div className="quiz-results">
            <div style={{ fontSize: 60, marginBottom: 12 }}>
              {correctCount >= 10 ? '🏆' : correctCount >= 7 ? '🌟' : correctCount >= 4 ? '👏' : '💪'}
            </div>
            <div className="quiz-results-score">{correctCount}/{questions.length}</div>
            <div className="quiz-results-label">correct answers</div>
            <div className="quiz-results-sp">{totalPoints.toLocaleString()} SP</div>
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>earned this quiz</div>

            <div className="quiz-results-breakdown">
              <div className="quiz-results-stat">
                <div className="stat-value" style={{ color: '#10B981' }}>{correctCount}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="quiz-results-stat">
                <div className="stat-value" style={{ color: '#EF4444' }}>{questions.length - correctCount}</div>
                <div className="stat-label">Wrong</div>
              </div>
              <div className="quiz-results-stat">
                <div className="stat-value" style={{ color: leagueInfo.color }}>{totalPoints.toLocaleString()}</div>
                <div className="stat-label">SP Earned</div>
              </div>
            </div>

            {/* Answer review */}
            {fullResults?.results && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Answer Review</div>
                {fullResults.results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 4, background: r.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                    <span style={{ fontSize: 16 }}>{r.isCorrect ? '✅' : '❌'}</span>
                    <span style={{ flex: 1, fontSize: 13, color: '#D1D5DB' }}>Q{r.questionNumber}: {r.question?.substring(0, 60)}...</span>
                    <span style={{ fontSize: 12, color: r.isCorrect ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {r.userAnswer || '—'} → {r.correctAnswer}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="quiz-start-btn"
              style={{ background: leagueInfo.color, marginTop: 24 }}
              onClick={() => { setPhase('idle'); loadQuiz(); }}
            >
              Back to Quiz Home
            </button>
          </div>

          {leaderboard.length > 0 && renderLeaderboard()}
        </div>
      )}
    </div>
  );

  function renderLeaderboard() {
    return (
      <div className="quiz-leaderboard" style={{ padding: '0 28px 28px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrophyOutlined style={{ color: '#FBBF24' }} /> Leaderboard
        </div>

        {userRank && (
          <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-stats)', fontSize: 16, fontWeight: 800, color: leagueInfo.color }}>#{userRank.rank}</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#E5E7EB' }}>Your Rank</div>
            <div style={{ fontFamily: 'var(--font-stats)', fontSize: 14, fontWeight: 700, color: '#FBBF24' }}>{(userRank.totalPoints || 0).toLocaleString()} SP</div>
          </div>
        )}

        {leaderboard.slice(0, 10).map((entry, i) => (
          <div key={i} className="quiz-lb-entry">
            <div className={`quiz-lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal'}`}>
              {i + 1}
            </div>
            <div className="quiz-lb-name">
              {entry.user?.userName || entry.user?.firstName || 'Anonymous'}
              {entry.perfectQuizzes > 0 && <span style={{ marginLeft: 6, fontSize: 12, color: '#FBBF24' }}>⭐ {entry.perfectQuizzes}</span>}
            </div>
            <div className="quiz-lb-points">{(entry.totalPoints || 0).toLocaleString()} SP</div>
          </div>
        ))}
      </div>
    );
  }
};

export default Quiz;
