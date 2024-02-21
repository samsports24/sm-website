import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'antd/dist/reset.css'

import '../styles/style.css'
import Routes from './Routes'
import { light, dark } from './theme'
import { getUser } from '../redux'
import { ethers } from 'ethers'
// import { version } from './constants'
// import { notification } from 'antd'

// import io from 'socket.io-client'
// import { base_url } from './constants'

const App = () => {
  const theme = useSelector((state) => state.theme.theme)
  const dispatch = useDispatch()
  // const socket = io(base_url, {
  //   transports: ['websocket'],
  // })

  useEffect(() => {
    if (theme === 'light') {
      Object.keys(light).forEach((key) => {
        document.body.style.setProperty(`--${key}`, light[key])
      })
    } else {
      Object.keys(dark).forEach((key) => {
        document.body.style.setProperty(`--${key}`, dark[key])
      })
    }
  }, [theme])

  // const connectWallet = async () => {
  //   if (window?.ethereum) {
  //     window?.ethereum
  //       .request({ method: 'eth_accounts' })
  //       .then(async (accounts) => {
  //         if (accounts.length === 0) {
  //           console.log("You're not connected to MetaMask")
  //         } else {
  //           let currentAccount = accounts[0]
  //           const provider = new ethers.BrowserProvider(window?.ethereum)
  //           const walletBalance = await provider.getBalance(currentAccount)
  //           console.log('currentAccount', currentAccount, walletBalance)

  //           dispatch({
  //             type: 'SET_ADDRESS_AND_BALANCE',
  //             payload: {
  //               address: currentAccount,
  //               balance: ethers.formatEther(walletBalance),
  //             },
  //           })
  //         }
  //       })
  //       .catch(console.error)

  //     // const provider = new ethers.BrowserProvider(window?.ethereum)

  //     // try {
  //     //   const accounts = await provider.send('eth_requestAccounts', [])
  //     //   if (accounts.length) {
  //     //     const connectedAddress = accounts[0]
  //     //     const walletBalance = await provider.getBalance(connectedAddress)
  //     //     dispatch({
  //     //       type: 'SET_ADDRESS_AND_BALANCE',
  //     //       payload: {
  //     //         address: connectedAddress,
  //     //         balance: ethers.formatEther(walletBalance),
  //     //       },
  //     //     })
  //     //   }
  //     // } catch (err) {
  //     //   console.error("error connecting wallet : " , err)
  //     // }
  //   }
  // }

  useEffect(() => {
    // connectWallet()

    // if (localStorage.getItem('version') !== version) {
    //   window.location.href = '/login'
    //   localStorage.clear()
    //   localStorage.setItem('version', version)
    //   notification.error({
    //     message: `Try login again!`,
    //     duration: 6,
    //   })
    // }
    if (localStorage.getItem('token')) {
      dispatch(getUser())
    }
    // socket.emit('join', 'yolooooooooooooooooo')
    // socket.on('test', (data) => {
    //   console.log(data)
    // })
  }, [])

  return <Routes />
}

export default App
