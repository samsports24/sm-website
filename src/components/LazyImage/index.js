import React, { useState, useRef, useEffect } from 'react'

/**
 * LazyImage — loads images only when they enter the viewport.
 * Uses IntersectionObserver for native lazy loading with a fallback.
 * Also handles error states with a placeholder.
 *
 * Usage:
 *   <LazyImage src={url} alt="Player headshot" width={80} height={80} />
 */
const LazyImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  style = {},
  placeholder,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imgRef.current) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // Start loading 200px before viewport
    )
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  const placeholderStyle = {
    width: width || '100%',
    height: height || 'auto',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    display: 'inline-block',
    ...style,
  }

  if (error) {
    return (
      <div
        ref={imgRef}
        className={className}
        style={placeholderStyle}
        role="img"
        aria-label={alt}
      >
        {placeholder || null}
      </div>
    )
  }

  return (
    <div ref={imgRef} style={{ display: 'inline-block', ...style }}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'block',
          }}
          {...rest}
        />
      ) : (
        <div style={placeholderStyle} />
      )}
    </div>
  )
}

export default LazyImage
