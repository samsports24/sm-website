import React, { useEffect, useState } from 'react'
import { Select } from 'antd'

/**
 * LongListSelect - a very long list of options, usable on a phone.
 *
 * THE BUG THIS EXISTS FOR
 *
 * Country is a 250-item list, and it was an antd <Select showSearch>. On a
 * desktop that is the right control. On iOS Safari it is close to unusable:
 *
 *   - showSearch focuses a text input, so the keyboard opens
 *   - the keyboard takes roughly half the viewport, and the dropdown's default
 *     256px list is squeezed into what is left
 *   - the keyboard cannot be dismissed without closing the dropdown
 *   - dragging that short list registers as a tap on iOS, so scrolling picks
 *     a country instead of scrolling past it
 *
 * A user reported it as "it does not allow keyboard to be removed to scroll
 * through to my country" and "if I try to scroll it only goes a couple then
 * selects one from there automatically". Both of those are the same control.
 *
 * THE FIX
 *
 * On a phone, render a plain <select>. iOS turns that into the native picker
 * wheel: no keyboard, no tap-vs-drag ambiguity, and typing a letter jumps to
 * that letter for free. Desktop keeps the searchable antd Select, which is
 * better there.
 *
 * Not a media query on a hidden element - the control that renders is the
 * control the platform handles well, and it re-picks if the window is resized.
 *
 * Drop-in for <Select> inside a Form.Item: takes the same value/onChange
 * contract antd's form passes down.
 */

const MOBILE_QUERY = '(max-width: 767px)'

const matchesMobile = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(MOBILE_QUERY).matches

const LongListSelect = ({
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select…',
  filterOption,
  disabled,
  id,
  ...rest
}) => {
  const [isMobile, setIsMobile] = useState(matchesMobile)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(MOBILE_QUERY)
    const handler = (e) => setIsMobile(e.matches)
    // addListener is the deprecated form, still the only one older iOS Safari has.
    if (mq.addEventListener) mq.addEventListener('change', handler)
    else mq.addListener(handler)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler)
      else mq.removeListener(handler)
    }
  }, [])

  if (!isMobile) {
    return (
      <Select
        showSearch
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        optionFilterProp='children'
        filterOption={filterOption}
        options={options}
        {...rest}
      />
    )
  }

  return (
    <select
      id={id}
      className='ant-input'
      value={value || ''}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value || undefined)}
      onBlur={onBlur}
      style={{
        width: '100%',
        // 16px or larger, otherwise iOS zooms the page in on focus and the
        // user is left scrolled sideways on a form they were halfway through.
        fontSize: 16,
        height: 40,
        appearance: 'none',
        WebkitAppearance: 'none',
        // Room for the chevron drawn below.
        paddingRight: 30,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='rgba(140,150,170,0.9)' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
    >
      <option value='' disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export default LongListSelect
