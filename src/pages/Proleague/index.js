import React, { useEffect, useState } from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Button, Col, Image, Row } from 'antd'
import { useNavigate } from 'react-router-dom'
import pro from '../../assets/proleague.png'
import stripe from '../../assets/stripe.png'
import sampointslogo from '../../assets/samcoinlogo.png'
import GmRatingModal from '../../components/modal/GmRating'

const Proleague = () => {
  const [modalshow, setModalShow] = useState(true)
  const handleCancel= ()=>{
    setModalShow(false);
  }

  const navigate=useNavigate()
  return (
    <>
      <div className='select_game_container select_league_container'>
        <SelectGameLeft logo={localStorage.getItem('imagePath')} />
        <SelectGameRight>
          <div className='pro_league_body'>
            <h1>PRO LEAGUE</h1>

            <div className='new-league_joining_card'>
              <div className='firstbox'>
                <div className='circle'>
                  <Image className='myimg' src={pro} alt='league' />
                </div>
                <div className='description'>
                  <p>
                    <span className='text1'>samSports Pro Leagues</span> offer an exclusive fantasy
                    football experience for serious players, combining realistic GM simulation,
                    advanced drafting tools, and cash prize pools. Members pay an annual fee for
                    access to GM ratings, a trade calculator, and competitive gameplay against top
                    enthusiasts. Join to compete, strategize, and immerse yourself in the ultimate
                    fantasy football challenge!
                  </p>
                </div>
              </div>
              <div className='annualfee'>
                <p>SamSports PRO LEAGUE ANUAL FEE</p>

                <p>$49.99</p>
              </div>
              <div>
                <div className='league-package'>
                  <div className='pro-league-package'>
                    <h2>Pro League Package:</h2>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                    <p>SamPoints</p>
                    
                        <div style={{display:'flex',gap:'20px'}}>
                        <Image  width={33}  preview={false} src={sampointslogo} alt='league' />
                        
                        <p>1,000,000
                        <div className='moreinfo'>MoreInfo</div>
                        </p>
                        </div>
                        </div>
                   
                    <p style={{marginTop:'-44px'}}>GM Rating</p>
                    <p>Trade calculator</p>
                    <p>In-Game Prize Pool</p>
                    <p>Beta Tester Badge</p>
                  </div>

                  <div className='pro-league-package'>
                    <h2>League Prize-Pool</h2>
                    <h3>1st place $500 + $500 dollars worth of SamPoints </h3>
                    <h3>2nd place $250 & $300 in SamPoints</h3>
                    <h3>3 & 4 $300 in SamPoints</h3>
                    <h3>5-8 $250 in SamPoints</h3>
                    <h3>9- 14 $2240 in SamPoints</h3>

                    <h3>15-20 200$ in SamPoints</h3>
                    <h3>21-25 $175 in SamPoints</h3>
                    <h3>26-32 $150 in SamPoints</h3>
                    <h3>Regular Season winner $150 in SamPoints</h3>
                    <h3>Each Conference winner $75 in SamPoints</h3>
                  </div>
                </div>
              </div>
              <div></div>
            </div>

            <div style={{ marginBottom: '20px' }} className='sam-pro-anaual-fee'>
              <p>
                You will have the ability to invite as many users as you &apos;d like by clicking on
                the <span>Clubhouse</span>tab. Based on your Referral Level, you can earn Sam Points
                for each successful user registration.
              </p>
              <p style={{ marginTop: '20px', fontWeight: 700 }}>
                SamSports PRO LEAGUE ANUAL FEE
                <div className='price'>$49.99</div>
                <div className='stripebtn'>
                  <Button onClick={() => navigate('fantasy-league')} type='primary'>PAY WITH Stripe</Button>
                  {/* <img className='stripecicle' src={stripe} alt='stripe'/> */}
                  {/* <div className='stripecicle'>
            <p>Stripe</p>
        </div> */}
                </div>
              </p>
            </div>
          </div>
        </SelectGameRight>
      </div>

      <GmRatingModal
        key={'modal'}
        visible={modalshow}
        onCancel={handleCancel}
      />
    </>
  )
}

export default Proleague
