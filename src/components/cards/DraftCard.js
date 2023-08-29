import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

import LeadIcon from '../../assets/lead.svg'
import DollorIcon from '../../assets/dollor-icon.svg'
import DollorIcon1 from '../../assets/dollor-icon-white.svg'
import CalendarIcon from '../../assets/calender.svg'
import TrophyIcon from '../../assets/trophy.svg'

const DraftCard = () => {
  const navigate = useNavigate()

  return (
    <div className='draft-container'>
      <div className='top-div'>
        <div className='details'>
          <p>League Name</p>
          <h3>Sam Football league #00001</h3>
        </div>
        <div className='btn-container'>
          <Button
            onClick={() => {
              navigate('/choose-your-league-step4')
            }}
          >
            Join
          </Button>
        </div>
      </div>
      <div className='card-body'>
        <div className='widgets-div'>
          <div className='widget-box'>
            <p>Players</p>
            <div className='lead'>
              <img src={LeadIcon} />
              <p>4-32</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>Draft Starts</p>
            <div className='lead'>
              <img src={CalendarIcon} />
              <p>9/01/23</p>
            </div>
          </div>
          <div className='widget-box'>
            <p>League Type</p>
            <div className='lead'>
              <img src={TrophyIcon} />
              <p>SFL</p>
            </div>
          </div>
        </div>
        <div className='widgets-div'>
          <div className='widget-box'>
            <p>League Bid Increments Min.</p>
            <div className='lead'>
              <img src={DollorIcon} />
              <p>$0.25</p>
            </div>
          </div>
          <div className='widget-box'>
            <p></p>
            <div className='lead'>
              <img src={DollorIcon1} />
              <p>$5.00</p>
            </div>
          </div>
          <div className='widget-box'>
            <p></p>
            <div className='lead'>
              <img src={DollorIcon1} />
              <p>$25.00</p>
            </div>
          </div>
        </div>
        <div className='draft-table'>
          <div className='table-head'>
            <h3>Current Draft Order</h3>
          </div>
          <div className='table-row'>
            <p>101= USER123</p>
            <div className='lead'>
              <img src={DollorIcon} />
              <p>$15.25</p>
            </div>
          </div>
          <div className='table-row'>
            <p>102= USER2223</p>
            <div className='lead'>
              <img src={DollorIcon} />
              <p>$15.00</p>
            </div>
          </div>
          <div className='table-row'>
            <p>103= USER345</p>
            <div className='lead'>
              <img src={DollorIcon} />
              <p>$14.25</p>
            </div>
          </div>
          <div className='table-row'>
            <p>104= 105= USER454</p>
            <div className='lead'>
              <img src={DollorIcon} />
              <p>$0.00</p>
            </div>
          </div>
          <div className='table-row'>
            <p>105= Unowned Team</p>
            <div className='lead'>
              <img src={DollorIcon1} />
              <p>$0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftCard
