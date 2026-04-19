import React from 'react'
import { BiRightArrowAlt } from 'react-icons/bi'

const SqureBox = ({ children, setting }) => {
  const {
    title,
    seeDetails,
    handleSeeDetail,
    viewAll,
    handleViewAll,
    minHeight = '400px',
    textColor = '#fff',
  } = setting

  return (
    <div className='square_box'>
      <header>
        <h3>{title}</h3>
        {seeDetails && (
          <p style={{ cursor: 'pointer', color: textColor }} onClick={handleSeeDetail}>
            See Details <BiRightArrowAlt size={18} />
          </p>
        )}
        {viewAll && (
          <p style={{ cursor: 'pointer', color: textColor }} onClick={handleViewAll}>
            View All <BiRightArrowAlt size={18} />
          </p>
        )}
      </header>
      <section className='square_box_body' style={{ minHeight: minHeight }}>
        {children}
      </section>
    </div>
  )
}

export default SqureBox
