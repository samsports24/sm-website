import React from 'react';
import './imagerow.css'

const imageRow = ({ options, onSelect, selectedValue }) => {
  return (
    <div className='image-row'>
      {options.map((option) => (
        <div
          key={option.value}
          className={`image-item ${selectedValue === option.value ? 'selected' : ''}`}
          onClick={() => onSelect(option.value)}
        >
          <img src={option.imageSrc} alt={option.value} />
        </div>
      ))}
    </div>
  );
};

export default imageRow;
