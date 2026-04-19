import React from 'react';
import { Card, Button, Space, Tag, Divider, Row, Col, Badge } from 'antd';
import { POSITIONS } from '../../config/constants';

const TradeCard = ({ trade, onAccept, onReject, onCounter }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'processing',
      accepted: 'success',
      rejected: 'error',
      countered: 'warning',
    };
    return colors[status] || 'default';
  };

  const getPositionColor = (position) => {
    return POSITIONS[position]?.color || '#999';
  };

  const PlayerBadge = ({ player }) => (
    <div
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        marginRight: '8px',
        marginBottom: '8px',
        fontSize: '12px',
      }}
    >
      <Badge color={getPositionColor(player.position)} text={player.position} style={{ marginRight: '6px' }} />
      {player.name}
    </div>
  );

  return (
    <Card
      style={{ marginBottom: '16px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Trade with {trade.otherTeamName}</span>
          <Tag color={getStatusColor(trade.status)}>{trade.status?.toUpperCase()}</Tag>
        </div>
      }
    >
      <Row gutter={16}>
        {/* Your Players */}
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Your Players</div>
            <div>
              {trade.yourPlayers?.map((player) => (
                <PlayerBadge key={player.id} player={player} />
              ))}
            </div>
          </div>
        </Col>

        {/* Their Players */}
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Their Players</div>
            <div>
              {trade.theirPlayers?.map((player) => (
                <PlayerBadge key={player.id} player={player} />
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* SamPoints */}
      {(trade.yourSamPoints || trade.theirSamPoints) && (
        <>
          <Divider />
          <Row gutter={16}>
            {trade.yourSamPoints > 0 && (
              <Col xs={12}>
                <div style={{ fontSize: '14px' }}>
                  You add: <strong style={{ color: '#ff4d4f' }}>{trade.yourSamPoints} SamPts</strong>
                </div>
              </Col>
            )}
            {trade.theirSamPoints > 0 && (
              <Col xs={12}>
                <div style={{ fontSize: '14px' }}>
                  They add: <strong style={{ color: '#52c41a' }}>{trade.theirSamPoints} SamPts</strong>
                </div>
              </Col>
            )}
          </Row>
        </>
      )}

      {/* Actions */}
      {trade.status === 'pending' && (
        <>
          <Divider />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button danger onClick={() => onReject?.(trade.id)}>
              Reject
            </Button>
            {onCounter && (
              <Button onClick={() => onCounter?.(trade.id)}>
                Counter
              </Button>
            )}
            <Button type="primary" onClick={() => onAccept?.(trade.id)}>
              Accept
            </Button>
          </Space>
        </>
      )}

      {/* Proposed By Info */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
        Proposed {trade.createdAt && new Date(trade.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );
};

export default TradeCard;
