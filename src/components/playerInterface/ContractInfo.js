const ContractInfo = ({ data }) => {
  return (
    <div className='player_info_card info_right'>
      <h2>Player Contract Info</h2>
      <p>{data?.contractInfo || 'No contract available'}</p>
    </div>
  )
}

export default ContractInfo
