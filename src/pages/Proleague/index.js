import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Old Pro League payment page — removed.
// Redirects to homepage for backward compatibility.
const Proleague = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/homepage', { replace: true })
  }, [navigate])

  return null
}

export default Proleague
