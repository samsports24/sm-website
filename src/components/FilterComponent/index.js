import React, { useState } from 'react'

const FilterBox = ({ data, handleFilter = () => {} }) => {
  const [activeFilter, setActiveFilter] = useState(data[0] || '')

  const handleActiveFilter = (value) => {
    setActiveFilter(value)
    handleFilter(value)
  }

  return (
    <div className='filter_box'>
      {data?.map((v, i, arr) => {
        const isLastItem = i === arr.length - 1
        return (
          <div key={i} className='filter_box_text'>
            <h2
              onClick={() => handleActiveFilter(v)}
              className={`${activeFilter === v && 'activeFilter'}`}
            >
              {v}
            </h2>
            <span style={{ display: isLastItem ? 'none' : 'inline' }}>|</span>
          </div>
        )
      })}
    </div>
  )
}

export default FilterBox
