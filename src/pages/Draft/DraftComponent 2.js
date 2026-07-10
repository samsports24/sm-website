import { Select } from 'antd'
import React from 'react'
import { IoMdClose } from 'react-icons/io'

const DraftComponent = ({ title, height, close, header, selectBox }) => {
  return (
    <div className='draft_comp_box'>
      <div className='draft_header'>
        <p>{title}</p>
      </div>
      <div className='draft_body'>
        <div className='draft_body_wrapper' style={{ height: height ? height : 'auto' }}>
          {header && (
            <div className='db_header'>
              <p>Round 7</p>
            </div>
          )}
          {selectBox && (
            <div className='select_box'>
              <Select
                defaultValue='Team 4'
                //   onChange={handleChange}
                options={[
                  {
                    value: 'Team 1',
                    label: 'Team 1',
                  },
                  {
                    value: 'Team 2',
                    label: 'Team 2',
                  },
                  {
                    value: 'Team 3',
                    label: 'Team 3',
                  },
                  {
                    value: 'Team 4',
                    label: 'Team 4',
                    disabled: true,
                  },
                ]}
              />
            </div>
          )}
          {Array(5)
            .fill({})
            .map((v, i) => {
              return (
                <div key={i} className='draft_card'>
                  <p className='index_number'>{i + 1}.</p>
                  <p className='name'>J.Witten</p>
                  <p className='team_bye'>TE-DAL</p>
                  <p className='team_bye'>(Bye: 11)</p>
                  {close && (
                    <div className='icon_box'>
                      <IoMdClose />
                    </div>
                  )}
                  {title === 'Team Rosters' && (
                    <div className='last_value'>
                      <p>R6-69</p>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default DraftComponent
