import { useEffect, useState } from 'react'
import { base_url } from '../../config/constants'

/**
 * useInjuryReport — loads the NFL injury feed ONCE (module-cached, shared across
 * every component that mounts) and returns a lookup keyed by player id.
 *
 * A player counts as "on the injury report" when they appear in this feed. The
 * feed is the same source the Injury Report page uses, so a player like Alvin
 * Kamara — whose official designation is "Unknown" but who has an ankle injury
 * and an "Unlikely to play" outlook — is caught here even though his plain
 * `InjuryStatus` field is blank.
 */

let cache = null // Map<playerId, feedRow>
let inflight = null

const buildMap = (players) => {
  const m = new Map()
  for (const p of players || []) {
    // The feed's id is the Player _id; also index common id aliases just in case.
    const ids = [p.id, p._id, p.playerId, p.PlayerID].filter(Boolean)
    for (const id of ids) m.set(String(id), p)
  }
  return m
}

const load = () => {
  if (cache) return Promise.resolve(cache)
  if (inflight) return inflight
  inflight = fetch(`${base_url}/values/injuries`)
    .then((x) => x.json())
    .then((r) => {
      cache = buildMap(r && r.success ? r.players : [])
      return cache
    })
    .catch(() => {
      cache = new Map()
      return cache
    })
    .finally(() => { inflight = null })
  return inflight
}

export const useInjuryReport = () => {
  const [map, setMap] = useState(cache || new Map())
  useEffect(() => {
    let alive = true
    load().then((m) => { if (alive) setMap(m) })
    return () => { alive = false }
  }, [])
  // Look up a player's injury feed row by any id we can find on the object.
  const getInjury = (player) => {
    if (!player) return null
    const ids = [player.id, player._id, player.playerId, player.PlayerID]
    for (const id of ids) {
      if (id != null && map.has(String(id))) return map.get(String(id))
    }
    return null
  }
  return { getInjury, loaded: !!cache }
}

export default useInjuryReport
