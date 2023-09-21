import React from 'react'

const PlayerInfoBottom = ({ player = {}, contract }) => {
  let infoData = [
    {
      title: 'Team',
      value: player?.Team || '-',
    },
    {
      title: 'Opponent',
      value: player?.UpcomingGameOpponent || '-',
    },
    {
      title: 'Postion',
      value: player?.Position || '-',
    },
    {
      title: 'Height',
      value: player?.Height || '-',
    },
    {
      title: 'Years in League',
      value: player?.Experience
        ? player?.Experience <= 1
          ? `${player?.Experience} Year`
          : `${player?.Experience} Years`
        : '-',
    },
    {
      title: 'Player Caps',
      value: contract || '-',
    },
    {
      title: 'Player College',
      value: player?.College || '-',
    },
    {
      title: 'Age',
      value: player?.Age ? `${player?.Age} (${player?.BirthDateString})` : '-',
    },
  ]
  return (
    <>
      <div className='info-card-new'>
        {infoData.map((item, index) => (
          <h3 key={index}>
            {item.title} : <span>{item.value}</span>
          </h3>
        ))}
      </div>

      <hr className='divider-new' />

      <div className='player_caps_box_new'>
        <h1>Player Cap Hit: {contract || '-'}</h1>
      </div>
    </>
  )
}

export default PlayerInfoBottom
