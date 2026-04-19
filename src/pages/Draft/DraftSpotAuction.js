import React, { useEffect, useState } from 'react'
import DraftAuction from '../../components/dratauction'
import { makeiswallettrue } from '../../redux'
import MessageModal from '../../components/modal/MessageModal'
import { useSelector } from 'react-redux'

const DraftSpotAuction = () => {
  const user = useSelector((state) => state.user.userDetails)

  const [modalshow, setModalShow] = useState(false)
  const handleConfirm = async () => {
    const payload = {
      userId: user?._id,
    }

    const data = await makeiswallettrue(payload)

    setModalShow(false)
  }

  useEffect(() => {
    if (user && !user?.iswallet) {
      setModalShow(true)
    }
  }, [user])

  return (
    <>
      <DraftAuction />
      <MessageModal key={'modal'} visible={modalshow} onClose={handleConfirm} />
    </>
  )
}

export default DraftSpotAuction
