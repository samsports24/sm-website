import React from 'react'
import { Pagination as AntPagination } from 'antd'

const Pagination = ({ title, defaultCurrent, total, onChange }) => {
  return (
    <div className='custom_pagination_box'>
      <h2>{title}</h2>
      <AntPagination
        defaultCurrent={defaultCurrent}
        total={total}
        showSizeChanger={false}
        onChange={onChange}
      />
    </div>
  )
}

export default Pagination
