import React, { useState, useCallback } from 'react'
import { Input, Button, Select, notification, Steps } from 'antd'
import {
  ShopOutlined,
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  BgColorsOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { publicAPI } from '../../config/constants'
import './partnerSignup.css'

const { Option } = Select

const PartnerSignup = () => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [subdomainStatus, setSubdomainStatus] = useState(null) // 'available', 'taken', 'checking'
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: 'bar',
    subdomain: '',
    website: '',
    address: { street: '', city: '', state: '', country: '', zip: '' },
    branding: { primaryColor: '#D4A843', logo: '' },
  })

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateAddress = (key, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }))
  }

  // Debounced subdomain check
  const checkSubdomain = useCallback(
    async (value) => {
      const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
      updateForm('subdomain', slug)

      if (slug.length < 3) {
        setSubdomainStatus(null)
        return
      }

      setSubdomainStatus('checking')
      try {
        const res = await publicAPI.post('/partner/check-subdomain', { subdomain: slug })
        setSubdomainStatus(res.data?.available ? 'available' : 'taken')
      } catch {
        setSubdomainStatus(null)
      }
    },
    []
  )

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!form.name || !form.email || !form.password) {
          notification.warning({ message: 'Please fill in all required fields' })
          return false
        }
        if (form.password.length < 8) {
          notification.warning({ message: 'Password must be at least 8 characters' })
          return false
        }
        if (form.password !== form.confirmPassword) {
          notification.warning({ message: 'Passwords do not match' })
          return false
        }
        return true
      case 1:
        if (!form.subdomain || form.subdomain.length < 3) {
          notification.warning({ message: 'Subdomain must be at least 3 characters' })
          return false
        }
        if (subdomainStatus === 'taken') {
          notification.warning({ message: 'This subdomain is already taken' })
          return false
        }
        return true
      case 2:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        businessName: form.businessName || form.name,
        businessType: form.businessType,
        subdomain: form.subdomain,
        website: form.website,
        address: form.address,
      }
      await publicAPI.post('/partner/register', payload)
      setSubmitted(true)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.'
      notification.error({ message: msg })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="ps-page">
        <div className="ps-container ps-success-container">
          <CheckCircleOutlined className="ps-success-icon" />
          <h1 className="ps-success-title">APPLICATION SUBMITTED</h1>
          <p className="ps-success-text">
            Your partner application for <strong>{form.subdomain}.samsports.io</strong> has been
            submitted. Our team will review your application and notify you at{' '}
            <strong>{form.email}</strong> once approved.
          </p>
          <p className="ps-success-subtext">
            This usually takes 24-48 hours. Once approved, your branded platform will be live immediately.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="ps-page">
      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <h1 className="ps-title">PARTNER WITH SAMSPORTS</h1>
          <p className="ps-subtitle">
            Get your own branded fantasy football platform for your venue
          </p>
        </div>

        {/* Steps */}
        <Steps
          current={step}
          size="small"
          className="ps-steps"
          items={[
            { title: 'Account', icon: <MailOutlined /> },
            { title: 'Platform', icon: <GlobalOutlined /> },
            { title: 'Business', icon: <ShopOutlined /> },
            { title: 'Review', icon: <RocketOutlined /> },
          ]}
        />

        {/* Step 0: Account Info */}
        {step === 0 && (
          <div className="ps-step">
            <h2 className="ps-step-title">Create Your Account</h2>
            <div className="ps-field">
              <label>Contact Name *</label>
              <Input
                prefix={<ShopOutlined />}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
              />
            </div>
            <div className="ps-field">
              <label>Email Address *</label>
              <Input
                prefix={<MailOutlined />}
                placeholder="you@yourbusiness.com"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
            </div>
            <div className="ps-field">
              <label>Phone</label>
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+1 555 123 4567"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </div>
            <div className="ps-field-row">
              <div className="ps-field">
                <label>Password *</label>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                />
              </div>
              <div className="ps-field">
                <label>Confirm Password *</label>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Platform Setup */}
        {step === 1 && (
          <div className="ps-step">
            <h2 className="ps-step-title">Set Up Your Platform</h2>
            <div className="ps-field">
              <label>Choose Your Subdomain *</label>
              <div className="ps-subdomain-wrap">
                <Input
                  placeholder="your-venue"
                  value={form.subdomain}
                  onChange={(e) => checkSubdomain(e.target.value)}
                  addonAfter=".samsports.io"
                  className="ps-subdomain-input"
                />
                {subdomainStatus === 'checking' && (
                  <span className="ps-subdomain-status ps-checking">Checking...</span>
                )}
                {subdomainStatus === 'available' && (
                  <span className="ps-subdomain-status ps-available">Available!</span>
                )}
                {subdomainStatus === 'taken' && (
                  <span className="ps-subdomain-status ps-taken">Already taken</span>
                )}
              </div>
              <span className="ps-hint">
                Your customers will visit {form.subdomain || 'your-venue'}.samsports.io
              </span>
            </div>
            <div className="ps-field">
              <label>Business Name</label>
              <Input
                prefix={<ShopOutlined />}
                placeholder="Joe's Sports Bar"
                value={form.businessName}
                onChange={(e) => updateForm('businessName', e.target.value)}
              />
            </div>
            <div className="ps-field">
              <label>Business Type</label>
              <Select
                value={form.businessType}
                onChange={(v) => updateForm('businessType', v)}
                className="ps-select"
              >
                <Option value="bar">Sports Bar</Option>
                <Option value="pub">Pub</Option>
                <Option value="restaurant">Restaurant</Option>
                <Option value="betting_shop">Betting Shop</Option>
                <Option value="sports_lounge">Sports Lounge</Option>
                <Option value="other">Other</Option>
              </Select>
            </div>
            <div className="ps-field">
              <label>Brand Color</label>
              <div className="ps-color-row">
                <input
                  type="color"
                  value={form.branding.primaryColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value },
                    }))
                  }
                  className="ps-color-picker"
                />
                <span className="ps-color-label">
                  <BgColorsOutlined /> Primary color for your platform
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <div className="ps-step">
            <h2 className="ps-step-title">Business Details</h2>
            <div className="ps-field">
              <label>Street Address</label>
              <Input
                placeholder="123 Main Street"
                value={form.address.street}
                onChange={(e) => updateAddress('street', e.target.value)}
              />
            </div>
            <div className="ps-field-row">
              <div className="ps-field">
                <label>City</label>
                <Input
                  placeholder="New York"
                  value={form.address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                />
              </div>
              <div className="ps-field">
                <label>State / Region</label>
                <Input
                  placeholder="NY"
                  value={form.address.state}
                  onChange={(e) => updateAddress('state', e.target.value)}
                />
              </div>
            </div>
            <div className="ps-field-row">
              <div className="ps-field">
                <label>Country</label>
                <Input
                  placeholder="United States"
                  value={form.address.country}
                  onChange={(e) => updateAddress('country', e.target.value)}
                />
              </div>
              <div className="ps-field">
                <label>ZIP / Postal Code</label>
                <Input
                  placeholder="10001"
                  value={form.address.zip}
                  onChange={(e) => updateAddress('zip', e.target.value)}
                />
              </div>
            </div>
            <div className="ps-field">
              <label>Website (optional)</label>
              <Input
                prefix={<GlobalOutlined />}
                placeholder="https://yourbar.com"
                value={form.website}
                onChange={(e) => updateForm('website', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="ps-step">
            <h2 className="ps-step-title">Review & Submit</h2>
            <div className="ps-review-grid">
              <div className="ps-review-item">
                <span className="ps-review-label">Platform URL</span>
                <span className="ps-review-value">{form.subdomain}.samsports.io</span>
              </div>
              <div className="ps-review-item">
                <span className="ps-review-label">Business</span>
                <span className="ps-review-value">{form.businessName || form.name}</span>
              </div>
              <div className="ps-review-item">
                <span className="ps-review-label">Type</span>
                <span className="ps-review-value">{form.businessType}</span>
              </div>
              <div className="ps-review-item">
                <span className="ps-review-label">Email</span>
                <span className="ps-review-value">{form.email}</span>
              </div>
              <div className="ps-review-item">
                <span className="ps-review-label">Location</span>
                <span className="ps-review-value">
                  {[form.address.city, form.address.state, form.address.country]
                    .filter(Boolean)
                    .join(', ') || 'Not provided'}
                </span>
              </div>
              <div className="ps-review-item">
                <span className="ps-review-label">Brand Color</span>
                <span className="ps-review-value">
                  <span
                    className="ps-color-swatch"
                    style={{ background: form.branding.primaryColor }}
                  />
                  {form.branding.primaryColor}
                </span>
              </div>
            </div>
            <div className="ps-plan-preview">
              <h3>FREE PLAN INCLUDES</h3>
              <ul>
                <li>Up to 5 leagues</li>
                <li>Up to 100 users</li>
                <li>Your own .samsports.io subdomain</li>
                <li>Basic branding (logo + primary color)</li>
                <li>SAM Metric scoring engine</li>
                <li>Full fantasy management tools</li>
              </ul>
              <p className="ps-plan-upgrade">
                Upgrade to Pro or Enterprise anytime for full branding, more users, and API access.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="ps-nav">
          {step > 0 && (
            <Button className="ps-btn-back" onClick={() => setStep((s) => s - 1)}>
              BACK
            </Button>
          )}
          <div className="ps-nav-spacer" />
          {step < 3 ? (
            <Button type="primary" className="ps-btn-next" onClick={handleNext}>
              NEXT
            </Button>
          ) : (
            <Button
              type="primary"
              className="ps-btn-submit"
              loading={loading}
              onClick={handleSubmit}
              icon={<RocketOutlined />}
            >
              SUBMIT APPLICATION
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="ps-footer">
          <span>Powered by SamSports &mdash; Fantasy-as-a-Service for Venues</span>
        </div>
      </div>
    </div>
  )
}

export default PartnerSignup
