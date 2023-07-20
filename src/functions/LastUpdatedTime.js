import moment from 'moment'

// This function return last update time like
// if we pass parameter of 2 hours ago time like this moment().subtract('hour', 2)
// its return with 2 hours(s) ago
export default function LastUpdatedTime(time) {
  if (time == undefined) return time
  let diff = moment().diff(time) / 1000

  if (diff < 0.5) {
    return 'Just Now'
  } else if (diff > 60) {
    // 3600 seconds is equal to 1 Hour
    if (diff > 3600) {
      // 86400 seconds is equal to 1 Day
      if (diff > 86400) {
        // 2592000 seconds is equal to 1 Month
        if (diff > 2592000) {
          // 31536000 seconds is equal to 1 year
          if (diff > 31536000) {
            return `${(diff / 31536000).toFixed(1)} Year(s) ago`
          } else {
            return `${(diff / 2592000).toFixed(1)} Month(s) ago`
          }
        } else {
          return `${(diff / 86400).toFixed(0)} day(s) ago`
        }
      } else {
        return `${(diff / 3600).toFixed(0)} hour(s) ago`
      }
    } else {
      return `${(diff / 60).toFixed(0)} minute(s) ago`
    }
  } else {
    return `Few seconds ago`
  }
}
