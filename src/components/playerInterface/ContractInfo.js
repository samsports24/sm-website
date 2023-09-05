// import { playerInterfaceData } from '../../pages/mockData'
import comingSoon from '../../assets/coming-soon.png'

const ContractInfo = () => {
  return (
    <div className='player_info_card info_right'>
      <h2>Player Contract Info</h2>
      <div
        style={{
          marginTop: '-12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '270px',
        }}
      >
        <img src={comingSoon} alt={''} width={300} height={'auto'} />
      </div>
      {/* <p>{playerInterfaceData?.playerContractInfo}</p> */}
    </div>
  )
}

export default ContractInfo
