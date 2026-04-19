import React from 'react';
import { Button, Dropdown, Space, Tooltip } from 'antd';
import { FORMATIONS } from '../../config/constants';

const FormationSelector = ({ current = '4-3-3', onChange, disabled = false }) => {
  const renderMiniPitch = (formation) => {
    const config = FORMATIONS[formation];
    if (!config) return null;

    return (
      <svg
        width="60"
        height="80"
        viewBox="0 0 100 130"
        style={{ marginRight: '8px', verticalAlign: 'middle' }}
      >
        <rect width="100" height="130" fill="#2d5016" stroke="#1a472a" strokeWidth="1" />
        <line x1="0" y1="65" x2="100" y2="65" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
        {config.slots.map((slot, idx) => (
          <circle
            key={idx}
            cx={(slot.x / 100) * 100}
            cy={(slot.y / 100) * 130}
            r="3"
            fill="#fff"
            opacity="0.8"
          />
        ))}
      </svg>
    );
  };

  const items = Object.keys(FORMATIONS).map((key) => ({
    key,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
        {renderMiniPitch(key)}
        <span style={{ fontWeight: key === current ? 'bold' : 'normal' }}>{key}</span>
        {key === current && <span style={{ marginLeft: 'auto', color: '#52c41a' }}>✓</span>}
      </div>
    ),
    onClick: () => onChange?.(key),
  }));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Tooltip title="Formation">
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Formation:</span>
      </Tooltip>
      <Dropdown
        menu={{ items }}
        disabled={disabled}
        trigger={['click']}
      >
        <Button
          type="primary"
          size="large"
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {renderMiniPitch(current)}
          <span>{current}</span>
        </Button>
      </Dropdown>
    </div>
  );
};

export default FormationSelector;
