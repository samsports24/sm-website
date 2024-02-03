import Navbar from './Navbar'
import HeroSection from './HeroSection'
import TeamSection from './TeamSection'
import LeagueSection from './LeagueSection'
import ImproveTeamSection from './ImproveTeamSection'

const LandingPage = () => {
  return (
    <div className='main-landing'>
      <Navbar />
      <HeroSection />
      <TeamSection />
      <LeagueSection />
      <ImproveTeamSection />
    </div>
  )
}

export default LandingPage
