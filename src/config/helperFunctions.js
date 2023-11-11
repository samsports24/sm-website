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
