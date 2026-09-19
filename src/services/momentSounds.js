// ── THE NOISE A GOAL MAKES ─────────────────────────────────────────────────
//
//  A push notification cannot carry a custom sound. The Notifications API had
//  a `sound` property, no browser ever implemented it, and it was dropped from
//  the spec in 2018. Every web push plays whatever the operating system plays,
//  and the only thing we control is whether it makes noise at all.
//
//  So the sound lives here instead, in the page, where we own it completely.
//  During a live match that is where people are anyway: a goal already arrives
//  over the socket as a Moment, and this gives it a voice at the same instant
//  the card appears.
//
//  ── AUTOPLAY ────────────────────────────────────────────────────────────
//
//  A browser will not let a page make noise before the person has interacted
//  with it. Calling play() cold throws NotAllowedError and, worse, some
//  browsers then hold it against the page. So the first real click or key
//  press unlocks the audio by playing every clip silently once, after which
//  they are free to play whenever they like. Nobody notices; the unlock rides
//  on a click they were making anyway.
//
//  ── WHEN IT STAYS QUIET ─────────────────────────────────────────────────
//
//  Off by the person's own switch. Off before the unlock. Off if the file is
//  missing, which is the normal state until somebody adds one, and is silent
//  rather than an error in the console every time somebody scores.
//
//  Drop the files in public/sounds/ and they start working. No code change.

const KEY = "samsports.momentSounds";

// One clip per kind of moment. A kind with no entry makes no sound, which is
// the right default for anything added later: new events stay quiet until
// somebody decides what they should sound like.
const CLIPS = {
  goal: "/sounds/goal.mp3",
  yellowCard: "/sounds/whistle.mp3",
  redCard: "/sounds/whistle.mp3",
  touchdown: "/sounds/touchdown.mp3",
  // The whistle again. A turnover ends the play and the whistle goes, so it is
  // not a stand-in for a missing sound - it is the right one, and one clip
  // doing two jobs is one fewer thing to keep level with the rest.
  interception: "/sounds/whistle.mp3",
  fumble: "/sounds/whistle.mp3",
};

const VOLUME = 0.55;

const audio = {};
let unlocked = false;
let missing = {};

export function soundsOn() {
  try { return localStorage.getItem(KEY) !== "off"; } catch (_) { return true; }
}

export function setSoundsOn(on) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (_) {}
  if (on) unlock();
}

function element(src) {
  if (audio[src]) return audio[src];
  const a = new Audio(src);
  a.preload = "auto";
  a.volume = VOLUME;
  // A 404 is the normal state before anybody has added the file. Remember it
  // and stop asking, rather than logging on every goal for the rest of the
  // season.
  a.addEventListener("error", () => { missing[src] = true; });
  audio[src] = a;
  return a;
}

/**
 * Let the page make noise, on the back of a click the person was making
 * anyway. Playing each clip muted counts as the gesture the browser wants.
 */
export function unlock() {
  if (unlocked) return;
  unlocked = true;
  for (const src of new Set(Object.values(CLIPS))) {
    const a = element(src);
    const wasMuted = a.muted;
    a.muted = true;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    try { a.pause(); a.currentTime = 0; } catch (_) {}
    a.muted = wasMuted;
  }
}

export function installUnlock() {
  const once = () => {
    unlock();
    window.removeEventListener("pointerdown", once);
    window.removeEventListener("keydown", once);
  };
  window.addEventListener("pointerdown", once, { once: true });
  window.addEventListener("keydown", once, { once: true });
}

/**
 * Play the sound for one moment. Never throws: a missing file, a browser that
 * refuses, or a moment with no sound of its own all end here quietly. A goal
 * that arrives must never be able to break the card that shows it.
 */
export function playMoment(moment) {
  try {
    if (!moment || !soundsOn() || !unlocked) return;
    const src = CLIPS[moment.kind];
    if (!src || missing[src]) return;
    const a = element(src);
    // Restart rather than overlap: two goals in a minute should sound like two
    // goals, not like one long noise.
    try { a.currentTime = 0; } catch (_) {}
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (_) {}
}

export default { playMoment, soundsOn, setSoundsOn, unlock, installUnlock };
