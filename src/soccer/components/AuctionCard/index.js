import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress, Tag, Space, Statistic, Row, Col } from 'antd';

const AuctionCard = ({ auction, onBid }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!auction.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        hours > 0
          ? `${hours}h ${minutes}m`
          : minutes > 0
            ? `${minutes}m ${seconds}s`
            : `${seconds}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime]);

  const isEnded = timeLeft === 'Ended';

  return (
    <Card
      hoverable
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      cover={
        <div
          style={{
            backgroundColor: '#f0f0f0',
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {auction.player?.photo ? (
            <img
              src={auction.player.photo}
              alt={auction.player.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{ fontSize: '60px', opacity: 0.3 }}>⚽</div>
          )}
          <Tag
            color={auction.type === 'salaries' ? 'blue' : 'green'}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
            {auction.type === 'salaries' ? 'Salary' : 'Penalty'}
          </Tag>
        </div>
      }
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {auction.player?.name}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {auction.player?.position} • {auction.player?.club}
        </div>
      </div>

      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
        <Col span={12}>
          <Statistic
            title="Current Bid"
            value={auction.currentBid || auction.startingBid}
            suffix="SamPts"
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Bids"
            value={auction.bidCount || 0}
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Time Left</div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: isEnded ? '#ff4d4f' : timeLeft?.includes('m') ? '#faad14' : '#1890ff',
          }}
        >
          {timeLeft || 'Loading...'}
        </div>
      </div>

      {auction.myBid && (
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#0050b3' }}>
            Your bid: <strong>{auction.myBid} SamPts</strong>
          </div>
        </div>
      )}

      <Button
        type="primary"
        block
        disabled={isEnded}
        onClick={() => onBid?.(auction.id)}
      >
        {isEnded ? 'Auction Ended' : 'Place Bid'}
      </Button>
    </Card>
  );
};

export default AuctionCard;
