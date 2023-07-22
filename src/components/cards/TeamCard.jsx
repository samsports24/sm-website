import React from 'react'

import { Button, Image } from 'antd'

const TeamCard = ({ data }) => {
  const { text, direction, imageUrl, title, link } = data
  return (
    <div className='team_card_box'>
      <div className='header'>
        <p>{text}</p>
        <p>{direction}</p>
      </div>
      <div className='image_box'>
        <Image preview={false} src={imageUrl} alt='Defiance' />
      </div>
      <h2>{title}</h2>
      <div className='link_box'>
        <p className='link_text'>{link || '--'}</p>
      </div>
      <div className='button_group'>
        <Button type='default' className='outlined_button'>
          RULEBOOK
        </Button>
        <Button type='primary' className='contained_button'>
          SHOP NOW
        </Button>
      </div>
    </div>
  )
}

export default TeamCard
