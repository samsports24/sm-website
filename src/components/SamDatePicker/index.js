import React, { useState, useRef, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import dayjs from 'dayjs'

const ACCENT = '#22C55E'
const ACCENT_LIGHT = 'rgba(34,197,94,0.15)'
const ACCENT_HOVER = 'rgba(34,197,94,0.25)'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const SamDatePicker = ({
  value,
  onChange,
  placeholder = 'Select date & time',
  showTime = false,
  timeOnly = false,
  format: displayFormat,
  disabledDate,
  style = {},
  disabled = false,
}) => {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? dayjs(value) : dayjs())
  const [selectedDate, setSelectedDate] = useState(value ? dayjs(value) : null)
  const [selectedHour, setSelectedHour] = useState(value ? dayjs(value).hour() : 12)
  const [selectedMinute, setSelectedMinute] = useState(value ? dayjs(value).minute() : 0)
  const [hoverDay, setHoverDay] = useState(null)
  const [view, setView] = useState(timeOnly ? 'timeOnly' : 'calendar') // 'calendar' | 'monthYear' | 'time' | 'timeOnly'
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  // Sync from external value changes
  useEffect(() => {
    if (value) {
      const d = dayjs(value)
      setSelectedDate(d)
      setViewDate(d)
      setSelectedHour(d.hour())
      setSelectedMinute(d.minute())
    } else {
      setSelectedDate(null)
    }
  }, [value])

  // Close on outside click, check both container and portal dropdown
  useEffect(() => {
    const handleClick = (e) => {
      const inContainer = containerRef.current && containerRef.current.contains(e.target)
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
      if (!inContainer && !inDropdown) {
        setOpen(false)
        setView(timeOnly ? 'timeOnly' : 'calendar')
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Position dropdown relative to input using getBoundingClientRect
  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const dropdownWidth = showTime ? 340 : 300
      const dropdownHeight = 420
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top, left
      left = rect.left
      // Keep dropdown within viewport horizontally
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 8
      }

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Open upward
        top = rect.top + window.scrollY - dropdownHeight - 4
      } else {
        // Open downward
        top = rect.bottom + window.scrollY + 4
      }

      setDropdownPos({ top, left })
    }
  }, [open, showTime])

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return
    const reposition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const dropdownWidth = showTime ? 340 : 300
        const dropdownHeight = 420
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        let top, left
        left = rect.left
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 8
        }
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          top = rect.top + window.scrollY - dropdownHeight - 4
        } else {
          top = rect.bottom + window.scrollY + 4
        }
        setDropdownPos({ top, left })
      }
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, showTime])

  const calendarDays = useMemo(() => {
    const start = viewDate.startOf('month')
    const startDay = start.day()
    const daysInMonth = viewDate.daysInMonth()
    const prevMonthDays = viewDate.subtract(1, 'month').daysInMonth()
    const days = []

    // Previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, current: false, date: start.subtract(i + 1, 'day') })
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = viewDate.date(i)
      days.push({ day: i, current: true, date })
    }
    // Next month leading days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false, date: viewDate.endOf('month').add(i, 'day') })
    }
    return days
  }, [viewDate])

  const handleDateSelect = (dateObj) => {
    if (disabledDate && disabledDate(dateObj.date)) return
    const newDate = dateObj.date.hour(selectedHour).minute(selectedMinute).second(0)
    setSelectedDate(newDate)
    setViewDate(dateObj.date)

    if (!showTime) {
      onChange?.(newDate)
      setOpen(false)
    }
  }

  const handleTimeConfirm = () => {
    if (timeOnly) {
      // For timeOnly mode, create a dayjs with just the time set
      const final = dayjs().hour(selectedHour).minute(selectedMinute).second(0)
      onChange?.(final)
      setOpen(false)
      return
    }
    if (!selectedDate) return
    const final = selectedDate.hour(selectedHour).minute(selectedMinute).second(0)
    setSelectedDate(final)
    onChange?.(final)
    setOpen(false)
    setView('calendar')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (timeOnly) {
      onChange?.(null)
      setOpen(false)
      return
    }
    setSelectedDate(null)
    onChange?.(null)
    setOpen(false)
  }

  const isToday = (date) => date.isSame(dayjs(), 'day')
  const isSelected = (date) => selectedDate && date.isSame(selectedDate, 'day')

  const formatDisplay = () => {
    if (timeOnly) {
      return `${String(selectedHour % 12 || 12).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedHour >= 12 ? 'PM' : 'AM'}`
    }
    if (!selectedDate) return ''
    if (displayFormat) return selectedDate.format(displayFormat)
    if (showTime) return selectedDate.format('MMM D, YYYY · h:mm A')
    return selectedDate.format('MMM D, YYYY')
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  // Render the dropdown via portal to escape overflow containers
  const dropdownContent = open ? ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        zIndex: 1050,
        width: (showTime || timeOnly) ? '340px' : '300px',
        background: 'linear-gradient(145deg, rgba(26,29,46,0.98), rgba(22,25,40,0.98))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)',
        overflow: 'hidden',
        animation: 'samPickerIn 0.2s ease-out',
      }}
    >
      {view === 'calendar' ? (
        <>
          {/* Month Navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px 12px',
          }}>
            <button type="button" onClick={() => setViewDate(viewDate.subtract(1, 'month'))} style={navBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setView('monthYear')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.02em',
                padding: '4px 10px', borderRadius: '8px', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              {MONTHS[viewDate.month()]} {viewDate.year()}
            </button>
            <button type="button" onClick={() => setViewDate(viewDate.add(1, 'month'))} style={navBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px', marginBottom: '4px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px 14px', gap: '2px' }}>
            {calendarDays.map((d, i) => {
              const isDisabled = disabledDate && disabledDate(d.date)
              const selected = isSelected(d.date)
              const today = isToday(d.date)
              const hovered = hoverDay === i && !isDisabled
              return (
                <div
                  key={i}
                  onClick={() => !isDisabled && handleDateSelect(d)}
                  onMouseEnter={() => setHoverDay(i)}
                  onMouseLeave={() => setHoverDay(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '36px', borderRadius: '10px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: selected ? 600 : today ? 600 : 400,
                    color: isDisabled ? 'rgba(255,255,255,0.15)' : selected ? '#fff' : !d.current ? 'rgba(255,255,255,0.2)' : today ? ACCENT : '#c8d0dc',
                    background: selected ? ACCENT : hovered ? ACCENT_HOVER : 'transparent',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {d.day}
                  {today && !selected && (
                    <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: ACCENT }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Time Toggle / Quick Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              type="button"
              onClick={() => {
                const today = dayjs()
                setViewDate(today)
                if (!showTime) {
                  setSelectedDate(today)
                  onChange?.(today)
                  setOpen(false)
                } else {
                  setSelectedDate(today.hour(selectedHour).minute(selectedMinute))
                }
              }}
              style={{
                background: 'none', border: 'none', color: ACCENT,
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                padding: '4px 8px', borderRadius: '6px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = ACCENT_LIGHT}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Today
            </button>
            {showTime && (
              <button
                type="button"
                onClick={() => setView('time')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: ACCENT_LIGHT, border: 'none', color: ACCENT,
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  padding: '6px 14px', borderRadius: '8px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = ACCENT_HOVER}
                onMouseLeave={(e) => e.currentTarget.style.background = ACCENT_LIGHT}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {String(selectedHour % 12 || 12).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')} {selectedHour >= 12 ? 'PM' : 'AM'}
              </button>
            )}
          </div>
        </>
      ) : view === 'monthYear' ? (
        /* Month & Year Picker View */
        <>
          {/* Year Navigation */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px 12px',
          }}>
            <button type="button" onClick={() => setViewDate(viewDate.subtract(1, 'year'))} style={navBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.02em' }}>
              {viewDate.year()}
            </span>
            <button type="button" onClick={() => setViewDate(viewDate.add(1, 'year'))} style={navBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Month Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '0 14px 14px', gap: '6px' }}>
            {MONTHS.map((m, i) => {
              const isCurrentMonth = viewDate.month() === i
              const isTodayMonth = dayjs().month() === i && dayjs().year() === viewDate.year()
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setViewDate(viewDate.month(i))
                    setView('calendar')
                  }}
                  style={{
                    height: '42px', borderRadius: '10px', border: 'none',
                    fontSize: '13px', fontWeight: isCurrentMonth ? 700 : isTodayMonth ? 600 : 400,
                    cursor: 'pointer',
                    background: isCurrentMonth ? ACCENT : 'rgba(255,255,255,0.04)',
                    color: isCurrentMonth ? '#fff' : isTodayMonth ? ACCENT : '#c8d0dc',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isCurrentMonth) e.currentTarget.style.background = ACCENT_HOVER }}
                  onMouseLeave={(e) => { if (!isCurrentMonth) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                >
                  {m}
                </button>
              )
            })}
          </div>

          {/* Back to calendar */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={() => setView('calendar')}
              style={{
                background: 'none', border: 'none', color: ACCENT,
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                padding: '4px 8px', borderRadius: '6px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = ACCENT_LIGHT}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Back to calendar
            </button>
          </div>
        </>
      ) : view === 'time' ? (
        /* Time Picker View */
        <>
          <div style={{ padding: '16px 18px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" onClick={() => setView('calendar')} style={navBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>
              Set Time
            </span>
          </div>

          {/* Large Time Display */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 0 20px', gap: '4px',
          }}>
            <span style={{ fontSize: '42px', fontWeight: 700, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>
              {String(selectedHour % 12 || 12).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '42px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>:</span>
            <span style={{ fontSize: '42px', fontWeight: 700, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>
              {String(selectedMinute).padStart(2, '0')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '12px' }}>
              {['AM', 'PM'].map(period => (
                <button
                  type="button"
                  key={period}
                  onClick={() => {
                    const isPM = period === 'PM'
                    const h12 = selectedHour % 12
                    setSelectedHour(isPM ? (h12 === 0 ? 12 : h12 + 12) : h12)
                  }}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', border: 'none',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.05em',
                    background: (selectedHour >= 12 ? 'PM' : 'AM') === period ? ACCENT : 'rgba(255,255,255,0.06)',
                    color: (selectedHour >= 12 ? 'PM' : 'AM') === period ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Hour Chips */}
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hour</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                const h24 = selectedHour >= 12 ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
                const active = (selectedHour % 12 || 12) === h
                return (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setSelectedHour(h24)}
                    style={{
                      height: '34px', borderRadius: '8px', border: 'none',
                      fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#a0a8b8',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Minute Chips */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Minute</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {minutes.map(m => {
                const active = selectedMinute === m
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setSelectedMinute(m)}
                    style={{
                      height: '34px', borderRadius: '8px', border: 'none',
                      fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#a0a8b8',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={handleTimeConfirm}
              disabled={!selectedDate}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: selectedDate ? 'pointer' : 'not-allowed',
                background: selectedDate ? ACCENT : 'rgba(255,255,255,0.06)',
                color: selectedDate ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => { if (selectedDate) e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
            >
              {selectedDate ? `Confirm · ${selectedDate.format('MMM D')} at ${String(selectedHour % 12 || 12)}:${String(selectedMinute).padStart(2, '0')} ${selectedHour >= 12 ? 'PM' : 'AM'}` : 'Select a date first'}
            </button>
          </div>
        </>
      ) : (
        /* Time-Only Picker (no calendar) */
        <>
          <div style={{ padding: '16px 18px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>Select Time</span>
          </div>

          {/* Large Time Display */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 0 20px', gap: '4px',
          }}>
            <span style={{ fontSize: '42px', fontWeight: 700, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>
              {String(selectedHour % 12 || 12).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '42px', fontWeight: 300, color: 'rgba(255,255,255,0.3)' }}>:</span>
            <span style={{ fontSize: '42px', fontWeight: 700, color: ACCENT, fontVariantNumeric: 'tabular-nums' }}>
              {String(selectedMinute).padStart(2, '0')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '12px' }}>
              {['AM', 'PM'].map(period => (
                <button
                  type="button"
                  key={period}
                  onClick={() => {
                    const isPM = period === 'PM'
                    const h12 = selectedHour % 12
                    setSelectedHour(isPM ? (h12 === 0 ? 12 : h12 + 12) : h12)
                  }}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', border: 'none',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.05em',
                    background: (selectedHour >= 12 ? 'PM' : 'AM') === period ? ACCENT : 'rgba(255,255,255,0.06)',
                    color: (selectedHour >= 12 ? 'PM' : 'AM') === period ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Hour Chips */}
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hour</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                const h24 = selectedHour >= 12 ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
                const active = (selectedHour % 12 || 12) === h
                return (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setSelectedHour(h24)}
                    style={{
                      height: '34px', borderRadius: '8px', border: 'none',
                      fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#a0a8b8',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Minute Chips */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Minute</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {minutes.map(m => {
                const active = selectedMinute === m
                return (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setSelectedMinute(m)}
                    style={{
                      height: '34px', borderRadius: '8px', border: 'none',
                      fontSize: '13px', fontWeight: active ? 700 : 400, cursor: 'pointer',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#a0a8b8',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={handleTimeConfirm}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                background: ACCENT,
                color: '#fff',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            >
              {`Set Time · ${String(selectedHour % 12 || 12).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedHour >= 12 ? 'PM' : 'AM'}`}
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  ) : null

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? ACCENT : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          minHeight: '42px',
        }}
      >
        {/* Calendar or Clock icon */}
        {timeOnly ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" style={{ marginRight: '10px', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedDate ? ACCENT : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
        <span style={{
          flex: 1,
          fontSize: '14px',
          color: (selectedDate || timeOnly) ? '#e2e8f0' : 'rgba(255,255,255,0.35)',
          fontWeight: (selectedDate || timeOnly) ? 500 : 400,
          letterSpacing: '0.01em',
        }}>
          {formatDisplay() || placeholder}
        </span>
        {(selectedDate || timeOnly) && (
          <div
            onClick={handleClear}
            style={{
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown rendered via portal */}
      {dropdownContent}

      {/* Keyframe animation */}
      <style>{`
        @keyframes samPickerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const navBtnStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

export default SamDatePicker
