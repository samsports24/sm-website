import React from 'react'
import { Pagination as AntPagination } from 'antd'

const Pagination = ({ title, defaultCurrent, current, pageSize, total, onChange }) => {
  return (
    <div className='custom_pagination_box'>
      <h2>{title}</h2>
      <AntPagination
        current={current}
        defaultCurrent={defaultCurrent}
        pageSize={pageSize}
        total={total}
        showSizeChanger={false}
        onChange={onChange}
      />
    </div>
  )
}

export default Pagination
