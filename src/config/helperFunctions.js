import store from '../redux/store'

export const positionOrder = {
  QB: 1,
  BQB: 2,
  RB: 3,
  FB: 4,
  WR: 5,
  TE: 6,
  G: 7,
  C: 8,
  OT: 9,
  OL: 10,
  DT: 11,
  NT: 12,
  DE: 13,
  DL: 14,
  ILB: 15,
  OLB: 16,
  LB: 17,
  CB: 18,
  S: 19,
  SS: 20,
  DB: 21,
  LS: 22,
  P: 23,
  K: 24,
}

// export const sortedArray = (arr) => {

//   return arr?.sort((a, b) => {
//     const nameA = a.players.Name !== undefined ? a.players.Name : null;
//     const nameB = b.players?.Name !== undefined ? b.players.Name : null;
// const nameComparison = nameA !== null && nameB !== null ? nameA.localeCompare(nameB) : 0;
//  const positionComparison = positionOrder[a.players.Position] - positionOrder[b.players.Position]
//   //  const nameComparison = a.players.Name.localeCompare(b.players?.Name)
//     return positionComparison !== 0 ? positionComparison : nameComparison
//   })
// }


export const sortedArray = (arr) => {
  return arr?.sort((a, b) => {
    const positionA = a?.players?.Position || '';
    const positionB = b?.players?.Position || '';
    const positionComparison = positionOrder[positionA] - positionOrder[positionB];

    const nameA = a?.players?.Name || '';
    const nameB = b?.players?.Name || '';
    const nameComparison = nameA.localeCompare(nameB);

    return positionComparison !== 0 ? positionComparison : nameComparison;
  });
};






export const sortedObject = (data) => {
  const sortedPositions = Object.keys(data)?.sort((a, b) => positionOrder[a] - positionOrder[b])
  const sortedDataArray = sortedPositions?.map((position) => ({ [position]: data[position] }))
  return sortedDataArray
}

export const getPositionColor = (value) => {
  const obj = {
    BQB: '#FFBA9E',
    K: '#D1D0C6',
    P: '#E77E7F',
    QB: '#FFE972',
    DE: '#E2E095',

    OL: '#FF72FF',
    G: '#FF72FF',
    OT: '#FF72FF',
    C: '#FF72FF',

    RB: '#FFFF72',
    FB: '#FFFF72',

    TE: '#EE909F',
    WR: '#EE909F',

    CB: '#C3E2A6',
    DB: '#C3E2A6',

    DT: '#93FF93',
    DL: '#93FF93',
    NT: '#93FF93',

    LB: '#B3F6E3',
    OLB: '#B3F6E3',
    ILB: '#B3F6E3',

    LS: '#CAFF70',

    S: '#98CCE6',
    SS: '#98CCE6',
  }
  return obj[value]
}

export const firstLetterCap = (str) => {
  return str !== '' ? str?.charAt(0).toUpperCase() + str.slice(1) : str
}

export const getPfScore = (arr) => {
  const season = store?.getState()?.user?.setting?.season
  const pf = arr?.filter((v) => v?.season == season)?.reduce((acc, obj) => acc + obj.score, 0) || 0
  const avg = pf > 0 ? pf / arr?.length : 0
  return {
    pf: pf?.toFixed(2),
    avg: avg?.toFixed(2),
  }
}


export const getRemainingSeconds = (timeString) => {
  const givenTime = new Date(timeString)
  const currentTime = new Date()
  const timeDifference = givenTime - currentTime
  const remainingSeconds = Math.floor(timeDifference / 1000)
  return remainingSeconds > 0 ? remainingSeconds : 0
}

export const getPf = (arr) => {
  if (arr && arr?.length > 0) {
    
    
    const setting = store?.getState()?.user?.setting
    const filtered = arr.filter((v) => v?.season === setting?.season && v?.week <= setting?.week)
    const tpf = filtered?.reduce((acc, obj) => acc + obj.score, 0) || 0
     const apf = tpf > 0 ? tpf / arr?.length : 0

    return {
      tpf: tpf?.toFixed(2),
      apf: apf?.toFixed(2),
    }
  } else {
    return {
      tpf: Number(0).toFixed(2),
      apf: Number(0).toFixed(2),
    }
  }
}

export const getRankAndPosition = (arr) => {
  const obj = {
    playerOverallRank: 'N/A',
    playerPositionRank: 'N/A',
  }
  if (arr && arr?.length > 0) {
    const setting = store?.getState()?.user?.setting
    const isExist = arr.find((v) => v?.season === setting?.season && v?.week === setting?.week)
    const overall = isExist?.playerOverallRank
    const position = isExist?.playerPositionRank

    if (isExist) {
      obj.playerOverallRank = overall <= 0 ? 'N/A' : `#${overall}`
      obj.playerPositionRank = position <= 0 ? 'N/A' : `#${position}`
    }
  }
  return obj
}
