import React from 'react'
import SelectGameLeft from '../SelectGame/SelectGameLeft'
import SelectGameRight from '../SelectGame/SelectGameRight'
import { Button, Col, Row } from 'antd'
import { useLocation } from 'react-router-dom'

const CreateOrJoinLeague = () => {
  const { state } = useLocation()

  return (
    <div className='select_game_container create_league_container'>
      <SelectGameLeft logo={state?.imagePath} />
      <SelectGameRight>
        <div className='cjl_body'>
          <div className='button_box'>
            <Button type='primary' className='inactive'>
              Step 1
            </Button>
            <Button type='primary'>Step 2</Button>
            <Button type='primary' className='inactive'>
              Step 3
            </Button>
          </div>
        </div>
      </SelectGameRight>
    </div>
  )
}

export default CreateOrJoinLeague
