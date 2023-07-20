// This Function format digits like
// 1000 to 1k
// 10,000 to 10k
// 100,000 to 100k
// 1,000,000 to 1M

// This function take 2 parameters first(num) which is value like 10000 and second(digits) which fixed  value after dot.
// ex: DigitFormatter(24790,1)
export const DigitFormatter = (num, digits) => {
  var si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ]
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  var i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
}
