import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Spin, notification, Modal, Select, Tooltip } from 'antd'
import { LoadingOutlined, FileSearchOutlined, StarFilled, StarOutlined, ArrowLeftOutlined, ClockCircleOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { attachToken, privateAPI } from '../../config/constants'
import './styles.css'

const REPORT_TYPES = [
  { key: 'full_scout', label: 'Full Scout Report', desc: 'Complete deep-dive analysis, SAM Metric, cap, trade value, matchups, dynasty outlook', icon: '🔬', price: '$2.99' },
  { key: 'trade_value', label: 'Trade Value Report', desc: 'Cap & market analysis, fair value, trade packages, buy/sell windows', icon: '💱', price: '$2.99' },
  { key: 'matchup_analysis', label: 'Matchup Analysis', desc: 'This week\'s opponent breakdown with SAM Metric projections', icon: '⚔️', price: '$2.99' },
  { key: 'rest_of_season', label: 'Rest-of-Season', desc: 'ROS projection, schedule, usage trends, dynasty vs redraft outlook', icon: '📈', price: '$2.99' },
]

const VERDICT_COLORS = {
  strong_buy: '#22C55E',
  buy: '#4ADE80',
  hold: '#F59E0B',
  sell: '#F97316',
  strong_sell: '#EF4444',
}

const GRADE_COLORS = {
  'A+': '#22C55E', 'A': '#22C55E', 'A-': '#4ADE80',
  'B+': '#3B82F6', 'B': '#3B82F6', 'B-': '#60A5FA',
  'C+': '#F59E0B', 'C': '#F59E0B', 'C-': '#FBBF24',
  'D+': '#F97316', 'D': '#F97316', 'D-': '#FB923C',
  'F': '#EF4444',
}

const GradeBadge = ({ grade }) => {
  if (!grade) return null
  const color = GRADE_COLORS[grade] || '#888'
  return (
    <span className='sr-grade' style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {grade}
    </span>
  )
}

const VerdictBadge = ({ verdict }) => {
  if (!verdict) return null
  const color = VERDICT_COLORS[verdict] || '#888'
  const label = verdict.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className='sr-verdict' style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

const ScoutReportPage = () => {
  const user = useSelector((s) => s.user?.userDetails)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState(null)
  const [scoringSystems, setScoringSystems] = useState([])

  // Purchase modal
  const [purchaseModal, setPurchaseModal] = useState(false)
  const [purchasePlayer, setPurchasePlayer] = useState(null)
  const [purchaseType, setPurchaseType] = useState('full_scout')
  const [purchaseScoring, setPurchaseScoring] = useState('sam_metric')
  const [purchasing, setPurchasing] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Player search for new report
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      attachToken()
      const res = await privateAPI.get('/scout-report/my-reports')
      setReports(res.data?.data?.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    }
    setLoading(false)
  }, [])

  const fetchScoringSystems = useCallback(async () => {
    try {
      const res = await privateAPI.get('/scout-report/scoring-systems')
      setScoringSystems(res.data?.data?.scoringSystems || [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchReports()
    fetchScoringSystems()
  }, [fetchReports, fetchScoringSystems])

  // Search players
  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      attachToken()
      const res = await privateAPI.get(`/player/search?query=${encodeURIComponent(query)}&limit=10`)
      setSearchResults(res.data?.data?.players || res.data?.data || [])
    } catch (err) {
      console.error(err)
    }
    setSearching(false)
  }

  // Purchase a report
  const handlePurchase = async () => {
    if (!purchasePlayer) return
    setPurchasing(true)
    try {
      attachToken()
      const res = await privateAPI.post('/scout-report/purchase', {
        playerId: purchasePlayer._id || purchasePlayer.id,
        reportType: purchaseType,
        scoringSystem: purchaseScoring,
      })
      const data = res.data?.data

      // If they already have a recent report, just view it
      if (data?.existingReport) {
        notification.info({ message: 'You already have a recent report for this player' })
        setActiveReport(data.existingReport)
        setPurchaseModal(false)
        setPurchasing(false)
        return
      }

      // In dev mode or after Stripe payment, generate immediately
      if (data?.reportId) {
        notification.success({ message: 'Report purchased! Generating analysis...' })
        setPurchaseModal(false)
        setGenerating(true)

        // Generate the report
        const genRes = await privateAPI.post(`/scout-report/generate/${data.reportId}`)
        const report = genRes.data?.data?.report
        if (report) {
          setActiveReport(report)
          fetchReports() // Refresh the list
        }
        setGenerating(false)
      } else if (data?.clientSecret) {
        // Stripe checkout flow
        notification.info({ message: 'Redirecting to payment...' })
        // For now, we'll handle Stripe Elements inline in a future update
        // The backend creates the PaymentIntent, we just need to collect payment
      }
    } catch (err) {
      notification.error({ message: err.response?.data?.message || 'Purchase failed' })
    }
    setPurchasing(false)
  }

  // View a specific report
  const handleViewReport = async (reportId) => {
    try {
      attachToken()
      const res = await privateAPI.get(`/scout-report/${reportId}`)
      setActiveReport(res.data?.data?.report || null)
    } catch (err) {
      notification.error({ message: 'Failed to load report' })
    }
  }

  const formatSP = (val) => {
    if (!val && val !== 0) return 'N/A'
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M SP`
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K SP`
    return `${val} SP`
  }

  // ═══ Render the report detail view ═══
  const renderReport = (report) => {
    const r = report.report || {}
    return (
      <div className='sr-report-detail'>
        {/* Header */}
        <div className='sr-detail-header'>
          <button className='sr-back-btn' onClick={() => setActiveReport(null)}>
            <ArrowLeftOutlined /> Back
          </button>
          <div className='sr-detail-title'>
            <h2>{report.playerName}</h2>
            <span className='sr-detail-meta'>
              {report.playerPosition} &middot; {report.playerTeam} &middot; {REPORT_TYPES.find(t => t.key === report.reportType)?.label || report.reportType}
            </span>
          </div>
        </div>

        {/* Summary + Verdict */}
        {r.summary && (
          <div className='sr-summary-card'>
            <p className='sr-summary-text'>{r.summary}</p>
            <div className='sr-summary-badges'>
              <VerdictBadge verdict={r.verdict} />
              {r.confidenceScore != null && (
                <span className='sr-confidence'>
                  {r.confidenceScore}% confidence
                </span>
              )}
            </div>
          </div>
        )}

        {/* SAM Metric Analysis */}
        {r.samMetricAnalysis && (
          <div className='sr-section'>
            <h3 className='sr-section-title'><ThunderboltOutlined /> SAM Metric Analysis</h3>
            <div className='sr-stat-grid'>
              {r.samMetricAnalysis.currentPPG != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.samMetricAnalysis.currentPPG}</span>
                  <span className='sr-stat-label'>PPG</span>
                </div>
              )}
              {r.samMetricAnalysis.positionRank && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.samMetricAnalysis.positionRank}</span>
                  <span className='sr-stat-label'>Position Rank</span>
                </div>
              )}
              {r.samMetricAnalysis.samMetricGrade && (
                <div className='sr-stat-item'>
                  <GradeBadge grade={r.samMetricAnalysis.samMetricGrade} />
                  <span className='sr-stat-label'>SAM Grade</span>
                </div>
              )}
            </div>
            {r.samMetricAnalysis.samMetricNarrative && (
              <p className='sr-narrative'>{r.samMetricAnalysis.samMetricNarrative}</p>
            )}
          </div>
        )}

        {/* Cap Analysis */}
        {r.capAnalysis && (
          <div className='sr-section'>
            <h3 className='sr-section-title'><DollarOutlined /> Cap Analysis</h3>
            <div className='sr-stat-grid'>
              {r.capAnalysis.currentCap != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{formatSP(r.capAnalysis.currentCap)}</span>
                  <span className='sr-stat-label'>Current Cap</span>
                </div>
              )}
              {r.capAnalysis.capEfficiencyGrade && (
                <div className='sr-stat-item'>
                  <GradeBadge grade={r.capAnalysis.capEfficiencyGrade} />
                  <span className='sr-stat-label'>Efficiency</span>
                </div>
              )}
              {r.capAnalysis.ppgPerMillionCap != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.capAnalysis.ppgPerMillionCap}</span>
                  <span className='sr-stat-label'>PPG/M Cap</span>
                </div>
              )}
            </div>
            {r.capAnalysis.capNarrative && (
              <p className='sr-narrative'>{r.capAnalysis.capNarrative}</p>
            )}
          </div>
        )}

        {/* Trade Value */}
        {r.tradeValue && (
          <div className='sr-section'>
            <h3 className='sr-section-title'>💱 Trade Value</h3>
            <div className='sr-stat-grid'>
              {r.tradeValue.estimatedSPValue != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{formatSP(r.tradeValue.estimatedSPValue)}</span>
                  <span className='sr-stat-label'>Est. Value</span>
                </div>
              )}
              <div className='sr-stat-item'>
                <span className='sr-stat-value' style={{ color: r.tradeValue.buyLowWindow ? '#22C55E' : 'rgba(255,255,255,0.3)' }}>
                  {r.tradeValue.buyLowWindow ? 'YES' : 'NO'}
                </span>
                <span className='sr-stat-label'>Buy Low?</span>
              </div>
              <div className='sr-stat-item'>
                <span className='sr-stat-value' style={{ color: r.tradeValue.sellHighWindow ? '#EF4444' : 'rgba(255,255,255,0.3)' }}>
                  {r.tradeValue.sellHighWindow ? 'YES' : 'NO'}
                </span>
                <span className='sr-stat-label'>Sell High?</span>
              </div>
            </div>
            {r.tradeValue.tradeNarrative && (
              <p className='sr-narrative'>{r.tradeValue.tradeNarrative}</p>
            )}
          </div>
        )}

        {/* Weekly Breakdown */}
        {r.weeklyBreakdown && (
          <div className='sr-section'>
            <h3 className='sr-section-title'><ClockCircleOutlined /> Weekly Breakdown</h3>
            <div className='sr-stat-grid'>
              {r.weeklyBreakdown.consistencyScore != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.weeklyBreakdown.consistencyScore}</span>
                  <span className='sr-stat-label'>Consistency</span>
                </div>
              )}
              {r.weeklyBreakdown.boomBustRatio && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value' style={{ fontSize: 14 }}>{r.weeklyBreakdown.boomBustRatio}</span>
                  <span className='sr-stat-label'>Boom:Bust</span>
                </div>
              )}
              {r.weeklyBreakdown.floorCeiling && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value' style={{ fontSize: 14 }}>
                    {r.weeklyBreakdown.floorCeiling.floor}-{r.weeklyBreakdown.floorCeiling.ceiling}
                  </span>
                  <span className='sr-stat-label'>Floor-Ceiling</span>
                </div>
              )}
            </div>
            {r.weeklyBreakdown.last5Games?.length > 0 && (
              <div className='sr-weekly-games'>
                {r.weeklyBreakdown.last5Games.map((g, i) => (
                  <div key={i} className={`sr-game-chip sr-game-${g.assessment}`}>
                    <span className='sr-game-week'>Wk {g.week}</span>
                    <span className='sr-game-score'>{g.score}</span>
                    <span className='sr-game-opp'>{g.opponent}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Matchup Analysis */}
        {r.matchupAnalysis && (
          <div className='sr-section'>
            <h3 className='sr-section-title'>⚔️ Matchup Analysis</h3>
            <div className='sr-stat-grid'>
              {r.matchupAnalysis.nextOpponent && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.matchupAnalysis.nextOpponent}</span>
                  <span className='sr-stat-label'>Next Opponent</span>
                </div>
              )}
              {r.matchupAnalysis.matchupGrade && (
                <div className='sr-stat-item'>
                  <GradeBadge grade={r.matchupAnalysis.matchupGrade} />
                  <span className='sr-stat-label'>Matchup Grade</span>
                </div>
              )}
              {r.matchupAnalysis.startSitRecommendation && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value' style={{ fontSize: 12, textTransform: 'uppercase' }}>
                    {r.matchupAnalysis.startSitRecommendation.replace(/_/g, ' ')}
                  </span>
                  <span className='sr-stat-label'>Start/Sit</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Injury Assessment */}
        {r.injuryAssessment && (
          <div className='sr-section'>
            <h3 className='sr-section-title'>🏥 Injury Assessment</h3>
            <div className='sr-stat-grid'>
              <div className='sr-stat-item'>
                <span className='sr-stat-value' style={{ fontSize: 13 }}>{r.injuryAssessment.currentStatus || 'Healthy'}</span>
                <span className='sr-stat-label'>Status</span>
              </div>
              <div className='sr-stat-item'>
                <span className='sr-stat-value' style={{ fontSize: 13 }}>{r.injuryAssessment.riskLevel || 'Low'}</span>
                <span className='sr-stat-label'>Risk Level</span>
              </div>
              {r.injuryAssessment.gamesAtRisk != null && (
                <div className='sr-stat-item'>
                  <span className='sr-stat-value'>{r.injuryAssessment.gamesAtRisk}</span>
                  <span className='sr-stat-label'>Games at Risk</span>
                </div>
              )}
            </div>
            {r.injuryAssessment.injuryHistory && (
              <p className='sr-narrative'>{r.injuryAssessment.injuryHistory}</p>
            )}
          </div>
        )}

        {/* Dynasty Outlook */}
        {r.dynastyOutlook && (
          <div className='sr-section'>
            <h3 className='sr-section-title'>👑 Dynasty Outlook</h3>
            {r.dynastyOutlook.ageContractWindow && (
              <p className='sr-narrative'>
                <strong>Window:</strong> {r.dynastyOutlook.ageContractWindow.replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            )}
            {r.dynastyOutlook.longTermValue && (
              <p className='sr-narrative'>{r.dynastyOutlook.longTermValue}</p>
            )}
          </div>
        )}

        {/* GM Rating Impact */}
        {r.gmRatingImpact && (
          <div className='sr-section'>
            <h3 className='sr-section-title'>📊 GM Rating Impact</h3>
            {r.gmRatingImpact.lineupIQEffect && (
              <p className='sr-narrative'>
                <strong>Lineup IQ Effect:</strong> {r.gmRatingImpact.lineupIQEffect}
              </p>
            )}
            {r.gmRatingImpact.gmRatingVerdict && (
              <p className='sr-narrative'>{r.gmRatingImpact.gmRatingVerdict}</p>
            )}
          </div>
        )}

        {/* Full Narrative */}
        {r.fullNarrative && (
          <div className='sr-section sr-full-narrative'>
            <h3 className='sr-section-title'>📝 Full Analysis</h3>
            <div className='sr-narrative-text'>
              {r.fullNarrative.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='sr-report-footer'>
          <span>Generated {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : 'N/A'}</span>
          <span>Scoring: {scoringSystems.find(s => s.id === report.scoringSystem)?.label || report.scoringSystem}</span>
          <span>Tokens: {report.tokensUsed?.toLocaleString() || 'N/A'}</span>
        </div>
      </div>
    )
  }

  // ═══ Generating overlay ═══
  if (generating) {
    return (
      <div className='sr-generating'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#f97316' }} spin />} />
        <h3>Generating Scout Report...</h3>
        <p>Our AI is analyzing SAM Metric data, cap numbers, trade value, matchups, and more. This usually takes 30-60 seconds.</p>
      </div>
    )
  }

  // ═══ Report detail view ═══
  if (activeReport) {
    return (
      <div className='sr-page'>
        {renderReport(activeReport)}
      </div>
    )
  }

  // ═══ Main list view ═══
  return (
    <div className='sr-page'>
      <div className='sr-page-header'>
        <div>
          <div className='sr-page-tag'>AI Scout Reports</div>
          <h1 className='sr-page-title'>Deep Player Analysis</h1>
          <p className='sr-page-desc'>Premium AI-powered scout reports, $2.99 each. Get deep analysis on any player including SAM Metric scoring, cap value, trade packages, matchup projections, and dynasty outlook.</p>
        </div>
        <button className='sr-new-btn' onClick={() => setPurchaseModal(true)}>
          <FileSearchOutlined /> New Report
        </button>
      </div>

      {/* Report Type Cards */}
      <div className='sr-type-grid'>
        {REPORT_TYPES.map((t) => (
          <div key={t.key} className='sr-type-card' onClick={() => { setPurchaseType(t.key); setPurchaseModal(true) }}>
            <span className='sr-type-icon'>{t.icon}</span>
            <div>
              <span className='sr-type-name'>{t.label}</span>
              <span className='sr-type-desc'>{t.desc}</span>
            </div>
            <span className='sr-type-price'>{t.price}</span>
          </div>
        ))}
      </div>

      {/* Past Reports */}
      <div className='sr-reports-section'>
        <h2 className='sr-reports-heading'>My Reports ({reports.length})</h2>
        {loading ? (
          <div className='sr-loading'><Spin size='large' /></div>
        ) : reports.length === 0 ? (
          <div className='sr-empty'>
            <FileSearchOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }} />
            <p>No scout reports yet. Purchase your first one above!</p>
          </div>
        ) : (
          <div className='sr-report-list'>
            {reports.map((rep) => (
              <div
                key={rep._id}
                className='sr-report-card'
                onClick={() => rep.status === 'completed' ? handleViewReport(rep._id) : null}
                style={{ cursor: rep.status === 'completed' ? 'pointer' : 'default' }}
              >
                <div className='sr-report-card-left'>
                  <div className='sr-report-player'>{rep.playerName}</div>
                  <div className='sr-report-meta'>
                    {rep.playerPosition} &middot; {rep.playerTeam} &middot; {REPORT_TYPES.find(t => t.key === rep.reportType)?.label || rep.reportType}
                  </div>
                </div>
                <div className='sr-report-card-right'>
                  {rep.status === 'completed' && rep.report?.verdict && (
                    <VerdictBadge verdict={rep.report.verdict} />
                  )}
                  <span className={`sr-report-status sr-status-${rep.status}`}>
                    {rep.status}
                  </span>
                  <span className='sr-report-date'>
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <Modal
        title='Purchase Scout Report'
        open={purchaseModal}
        onCancel={() => { setPurchaseModal(false); setPurchasePlayer(null); setSearchQuery(''); setSearchResults([]) }}
        footer={null}
        className='sr-modal'
      >
        <div className='sr-modal-body'>
          {/* Player Search */}
          <div className='sr-field'>
            <label>Search Player</label>
            <input
              type='text'
              placeholder='Type a player name...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className='sr-input'
            />
            {searching && <Spin size='small' style={{ marginLeft: 8 }} />}
          </div>

          {searchResults.length > 0 && !purchasePlayer && (
            <div className='sr-search-results'>
              {searchResults.map((p) => (
                <div
                  key={p._id || p.id}
                  className='sr-search-item'
                  onClick={() => { setPurchasePlayer(p); setSearchResults([]); setSearchQuery(p.Name || p.name) }}
                >
                  <span className='sr-search-name'>{p.Name || p.name}</span>
                  <span className='sr-search-meta'>{p.Position || p.position} &middot; {p.Team || p.team}</span>
                </div>
              ))}
            </div>
          )}

          {purchasePlayer && (
            <div className='sr-selected-player'>
              <span>{purchasePlayer.Name || purchasePlayer.name}</span>
              <button onClick={() => { setPurchasePlayer(null); setSearchQuery('') }}>Change</button>
            </div>
          )}

          {/* Report Type */}
          <div className='sr-field'>
            <label>Report Type</label>
            <Select
              value={purchaseType}
              onChange={setPurchaseType}
              style={{ width: '100%' }}
            >
              {REPORT_TYPES.map((t) => (
                <Select.Option key={t.key} value={t.key}>
                  {t.icon} {t.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Scoring System */}
          <div className='sr-field'>
            <label>Scoring System</label>
            <Select
              value={purchaseScoring}
              onChange={setPurchaseScoring}
              style={{ width: '100%' }}
            >
              {scoringSystems.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.label} {s.isDefault ? '(Default)' : ''}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Purchase Button */}
          <button
            className='sr-purchase-btn'
            disabled={!purchasePlayer || purchasing}
            onClick={handlePurchase}
          >
            {purchasing ? 'Processing...' : `Purchase Report, $2.99`}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ScoutReportPage
