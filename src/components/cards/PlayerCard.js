const PlayerCard = ({Image, PlayerName, Owner, Position, Age, Date}) => {
    return (
        <div className="player-card">
            <div className="player-image">
                <img src={Image} />
            </div>
            <div className='player-name'>
                <h2>{PlayerName}</h2>
                <div className='player-details'>
                    <p>Owner:<span className='bold'> {Owner}</span></p>
                    <p>Position:<span className='bold'> {Position}</span></p>
                    <p>Age: <span className='bold'> {Age}</span></p>
                      <p>Date Registered: <span className='bold'> {Date} </span></p>

                </div>

            </div>
        </div>
    )
}

export default PlayerCard;