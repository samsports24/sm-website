import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const PlayerLiveAuction = () => {
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to auction page with the auction ID so the modal opens over the cards
    navigate(`/player-auction?bid=${params?.id}`, { replace: true })
  }, [])

  return null
}

export default PlayerLiveAuction
