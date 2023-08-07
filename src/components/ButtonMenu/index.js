import React from 'react'

import { Button, Tooltip } from 'antd'

import RightIcon from '../../assets/right-icon.svg'

import { useNavigate } from 'react-router-dom'

const ButtonMenu = ({ data }) => {
  const { buttonName, item } = data
  const navigate = useNavigate()

  return (
    <Tooltip
      overlayClassName='custom_tooltip'
      trigger={['click']}
      placement='bottomLeft'
      title={
        <ul>
          {item?.length > 0 ? (
            item?.map((v, i) => {
              return (
                <li key={i} onClick={() => navigate(v?.navigate)}>
                  <img src={RightIcon} /> {v?.name}
                </li>
              )
            })
          ) : (
            <li>No Item</li>
          )}
        </ul>
      }
    >
      <Button className='custom_tooltip_button' type='primary'>
        {buttonName}
      </Button>
    </Tooltip>
  )
}

export default ButtonMenu
