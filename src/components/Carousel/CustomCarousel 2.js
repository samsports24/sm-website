import React, { useRef, useState } from 'react'

const CustomCarousel = ({ children, height }) => {
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const wrapperRef = useRef(null)

  const handleMouseDown = (e) => {
    if (!wrapperRef.current) return
    setDragging(true)
    setStartX(e.pageX - wrapperRef.current.offsetLeft)
    setScrollLeft(wrapperRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!dragging || !wrapperRef.current) return
    const x = e.pageX - wrapperRef.current.offsetLeft
    const walk = (x - startX) * 1
    wrapperRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div
      className='custom_carousel'
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      ref={wrapperRef}
      style={{ height: height ? height : 'auto' }}
    >
      <div className='wrapper' style={{ height: height ? height : 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export default CustomCarousel
