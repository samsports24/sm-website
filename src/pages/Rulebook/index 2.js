import MainRuleBook from './mainrulebook'
import OnboardingGuide from '../../components/OnboardingGuide'

const RuleBook = () => {
  return (
    <div className='rule_book'>
      <OnboardingGuide tabKey="rules" />
      <MainRuleBook />
    </div>
  )
}

export default RuleBook
