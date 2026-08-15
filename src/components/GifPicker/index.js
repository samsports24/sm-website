import React, { useState, useEffect, useRef, useCallback } from 'react'
import { base_url } from '../../config/constants'

/**
 * GifPicker — lightweight GIF search panel using the Tenor API.
 *
 * Props:
 *   visible      — boolean, whether the picker is open
 *   onSelect     — (gifUrl: string) => void
 *   onClose      — () => void
 *   accentColor  — string, theme accent (default: '#A78BFA')
 */

// GIF search goes through our own backend (/gifs), which holds the Tenor key.
// The key used to be hardcoded here and shipped in the public bundle — and it
// stopped working, which is what produced "Could not load GIFs".
const GIF_BASE = `${base_url}/gifs`

const GifPicker = ({ visible, onSelect, onClose, accentColor = '#A78BFA' }) => {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nextPos, setNextPos] = useState('')
  const searchTimeout = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    const handleClick = (e) => {
      if (e.target.closest('.nflr-chat-gif-btn')) return
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible, onClose])

  useEffect(() => {
    if (visible && trending.length === 0) fetchTrending()
  }, [visible]) // eslint-disable-line

  // No local mapping any more — the backend returns {id,title,preview,full}.

  const fetchTrending = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${GIF_BASE}/trending`)
      if (!res.ok) throw new Error('API returned ' + res.status)
      const json = await res.json()
      setTrending(json.results || [])  // backend already maps to {id,title,preview,full}
    } catch (err) {
      setError('Could not load GIFs.')
    } finally { setLoading(false) }
  }

  const searchGifs = useCallback(async (q, pos = '') => {
    if (!q.trim()) { setGifs([]); setNextPos(''); return }
    setLoading(true); setError(null)
    try {
      const url = `${GIF_BASE}/search?q=${encodeURIComponent(q)}` + (pos ? `&pos=${encodeURIComponent(pos)}` : '')
      const res = await fetch(url)
      if (!res.ok) throw new Error('API returned ' + res.status)
      const json = await res.json()
      const mapped = json.results || []  // backend already maps
      if (!pos) setGifs(mapped); else setGifs(prev => prev.concat(mapped))
      setNextPos(json.next || '')
    } catch (err) {
      setError('Search failed.')
    } finally { setLoading(false) }
  }, [])

  const handleInput = (e) => {
    const val = e.target.value; setQuery(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchGifs(val), 400)
  }

  const handleSelect = (gif) => {
    onSelect(gif.full)
    onClose(); setQuery(''); setGifs([])
  }

  if (!visible) return null
  const displayGifs = query.trim() ? gifs : trending

  return (
    <div ref={panelRef} className="gif-picker" style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6,
      background: '#141C2D', border: `1px solid ${accentColor}30`,
      borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 360,
    }}>
      <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid rgba(110,105,128,0.15)' }}>
        <input autoFocus value={query} onChange={handleInput} placeholder="Search GIFs..."
          style={{
            width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(110,105,128,0.25)', borderRadius: 8,
            color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{
        flex: 1, overflowY: 'auto', padding: 8,
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, alignContent: 'start',
      }}>
        {loading && displayGifs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Loading...</div>
        )}
        {error && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: '#f87171', fontSize: 12 }}>
            {error}
            <div onClick={() => query.trim() ? searchGifs(query) : fetchTrending()} style={{ color: accentColor, cursor: 'pointer', marginTop: 8, fontWeight: 600 }}>Retry</div>
          </div>
        )}
        {!loading && !error && displayGifs.length === 0 && query.trim() && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No GIFs found</div>
        )}
        {displayGifs.map((gif) => (
          <div key={gif.id} onClick={() => handleSelect(gif)} style={{
            cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
            background: 'rgba(0,0,0,0.2)', position: 'relative', paddingBottom: '75%',
          }}>
            <img src={gif.preview} alt={gif.title || 'GIF'} loading="lazy"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
        {query.trim() && gifs.length > 0 && nextPos && !loading && (
          <div onClick={() => searchGifs(query, nextPos)} style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '8px 0',
            color: accentColor, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Load more</div>
        )}
      </div>
      <div style={{ padding: '4px 10px 6px', borderTop: '1px solid rgba(110,105,128,0.15)', textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
        Powered by Tenor
      </div>
    </div>
  )
}

export default GifPicker
