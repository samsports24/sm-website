import React, { useEffect, useState } from 'react'

import Header from '../../components/Header'
import Loader from '../../components/Loader'
import { useSelector } from 'react-redux'
import teamlogo from '../../assets/beast-square-2.png'
import { Image, Badge, Spin, Button } from 'antd'
import { getDraftRound, makeBid } from '../../redux/actions/draftAction'
import sampointslogo from '../../assets/samcoinlogo.png'
import MessageModal from '../../components/modal/MessageModal'
import { getLeagueDetails } from '../../redux'
const DraftSpotAuction = () => {
  const { draftRounds } = useSelector((state) => state.draft)
  const [bidAmount, setBidAmount] = useState('')
  const [data, setData] = useState('')

  const { currentLeague } = useSelector((state) => state.league)
  console.log('🚀 ~ ClockComponent ~ currentLeague:', currentLeague)

  const handleInputChange = (e) => {
    setBidAmount(e.target.value)
  }
  const user = useSelector((state) => state.user.userDetails)

  console.log('user', user?.iswallet)

  const [loading, setLoading] = useState(true)
  const [modalshow, setModalShow] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  const handleConfirm = () => {
    setModalShow(false)
  }

  const myleague = async () => {
    await getLeagueDetails()
  }



  useEffect(() => {
    if (user) {
      if (user?.iswallet === false) {
        setModalShow(true)
      } else if (user?.iswallet === true) {
        setModalShow(false)
      }
    }
  }, [user])

  //  console.log('currentLeague?.draftStart', currentLeague)

  let ConfDiv = [
    {
      position: 1,
      name: 'Apex',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },
    {
      position: 2,
      name: 'Ascendancy',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eedf60a538b0337c4bb9',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
    },

    {
      position: 3,
      name: 'Prestige',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eef060a538b0337c4d1f',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
    },
    {
      position: 4,
      name: 'Dominance',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ec7860a538b0337c0dbe',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },

    {
      position: 5,
      name: 'Excellence',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6eca560a538b0337c1129',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },
    {
      position: 6,
      name: 'Superior',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eee960a538b0337c4c44',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
    },

    {
      position: 7,
      name: 'Vanguard',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eefb60a538b0337c4dda',
    },
    {
      position: 8,
      name: 'Pinnacle',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },

    {
      position: 9,
      name: 'Pinnacle',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
    },
    {
      position: 10,
      name: 'Vanguard',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eefb60a538b0337c4dda',
    },

    {
      position: 11,
      name: 'Superior',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eee960a538b0337c4c44',
    },
    {
      position: 12,
      name: 'Excellence',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6eca560a538b0337c1129',
    },

    {
      position: 13,
      name: 'Dominance',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ec7860a538b0337c0dbe',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },
    {
      position: 14,
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eef060a538b0337c4d1f',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      name: 'Prestige',
    },

    {
      position: 15,
      name: 'Ascendancy',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eedf60a538b0337c4bb9',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
    },
    {
      position: 16,
      name: 'Apex',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },

    {
      position: 17,
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
      name: 'elite',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },
    {
      position: 18,
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eedf60a538b0337c4bb9',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      name: 'Ascendancy',
    },

    {
      position: 19,
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eef060a538b0337c4d1f',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      name: 'Prestige',
    },

    {
      position: 20,
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      name: 'Dominance',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ec7860a538b0337c0dbe',
    },

    {
      position: 21,
      name: 'Excellence',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6eca560a538b0337c1129',
    },
    {
      position: 22,
      name: 'Superior',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eee960a538b0337c4c44',
    },
    {
      position: 23,
      name: 'Vanguard',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eefb60a538b0337c4dda',
    },

    {
      position: 24,
      name: 'Pinnacle',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
    },

    {
      position: 25,
      name: 'Pinnacle',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6ecc460a538b0337c1a6c',
    },
    {
      position: 26,
      name: 'Vanguard',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eefb60a538b0337c4dda',
    },

    {
      position: 27,
      name: 'Superior',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eee960a538b0337c4c44',
    },

    {
      position: 28,
      name: 'Excellence',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6eca560a538b0337c1129',
    },

    {
      position: 29,
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
      name: 'Dominance',
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ec7860a538b0337c0dbe',
    },
    {
      position: 30,
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eef060a538b0337c4d1f',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      name: 'Prestige',
    },

    {
      position: 31,
      conference: '65d6ebd560a538b0337c01c0',
      division: '65d6eedf60a538b0337c4bb9',
      imageurl: 'https://samsports.s3.us-west-1.amazonaws.com/17175808405745716.180818305749.png',
      name: 'Ascendancy',
    },

    {
      position: 32,
      conference: '65d6eb7560a538b0337bfabc',
      division: '65d6ecc460a538b0337c1a6c',
      name: 'Apex',
      imageurl: 'https://samsports.s3.amazonaws.com/17175803434309120.539375051409.png',
    },
  ]

  const getData = async () => {
    await getDraftRound()
    return true
  }

  useEffect(() => {
    myleague()
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getData()
        if (res) {
          setData(res)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!currentLeague?.draftStart) return

      const now = new Date().getTime()
      const draftStart = new Date(currentLeague.draftStart).getTime() - 3600000 // Subtract 1 hour (3600000 ms)
      const distance = draftStart - now

      if (distance < 0) {
        setTimeRemaining({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`)

      setTimeRemaining({
        days: formatTime(days),
        hours: formatTime(hours),
        minutes: formatTime(minutes),
        seconds: formatTime(seconds),
      })
    }

    const timer = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(timer)
  }, [currentLeague?.draftStart])

  const handleMakeBid = async () => {
    setLoading(true)
    try {
      const payload = {
        leagueid: user?.team?.currentLeague._id,
        bidamount: parseFloat(bidAmount),
        teamid: user?.team?._id,
      }

      const data = await makeBid(payload)
      console.log('Bid placed successfully:', data)
      const res = await getData()
      if (res) {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error making bid:', error)
    }
  }

  const sortedDraftRounds = draftRounds?.sort((a, b) => a.position - b.position)

 
  const mysortedDraftRounds = [
    { position: 1, bidamount: 372518, team: { logo: teamlogo, user: { userName: 'samsmith' } } },
    { position: 2, bidamount: 479585, team: { logo: teamlogo, user: { userName: 'janedoe' } } },
    { position: 3, bidamount: 209192, team: { logo: teamlogo, user: { userName: 'johndoe' } } },
    { position: 4, bidamount: 906395, team: { logo: teamlogo, user: { userName: 'janedoe123' } } },
    { position: 5, bidamount: 124217, team: { logo: teamlogo, user: { userName: 'alexjones' } } },
    { position: 6, bidamount: 726833, team: { logo: teamlogo, user: { userName: 'maryjane' } } },
    { position: 7, bidamount: 685527, team: { logo: teamlogo, user: { userName: 'peterparker' } } },
    { position: 8, bidamount: 234456, team: { logo: teamlogo, user: { userName: 'tonystark' } } },
    { position: 9, bidamount: 524528, team: { logo: teamlogo, user: { userName: 'steverogers' } } },
    { position: 10, bidamount: 865377, team: { logo: teamlogo, user: { userName: 'brucewayne' } } },
    { position: 11, bidamount: 494852, team: { logo: teamlogo, user: { userName: 'clarkkent' } } },
    { position: 12, bidamount: 101274, team: { logo: teamlogo, user: { userName: 'barryallen' } } },
    {
      position: 13,
      bidamount: 675839,
      team: { logo: teamlogo, user: { userName: 'dianaprince' } },
    },
    {
      position: 14,
      bidamount: 739202,
      team: { logo: teamlogo, user: { userName: 'arthurcurry' } },
    },
    {
      position: 15,
      bidamount: 813594,
      team: { logo: teamlogo, user: { userName: 'vincentvega' } },
    },
    {
      position: 16,
      bidamount: 647235,
      team: { logo: teamlogo, user: { userName: 'juleswinnfield' } },
    },
    {
      position: 17,
      bidamount: 212896,
      team: { logo: teamlogo, user: { userName: 'hanniballecter' } },
    },
    {
      position: 18,
      bidamount: 325874,
      team: { logo: teamlogo, user: { userName: 'claricestarling' } },
    },
    {
      position: 19,
      bidamount: 758294,
      team: { logo: teamlogo, user: { userName: 'petergriffin' } },
    },
    {
      position: 20,
      bidamount: 925731,
      team: { logo: teamlogo, user: { userName: 'loisgriffin' } },
    },
    {
      position: 21,
      bidamount: 451273,
      team: { logo: teamlogo, user: { userName: 'briangriffin' } },
    },
    {
      position: 22,
      bidamount: 529134,
      team: { logo: teamlogo, user: { userName: 'stewiegriffin' } },
    },
    { position: 23, bidamount: 687235, team: { logo: teamlogo, user: { userName: 'megmom' } } },
    {
      position: 24,
      bidamount: 632688,
      team: { logo: teamlogo, user: { userName: 'chrisgriffin' } },
    },
    {
      position: 25,
      bidamount: 717930,
      team: { logo: teamlogo, user: { userName: 'glennquagmire' } },
    },
    { position: 26, bidamount: 433150, team: { logo: teamlogo, user: { userName: 'joeswanson' } } },
    {
      position: 27,
      bidamount: 541575,
      team: { logo: teamlogo, user: { userName: 'clevelandbrown' } },
    },
    {
      position: 28,
      bidamount: 354487,
      team: { logo: teamlogo, user: { userName: 'carterpewterschmidt' } },
    },
    { position: 29, bidamount: 708276, team: { logo: teamlogo, user: { userName: 'seamus' } } },
    { position: 30, bidamount: 12104, team: { logo: teamlogo, user: { userName: 'tricia' } } },
    {
      position: 31,
      bidamount: 110427,
      team: { logo: teamlogo, user: { userName: 'mortgoldman' } },
    },
    { position: 32, bidamount: 992571, team: { logo: teamlogo, user: { userName: 'jerome' } } },
  ]

  return (
    <>
      <Header />

      <MessageModal visible={modalshow} onClose={handleConfirm} />

      {loading ? (
        <Loader />
      ) : (
        <div className='main_draft_Spot_Auction'>
          <div className='main'>
            <div className='firstdiv'>
              <div className='w1'>PICK</div>
              <div className='w2'>USER & BID</div>
              <div className='w3'>CONFERENCE AND DIVISION</div>
            </div>

            <div className='seconddiv'>
              <div>TIME LEFT</div>
            </div>
          </div>

          <div className='mygap' style={{ display: 'flex', gap: '90px' }}>
            <div style={{ width: '60%', height: '500px', overflowY: 'auto' }}>
              {sortedDraftRounds?.map((item, index) => {
                const confDivItem = ConfDiv.find((conf) => conf?.position === item?.position)

                return (
                  <div key={index} className='mainauctionround'>
                    <div className='auctionpick'>{item?.position}</div>

                    <div className='userbidimg'>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div className='teamimg'>
                          <Image src={item?.team?.logo} alt='teamlogo' />
                        </div>
                        <div className='username'>
                          USERNAME
                          <div className='user'>{item?.team?.user?.userName}</div>
                        </div>
                      </div>
                      <div>
                        <div className='bidtext'>Bid</div>
                        <div style={{ display: 'flex', gap: '40px' }}>
                          {/* <Image  preview={false} src={sampointslogo} alt='teamlogo' /> */}
                          <img className='sampointsimg' src={sampointslogo} alt='teamlogo' />

                          <div className='bid'>{item?.bidamount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className='confernceanddivision'>
                      <div style={{ display: 'flex', gap: '20px', marginLeft: '44px' }}>
                        <div className='divisionimg'>
                          <Image preview={false} src={confDivItem?.imageurl} alt='divisionlogo' />
                        </div>
                        <div className='divisionname'>{confDivItem?.name}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='timeremains'>
              {/* <div className='timemaindiv'>
                <div className='timeheading'>
                  DAYS
                  <div className='timepara'>01</div>
                </div>

                <div className='timeheading'>
                  HOURS
                  <div className='timepara'>12:</div>
                </div>

                <div className='timeheading'>
                  MINUTES
                  <div className='timepara'>42:</div>
                </div>

                <div className='timeheading'>
                  SECONDS
                  <div className='timepara'>32</div>
                </div>
              </div> */}

              <div className='timemaindiv'>
                <div className='timeheading'>
                  DAYS
                  <div className='timepara'>{timeRemaining?.days}</div>
                </div>
                <div className='timeheading'>
                  HOURS
                  <div className='timepara'>{timeRemaining?.hours}:</div>
                </div>
                <div className='timeheading'>
                  MINUTES
                  <div className='timepara'>{timeRemaining?.minutes}:</div>
                </div>
                <div className='timeheading'>
                  SECONDS
                  <div className='timepara'>{timeRemaining?.seconds}</div>
                </div>
              </div>

              <div className='bidheading'>
                <div className='head'>
                  YOUR
                  <div className='bidpara'>BID</div>
                </div>

                <input
                  type='number'
                  className='inputtag'
                  placeholder='0'
                  //  placeholder='Enter bid amount'
                  value={bidAmount}
                  onChange={handleInputChange}
                />
                <div onClick={handleMakeBid} className='submitbtn'>
                  Submit
                </div>

                <div style={{ marginTop: '-42px' }} className='bidheading'>
                  <div className='head'>
                    YOUR
                    <div className='bidpara'>DRAFTSPOT</div>
                  </div>
                </div>
              </div>

              {/* <div style={{ display: 'flex' }}>
              <div className='auctionpick'>1</div>

              <div className='userbidimg'>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className='teamimg'>
                    <Image preview={false} src={teamlogo} alt='teamlogo' />
                  </div>
                  <div className='username'>
                    USERNAME
                    <div className='user'>USER1223</div>
                  </div>
                </div>
                <div>
                  <div className='bidtext'>Bid</div>
                  <div style={{ display: 'flex' }}>
                    <div>
                      <Image width={70} preview={false} src={coin} alt='teamlogo' />
                    </div>
                    <div className='bid'>62,000</div>
                  </div>
                </div>
              </div>
            </div> */}

              <div>
                {draftRounds.map((draftRound, index) => {
                  if (user?._id === draftRound?.team?.user._id) {
                    return (
                      <div key={index} style={{ display: 'flex' }}>
                        <div className='auctionpick'>{draftRound?.position}</div>

                        <div className='userbidimg'>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            <div className='teamimg'>
                              <Image preview={false} src={draftRound?.team?.logo} alt='teamlogo' />
                            </div>
                            <div className='username'>
                              USERNAME
                              <div className='user'>{draftRound?.team?.user?.userName}</div>
                            </div>
                          </div>
                          <div>
                            <div className='bidtext'>Bid</div>
                            <div style={{ display: 'flex' }}>
                              {/* <Image  preview={false} src={sampointslogo} alt='teamlogo' /> */}
                              <img className='sampointsimg' src={sampointslogo} alt='teamlogo' />
                              {/* <img className='sampointslogo' src={sampointslogo} alt='teamlogo' /> */}

                              <div className='bid'>{draftRound?.bidamount?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null // Render nothing if the condition is not met
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DraftSpotAuction
