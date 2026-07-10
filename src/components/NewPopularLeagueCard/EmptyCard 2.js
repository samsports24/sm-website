
const LeagueEmptyCard = () => {
  return (
    <div className='p_league_card_wrapper empty_wrapper'>
      <div className='p_league_card'>
        <div className='top'>
          <div className='row_1'>
            <div>
              <p className='text_title'>League Name:</p>
              <p className='text_value'></p>
            </div>
            <div className='image_box' />
          </div>
          <div className='row_2'>
            <div>
              <p className='text_title'>Draft Starts:</p>
              <p className='text_value'>{" "}</p>
            </div>
            <div>
              <p className='text_title'>Players:</p>
              <p className='text_value'></p>
            </div>
          </div>
          <div className='row_3'>
            <p className='text_title'>League Type:</p>
            <p className='text_value'>{" "}</p>
          </div>
          <div className='row_4'>
            <p className='text_title'>League Level:</p>
            <div>
              {Array(Number(3))
                .fill()
                // .slice(0, 5)
                .map((_, i) => {
                  return ""
                })}
            </div>
          </div>
          <div className='row_5'>
            <p className='text_title'>Entry Fee:</p>
            <p className='text_value'></p>
          </div>
          <div className='row_5'>
            <p className='text_title'>Prize pool wallet:</p>
            <p className='text_value'></p>
          </div>
        </div>
        <div className='button_row'>
        </div>
        <div className="create_btn">
            <p>Create a League</p>
        </div>
      </div>
    </div>
  )
}

export default LeagueEmptyCard
