import React, { useState, useContext } from 'react'
import { Button, message } from 'antd'
import { ethers } from 'ethers'
import { useDispatch, useSelector } from 'react-redux'

const ConnectWallet = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const {address , balance} = useSelector(state => state.contract)

  const connectEthereumWallet = async () => {
    setLoading(true)

    if (!window?.ethereum) {
      message.error('Ethereum provider not detected')
      setLoading(false)
      return
    }

    const provider = new ethers.BrowserProvider(window?.ethereum)

    try {
      // This will request the user to grant permission to access their Ethereum wallet
      const accounts = await provider.send('eth_requestAccounts', [])
      // console.log(accounts)
      if (accounts.length) {
        message.success(`Connected to ${accounts[0]}`)
        // navigate('/connect-wallet') // Navigate after successful connection
        // document.getElementById('walletStatus').textContent = 'Connected'
        const connectedAddress = accounts[0]
        const walletBalance = await provider.getBalance(connectedAddress)

        // console.log('connected wallet : ', {
        //   connectedAddress,
        //   walletBalance: ethers.formatEther(walletBalance),
        // })
        // redux here
        dispatch({
          type: 'SET_ADDRESS_AND_BALANCE',
          payload: {
            address: connectedAddress,
            balance: ethers.formatEther(walletBalance),
          },
        })
        // context.setAddress(connectedAddress)
        // context.setBalance(ethers.formatEther(walletBalance))
        // document.getElementById('walletStatus').textContent = 'Connected'
        // setWalletStatus(true)
      } else {
        message.warn('No account connected')
      }
    } catch (err) {
      message.error('Failed to connect to wallet')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className='connect-wallet-page'>
      {/* <div className='top'> */}
      {/* <img src={SamLogo} /> */}
      {address ? <Button
        type='primary'
        disabled
        className='custom_tooltip_button'
        style={{color : "white"}}
      >
        Wallet Connected {`${address?.slice(0,7)}...${address?.slice(-5,address?.length)}`}
      </Button> : <Button
        type='primary'
        id='walletStatus'
        className='custom_tooltip_button'
        onClick={connectEthereumWallet}
        loading={loading}
      >
        Connect Metamask
      </Button>}
      {/* </div> */}
      {/* <div className='content'>
        <p className='title'>Private Sales</p>
        <p className='timer'>Timer : 10:00</p>
        <p className='duration'>Duration : 7 days left</p>
      </div> */}
    </div>
  )
}

export default ConnectWallet
