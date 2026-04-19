// ESPN API Configuration
export const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// Soccer Leagues Configuration
export const SOCCER_LEAGUES = [
  // International
  { id: 'fifa.worldq.uefa', name: 'World Cup Qualifiers - UEFA', emoji: '🌍' },
  { id: 'fifa.worldq.conmebol', name: 'World Cup Qualifiers - CONMEBOL', emoji: '🌎' },
  { id: 'fifa.worldq.concacaf', name: 'World Cup Qualifiers - CONCACAF', emoji: '🌎' },
  { id: 'fifa.worldq.afc', name: 'World Cup Qualifiers - AFC', emoji: '🌏' },
  { id: 'fifa.worldq.caf', name: 'World Cup Qualifiers - CAF', emoji: '🌍' },
  { id: 'fifa.worldq.ofc', name: 'World Cup Qualifiers - OFC', emoji: '🌏' },
  { id: 'fifa.friendly', name: 'Friendlies', emoji: '🤝' },
  { id: 'uefa.nations', name: 'UEFA Nations League', emoji: '🇪🇺' },
  // Club competitions
  { id: 'uefa.champions', name: 'Champions League', emoji: '🏆' },
  { id: 'uefa.europa', name: 'Europa League', emoji: '🟠' },
  // { id: 'uefa.conference', name: 'Conference League', emoji: '🟣' }, // Disabled: ESPN API returns 400 for this league
  { id: 'eng.1', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'esp.1', name: 'La Liga', emoji: '🇪🇸' },
  { id: 'ger.1', name: 'Bundesliga', emoji: '🇩🇪' },
  { id: 'ita.1', name: 'Serie A', emoji: '🇮🇹' },
  { id: 'fra.1', name: 'Ligue 1', emoji: '🇫🇷' },
  { id: 'eng.fa', name: 'FA Cup', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'usa.1', name: 'MLS', emoji: '🇺🇸' },
];

// Sport Tabs for Header Navigation
export const SPORT_TABS = [
  { key: 'worldcup', emoji: '🏆', label: 'World Cup 2026', sport: 'soccer', league: null, special: 'worldcup' },
  { key: 'soccer', emoji: '⚽', label: 'Soccer', sport: 'soccer', league: null },
  { key: 'nfl', emoji: '🏈', label: 'A.Football', sport: 'football', league: 'nfl' },
  { key: 'nba', emoji: '🏀', label: 'NBA', sport: 'basketball', league: 'nba' },
  { key: 'nhl', emoji: '🏒', label: 'NHL', sport: 'hockey', league: 'nhl' },
  { key: 'mlb', emoji: '⚾', label: 'MLB', sport: 'baseball', league: 'mlb' },
  { key: 'tennis', emoji: '🎾', label: 'Tennis', sport: 'tennis', league: null },
  { key: 'ncaafb', emoji: '🎓', label: 'NCAAFB', sport: 'football', league: 'college-football' },
  { key: 'ncaab', emoji: '🎓', label: 'NCAAB', sport: 'basketball', league: 'mens-college-basketball' },
];

// Tennis Leagues Configuration
export const TENNIS_LEAGUES = [
  { id: 'atp', sport: 'tennis', name: 'ATP Tour', emoji: '🎾' },
  { id: 'wta', sport: 'tennis', name: 'WTA Tour', emoji: '🎾' },
];

// Standings Configurations for Different Sports
export const STANDINGS_CONFIGS = {
  epl: {
    label: 'Premier League',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sport: 'soccer',
    league: 'eng.1',
    afLeagueId: 39,
    type: 'soccer',
    zones: { cl: [1, 4], el: [5, 6], conf: [7, 7], rel: [18, 20] },
  },
  laliga: {
    label: 'La Liga',
    emoji: '🇪🇸',
    sport: 'soccer',
    league: 'esp.1',
    afLeagueId: 140,
    type: 'soccer',
    zones: { cl: [1, 4], el: [5, 6], rel: [18, 20] },
  },
  bundesliga: {
    label: 'Bundesliga',
    emoji: '🇩🇪',
    sport: 'soccer',
    league: 'ger.1',
    afLeagueId: 78,
    type: 'soccer',
    zones: { cl: [1, 4], el: [5, 6], rel: [16, 18] },
  },
  seriea: {
    label: 'Serie A',
    emoji: '🇮🇹',
    sport: 'soccer',
    league: 'ita.1',
    afLeagueId: 135,
    type: 'soccer',
    zones: { cl: [1, 4], el: [5, 6], rel: [18, 20] },
  },
  ligue1: {
    label: 'Ligue 1',
    emoji: '🇫🇷',
    sport: 'soccer',
    league: 'fra.1',
    afLeagueId: 61,
    type: 'soccer',
    zones: { cl: [1, 3], el: [4, 5], rel: [16, 18] },
  },
  nba: {
    label: 'NBA',
    emoji: '🏀',
    sport: 'basketball',
    league: 'nba',
    type: 'nba',
    zones: { playoff: [1, 6] },
  },
  nfl: {
    label: 'A.Football',
    emoji: '🏈',
    sport: 'football',
    league: 'nfl',
    type: 'nfl',
    zones: { playoff: [1, 4] },
  },
  nhl: {
    label: 'NHL',
    emoji: '🏒',
    sport: 'hockey',
    league: 'nhl',
    type: 'nhl',
    zones: { playoff: [1, 8] },
  },
  mlb: {
    label: 'MLB',
    emoji: '⚾',
    sport: 'baseball',
    league: 'mlb',
    type: 'mlb',
    zones: { playoff: [1, 3] },
  },
  ncaafb: {
    label: 'NCAA Football',
    emoji: '🎓🏈',
    sport: 'football',
    league: 'college-football',
    type: 'ncaafb',
    zones: { playoff: [1, 12] },
  },
  ncaab: {
    label: 'NCAA Basketball',
    emoji: '🎓🏀',
    sport: 'basketball',
    league: 'mens-college-basketball',
    type: 'ncaab',
    zones: { playoff: [1, 68] },
  },
};

// News Sources Configuration
export const NEWS_SOURCES = [
  { sport: 'soccer', label: 'Soccer', icon: '⚽', espn: 'soccer/eng.1' },
  { sport: 'soccer', label: 'Soccer', icon: '⚽', espn: 'soccer/esp.1' },
  { sport: 'nfl', label: 'A.Football', icon: '🏈', espn: 'football/nfl' },
  { sport: 'nba', label: 'NBA', icon: '🏀', espn: 'basketball/nba' },
  { sport: 'nhl', label: 'NHL', icon: '🏒', espn: 'hockey/nhl' },
  { sport: 'mlb', label: 'MLB', icon: '⚾', espn: 'baseball/mlb' },
  { sport: 'ncaafb', label: 'NCAA Football', icon: '🎓🏈', espn: 'football/college-football' },
  { sport: 'ncaab', label: 'NCAA Basketball', icon: '🎓🏀', espn: 'basketball/mens-college-basketball' },
];

// Internationalization (i18n) Translations
export const I18N = {
  en: {
    appTitle: 'Sam Sports',
    searchPlaceholder: 'Search leagues, teams, players...',
    loading: 'Loading...',
    error: 'Error loading data',
    noResults: 'No results found',
    standings: 'Standings',
    schedule: 'Schedule',
    scores: 'Scores',
    news: 'News',
    liveNow: 'Live Now',
    upcoming: 'Upcoming',
    finished: 'Finished',
    position: 'Position',
    team: 'Team',
    played: 'Played',
    won: 'Won',
    drawn: 'Drawn',
    lost: 'Lost',
    pointsFor: 'Points For',
    pointsAgainst: 'Points Against',
    pointsDifference: 'Points Difference',
    points: 'Points',
    home: 'Home',
    away: 'Away',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    fullTime: 'Full Time',
    notStarted: 'Not Started',
    inPlay: 'In Play',
    postponed: 'Postponed',
    cancelled: 'Cancelled',
    live: 'Live',
    viewDetails: 'View Details',
    backToHome: 'Back to Home',
    sportNotFound: 'Sport not found',
    selectASport: 'Select a sport to view standings',
  },
  fr: {
    appTitle: 'Sam Sports',
    searchPlaceholder: 'Rechercher des ligues, équipes, joueurs...',
    loading: 'Chargement...',
    error: 'Erreur lors du chargement des données',
    noResults: 'Aucun résultat trouvé',
    standings: 'Classements',
    schedule: 'Calendrier',
    scores: 'Résultats',
    news: 'Actualités',
    liveNow: 'En Direct',
    upcoming: 'À Venir',
    finished: 'Terminé',
    position: 'Position',
    team: 'Équipe',
    played: 'Joué',
    won: 'Gagné',
    drawn: 'Nul',
    lost: 'Perdu',
    pointsFor: 'Points Pour',
    pointsAgainst: 'Points Contre',
    pointsDifference: 'Différence de Points',
    points: 'Points',
    home: 'Domicile',
    away: 'Extérieur',
    date: 'Date',
    time: 'Heure',
    status: 'Statut',
    fullTime: 'Temps Complet',
    notStarted: 'Non Commencé',
    inPlay: 'En Cours',
    postponed: 'Reporté',
    cancelled: 'Annulé',
    live: 'En Direct',
    viewDetails: 'Voir les Détails',
    backToHome: 'Retour à l\'Accueil',
    sportNotFound: 'Sport non trouvé',
    selectASport: 'Sélectionnez un sport pour voir les classements',
  },
  es: {
    appTitle: 'Sam Sports',
    searchPlaceholder: 'Buscar ligas, equipos, jugadores...',
    loading: 'Cargando...',
    error: 'Error al cargar los datos',
    noResults: 'No se encontraron resultados',
    standings: 'Clasificaciones',
    schedule: 'Calendario',
    scores: 'Resultados',
    news: 'Noticias',
    liveNow: 'En Vivo Ahora',
    upcoming: 'Próximamente',
    finished: 'Finalizado',
    position: 'Posición',
    team: 'Equipo',
    played: 'Jugado',
    won: 'Ganado',
    drawn: 'Empatado',
    lost: 'Perdido',
    pointsFor: 'Puntos a Favor',
    pointsAgainst: 'Puntos en Contra',
    pointsDifference: 'Diferencia de Puntos',
    points: 'Puntos',
    home: 'Casa',
    away: 'Fuera',
    date: 'Fecha',
    time: 'Hora',
    status: 'Estado',
    fullTime: 'Tiempo Completo',
    notStarted: 'No Iniciado',
    inPlay: 'En Juego',
    postponed: 'Pospuesto',
    cancelled: 'Cancelado',
    live: 'En Vivo',
    viewDetails: 'Ver Detalles',
    backToHome: 'Volver a Inicio',
    sportNotFound: 'Deporte no encontrado',
    selectASport: 'Selecciona un deporte para ver las clasificaciones',
  },
  pt: {
    appTitle: 'Sam Sports',
    searchPlaceholder: 'Pesquisar ligas, times, jogadores...',
    loading: 'Carregando...',
    error: 'Erro ao carregar dados',
    noResults: 'Nenhum resultado encontrado',
    standings: 'Classificações',
    schedule: 'Calendário',
    scores: 'Resultados',
    news: 'Notícias',
    liveNow: 'Ao Vivo Agora',
    upcoming: 'Próximos',
    finished: 'Finalizado',
    position: 'Posição',
    team: 'Time',
    played: 'Jogos',
    won: 'Vitórias',
    drawn: 'Empates',
    lost: 'Derrotas',
    pointsFor: 'Pontos a Favor',
    pointsAgainst: 'Pontos Contra',
    pointsDifference: 'Diferença de Pontos',
    points: 'Pontos',
    home: 'Casa',
    away: 'Fora',
    date: 'Data',
    time: 'Hora',
    status: 'Status',
    fullTime: 'Tempo Completo',
    notStarted: 'Não Iniciado',
    inPlay: 'Em Jogo',
    postponed: 'Adiado',
    cancelled: 'Cancelado',
    live: 'Ao Vivo',
    viewDetails: 'Ver Detalhes',
    backToHome: 'Voltar ao Início',
    sportNotFound: 'Esporte não encontrado',
    selectASport: 'Selecione um esporte para ver as classificações',
  },
};

// Helper Functions

/**
 * Get translation for a given key and language
 * @param {string} key - Translation key
 * @param {string} lang - Language code (default: 'en')
 * @returns {string} Translated string
 */
export const t = (key, lang = 'en') => {
  if (!I18N[lang] || !I18N[lang][key]) {
    return I18N['en'][key] || key;
  }
  return I18N[lang][key];
};

/**
 * Format time as HH:MM
 * @param {Date|number} date - Date or timestamp
 * @returns {string} Formatted time (HH:MM)
 */
export const fmtTime = (d) => {
  const date = typeof d === 'number' ? new Date(d) : d;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format date as "Wed, 12 Mar 2026"
 * @param {Date|number} date - Date or timestamp
 * @returns {string} Formatted date
 */
export const fmtDate = (d) => {
  const date = typeof d === 'number' ? new Date(d) : d;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = dayNames[date.getDay()];
  const date_num = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}, ${date_num} ${month} ${year}`;
};

/**
 * Get human-readable time difference
 * @param {Date|number} date - Date or timestamp
 * @returns {string} Time ago ("just now", "5m ago", "3h ago", "2d ago", etc.)
 */
export const timeAgo = (date) => {
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
};

/**
 * Get status information for a competition
 * @param {object} comp - Competition object with status and appropriate time fields
 * @returns {object} Status object with {cls, label, chip, clock}
 */
export const getStatus = (obj) => {
  // ESPN API returns status as: { type: { state, detail, shortDetail }, displayClock }
  // Handle both event objects and competition objects
  const statusObj = obj?.status || obj
  const state = statusObj?.type?.state || ''
  const detail = statusObj?.type?.detail || statusObj?.type?.shortDetail || ''
  const clock = statusObj?.displayClock || obj?.displayClock || null

  // Also handle simple string status (fallback)
  const rawStatus = (typeof obj?.status === 'string') ? obj.status.toLowerCase() : ''

  if (!state && !rawStatus) {
    return { cls: 'status-unknown', label: 'Unknown', chip: '?', clock: null }
  }

  // In Play / Live
  if (state === 'in' || rawStatus === 'in_progress' || rawStatus === 'inprogress') {
    const isHalftime = detail.toLowerCase().includes('halftime') || detail.toLowerCase().includes('half time')
    return {
      cls: isHalftime ? 'status-halftime' : 'status-live',
      label: isHalftime ? 'HT' : (clock || detail || 'Live'),
      chip: isHalftime ? 'HT' : 'LIVE',
      clock,
      state: isHalftime ? 'halftime' : 'live',
    }
  }

  // Pre-game / Scheduled
  if (state === 'pre' || rawStatus === 'scheduled' || rawStatus === 'notstarted') {
    const startTime = obj?.date || obj?.startTime
    return {
      cls: 'status-scheduled',
      label: detail || (startTime ? fmtTime(new Date(startTime)) : 'Upcoming'),
      chip: detail || 'Soon',
      clock: null,
      state: 'scheduled',
    }
  }

  // Post-game / Final
  if (state === 'post' || rawStatus === 'final' || rawStatus === 'finished' || rawStatus === 'completed') {
    // Check for postponed/cancelled in detail
    const lowerDetail = detail.toLowerCase()
    if (lowerDetail.includes('postponed')) {
      return { cls: 'status-postponed', label: 'Postponed', chip: 'PPD', clock: null, state: 'postponed' }
    }
    if (lowerDetail.includes('cancel')) {
      return { cls: 'status-cancelled', label: 'Cancelled', chip: 'CAN', clock: null, state: 'cancelled' }
    }
    return {
      cls: 'status-final',
      label: detail || 'FT',
      chip: 'FT',
      clock: null,
      state: 'final',
    }
  }

  // Postponed
  if (rawStatus === 'postponed') {
    return { cls: 'status-postponed', label: 'Postponed', chip: 'PPD', clock: null, state: 'postponed' }
  }

  // Cancelled
  if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
    return { cls: 'status-cancelled', label: 'Cancelled', chip: 'CAN', clock: null, state: 'cancelled' }
  }

  // Default
  return {
    cls: 'status-unknown',
    label: detail || state || 'Unknown',
    chip: (state || '?').substring(0, 3).toUpperCase(),
    clock: null,
    state: 'unknown',
  }
};
