import store from '../redux/store'

export const sortedArray = (arr) => {
  return arr?.sort((a, b) => {
    const positionOrder = {
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
      P: 22,
      K: 23,
    }
    const positionComparison = positionOrder[a.players.Position] - positionOrder[b.players.Position]
    const nameComparison = a.players.Name.localeCompare(b.players.Name)
    return positionComparison !== 0 ? positionComparison : nameComparison
  })
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
