import { Routes, Route, BrowserRouter, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom'
import PrivateWrapper from './PrivateRoutes'
import AdminRoute from './AdminRoute'
import Layout from '../layout/Layout'
import React, { Suspense, lazy, useEffect } from 'react'
import { Spin, notification } from 'antd'

import { version } from './constants'
import DraftCountdownPopup from '../components/DraftCountdownPopup'
import AnnouncementBanner from '../components/AnnouncementBanner'
import { trackPageView } from '../utils/analytics'

// Auto-track page views on route change
const PageTracker = () => {
  const location = useLocation()
  useEffect(() => { trackPageView(location.pathname) }, [location.pathname])
  return null
}

// ── Eagerly load only the 404/fallback page ──
import ComingSoon from '../pages/CommingSoon'

// ── Lazy-load LandingPage (heavy component with many sub-widgets) ──
const LandingPage = lazy(() => import('../pages/LandingPage'))

// ── Lazy-load everything else ──
const Login = lazy(() => import('../pages/Login'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const Authentication = lazy(() => import('../pages/Authentication'))
const EmailVerification = lazy(() => import('../components/EmailVerification'))
const NewSignUp = lazy(() => import('../pages/NewSignUp'))
const NewHomePage = lazy(() => import('../pages/NewHomePage'))
const FantasyLeague = lazy(() => import('../pages/FantasyLeague'))
const LeagueScore = lazy(() => import('../pages/LeagueScore'))
const GameDetails = lazy(() => import('../pages/GameDetails'))
const ProfessionalLeague = lazy(() => import('../pages/ProfessionalLeague'))
const PublicLeague = lazy(() => import('../pages/PublicLeague'))
const EditProfile = lazy(() => import('../pages/EditProfile'))
const LeagueStandings = lazy(() => import('../pages/LeagueStandings'))
const Playoff = lazy(() => import('../pages/Playoff'))
const DepthChart = lazy(() => import('../pages/DepthChart'))
const PlayerRoster = lazy(() => import('../pages/PlayerRoster'))
const PlayerInterface = lazy(() => import('../pages/PlayerInterface2'))
const TeamSchedule = lazy(() => import('../pages/TeamSchedule'))
const TeamSetting = lazy(() => import('../pages/TeamSettings'))
const InjuredReserve = lazy(() => import('../pages/InjuredReserve'))
const AgentPlayerInterface = lazy(() => import('../pages/AgentPlayerInterface'))
const PlayerAuction = lazy(() => import('../pages/PlayerAuction'))
const PlayerLiveAuction = lazy(() => import('../pages/PlayerLiveAuction'))
const PlayerWinningBid = lazy(() => import('../pages/PlayerWinningBid'))
const ChooseYourGame = lazy(() => import('../pages/ChooseYourGame'))
const ChooseYourLeague = lazy(() => import('../pages/ChooseYourLeague'))
const ChooseYourLeagueStep3 = lazy(() => import('../pages/ChooseYourLeagueStep3'))
const ChooseYourLeagueStep4 = lazy(() => import('../pages/ChooseYourLeague4'))
const TermsAndCondition = lazy(() => import('../pages/TermsAndCondition'))
const TermsOfService = lazy(() => import('../pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))
const EUPrivacyRights = lazy(() => import('../pages/EUPrivacyRights'))
const CookiePolicy = lazy(() => import('../pages/CookiePolicy'))
const GDPRCompliance = lazy(() => import('../pages/GDPRCompliance'))
const DataRights = lazy(() => import('../pages/DataRights'))
const Contact = lazy(() => import('../pages/Contact'))
const LeagueNotification = lazy(() => import('../pages/LeagueNotification'))
const TotalPayment = lazy(() => import('../pages/TotalPayment'))
const MyLeague = lazy(() => import('../pages/MyLeague'))
const League = lazy(() => import('../pages/League'))
const TeamTrade = lazy(() => import('../pages/TeamTrade'))
const CounterTrade = lazy(() => import('../pages/CounterTrade'))
const PublicDraft = lazy(() => import('../pages/Draft/PublicDraft'))
const AllTransaction = lazy(() => import('../pages/AllTransaction/AllTransaction'))
const Draft = lazy(() => import('../pages/Draft'))
const TeamRoster = lazy(() => import('../pages/TeamRoster'))
const TeamFinancials = lazy(() => import('../pages/TeamFinancials'))
const LeagueRosters = lazy(() => import('../pages/LeagueRosters'))
const SelectGame = lazy(() => import('../pages/SelectGame'))
const SelectLeague = lazy(() => import('../pages/SelectLeague'))
// Old CreateOrJoinLeague removed, /create-join-league now redirects to /onboarding
const Comissioner = lazy(() => import('../pages/Comissioner'))
const PopularLeague = lazy(() => import('../pages/PopularLeague'))
const DraftSpotAuction = lazy(() => import('../pages/Draft/DraftSpotAuction'))
const BuySampoints = lazy(() => import('../pages/AllTransaction/BuySampoints'))
const Payoptions = lazy(() => import('../pages/AllTransaction/Payoptions'))
const Stadium = lazy(() => import('../pages/Stadium'))
const Clubhouse = lazy(() => import('../pages/Clubhouse'))
const NFLPredictor = lazy(() => import('../pages/NFLPredictor'))
const Proleague = lazy(() => import('../pages/Proleague'))
const Success = lazy(() => import('../pages/Successpayment'))
const Error = lazy(() => import('../pages/errorpayment'))
const RuleBook = lazy(() => import('../pages/Rulebook'))
const RoasterInfo = lazy(() => import('../pages/Rulebook/RoasterInfo'))
const GmRating = lazy(() => import('../pages/Rulebook/Gmrating'))
const SampointsBreakdown = lazy(() => import('../pages/Rulebook/sampointsbreakdown'))
const RewardInfo = lazy(() => import('../pages/Rulebook/rewardinfo'))
const RegularSeasonandPlayoff = lazy(() => import('../pages/Rulebook/RegularSeasonandPlayoff'))
const SammetricBreakdown = lazy(() => import('../pages/Rulebook/Sammetric'))
const SamPositiontab = lazy(() => import('../pages/Rulebook/samPositiontab'))
const FranchiseTag = lazy(() => import('../pages/Rulebook/FranchiseTag'))
const ExchangeRules = lazy(() => import('../pages/Rulebook/ExchangeRules'))
const EmpireSaleRules = lazy(() => import('../pages/Rulebook/EmpireSaleRules'))
const GovernanceRules = lazy(() => import('../pages/Rulebook/GovernanceRules'))
const AllNews = lazy(() => import('../components/RollingNewsFeed/AllNews'))
const SearchPlayer = lazy(() => import('../pages/SearchPlayer'))
const Chat = lazy(() => import('../pages/Chat'))
const PlayoffBracket = lazy(() => import('../pages/Postseason/PlayoffBracket'))
const WorldCup = lazy(() => import('../pages/WorldCup'))
const PlayoffStandings = lazy(() => import('../pages/Postseason/PlayoffStandings'))
const SupplementalDraft = lazy(() => import('../pages/Postseason/SupplementalDraft'))
const PlayoffDraft = lazy(() => import('../pages/Postseason/PlayoffDraft'))
const RosterBoard = lazy(() => import('../pages/Postseason/RosterBoard'))
const RookieDraft = lazy(() => import('../pages/Postseason/RookieDraft'))
const AICoachWidget = lazy(() => import('../components/AICoachWidget'))
const WarRoom = lazy(() => import('../pages/WarRoom'))
const FAQ = lazy(() => import('../pages/FAQ'))
const Glossary = lazy(() => import('../pages/Glossary'))
const GMChallenge = lazy(() => import('../pages/GMChallenge'))
const OnboardingWizard = lazy(() => import('../pages/OnboardingWizard'))
const SportHub = lazy(() => import('../pages/SportHub'))
const ScoutReport = lazy(() => import('../pages/ScoutReport'))
const LiveScore = lazy(() => import('../pages/LiveScore'))
const Marketing = lazy(() => import('../pages/Marketing'))
const ArticlesPage = lazy(() => import('../soccer/pages/Articles'))

// ── Product Marketing Pages ──
const RivalsPage = lazy(() => import('../pages/Products/RivalsPage'))
const CLFantasyPage = lazy(() => import('../pages/Products/CLFantasyPage'))
const DraftLeaguesPage = lazy(() => import('../pages/Products/DraftLeaguesPage'))
const PredictorPage = lazy(() => import('../pages/Products/PredictorPage'))
const SAMMetricPage = lazy(() => import('../pages/Products/SAMMetricPage'))
const SamPointsPage = lazy(() => import('../pages/Products/SamPointsPage'))
const HowItWorksPage = lazy(() => import('../pages/Products/HowItWorksPage'))

// ── NFL Rivals ──
const NFLRivalsLayout = lazy(() => import('../pages/NFLRivals/NFLRivalsLayout'))
const NFLRivalsOverview = lazy(() => import('../pages/NFLRivals'))
const NFLRivalsSquad = lazy(() => import('../pages/NFLRivals/SquadBuilder'))
const NFLRivalsSearch = lazy(() => import('../pages/NFLRivals/PlayerSearch'))
const NFLRivalsPod = lazy(() => import('../pages/NFLRivals/PodStandings'))
const NFLRivalsMatchday = lazy(() => import('../pages/NFLRivals/MatchdayView'))
const NFLRivalsTrophies = lazy(() => import('../pages/NFLRivals/TrophyCabinet'))
const NFLRivalsLeaderboard = lazy(() => import('../pages/NFLRivals/Leaderboard'))
const NFLRivalsHistory = lazy(() => import('../pages/NFLRivals/SeasonHistory'))
const NFLRivalsRulesbook = lazy(() => import('../pages/NFLRivals/Rulesbook'))
const NFLRivalsAICoach = lazy(() => import('../pages/NFLRivals/AICoach'))

const AdminPanel = lazy(() => import('../pages/Admin/AdminPanel'))
const AdminLogin = lazy(() => import('../pages/Admin/AdminLogin'))

/* ── Loading fallback ── */
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    background: 'transparent',
  }}>
    <Spin size="large" />
  </div>
)

/* ── Suspense wrapper shorthand ── */
const L = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>

const Routers = () => {
  const Component = () => {
    const navigate = useNavigate()

    React.useEffect(() => {
      const storedVersion = localStorage.getItem('version')
      if (storedVersion && storedVersion !== version) {
        localStorage.clear()
        localStorage.setItem('version', version)
        notification.error({
          message: `Try login again!`,
          duration: 6,
        })
        navigate('/login')
      } else if (!storedVersion) {
        localStorage.setItem('version', version)
      }
    }, [])

    return (
      <Layout>
        <Outlet />
      </Layout>
    )
  }

  return (
    <BrowserRouter>
    <React.StrictMode>
      <PageTracker />
      <AnnouncementBanner />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Admin Auth ── */}
        <Route path='/admin-login' element={<L><AdminLogin /></L>} />
        <Route path='/admin' element={<AdminRoute><L><AdminPanel /></L></AdminRoute>} />

        {/* ── NFL Rivals (own layout, BEFORE PrivateWrapper to avoid wildcard catch) ── */}
        <Route path='/nfl-rivals' element={<L><NFLRivalsLayout /></L>}>
          <Route index element={<L><NFLRivalsOverview /></L>} />
          <Route path='squad' element={<L><NFLRivalsSquad /></L>} />
          <Route path='search' element={<L><NFLRivalsSearch /></L>} />
          <Route path='pod' element={<L><NFLRivalsPod /></L>} />
          <Route path='matchday' element={<L><NFLRivalsMatchday /></L>} />
          <Route path='trophies' element={<L><NFLRivalsTrophies /></L>} />
          <Route path='leaderboard' element={<L><NFLRivalsLeaderboard /></L>} />
          <Route path='history' element={<L><NFLRivalsHistory /></L>} />
          <Route path='ai-coach' element={<L><NFLRivalsAICoach /></L>} />
          <Route path='rulesbook' element={<L><NFLRivalsRulesbook /></L>} />
          <Route path='buy-sp' element={<L><BuySampoints /></L>} />
        </Route>

        {/* Uncommit next line to apply token security */}
        <Route element={<PrivateWrapper />}>
          <Route path='/dashboard' element={<L><ProfessionalLeague /></L>} />
          <Route path='/leagueScore' element={<L><LeagueScore /></L>} />
          <Route path='/game-details' element={<L><GameDetails /></L>} />
          <Route path='/team-setting' element={<L><TeamSetting /></L>} />
          <Route path='/edit-profile' element={<L><EditProfile /></L>} />
          <Route path='/team-schedule' element={<L><TeamSchedule /></L>} />
          <Route path='/injured-reserve' element={<L><InjuredReserve /></L>} />
          <Route path='/league-notification' element={<L><LeagueNotification /></L>} />
          <Route path='/player-live-auction/:id' element={<L><PlayerLiveAuction /></L>} />
          <Route path='/player-interface/:id' element={<L><PlayerInterface /></L>} />
          <Route path='/professional-league' element={<Navigate to='/dashboard' replace />} />
          <Route path='/all-news' element={<L><AllNews/></L>} />
          <Route path='/player-roster' element={<L><PlayerRoster /></L>} />
          <Route path='/team-roster/:id' element={<L><TeamRoster /></L>} />
          <Route path='/depth-chart' element={<L><DepthChart /></L>} />
          <Route path='/team-starters/:teamID' element={<L><DepthChart /></L>} />
          <Route path='/league-standings' element={<L><LeagueStandings /></L>} />
          <Route path='/comissioner' element={<L><Comissioner /></L>} />
          <Route path='/player-auction' element={<L><PlayerAuction /></L>} />
          <Route path='/player-winning-bid/:id' element={<L><PlayerWinningBid /></L>} />
          <Route path='/agent-player-interface/:id' element={<L><AgentPlayerInterface /></L>} />
          <Route path='/team-trade' element={<L><TeamTrade /></L>} />
          <Route path='/counter-trade' element={<L><CounterTrade /></L>} />
          <Route path='/team-financials' element={<L><TeamFinancials /></L>} />
          <Route path='/league-rosters' element={<L><LeagueRosters /></L>} />
          <Route path='/public-draft' element={<L><PublicDraft /></L>} />
          <Route path='/all-transaction' element={<L><AllTransaction /></L>} />
          <Route path='/live-draft' element={<L><Draft /></L>} />
          <Route path='/search-player' element={<L><SearchPlayer/></L>} />
          <Route path='/draft-spot-auction' element={<L><DraftSpotAuction /></L>} />
          <Route path='/stadium' element={<L><Stadium /></L>} />
          <Route path='/clubhouse' element={<L><Clubhouse /></L>} />
          <Route path='/nfl-predictor' element={<L><NFLPredictor /></L>} />
          <Route path='/chat' element={<L><Chat/></L>} />

          {/* Dynasty 32 Postseason Routes */}
          <Route path='/playoff-bracket' element={<L><PlayoffBracket /></L>} />
          <Route path='/playoff-standings' element={<L><PlayoffStandings /></L>} />
          <Route path='/supplemental-draft' element={<L><SupplementalDraft /></L>} />
          <Route path='/playoff-draft' element={<L><PlayoffDraft /></L>} />
          <Route path='/world-cup' element={<L><WorldCup /></L>} />
          <Route path='/roster-board' element={<L><RosterBoard /></L>} />
          <Route path='/rookie-draft' element={<L><RookieDraft /></L>} />

          {/* Redirect aliases for routes referenced elsewhere */}
          <Route path='/free-agent' element={<Navigate to='/agent-player-interface/0' replace />} />
          <Route path='/transactions' element={<Navigate to='/all-transaction' replace />} />
          <Route path='/schedule' element={<Navigate to='/team-schedule' replace />} />
          <Route path='/roster' element={<Navigate to='/player-roster' replace />} />

          <Route path='/war-room' element={<L><WarRoom /></L>} />
          <Route path='/gm-challenge' element={<L><GMChallenge /></L>} />
          <Route path='/buy-sam-points' element={<L><BuySampoints /></L>} />
          <Route path='/select-buy-options' element={<L><Payoptions/></L>} />
          <Route path='/scout-report' element={<L><ScoutReport /></L>} />
          <Route path='/livescore' element={<L><LiveScore /></L>} />
          <Route path='/live-score' element={<L><LiveScore /></L>} />
        </Route>

        <Route element={<Component />}>
          <Route path='/homepage' element={<L><NewHomePage /></L>} />
          <Route path='/popular-league' element={<L><PopularLeague /></L>} />

          {/* RULESBOOK ROUTES */}
          <Route path='/rule-book' element={<L><RuleBook /></L>} />
          <Route path='/rule-book/roasterinfo' element={<L><RoasterInfo /></L>} />
          <Route path='/rule-book/gm-rating' element={<L><GmRating /></L>} />
          <Route path='/rule-book/sampoints-breakdown' element={<L><SampointsBreakdown/></L>} />
          <Route path='/rule-book/reward-info' element={<L><RewardInfo/></L>} />
          <Route path='/rule-book/regularseason-and-playoff' element={<L><RegularSeasonandPlayoff/></L>} />
          <Route path='/rule-book/sammetric' element={<L><SammetricBreakdown/></L>} />
          <Route path='/rule-book/samposition' element={<L><SamPositiontab/></L>} />
          <Route path='/rule-book/franchisetag' element={<L><FranchiseTag/></L>} />
          <Route path='/rule-book/exchange' element={<L><ExchangeRules/></L>} />
          <Route path='/rule-book/empire-sales' element={<L><EmpireSaleRules/></L>} />
          <Route path='/rule-book/governance' element={<L><GovernanceRules/></L>} />

          <Route path='/choose-your-game-step1' element={<L><ChooseYourGame /></L>} />
          <Route path='/choose-your-league-step2' element={<L><ChooseYourLeague /></L>} />
          <Route path='/choose-your-league-step3' element={<L><ChooseYourLeagueStep3 /></L>} />
          <Route path='/choose-your-league-step4' element={<L><ChooseYourLeagueStep4 /></L>} />
          <Route path='/total-payment' element={<L><TotalPayment /></L>} />
          <Route path='/public-league' element={<L><PublicLeague /></L>} />
          <Route path='/terms-condition' element={<L><TermsAndCondition /></L>} />
          <Route path='/my-league' element={<L><MyLeague /></L>} />
          <Route path='/league' element={<L><League /></L>} />
          <Route path='/playoff' element={<L><Playoff /></L>} />
        </Route>

        <Route path='/login' element={<Navigate to='/' replace />} />
        <Route path='/sign-up' element={<Navigate to='/select-game' replace />} />
        <Route path='/forgot-password' element={<L><ForgotPassword /></L>} />
        <Route path='/authentication' element={<L><Authentication /></L>} />
        <Route path='/verify-email' element={<L><EmailVerification /></L>} />
        <Route path='/about' element={<L><Marketing /></L>} />
        <Route path='/products/rivals' element={<L><RivalsPage /></L>} />
        <Route path='/products/cl-fantasy' element={<L><CLFantasyPage /></L>} />
        <Route path='/products/draft-leagues' element={<L><DraftLeaguesPage /></L>} />
        <Route path='/products/predictor' element={<L><PredictorPage /></L>} />
        <Route path='/products/sam-metric' element={<L><SAMMetricPage /></L>} />
        <Route path='/products/sampoints' element={<L><SamPointsPage /></L>} />
        <Route path='/products/how-it-works' element={<L><HowItWorksPage /></L>} />
        <Route path='/' element={<L><LandingPage /></L>} />
        <Route path='/articles' element={<L><ArticlesPage /></L>} />

        <Route path='/terms' element={<L><TermsOfService /></L>} />
        <Route path='/privacy' element={<L><PrivacyPolicy /></L>} />
        <Route path='/eu-privacy' element={<L><EUPrivacyRights /></L>} />
        <Route path='/cookies' element={<L><CookiePolicy /></L>} />
        <Route path='/gdpr' element={<L><GDPRCompliance /></L>} />
        <Route path='/data-rights' element={<L><DataRights /></L>} />
        <Route path='/contact' element={<L><Contact /></L>} />
        <Route path='/faq' element={<L><FAQ /></L>} />
        <Route path='/glossary' element={<L><Glossary /></L>} />
        <Route path='/select-game' element={<L><SelectGame /></L>} />
        <Route path='/onboarding' element={<L><OnboardingWizard /></L>} />
        <Route path='/hub' element={<L><SportHub /></L>} />
        <Route path='/signup' element={<Navigate to='/select-game' replace />} />
        <Route path='/select-league' element={<Navigate to='/onboarding' replace />} />
        <Route path='/proleague' element={<L><Proleague /></L>} />
        <Route path='/create-join-league' element={<Navigate to='/onboarding' replace />} />
        <Route path='/success' element={<L><Success /></L>} />
        <Route path='/error' element={<L><Error /></L>} />

        {/* Catch-all: unknown routes show Coming Soon */}
        <Route path='*' element={<ComingSoon />} />

      </Routes>
      </Suspense>
      {localStorage.getItem('userId') && localStorage.getItem('token') && <Suspense fallback={null}><AICoachWidget /></Suspense>}
      <DraftCountdownPopup />
      </React.StrictMode>
    </BrowserRouter>
  )
}

export default Routers
