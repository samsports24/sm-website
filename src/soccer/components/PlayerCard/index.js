import React from 'react';
import { Card, Badge, Avatar, Progress, Row, Col } from 'antd';
import { POSITIONS } from '../../config/constants';

const PlayerCard = ({ player, variant = 'full', onClick, showStats = true }) => {
  const position = POSITIONS[player.position];
  const positionColor = position?.color || '#999';

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <Avatar
          src={player.photo}
          size={40}
          style={{
            backgroundColor: positionColor,
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          {!player.photo && player.position}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{player.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{player.club}</div>
        </div>
        {player.salary > 0 && (
          <div style={{ fontSize: '11px', color: '#888', textAlign: 'right', marginRight: 8 }}>
            <div>{player.salary >= 1000000 ? `${(player.salary / 1000000).toFixed(1)}M` : `${(player.salary / 1000).toFixed(0)}K`} SP</div>
          </div>
        )}
        <Badge
          color={positionColor}
          text={position?.abbr}
          style={{ fontSize: '12px', fontWeight: 'bold' }}
        />
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#000',
            minWidth: '40px',
            textAlign: 'right',
          }}
        >
          {player.rating || '-'}
        </div>
      </div>
    );
  }

  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', height: '100%' }}
      hoverable={!!onClick}
      cover={
        <div
          style={{
            backgroundColor: positionColor,
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ fontSize: '80px', color: '#fff', opacity: 0.3 }}>⚽</div>
          )}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#ffeb3b',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {player.rating || '-'}
            </span>
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{player.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{player.nationality}</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Badge color={positionColor} text={position?.name} style={{ fontSize: '12px' }} />
        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{player.club}</div>
        {(player.salary > 0 || player.marketValue > 0) && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
            {player.salary > 0 && (
              <span style={{ color: '#52c41a', fontWeight: 600 }}>
                Salary: {player.salary >= 1000000 ? `${(player.salary / 1000000).toFixed(1)}M` : `${(player.salary / 1000).toFixed(0)}K`} SP/yr
              </span>
            )}
            {player.marketValue > 0 && (
              <span style={{ color: '#1890ff', fontWeight: 600 }}>
                Value: {player.marketValue >= 1000000 ? `${(player.marketValue / 1000000).toFixed(1)}M` : `${(player.marketValue / 1000).toFixed(0)}K`} SP
              </span>
            )}
          </div>
        )}
      </div>

      {showStats && player.stats && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Stats</div>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Pace</div>
              <Progress
                percent={player.stats.pace}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.pace}</span>}
              />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Shooting</div>
              <Progress
                percent={player.stats.shooting}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.shooting}</span>}
              />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Passing</div>
              <Progress
                percent={player.stats.passing}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.passing}</span>}
              />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Dribbling</div>
              <Progress
                percent={player.stats.dribbling}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.dribbling}</span>}
              />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Defending</div>
              <Progress
                percent={player.stats.defending}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.defending}</span>}
              />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>Physical</div>
              <Progress
                percent={player.stats.physical}
                size="small"
                strokeColor={positionColor}
                format={() => <span style={{ fontSize: '10px' }}>{player.stats.physical}</span>}
              />
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default PlayerCard;
