/* Exchange asset model + filter UI config.
   All marketplace data (listings, stats, balances, trends, sales) flows in from
   the exchange store (getExchangeListings / getExchangeStats). No sample or
   fabricated data lives here — empty feeds resolve to honest empty states. */

export const ASSET_TYPES = [
  { key: 'all', label: 'All Assets', icon: '🌐' },
  { key: 'franchises', label: 'Franchises', icon: '🛡️' },
  { key: 'picks', label: 'Draft Picks', icon: '🎯' },
  { key: 'teams', label: 'Teams', icon: '👥' },
  { key: 'other', label: 'Other', icon: '✨' },
]

export const TEAMS_FILTER = ['All Teams', 'KC', 'MIN', 'ATL', 'BAL', 'GB', 'SF']
export const PRICE_FILTER = ['Price: Any', 'Under 20M', '20M – 50M', '50M – 100M', '100M+']
export const SORTS = ['Recently Listed', 'Price: Low to High', 'Price: High to Low', 'OVR', 'Ending Soon', 'Trending']

// Zeroed header balances used only until real balances are passed in.
export const EMPTY_BALANCES = { ep: 0, empireValue: 0, availableCap: 0 }

// Zeroed marketplace stats used only until real stats load.
export const EMPTY_STATS = { liveListings: 0, totalVolume: 0, successfulTrades: 0, avgSalePrice: 0 }
