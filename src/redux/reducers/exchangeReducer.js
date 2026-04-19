import { EXCHANGE_TYPES } from '../actions/exchangeActions'

const initialState = {
  // Browse listings
  listings: [],
  listingsLoading: false,
  listingsPagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Seller's own listings
  myListings: [],

  // Buyer's sent offers
  myOffers: [],

  // Seller's received offers
  receivedOffers: [],

  // Exchange KPI stats
  stats: {
    activeListings: 0,
    totalFloorValue: 0,
    avgAskingPrice: 0,
    myActiveOffers: 0,
    mySpBalance: 0,
  },

  // DM conversations
  conversations: [],

  // Transaction history
  history: [],

  // Empire Sale
  empireListings: [],
  empireListingsLoading: false,
  empireListingsPagination: { page: 1, limit: 20, total: 0, pages: 0 },
  myEmpireSale: null,
  myTeamsForSale: null,
}

const exchangeReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case EXCHANGE_TYPES.SET_LISTINGS:
      return {
        ...state,
        listings: payload?.listings || [],
        listingsPagination: payload?.pagination || state.listingsPagination,
      }

    case EXCHANGE_TYPES.SET_LISTINGS_LOADING:
      return {
        ...state,
        listingsLoading: payload,
      }

    case EXCHANGE_TYPES.SET_MY_LISTINGS:
      return {
        ...state,
        myListings: payload || [],
      }

    case EXCHANGE_TYPES.SET_MY_OFFERS:
      return {
        ...state,
        myOffers: payload || [],
      }

    case EXCHANGE_TYPES.SET_RECEIVED_OFFERS:
      return {
        ...state,
        receivedOffers: payload || [],
      }

    case EXCHANGE_TYPES.SET_STATS:
      return {
        ...state,
        stats: payload || initialState.stats,
      }

    case EXCHANGE_TYPES.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: payload || [],
      }

    case EXCHANGE_TYPES.SET_HISTORY:
      return {
        ...state,
        history: payload || [],
      }

    // Empire Sale
    case EXCHANGE_TYPES.SET_EMPIRE_LISTINGS:
      return {
        ...state,
        empireListings: payload?.listings || [],
        empireListingsPagination: payload?.pagination || state.empireListingsPagination,
      }

    case EXCHANGE_TYPES.SET_EMPIRE_LISTINGS_LOADING:
      return {
        ...state,
        empireListingsLoading: payload,
      }

    case EXCHANGE_TYPES.SET_MY_EMPIRE_SALE:
      return {
        ...state,
        myEmpireSale: payload || null,
      }

    case EXCHANGE_TYPES.SET_MY_TEAMS_FOR_SALE:
      return {
        ...state,
        myTeamsForSale: payload || null,
      }

    case EXCHANGE_TYPES.CLEAR_EXCHANGE:
      return initialState

    default:
      return state
  }
}

export default exchangeReducer
