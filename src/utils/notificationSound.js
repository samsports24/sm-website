/**
 * Notification Sound Utility
 * Uses the Web Audio API to generate distinct notification sounds
 * without requiring external audio files.
 */

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a simple tone notification
 * @param {number} frequency - Hz (higher = more urgent)
 * @param {number} duration - seconds
 * @param {string} type - oscillator type: 'sine', 'square', 'triangle', 'sawtooth'
 * @param {number} volume - 0 to 1
 */
function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    // Silently fail, audio not supported or blocked by browser policy
  }
}

/**
 * Chat message received, soft, short pop
 */
export function playChatSound() {
  playTone(800, 0.08, 'sine', 0.2)
  setTimeout(() => playTone(1200, 0.06, 'sine', 0.15), 80)
}

/**
 * Trade/Transfer offer received, two-tone alert
 */
export function playTradeSound() {
  playTone(523, 0.12, 'triangle', 0.3) // C5
  setTimeout(() => playTone(659, 0.12, 'triangle', 0.3), 130) // E5
  setTimeout(() => playTone(784, 0.18, 'triangle', 0.25), 260) // G5
}

/**
 * Auction won, triumphant ascending chime
 */
export function playAuctionWonSound() {
  playTone(523, 0.1, 'sine', 0.25)  // C5
  setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 100)  // E5
  setTimeout(() => playTone(784, 0.1, 'sine', 0.25), 200)  // G5
  setTimeout(() => playTone(1047, 0.25, 'sine', 0.3), 300)  // C6, long hold
}

/**
 * Generic notification, simple ding
 */
export function playNotificationSound() {
  playTone(880, 0.15, 'sine', 0.25) // A5
}

/**
 * Counter offer received, attention-grabbing double beep
 */
export function playCounterOfferSound() {
  playTone(660, 0.1, 'square', 0.2)
  setTimeout(() => playTone(880, 0.15, 'square', 0.2), 150)
}
