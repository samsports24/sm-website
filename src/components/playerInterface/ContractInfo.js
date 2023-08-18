import { playerInterfaceData } from '../../pages/mockData'

const ContractInfo = () => {
  return (
    <div className='player_info_card info_right'>
      <h2>Player Contract Info</h2>
      <p>{playerInterfaceData?.playerContractInfo}</p>
    </div>
  )
}

export default ContractInfo
