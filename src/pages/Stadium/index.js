import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { IoMdArrowDropdown } from 'react-icons/io'
import { Button, Select } from 'antd'
import stadium from '../../assets/newstadium.png'
import sampointslogo from '../../assets/stadiumsampoints.webp'
import mystadium from '../../assets/mystadium.png'
import { ImArrowRight } from 'react-icons/im'
import stadiumb from '../../assets/stadium b.png'
import stadiumc from '../../assets/stadium c.png'
import stadiumd from '../../assets/stadium d.png'

const Stadium = () => {
  const teamNames = [
    'Atlanta Legion',
    'Boston Blazers',
    'Chicago Warriors',
    'Dallas Titans',
    'Houston Stars',
    'Los Angeles Vipers',
    'Miami Storm',
    'New York Guardians',
    'San Francisco Miners',
    'Seattle Thunder',
  ]
  const generateYearsArray = () =>
    Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)
  const [team, setTeam] = useState(null)
  return (
    <>
      <Header />

      <div className='stadium-main'>
        <div className='firstdiv'>
          <div className='year_selector_container'>
            <Select
              shape='circle'
              className='year_selector'
              allowClear
              placeholder={teamNames[0]}
              onChange={(value) => setTeam(value)}
              style={{ width: '56%', marginBottom: '13px' }}
              suffixIcon={<IoMdArrowDropdown size={20} color='var(--link)' />}
            >
              {teamNames.map((year, index) => (
                <Select.Option shape='circle' key={index} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
            <p>Your Stadium</p>
            <img className='stadiumimg' src={stadium} alt='stadium' />
            <p>Stadium Name</p>
            <p>TEAM NAME STADIUM</p>
            <div className='ticketcost'>
              <p>
                Average Ticket <span>Cost</span>
              </p>

              <div className='per-ticket-price'>
                <img className='samlogo' src={sampointslogo} alt='samlogo' />
                <p>85</p>
                <p>Per.Ticket</p>
              </div>
            </div>
          </div>
          <div className='daily-login-section'>
            <div className='dailylogin'>
              DAILY <span>LOGIN</span>
            </div>
            <div className='daydiv'>
              <div className='day'>DAY 1</div>
              <div className='day'>DAY 2</div>
              <div className='day'>DAY 3</div>
              <div className='day'>DAY 4</div>
            </div>
            <p>
              Seating
              <span>Capacity</span>
            </p>
            <p>60,000</p>
            <p>
              Upcoming
              <span>Home Attendance</span>
            </p>
            <p>100%</p>
            <div className='weeklyticketslaes'>
              <p>
                Total Weekly <span>Ticket Sales</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                5,100,000
              </p>

              <p>
                Total Weekly <span>Match-Up Pot</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                3,570,000
              </p>

              <p>
                Total Weekly <span>To Prize Pool</span>
              </p>

              <p>
                <img width={50} src={sampointslogo} alt='sampointslogo' />
                1,530,000
              </p>
            </div>
          </div>

          <div className='stadiumupgrade'>
            STADIUM <span>UPGARDE</span>
            <div style={{ marginTop: '10px' }} className='main-stadium-section'>
              <img className='mystadium' src={mystadium} alt='stadium' />
              <p>
                Seating
                <span>Capacity</span>
                <div className='pricecost'>
                  <p>60,000</p>
                  <ImArrowRight />
                  <p>68,000</p>
                </div>
                <p>
                  Average Ticket
                  <span>Cost</span>
                  <div className='pricecost'>
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      85
                    </p>
                    <ImArrowRight />
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      100
                    </p>
                  </div>
                </p>
              </p>

              <p>
                Upgrade
                <span>Cost</span>
                <div className='upgradepart'>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  <p>140,000,000</p>
                </div>
                <Button className='upgradebtn'>UPGRADE</Button>
              </p>
            </div>
            <div style={{ marginTop: '10px' }} className='main-stadium-section'>
              <img className='mystadium' src={stadiumb} alt='stadium' />
              <p>
                Seating
                <span>Capacity</span>
                <div className='pricecost'>
                  <p>68,000</p>
                  <ImArrowRight />
                  <p>73,000</p>
                </div>
                <p>
                  Average Ticket
                  <span>Cost</span>
                  <div className='pricecost'>
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      100
                    </p>
                    <ImArrowRight />
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      125
                    </p>
                  </div>
                </p>
              </p>

              <p>
                Upgrade
                <span>Cost</span>
                <div className='upgradepart'>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  <p>160,000,000</p>
                </div>
                <Button className='upgradebtn'>UPGRADE</Button>
              </p>
            </div>
            <div style={{ marginTop: '10px' }} className='main-stadium-section'>
              <img className='mystadium' src={stadiumc} alt='stadium' />
              <p>
                Seating
                <span>Capacity</span>
                <div className='pricecost'>
                  <p>73,000</p>
                  <ImArrowRight />
                  <p>76,000</p>
                </div>
                <p>
                  Average Ticket
                  <span>Cost</span>
                  <div className='pricecost'>
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      125
                    </p>
                    <ImArrowRight />
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      150
                    </p>
                  </div>
                </p>
              </p>

              <p>
                Upgrade
                <span>Cost</span>
                <div className='upgradepart'>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  <p>180,000,000</p>
                </div>
                <Button className='upgradebtn'>UPGRADE</Button>
              </p>
            </div>
            <div style={{ marginTop: '10px' }} className='main-stadium-section'>
              <img className='mystadium' src={stadiumd} alt='stadium' />
              <p>
                Seating
                <span>Capacity</span>
                <div className='pricecost'>
                  <p>76,000</p>
                  <ImArrowRight />
                  <p>82,000</p>
                </div>
                <p>
                  Average Ticket
                  <span>Cost</span>
                  <div className='pricecost'>
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      150
                    </p>
                    <ImArrowRight />
                    <p className='updatecolr'>
                      <img width={20} src={sampointslogo} alt='sampointslogo' />
                      200
                    </p>
                  </div>
                </p>
              </p>

              <p>
                Upgrade
                <span>Cost</span>
                <div className='upgradepart'>
                  <img width={50} src={sampointslogo} alt='sampointslogo' />
                  <p>220,000,000</p>
                </div>
                <Button className='upgradebtn'>UPGRADE</Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Stadium
