import Image from '../../assets/sam-football.png'
import LeadIcon from '../../assets/lead.svg'
import DollorIcon from '../../assets/dollor-icon.svg'
import DollorIcon1 from '../../assets/dollor-icon-white.svg'
import CalendarIcon from '../../assets/calender.svg'
import LoaderIcon from '../../assets/loaderIcon.svg'
import AuctionIcon from '../../assets/auctionIcon.svg'
import DynastyIcon from '../../assets/dynasty.svg'
import TrophyIcon from '../../assets/trophy.svg'
import MultiPlayers from '../../assets/multiplayers.png'

const LeagueCard = () => {
    return (
        <div className="league-container">
            <div className="top-div">
                <img src={Image} />
                <div className='details'>
                    <h3>League # 00001</h3>
                    <p>Players</p>
                    <div className='lead'>
                        <img src={LeadIcon} />
                        <p>4-32</p>
                    </div>
                </div>
            </div>
            <div className='card-body'>
                <p>League Bid Increments Min.</p>
                <div className='price m-b-24'>
                    <div className='lead'>
                        <img src={DollorIcon} />
                        <p> $0.25</p>
                    </div>
                    <div className='lead'>
                        <img src={DollorIcon1} />
                        <p> $5.00</p>
                    </div>
                    <div className='lead'>
                        <img src={DollorIcon1} />
                        <p> $25.00</p>
                    </div>
                </div>
                <p>Draft Starts</p>
                <div className='lead m-b-24'>
                    <img src={CalendarIcon} />
                    <p> 9/01/23</p>
                </div>
                <p>League Type</p>
                <div className='price m-b-16'>
                    <div className='lead'>
                        <img src={LoaderIcon} />
                        <p>Redraft</p>
                    </div>
                    <div className='lead'>
                        <img src={AuctionIcon} />
                        <p>Auction</p>
                    </div>
                </div>
                <div className='price m-b-20'>
                    <div className='lead'>
                        <img src={DynastyIcon} />
                        <p>Dynasty</p>
                    </div>
                    <div className='lead'>
                        <img src={TrophyIcon} />
                        <p>SFL</p>
                    </div>
                </div>
            </div>
            <div className='card-bottom'>
                <div className='images'>
                    <img src={MultiPlayers} />
                </div>
                <p>3,000,000+ players</p>
            </div>
        </div>
    )
}

export default LeagueCard