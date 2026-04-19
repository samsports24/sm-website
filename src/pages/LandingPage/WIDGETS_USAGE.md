# API-Sports Widgets — Integration Guide

## Setup

1. Add your API-Sports key to `.env`:
```
REACT_APP_API_SPORTS_KEY=your-api-sports-key-here
```

2. Import the CSS in `landing.css` or your main CSS:
```css
@import '../../styles/pages/api-sports-widgets.css';
```

3. **Important**: Whitelist your domain(s) in the API-Sports dashboard to protect your API key from being used by others.

---

## Quick Start — Replace SportPanel with Widgets

In `LandingPage/index.js`, you can swap or supplement the ESPN-based panels:

```jsx
import { SportWidgetPanel } from './ApiSportsWidgets'

// In renderMainContent():
if (activeSport !== 'standings' && activeSport !== 'news') {
  return (
    <SportWidgetPanel
      activeSport={activeSport}
      selectedDate={selectedDate}
    />
  )
}
```

---

## Individual Widget Examples

### Live Scores (all NFL games today)
```jsx
import { GamesWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<GamesWidget sport="nfl" refresh={20} tab="all" onGameClick="modal" />
```

### NFL Standings
```jsx
import { StandingsWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<StandingsWidget sport="nfl" league={1} season="2025" />
```

### Game Detail (box score, player stats, events)
```jsx
import { GameWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<GameWidget
  sport="nfl"
  gameId={12345}
  showStats={true}
  showPlayers={true}
  showEvents={true}
  refresh={30}
/>
```

### Team Profile with Squad
```jsx
import { TeamWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<TeamWidget sport="nfl" teamId={1} showStats={true} showSquad={true} />
```

### Player Profile with Stats
```jsx
import { PlayerWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<PlayerWidget sport="nfl" playerId={456} season="2025" showStats={true} />
```

### Head-to-Head
```jsx
import { H2HWidget, WidgetConfig } from './ApiSportsWidgets'

<WidgetConfig sport="nfl" />
<H2HWidget sport="nfl" teamId1={33} teamId2={34} onGameClick="modal" />
```

### Multi-League Soccer (all 5 leagues)
```jsx
<GamesWidget
  sport="soccer"
  league="39-140-78-135-61"
  refresh={20}
  onGameClick="modal"
/>
```

---

## League IDs Reference

### NFL / NCAA
| League | ID |
|--------|----|
| NFL | 1 |
| NCAA | 2 |

### Soccer (API-Football v3)
| League | ID |
|--------|----|
| Premier League | 39 |
| La Liga | 140 |
| Bundesliga | 78 |
| Serie A | 135 |
| Ligue 1 | 61 |
| Champions League | 2 |
| Europa League | 3 |
| MLS | 253 |

### NBA / NHL / MLB
Check API-Sports dashboard for exact league IDs.

---

## Theme

The widgets use a custom "samsports" theme that matches the landing page dark mode:
- Background: #111827 (--ls-surface)
- Primary/accent: #22C55E (--ls-cyan/--ls-green)
- Text: #F1F5F9 (--ls-wdim)
- Border: #1E293B (--ls-border)

You can customize it by editing `SAMSPORTS_THEME_CSS` in `ApiSportsWidgets.js`.

---

## API Calls & Caching

Each widget render triggers 1 API call. With `data-refresh="20"`, it refreshes every 20 seconds.

**Important**: Set up caching as recommended by API-Sports to avoid burning through your daily quota. The widget docs explain how: https://api-sports.io/documentation/widgets/v3
