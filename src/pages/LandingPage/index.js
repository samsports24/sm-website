import Navbar from './Navbar'
import HeroSection from './HeroSection'
import TeamSection from './TeamSection'
import LeagueSection from './LeagueSection'
import ImproveTeamSection from './ImproveTeamSection'
import DraftTeamSection from './DraftTeamSection'
import CommunitySection from './CommunitySection'
// import PopularLeagueSection from './PopularLeagueSection'
import FantasySportsSection from './FantasySportsSection'

const LandingPage = () => {
  return (
    <div className='main-landing'>
      <Navbar />
      <HeroSection />
      <TeamSection />
      <LeagueSection />
      <ImproveTeamSection />
      <DraftTeamSection />
      <CommunitySection />
      {/* <PopularLeagueSection /> */}
      <FantasySportsSection />
    </div>
  )
}

export default LandingPage
