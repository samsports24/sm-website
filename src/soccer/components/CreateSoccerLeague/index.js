import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Input, Form, Avatar, Select, notification } from 'antd'
import { soccerAPI, attachSoccerToken } from '../../config/constants'

// ═══════════════════════════════════════════════════════════════
//  CREATE SOCCER LEAGUE — Multi-Step Wizard
//
//  Soccer-specific league creation with real-league picker.
//  Steps:
//    1. Pick Real League (PL, La Liga, Serie A, Bundesliga, Ligue 1, CL, World Cup)
//    2. Basics (name, team name, size)
//    3. Draft Settings (type, date, timer)
//    4. Publish (visibility, password, description)
//
//  Reuses the same `cl-` CSS classes from the NFL CreateLeague modal
//  for a consistent dark-mode design language.
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { key: 'league', label: 'Competition', icon: '1' },
  { key: 'basics', label: 'Basics', icon: '2' },
  { key: 'draft', label: 'Draft', icon: '3' },
  { key: 'access', label: 'Publish', icon: '4' },
]

// ── Available Real Leagues (Top 5 + CL + World Cup) ──
const REAL_LEAGUES = [
  {
    key: 'premier_league',
    name: 'English Premier',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    color: '#3D195B',
    maxTeams: 20,
    matchweeks: 38,
    description: '20 clubs, 38 matchweeks',
  },
  {
    key: 'la_liga',
    name: 'Spanish First Division',
    country: 'Spain',
    flag: '🇪🇸',
    color: '#FF4B44',
    maxTeams: 20,
    matchweeks: 38,
    description: '20 clubs, 38 matchweeks',
  },
  {
    key: 'serie_a',
    name: 'Italian First Division',
    country: 'Italy',
    flag: '🇮🇹',
    color: '#008FD5',
    maxTeams: 20,
    matchweeks: 38,
    description: '20 clubs, 38 matchweeks',
  },
  {
    key: 'bundesliga',
    name: 'German First Division',
    country: 'Germany',
    flag: '🇩🇪',
    color: '#D20515',
    maxTeams: 18,
    matchweeks: 34,
    description: '18 clubs, 34 matchweeks',
  },
  {
    key: 'ligue_1',
    name: 'French First Division',
    country: 'France',
    flag: '🇫🇷',
    color: '#091C3E',
    maxTeams: 18,
    matchweeks: 34,
    description: '18 clubs, 34 matchweeks',
  },
  {
    key: 'champions_league',
    name: 'European Cup',
    country: 'Europe',
    flag: '🇪🇺',
    color: '#071D49',
    maxTeams: 36,
    matchweeks: 17,
    description: '36 clubs, 17 matchdays (league + knockouts)',
  },
  {
    key: 'world_cup_2026',
    name: 'World Cup 2026',
    country: 'International',
    flag: '🏆',
    color: '#D4AF37',
    maxTeams: 48,
    matchweeks: 7,
    description: '48 nations, 7 matchdays',
  },
]

// ── Team size options (generated per league max) ──
const getSizeOptions = (maxTeams) => {
  const sizes = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 36, 48]
  return sizes.filter(s => s <= maxTeams)
}

// ── Default size per league ──
const getDefaultSize = (maxTeams) => {
  if (maxTeams >= 20) return 10
  if (maxTeams >= 18) return 10
  if (maxTeams >= 12) return 8
  return 4
}

// ── Draft types ──
const DRAFT_TYPES = [
  {
    value: 'snake',
    title: 'Snake Draft',
    desc: 'Standard snake-order picks, reverses each round',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
  },
  {
    value: 'auction',
    title: 'Auction Draft',
    desc: 'Bid SamPoints on players — highest bid wins',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    ),
  },
  {
    value: 'auto',
    title: 'Auto Draft',
    desc: 'AI picks based on SAM ratings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
    ),
  },
  {
    value: 'randomized',
    title: 'Random Draft',
    desc: 'Fully randomized player assignment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
    ),
  },
]

// ── Visibility ──
const VISIBILITY_TYPES = [
  {
    value: 'public',
    title: 'Public',
    desc: 'Anyone can find and join',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    ),
  },
  {
    value: 'private',
    title: 'Private',
    desc: 'Invite-only with password',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    ),
  },
]

// ── CardSelect reusable ──
const CardSelect = ({ options, value, onChange }) => (
  <div className="cl-card-radios">
    {options.map((opt) => (
      <div
        key={opt.value}
        className={`cl-card-option ${value === opt.value ? 'cl-card-option--active' : ''}`}
        onClick={() => onChange(opt.value)}
      >
        <div className="cl-card-option-icon">{opt.icon}</div>
        <div>
          <div className="cl-card-option-title">{opt.title}</div>
          <div className="cl-card-option-desc">{opt.desc}</div>
        </div>
      </div>
    ))}
  </div>
)

// ── Compute current season string ──
const getCurrentSeason = (leagueKey) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  // MLS + World Cup use calendar year
  if (leagueKey === 'mls' || leagueKey === 'world_cup_2026') return `${year}`
  // European seasons: Aug-Jul. Before August = previous-current year
  if (month < 8) return `${year - 1}-${String(year).slice(2)}`
  return `${year}-${String(year + 1).slice(2)}`
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const CreateSoccerLeague = ({ button, onSuccess, externalOpen, onExternalClose }) => {
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [imageSrc, setImageSrc] = useState(null)
  const [file, setFile] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedLeague, setSelectedLeague] = useState(null)

  const isOpen = externalOpen !== undefined ? externalOpen : isModalVisible

  const showModal = () => {
    if (localStorage.getItem('token')) {
      setIsModalVisible(true)
    } else {
      notification.warning({ message: 'Please sign in first' })
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    if (onExternalClose) onExternalClose()
    form.resetFields()
    setFile(null)
    setImageSrc(null)
    setIsPrivate(false)
    setSelectedLeague(null)
    setStep(0)
  }

  // When league is picked, pre-fill defaults
  useEffect(() => {
    if (selectedLeague) {
      const league = REAL_LEAGUES.find(l => l.key === selectedLeague)
      if (league) {
        form.setFieldsValue({
          numberOfTeams: getDefaultSize(league.maxTeams),
        })
      }
    }
  }, [selectedLeague, form])

  const onFinish = async (values) => {
    if (loading || !selectedLeague) return
    setLoading(true)

    try {
      attachSoccerToken()

      const payload = {
        name: values.name,
        realLeague: selectedLeague,
        season: getCurrentSeason(selectedLeague),
        maxTeams: values.numberOfTeams,
        draftType: values.draftType || 'snake',
        draftPickTimer: values.draftPickTimer || 120,
        teamName: values.teamName,
        teamAbbreviation: values.teamAbbreviation || '',
        description: values.description || '',
      }

      // Visibility — backend stores password directly on league doc
      if (values.leagueType === 'private' && values.leaguePassword) {
        payload.password = values.leaguePassword
        payload.leagueType = 'private'
      } else {
        payload.leagueType = 'public'
      }

      // Draft date — commissioner sets this later from the Commissioner page

      const res = await soccerAPI.post('/api/v1/leagues/create', payload)

      if (res.data?.success) {
        notification.success({
          message: 'League Created!',
          description: `Now set up your league — configure draft date, rules, and invite players.`,
        })
        if (onSuccess) onSuccess(selectedLeague)
        handleCancel()
        // Redirect commissioner to setup page so they configure draft date, rules, etc.
        navigate('/commissioner')
      } else {
        notification.error({
          message: 'Creation Failed',
          description: res.data?.message || 'Something went wrong.',
        })
      }
    } catch (err) {
      notification.error({
        message: 'Error',
        description: err?.response?.data?.message || err.message || 'Failed to create league.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
  }

  const nextStep = async () => {
    // Step 0: just need a league selected
    if (step === 0) {
      if (!selectedLeague) {
        notification.warning({ message: 'Pick a competition first' })
        return
      }
      setStep(1)
      return
    }

    const fieldsPerStep = [
      [], // step 0 handled above
      ['name', 'teamName', 'numberOfTeams'],
      ['draftType'],
      ['leagueType'],
    ]
    try {
      await form.validateFields(fieldsPerStep[step])
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    } catch {
      // validation errors shown inline
    }
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const leagueInfo = REAL_LEAGUES.find(l => l.key === selectedLeague)

  return (
    <>
      {externalOpen === undefined && (
        <div onClick={() => showModal()} style={{ width: '100%' }}>
          {button}
        </div>
      )}
      <Modal
        centered
        open={isOpen}
        footer={false}
        onCancel={handleCancel}
        closeIcon={false}
        closable={false}
        className="cl-modal"
        width={560}
        destroyOnClose
      >
        <div className="cl-modal-inner">
          {/* Header */}
          <div className="cl-header">
            <div>
              <h2 className="cl-title">
                {selectedLeague && step > 0
                  ? <>{leagueInfo?.flag} {leagueInfo?.name} Fantasy</>
                  : 'Create Soccer League'
                }
              </h2>
              <p className="cl-subtitle">{STEPS[step].label} &mdash; Step {step + 1} of {STEPS.length}</p>
            </div>
            <button className="cl-close" onClick={handleCancel}>&times;</button>
          </div>

          {/* Progress Steps */}
          <div className="cl-steps">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`cl-step ${i === step ? 'cl-step--active' : ''} ${i < step ? 'cl-step--done' : ''}`}>
                <div className="cl-step-dot">
                  {i < step ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </div>
                <span className="cl-step-label">{s.label}</span>
                {i < STEPS.length - 1 && <div className="cl-step-line" />}
              </div>
            ))}
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="cl-form"
            onValuesChange={(changed) => {
              if (changed.leagueType === 'private') setIsPrivate(true)
              if (changed.leagueType === 'public') setIsPrivate(false)
            }}
          >
            {/* ═══ Step 1: Pick Competition ═══ */}
            <div className="cl-panel" style={{ display: step === 0 ? 'block' : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {REAL_LEAGUES.map((league) => (
                  <div
                    key={league.key}
                    onClick={() => setSelectedLeague(league.key)}
                    style={{
                      position: 'relative',
                      padding: '16px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      border: selectedLeague === league.key
                        ? `2px solid ${league.color}`
                        : '2px solid rgba(255,255,255,0.06)',
                      background: selectedLeague === league.key
                        ? `linear-gradient(135deg, ${league.color}22 0%, rgba(13,17,23,0.95) 100%)`
                        : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>{league.flag}</span>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                          {league.name}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                          {league.country}
                        </div>
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, paddingLeft: 32 }}>
                      {league.description}
                    </div>
                    {selectedLeague === league.key && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: league.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedLeague && (
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginTop: 14,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.5,
                }}>
                  <strong style={{ color: '#fff' }}>{leagueInfo?.name}</strong> — {leagueInfo?.description}.
                  Draft your squad from real {leagueInfo?.name} players and compete with SAM Metric scoring.
                  Season: <strong style={{ color: '#fff' }}>{getCurrentSeason(selectedLeague)}</strong>
                </div>
              )}
            </div>

            {/* ═══ Step 2: Basics ═══ */}
            <div className="cl-panel" style={{ display: step === 1 ? 'block' : 'none' }}>
              <Form.Item
                name="name"
                label="League Name"
                rules={[{ required: true, message: 'Give your league a name' }]}
              >
                <Input placeholder={`e.g. ${leagueInfo?.name || 'Premier'} Elite XI`} size="large" />
              </Form.Item>

              <Form.Item
                name="teamName"
                label="Your Team Name"
                rules={[{ required: true, message: 'Name your team' }, { whitespace: true, message: 'Team name cannot be empty' }]}
              >
                <Input placeholder="e.g. Galacticos FC" size="large" />
              </Form.Item>

              <Form.Item
                name="teamAbbreviation"
                label="Team Abbreviation (3 letters)"
              >
                <Input placeholder="e.g. GAL" size="large" maxLength={3} style={{ textTransform: 'uppercase' }} />
              </Form.Item>

              <div className="cl-row-2">
                <Form.Item
                  name="numberOfTeams"
                  label="Team Slots"
                  rules={[{ required: true, message: 'Required' }]}
                  className="cl-flex-1"
                >
                  <Select placeholder="Choose size" size="large">
                    {getSizeOptions(leagueInfo?.maxTeams || 20).map(n => (
                      <Select.Option key={n} value={n}>{n} Teams</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>&#128273;</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>League Code</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    A unique code (e.g. SAM-K7X3A2) will be auto-generated. Share it to invite friends.
                  </div>
                </div>
              </div>

              {/* Logo upload */}
              <Form.Item name="logo" label="League Logo" className="cl-logo-item" style={{ marginTop: 16 }}>
                <div className="cl-logo-upload">
                  <label className="cl-upload-zone" htmlFor="scl-file-input">
                    {imageSrc ? (
                      <Avatar size={56} src={imageSrc} />
                    ) : (
                      <div className="cl-upload-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                    )}
                    <div className="cl-upload-text">
                      <span className="cl-upload-cta">{imageSrc ? 'Change logo' : 'Upload logo'}</span>
                      <span className="cl-upload-hint">PNG or JPG, max 2MB</span>
                    </div>
                  </label>
                  <input
                    type="file"
                    hidden
                    id="scl-file-input"
                    onChange={(e) => handleFile(e?.target?.files[0])}
                    accept="image/jpg,image/png,image/jpeg"
                  />
                </div>
              </Form.Item>
            </div>

            {/* ═══ Step 3: Draft Settings ═══ */}
            <div className="cl-panel" style={{ display: step === 2 ? 'block' : 'none' }}>
              <Form.Item
                name="draftType"
                label="Draft Type"
                rules={[{ required: true, message: 'Pick a draft type' }]}
                initialValue="snake"
              >
                <CardSelect options={DRAFT_TYPES} />
              </Form.Item>

              <div className="cl-row-2">
                <Form.Item
                  name="draftPickTimer"
                  label="Pick Timer"
                  initialValue={120}
                  className="cl-flex-1"
                >
                  <Select size="large" options={[
                    { value: 60, label: '1 min' },
                    { value: 90, label: '1.5 min' },
                    { value: 120, label: '2 min' },
                    { value: 180, label: '3 min' },
                    { value: 300, label: '5 min' },
                  ]} />
                </Form.Item>

                <Form.Item
                  name="draftRounds"
                  label="Draft Rounds"
                  initialValue={26}
                  className="cl-flex-1"
                >
                  <Select size="large" options={[
                    { value: 21, label: '21 Rounds (squad only)' },
                    { value: 26, label: '26 Rounds (full roster)' },
                  ]} />
                </Form.Item>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                marginTop: 8,
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.5,
              }}>
                <strong style={{ color: '#fff' }}>SAM Metric Scoring</strong> — All soccer leagues use the SAM Metric.
                26 stats tracked per player, position-weighted multipliers, advanced xG/xA analytics.
                Commissioner can customize scoring after league creation.
              </div>
            </div>

            {/* ═══ Step 4: Publish ═══ */}
            <div className="cl-panel" style={{ display: step === 3 ? 'block' : 'none' }}>
              <Form.Item
                name="leagueType"
                label="Visibility"
                rules={[{ required: true, message: 'Choose visibility' }]}
                initialValue="public"
              >
                <CardSelect options={VISIBILITY_TYPES} />
              </Form.Item>

              {isPrivate && (
                <Form.Item
                  name="leaguePassword"
                  label="League Password"
                  rules={[{ required: true, message: 'Set a password for your private league' }]}
                >
                  <Input.Password placeholder="Set a password" size="large" />
                </Form.Item>
              )}

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Tell managers what your league is about..." />
              </Form.Item>
            </div>

            {/* ── Navigation ── */}
            <div className="cl-nav">
              {step > 0 && (
                <Button className="cl-back-btn" onClick={prevStep} size="large">
                  Back
                </Button>
              )}
              <div className="cl-nav-spacer" />
              {step < STEPS.length - 1 ? (
                <Button className="cl-next-btn" onClick={nextStep} size="large">
                  Continue
                </Button>
              ) : (
                <Button
                  loading={loading}
                  disabled={loading}
                  type="primary"
                  htmlType="submit"
                  className="cl-submit-btn"
                  size="large"
                >
                  Create League
                </Button>
              )}
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}

export default CreateSoccerLeague
