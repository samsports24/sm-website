# Moment sounds

Drop the files in here and they start working. No code change, no deploy step
beyond the usual one.

| File            | Plays on                                            |
|-----------------|-----------------------------------------------------|
| `goal.mp3`      | a goal                                              |
| `whistle.mp3`   | a yellow card, a red card, an interception, a fumble |
| `touchdown.mp3` | an NFL touchdown                                    |

All four exist. All three clips are synthesised rather than recorded, so
nothing here carries a licence and there is nothing to attribute. All levelled
to about -9.5 LUFS with a limiter at -1dBFS, so no one of them jumps out
against the others - which is what makes a set of sounds liveable rather than
something people switch off after one match.

A file that is not here simply makes no sound. That is the normal state and it
is silent rather than an error, so adding one at a time is fine.

Keep them SHORT - a second or two. This plays the instant a card appears in
chat, on top of whatever the person is already doing, and a five-second sample
is a thing people switch off after one match. Keep them small too; they are
fetched by every visitor with sound on.

Use audio you own or that is licensed for commercial use. A clip lifted from a
broadcast is somebody else's copyright and this is a public site.

Mapping lives in `src/services/momentSounds.js` if a new event needs its own
noise.
