const STATIC_DATA = [
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'te',
    classKey: 'offense_te',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-1.png'),
    Name: '',
    Position: 'ol',
    classKey: 'offense_ol-1',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-6.png'),
    Name: '',
    Position: 'ol',
    classKey: 'offense_ol-2',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'ol',
    classKey: 'offense_ol-3',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'ol',
    classKey: 'offense_ol-4',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-1.png'),
    Name: '',
    Position: 'ol',
    classKey: 'offense_ol-5',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'wr',
    classKey: 'offense_wr-1',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-4.png'),
    Name: '',
    Position: 'rb/wr/te',
    classKey: 'offense_rbwrte',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-3.png'),
    Name: '',
    Position: 'qb',
    classKey: 'offense_qb-1',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'rb',
    classKey: 'offense_rb',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-3.png'),
    Name: '',
    Position: 'wr',
    classKey: 'offense_wr-2',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'backup qb',
    classKey: 'offense_qb-2',
    type: 'offense',
  },
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'cb/s',
    classKey: 'defense_cbs',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-1.png'),
    Name: '',
    Position: 'lb',
    classKey: 'defense_lb-1',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-6.png'),
    Name: '',
    Position: 'lb',
    classKey: 'defense_lb-2',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'lb/cb/s',
    classKey: 'defense_lbcbs',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'cb',
    classKey: 'defense_cb-1',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-1.png'),
    Name: '',
    Position: 's',
    classKey: 'defense_s',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'de',
    classKey: 'defense_de',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-4.png'),
    Name: '',
    Position: 'dt',
    classKey: 'defense_dt',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-3.png'),
    Name: '',
    Position: 'dt/de',
    classKey: 'defense_dtde',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-5.png'),
    Name: '',
    Position: 'dt/lb',
    classKey: 'defense_dtlb',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-3.png'),
    Name: '',
    Position: 'cb',
    classKey: 'defense_cb-2',
    type: 'defense',
  },
  {
    imageUrl: require('../../assets/player-img-2.png'),
    Name: '',
    Position: 'k',
    classKey: 'special_team_pk',
    type: 'special team',
  },
  {
    imageUrl: require('../../assets/player-img-6.png'),
    Name: '',
    Position: 'p',
    classKey: 'special_team_pn',
    type: 'special team',
  },
]

const initialState = {
  isLoading: true,
  data: [],
  staticData: STATIC_DATA,
  activeCount: null,
  activeFilter: 'offense',
}

const depthChartReducer = (state = initialState, action) => {
  const { type, payload } = action
  switch (type) {
    case 'SET_DEPTH_CHART_LOADING': {
      return {
        ...state,
        isLoading: payload,
      }
    }
    default:
      return state
  }
}

export default depthChartReducer
