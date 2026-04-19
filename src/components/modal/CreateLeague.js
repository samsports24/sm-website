import { useState } from 'react'
import { Modal, Button, Input, Form, Avatar, Rate, Select } from 'antd'
import SamDatePicker from '../SamDatePicker'
import { createNewLeagueFromDashboard } from '../../redux'
import { landingSignup } from '../../config/constants'
import dayjs from 'dayjs'

const STEPS = [
  { key: 'mode', label: 'Game Mode', icon: '1' },
  { key: 'basics', label: 'Basics', icon: '2' },
  { key: 'draft', label: 'Draft', icon: '3' },
  { key: 'access', label: 'Publish', icon: '4' },
]

const LEAGUE_MODES = [
  {
    value: 'full',
    title: 'Full SAM Metric',
    desc: '53-man roster, offense + defense, salary cap. The real A.Football experience.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    ),
  },
  {
    value: 'offense_only',
    title: 'Offense Only',
    desc: '30-player roster, offense players only. Choose your scoring system.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    ),
  },
]

const SCORING_MODES = [
  { value: 'ppr', title: 'PPR', desc: '1 point per reception' },
  { value: 'half_ppr', title: 'Half-PPR', desc: '0.5 points per reception' },
  { value: 'standard', title: 'Standard', desc: 'No reception points' },
  { value: 'superflex', title: 'Superflex', desc: 'PPR + QB can fill flex spot' },
  { value: 'te_premium', title: 'TE Premium', desc: '1.5 PPR for tight ends' },
]

const DRAFT_TYPES = [
  {
    value: 'live',
    title: 'Live Online',
    desc: 'Real-time picks with your league',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
    ),
  },
  {
    value: 'auto',
    title: 'Auto Draft',
    desc: 'AI picks based on your rankings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    ),
  },
  {
    value: 'random',
    title: 'Random Draft',
    desc: 'Randomized picks for all teams',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
    ),
  },
]

// ─── Draft Format: Rookies in entry draft vs separate rookie draft ───
const DRAFT_FORMATS = [
  {
    value: 'combined',
    title: 'Combined Draft',
    desc: 'Rookies + veterans in one entry draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
    ),
  },
  {
    value: 'separate_rookie',
    title: 'Separate Rookie Draft',
    desc: 'Dynasty-style: 7-round rookie-only draft',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ),
  },
]

const ROOKIE_DRAFT_ROUNDS = [
  { value: 4, label: '4 Rounds' },
  { value: 5, label: '5 Rounds' },
  { value: 6, label: '6 Rounds' },
  { value: 7, label: '7 Rounds' },
]

const ROOKIE_DRAFT_ORDER = [
  { value: 'inverse_standings', label: 'Inverse Standings', desc: 'Worst record picks first' },
  { value: 'lottery', label: 'Lottery', desc: 'Weighted lottery for bottom teams' },
  { value: 'commissioner_set', label: 'Commissioner Set', desc: 'You set the order manually' },
]

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

const CreateLeague = ({ button, isCommissioner = false, onSuccess, externalOpen, onExternalClose }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [imageSrc, setImageSrc] = useState(null)
  const [file, setFile] = useState(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [step, setStep] = useState(0)
  const [leagueModeValue, setLeagueModeValue] = useState('full')
  const [draftFormatValue, setDraftFormatValue] = useState('combined')

  // Support external open/close control (e.g. from OnboardingWizard)
  const isOpen = externalOpen !== undefined ? externalOpen : isModalVisible

  const showModal = () => {
    if (localStorage.getItem('token')) {
      setIsModalVisible(true)
    } else {
      landingSignup()
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    if (onExternalClose) onExternalClose()
    form.resetFields()
    setFile(null)
    setImageSrc(null)
    setIsPrivate(false)
    setLeagueModeValue('full')
    setStep(0)
  }

  const onFinish = async (values) => {
    if (loading) return
    setLoading(true)
    const obj = {
      ...values,
      draftStart: dayjs(values?.draftStart).toISOString(),
      ...(values?.rookieDraftStart ? { rookieDraftStart: dayjs(values.rookieDraftStart).toISOString() } : {}),
    }

    if (values?.leagueType === 'public') {
      delete obj.leaguePassword
    }

    let formdata = new FormData()
    if (file) {
      formdata.append('pictures', file)
    }
    Object.entries(obj).map(([key, value]) => {
      if (value) {
        formdata.append(key, value)
      }
    })
    await createNewLeagueFromDashboard(formdata)
    setLoading(false)
    if (onSuccess) onSuccess()
    handleCancel()
  }

  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
  }

  const nextStep = async () => {
    const modeFields = leagueModeValue === 'offense_only' ? ['leagueMode', 'scoringMode'] : ['leagueMode']
    const fieldsPerStep = [
      modeFields,
      ['name', 'numberOfTeams', 'leagueLevel'],
      ['draftType', 'draftStart'],
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
        width={520}
        destroyOnClose
      >
        <div className="cl-modal-inner">
          {/* Header */}
          <div className="cl-header">
            <div>
              <h2 className="cl-title">Create League</h2>
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
              if (changed.leagueMode) {
                setLeagueModeValue(changed.leagueMode)
                if (changed.leagueMode === 'full') {
                  form.setFieldsValue({ scoringMode: undefined })
                }
              }
            }}
          >
            {/* Step 1: Game Mode */}
            <div className="cl-panel" style={{ display: step === 0 ? 'block' : 'none' }}>
              <Form.Item
                name="leagueMode"
                label="League Mode"
                rules={[{ required: true, message: 'Choose a game mode' }]}
                initialValue="full"
              >
                <CardSelect options={LEAGUE_MODES} />
              </Form.Item>

              {leagueModeValue === 'offense_only' && (
                <Form.Item
                  name="scoringMode"
                  label="Scoring System"
                  rules={[{ required: true, message: 'Choose a scoring system' }]}
                >
                  <Select placeholder="Select scoring format" size="large">
                    {SCORING_MODES.map((m) => (
                      <Select.Option key={m.value} value={m.value}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600 }}>{m.title}</span>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{m.desc}</span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <div className="cl-mode-info" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
                {leagueModeValue === 'offense_only' ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#fff' }}>Offense Only</strong>, 11 starters, 30 total players. Draft and roster only include QB, RB, WR, TE, K. 150M SamPoints budget. All auction and poaching rules apply.
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#fff' }}>Full SAM Metric</strong>, 24 starters (11 offense + 11 defense + K + P), 53-man active roster, 16-man practice squad. 300M SamPoints budget. The complete A.Football experience.
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Basics */}
            <div className="cl-panel" style={{ display: step === 1 ? 'block' : 'none' }}>
              <Form.Item
                name="name"
                label="League Name"
                rules={[{ required: true, message: 'Give your league a name' }]}
              >
                <Input placeholder="e.g. Dynasty Legends 32" size="large" />
              </Form.Item>

              <Form.Item
                name="teamName"
                label="Your Team Name"
                rules={[{ required: true, message: 'Give your team a name' }, { whitespace: true, message: 'Team name cannot be empty' }]}
              >
                <Input placeholder="e.g. Thunder Hawks" size="large" />
              </Form.Item>

              <div className="cl-league-id-info" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>&#128273;</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>League ID</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>A unique code (e.g. SAM-A7K3X2) will be auto-generated when you create the league. Share it with friends to invite them.</div>
                </div>
              </div>

              <div className="cl-row-2">
                <Form.Item
                  name="numberOfTeams"
                  label="Team Slots"
                  rules={[{ required: true, message: 'Required' }]}
                  className="cl-flex-1"
                >
                  <Select placeholder="Choose size" size="large">
                    <Select.Option value={10}>10 Teams</Select.Option>
                    <Select.Option value={16}>16 Teams</Select.Option>
                    <Select.Option value={24}>24 Teams</Select.Option>
                    <Select.Option value={32}>32 Teams</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="leagueLevel"
                  label="Difficulty"
                  rules={[{ required: true, message: 'Required' }]}
                  className="cl-flex-1"
                >
                  <Rate className="cl-rate" />
                </Form.Item>
              </div>

              {/* Logo upload */}
              <Form.Item name="logo" label="League Logo" className="cl-logo-item">
                <div className="cl-logo-upload">
                  <label className="cl-upload-zone" htmlFor="cl-file-input">
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
                    id="cl-file-input"
                    onChange={(e) => handleFile(e?.target?.files[0])}
                    accept="image/jpg,image/png,image/jpeg"
                  />
                </div>
              </Form.Item>
            </div>

            {/* Step 3: Draft */}
            <div className="cl-panel" style={{ display: step === 2 ? 'block' : 'none' }}>
              <Form.Item
                name="draftType"
                label="Draft Type"
                rules={[{ required: true, message: 'Pick a draft type' }]}
              >
                <CardSelect options={DRAFT_TYPES} />
              </Form.Item>

              <Form.Item
                name="draftFormat"
                label="Rookie Draft Format"
                tooltip="Choose whether rookies are included in the main entry draft or held for a separate rookie-only draft (dynasty-style)."
                initialValue="combined"
              >
                <CardSelect options={DRAFT_FORMATS} onChange={(v) => setDraftFormatValue(v)} />
              </Form.Item>

              {draftFormatValue === 'separate_rookie' && (
                <>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Form.Item
                      name="rookieDraftRounds"
                      label="Rookie Draft Rounds"
                      initialValue={7}
                      style={{ flex: 1 }}
                    >
                      <Select size="large" options={ROOKIE_DRAFT_ROUNDS} />
                    </Form.Item>
                    <Form.Item
                      name="rookieDraftPickTimer"
                      label="Pick Timer"
                      initialValue={120}
                      style={{ flex: 1 }}
                    >
                      <Select size="large" options={[
                        { value: 60, label: '1 min' },
                        { value: 120, label: '2 min' },
                        { value: 180, label: '3 min' },
                        { value: 300, label: '5 min' },
                        { value: 480, label: '8 min' },
                      ]} />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="rookieDraftOrderMethod"
                    label="Rookie Draft Order"
                    initialValue="inverse_standings"
                  >
                    <CardSelect options={ROOKIE_DRAFT_ORDER} />
                  </Form.Item>
                  <Form.Item
                    name="rookieDraftStart"
                    label="Rookie Draft Date (optional)"
                    tooltip="Set later if you prefer — typically scheduled after the A.Football Draft."
                  >
                    <SamDatePicker
                      placeholder="Set after A.Football Draft"
                      style={{ width: '100%' }}
                      size="large"
                      showTime={{ format: 'HH:mm' }}
                      format="MMM D, YYYY h:mm A"
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="draftStart"
                label="Entry Draft Date & Time"
                rules={[{ required: true, message: 'Set a draft date' }]}
              >
                <SamDatePicker
                  placeholder="Select date and time"
                  style={{ width: '100%' }}
                  size="large"
                  showTime={{ format: 'HH:mm' }}
                  format="MMM D, YYYY h:mm A"
                />
              </Form.Item>
            </div>

            {/* Step 4: Access & Publish */}
            <div className="cl-panel" style={{ display: step === 3 ? 'block' : 'none' }}>
              <Form.Item
                name="leagueType"
                label="Visibility"
                rules={[{ required: true, message: 'Choose visibility' }]}
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

              <Form.Item name="entryFee" label="Entry Fee">
                <Input placeholder="Free or enter amount" size="large" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Tell players what your league is about..." />
              </Form.Item>
            </div>

            {/* Navigation Buttons */}
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

export default CreateLeague
