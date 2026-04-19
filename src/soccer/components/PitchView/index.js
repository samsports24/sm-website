import React, { useState } from 'react';
import { Tooltip, Badge, Button, Empty } from 'antd';
import { POSITIONS, FORMATIONS } from '../../config/constants';

const PitchView = ({
  formation = '4-3-3',
  starters = [],
  substitutes = [],
  captain,
  onSlotClick,
  onSubClick,
  editable = false,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const formationConfig = FORMATIONS[formation];
  if (!formationConfig) return <Empty description="Invalid formation" />;

  const containerWidth = 600;
  const containerHeight = 800;
  const pitchPadding = 20;
  const pitchWidth = containerWidth - pitchPadding * 2;
  const pitchHeight = containerHeight - pitchPadding * 2;

  const positionColor = (pos) => POSITIONS[pos]?.color || '#999';

  const PlayerDot = ({ player, slot, slotIndex, isSub = false }) => {
    const x = (slot.x / 100) * pitchWidth + pitchPadding;
    const y = (slot.y / 100) * pitchHeight + pitchPadding;

    const handleClick = () => {
      if (editable) {
        isSub ? onSubClick?.(slotIndex) : onSlotClick?.(slotIndex);
      }
    };

    if (!player) {
      return editable ? (
        <Tooltip title="Click to select player">
          <g key={`slot-${slotIndex}`} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={18} fill="#f0f0f0" stroke="#999" strokeWidth="2" />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#999"
            >
              +
            </text>
          </g>
        </Tooltip>
      ) : (
        <g key={`slot-${slotIndex}`}>
          <circle cx={x} cy={y} r={18} fill="#f0f0f0" stroke="#ddd" strokeWidth="2" strokeDasharray="4" />
        </g>
      );
    }

    const isCaptain = captain === player.id;

    return (
      <Tooltip
        key={`player-${slotIndex}`}
        title={
          <div>
            <div style={{ fontWeight: 'bold' }}>{player.name}</div>
            <div>{POSITIONS[slot.pos]?.name}</div>
            {player.rating && <div>Rating: {player.rating}</div>}
          </div>
        }
      >
        <g
          onClick={handleClick}
          onMouseEnter={() => setHoveredSlot(slotIndex)}
          onMouseLeave={() => setHoveredSlot(null)}
          style={{ cursor: editable ? 'pointer' : 'default' }}
        >
          <circle
            cx={x}
            cy={y}
            r={18}
            fill={positionColor(slot.pos)}
            stroke={hoveredSlot === slotIndex ? '#fff' : '#000'}
            strokeWidth={hoveredSlot === slotIndex ? 3 : 2}
            opacity={0.85}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#fff"
          >
            {player.number || ''}
          </text>
          {isCaptain && (
            <g>
              <circle cx={x + 12} cy={y - 12} r={10} fill="gold" stroke="#333" strokeWidth="1.5" />
              <text
                x={x + 12}
                y={y - 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#333"
              >
                C
              </text>
            </g>
          )}
        </g>
      </Tooltip>
    );
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0, marginBottom: '10px' }}>Formation: {formation}</h3>
      </div>

      <svg
        width="100%"
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        style={{
          maxWidth: containerWidth,
          border: '2px solid #1a472a',
          borderRadius: '8px',
          backgroundColor: '#2d5016',
          margin: '0 auto',
          display: 'block',
        }}
      >
        {/* Pitch markings */}
        <defs>
          <pattern id="pitchGrid" width="20" height="20" patternUnits="userSpaceOnUse" />
        </defs>

        {/* Center line */}
        <line
          x1={pitchPadding}
          y1={pitchPadding + pitchHeight / 2}
          x2={containerWidth - pitchPadding}
          y2={pitchPadding + pitchHeight / 2}
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Center circle */}
        <circle
          cx={containerWidth / 2}
          cy={pitchPadding + pitchHeight / 2}
          r={pitchWidth * 0.15}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Center spot */}
        <circle
          cx={containerWidth / 2}
          cy={pitchPadding + pitchHeight / 2}
          r="3"
          fill="#fff"
          opacity="0.5"
        />

        {/* Left penalty area */}
        <rect
          x={pitchPadding}
          y={pitchPadding + pitchHeight * 0.2}
          width={pitchWidth * 0.2}
          height={pitchHeight * 0.6}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Right penalty area */}
        <rect
          x={containerWidth - pitchPadding - pitchWidth * 0.2}
          y={pitchPadding + pitchHeight * 0.2}
          width={pitchWidth * 0.2}
          height={pitchHeight * 0.6}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Left goal area */}
        <rect
          x={pitchPadding}
          y={pitchPadding + pitchHeight * 0.35}
          width={pitchWidth * 0.1}
          height={pitchHeight * 0.3}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Right goal area */}
        <rect
          x={containerWidth - pitchPadding - pitchWidth * 0.1}
          y={pitchPadding + pitchHeight * 0.35}
          width={pitchWidth * 0.1}
          height={pitchHeight * 0.3}
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Player dots */}
        {formationConfig.slots.map((slot, index) => (
          <PlayerDot key={`player-${index}`} player={starters[index]} slot={slot} slotIndex={index} />
        ))}
      </svg>

      {/* Substitutes bench */}
      {substitutes && substitutes.length > 0 && (
        <div style={{ marginTop: '30px', padding: '0 20px' }}>
          <h4 style={{ marginBottom: '15px' }}>Substitutes</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => {
              const sub = substitutes[index];
              return (
                <div
                  key={`sub-${index}`}
                  onClick={() => editable && onSubClick?.(index)}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    textAlign: 'center',
                    backgroundColor: sub ? '#f5f5f5' : '#fafafa',
                    cursor: editable ? 'pointer' : 'default',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sub ? (
                    <>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{sub.number}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{sub.name}</div>
                      <Badge color={positionColor(sub.position)} text={sub.position} style={{ fontSize: '10px' }} />
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchView;
