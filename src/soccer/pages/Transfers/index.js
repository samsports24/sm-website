import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Tabs,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Row,
  Col,
  Table,
  Badge,
  Empty,
  Spin,
  Alert,
  List,
  message,
  InputNumber,
  Avatar,
  Divider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AuctionCard from '../../components/AuctionCard';
import PlayerCard from '../../components/PlayerCard';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken, POSITIONS, REAL_LEAGUES } from '../../config/constants';

const Transfers = () => {
  const dispatch = useDispatch();
  const { league, leagueName } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [transferWindowOpen, setTransferWindowOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('freeAgents');
  const [createAuctionModalVisible, setCreateAuctionModalVisible] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedAuctionForBid, setSelectedAuctionForBid] = useState(null);
  const [bidAmount, setBidAmount] = useState(null);
  const [freeAgents, setFreeAgents] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [squadPlayers, setSquadPlayers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterPosition, setFilterPosition] = useState(null);
  const [filterClub, setFilterClub] = useState(null);
  const [createAuctionLoading, setCreateAuctionLoading] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const [selectedPlayerForAuction, setSelectedPlayerForAuction] = useState(null);
  const [startingBid, setStartingBid] = useState(null);
  const [auctionDuration, setAuctionDuration] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    if (!league?._id) return;
    fetchAllData();
  }, [league?._id]);

  const fetchAllData = async () => {
    attachSoccerToken();
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        soccerAPI.get(`/api/v1/leagues/${league._id}/free-agents`),
        soccerAPI.get(`/api/v1/auctions/league/${league._id}`),
        soccerAPI.get(`/api/v1/auctions/won-auctions`),
      ]);

      // Process free agents
      if (results[0].status === 'fulfilled') {
        setFreeAgents(results[0].value.data.data || results[0].value.data || []);
      } else {
        console.error('Failed to fetch free agents:', results[0].reason);
        message.error('Failed to fetch free agents');
      }

      // Process auctions
      if (results[1].status === 'fulfilled') {
        const auctionData = results[1].value.data.data || results[1].value.data || [];
        setAuctions(auctionData);
      } else {
        console.error('Failed to fetch auctions:', results[1].reason);
        message.error('Failed to fetch auctions');
      }

      // Process won/active bids
      if (results[2].status === 'fulfilled') {
        setMyBids(results[2].value.data.data || results[2].value.data || []);
      } else {
        console.error('Failed to fetch won auctions:', results[2].reason);
        message.error('Failed to fetch your bids');
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      message.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch squad players when create auction modal opens
  const handleCreateAuctionModalOpen = async () => {
    attachSoccerToken();
    try {
      const response = await soccerAPI.get(`/api/v1/teams/squad`);
      const players = response.data.data || response.data.players || [];
      setSquadPlayers(players);
    } catch (error) {
      console.error('Failed to fetch squad:', error);
      message.error('Failed to fetch your squad');
    }
    setCreateAuctionModalVisible(true);
  };

  const handleSignFreeAgent = (playerId, playerName) => {
    Modal.confirm({
      title: 'Sign Player',
      content: `Create an auction for ${playerName} with starting bid of 0 SamPts?`,
      okText: 'Create Auction',
      cancelText: 'Cancel',
      onOk: async () => {
        attachSoccerToken();
        try {
          await soccerAPI.post(`/api/v1/auctions`, {
            playerId,
            startingBid: 0,
            duration: 24,
            leagueId: league._id,
          });
          message.success('Auction created successfully!');
          fetchAllData();
        } catch (error) {
          console.error('Failed to create auction:', error);
          message.error(error.response?.data?.message || 'Failed to create auction');
        }
      },
    });
  };

  const handleBid = (auction) => {
    setSelectedAuctionForBid(auction);
    setBidAmount(null);
    setBidModalVisible(true);
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || bidAmount <= 0) {
      message.error('Please enter a valid bid amount');
      return;
    }

    attachSoccerToken();
    setBidLoading(true);
    try {
      await soccerAPI.post(`/api/v1/auctions/${selectedAuctionForBid._id || selectedAuctionForBid.id}/bid`, {
        amount: bidAmount,
      });
      message.success('Bid placed successfully!');
      setBidModalVisible(false);
      fetchAllData();
    } catch (error) {
      console.error('Failed to place bid:', error);
      message.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!selectedPlayerForAuction || !startingBid || !auctionDuration) {
      message.error('Please fill in all fields');
      return;
    }

    attachSoccerToken();
    setCreateAuctionLoading(true);
    try {
      await soccerAPI.post(`/api/v1/auctions`, {
        playerId: selectedPlayerForAuction,
        startingBid,
        duration: parseInt(auctionDuration),
        leagueId: league._id,
      });
      message.success('Auction created successfully!');
      setCreateAuctionModalVisible(false);
      setSelectedPlayerForAuction(null);
      setStartingBid(null);
      setAuctionDuration(null);
      fetchAllData();
    } catch (error) {
      console.error('Failed to create auction:', error);
      message.error(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setCreateAuctionLoading(false);
    }
  };

  // ── Swipe handling for mobile tab switching ──
  const TAB_KEYS = ['freeAgents', 'auctions', 'myBids'];
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipe = 50;
    if (Math.abs(diff) < minSwipe) return;

    const currentIdx = TAB_KEYS.indexOf(activeTab);
    if (diff > 0 && currentIdx < TAB_KEYS.length - 1) {
      setActiveTab(TAB_KEYS[currentIdx + 1]);
    } else if (diff < 0 && currentIdx > 0) {
      setActiveTab(TAB_KEYS[currentIdx - 1]);
    }
  }, [activeTab]);

  const filteredFreeAgents = freeAgents.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesPosition = !filterPosition || p.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);

  const handlePlayerClick = (record) => {
    setSelectedPlayer(record);
    setPlayerModalVisible(true);
  };

  const freeAgentColumns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 180,
      render: (text, record) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => handlePlayerClick(record)}
        >
          {record.photo && (
            <img
              src={record.photo}
              alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>{text}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{record.club || record.nationality}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Pos',
      dataIndex: 'position',
      key: 'position',
      width: 60,
      render: (pos) => (
        <Badge color={POSITIONS[pos]?.color} text={POSITIONS[pos]?.abbr || pos} />
      ),
    },
    {
      title: 'OVR',
      dataIndex: 'rating',
      key: 'rating',
      width: 55,
      sorter: (a, b) => (a.rating || a.overallRating || 0) - (b.rating || b.overallRating || 0),
      defaultSortOrder: 'descend',
      render: (rating, record) => {
        const val = rating || record.overallRating || '-';
        const color = val >= 80 ? '#52c41a' : val >= 70 ? '#faad14' : val >= 60 ? '#1890ff' : '#999';
        return (
          <div style={{
            padding: '2px 6px', backgroundColor: color, borderRadius: 4,
            fontWeight: 'bold', textAlign: 'center', color: '#fff', fontSize: 13,
          }}>
            {val}
          </div>
        );
      },
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 50,
      sorter: (a, b) => (a.age || 0) - (b.age || 0),
      render: (age) => age || '-',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      width: 80,
      sorter: (a, b) => (a.salary || 0) - (b.salary || 0),
      render: (val) => {
        if (!val) return '-';
        if (val >= 1000000) return <span style={{ fontWeight: 600 }}>{(val / 1000000).toFixed(1)}M</span>;
        if (val >= 1000) return <span style={{ fontWeight: 600 }}>{(val / 1000).toFixed(0)}K</span>;
        return `${val} SP`;
      },
    },
    {
      title: 'Pts',
      dataIndex: 'fantasyPointsTotal',
      key: 'fantasyPointsTotal',
      width: 55,
      sorter: (a, b) => (a.fantasyPointsTotal || 0) - (b.fantasyPointsTotal || 0),
      render: (val) => val ? val.toFixed(1) : '-',
    },
    {
      title: 'Avg',
      dataIndex: 'fantasyPointsAvg',
      key: 'fantasyPointsAvg',
      width: 55,
      sorter: (a, b) => (a.fantasyPointsAvg || 0) - (b.fantasyPointsAvg || 0),
      render: (val) => val ? val.toFixed(1) : '-',
    },
    {
      title: 'Goals',
      dataIndex: 'goalsScored',
      key: 'goalsScored',
      width: 55,
      render: (val) => val || '-',
    },
    {
      title: 'Assists',
      dataIndex: 'assists',
      key: 'assists',
      width: 55,
      render: (val) => val || '-',
    },
    {
      title: '',
      key: 'action',
      width: 70,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={(e) => { e.stopPropagation(); handleSignFreeAgent(record.id || record._id, record.name); }}
        >
          Sign
        </Button>
      ),
    },
  ];

  const myBidsColumns = [
    {
      title: 'Player',
      dataIndex: ['player', 'name'],
      key: 'playerName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.player?.position} • {record.player?.club}
          </div>
        </div>
      ),
    },
    {
      title: 'Your Bid',
      dataIndex: 'myBid',
      key: 'myBid',
      render: (val) => `${val} SamPts`,
    },
    {
      title: 'Current Bid',
      dataIndex: 'currentBid',
      key: 'currentBid',
      render: (val, record) => {
        const current = val || record.bids?.[record.bids.length - 1] || record.startingBid || 0;
        return `${current} SamPts`;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isWinning = record.status === 'winning' || record.isWinning;
        return (
          <Badge
            color={isWinning ? '#52c41a' : '#ff4d4f'}
            text={isWinning ? 'Winning' : 'Outbid'}
          />
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>{leagueName} Transfer Market</h2>
      </div>

      {/* Transfer Window Status */}
      {!transferWindowOpen && (
        <Alert
          message="Transfer Window Closed"
          description="The transfer window is currently closed. Check back next week for openings."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      {transferWindowOpen && (
        <Alert
          message="Transfer Window Open"
          description="Buy and sell players until the window closes. Make strategic moves!"
          type="success"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'freeAgents',
            label: `Free Agents (${freeAgents.length})`,
            children: (
              <div>
                <Card style={{ marginBottom: '16px' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                      placeholder="Search players..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      size="large"
                    />
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12} lg={6}>
                        <Select
                          placeholder="Filter by position"
                          allowClear
                          value={filterPosition}
                          onChange={setFilterPosition}
                          style={{ width: '100%' }}
                          options={Object.entries(POSITIONS).map(([key, val]) => ({
                            label: val.name,
                            value: key,
                          }))}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>

                {filteredFreeAgents.length === 0 ? (
                  <Empty description="No free agents found" />
                ) : (
                  <Table
                    columns={freeAgentColumns}
                    dataSource={filteredFreeAgents.map((p, idx) => ({ ...p, key: idx }))}
                    pagination={{ pageSize: 15 }}
                    size="small"
                    scroll={{ x: 800 }}
                    onRow={(record) => ({
                      onClick: () => handlePlayerClick(record),
                      style: { cursor: 'pointer' },
                    })}
                  />
                )}
              </div>
            ),
          },
          {
            key: 'auctions',
            label: `Auctions (${auctions.length})`,
            children: (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateAuctionModalOpen}
                    disabled={!transferWindowOpen}
                  >
                    Create Auction
                  </Button>
                </div>

                {auctions.length === 0 ? (
                  <Empty />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      scrollSnapType: 'x mandatory',
                      paddingBottom: 8,
                    }}
                  >
                    {auctions.map((auction) => (
                      <div
                        key={auction._id || auction.id}
                        style={{
                          minWidth: 280,
                          maxWidth: 340,
                          flex: '0 0 auto',
                          scrollSnapAlign: 'start',
                        }}
                      >
                        <AuctionCard auction={auction} onBid={handleBid} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'myBids',
            label: `My Bids (${myBids.length})`,
            children: (
              <div>
                {myBids.length === 0 ? (
                  <Empty description="No active bids" />
                ) : (
                  <Table
                    columns={myBidsColumns}
                    dataSource={myBids.map((bid, idx) => ({ ...bid, key: idx }))}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    scroll={{ x: 500 }}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
      </div>

      {/* Bid Modal */}
      <Modal
        title={selectedAuctionForBid ? `Place Bid - ${selectedAuctionForBid.player?.name}` : 'Place Bid'}
        open={bidModalVisible}
        onCancel={() => setBidModalVisible(false)}
        onOk={handlePlaceBid}
        confirmLoading={bidLoading}
        okText="Place Bid"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {selectedAuctionForBid && (
            <>
              <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#666' }}>Current Bid:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '8px', fontSize: '16px' }}>
                    {selectedAuctionForBid.currentBid || selectedAuctionForBid.startingBid || 0} SamPts
                  </span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Starting Bid:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>
                    {selectedAuctionForBid.startingBid || 0} SamPts
                  </span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Your Bid Amount</label>
                <InputNumber
                  min={
                    (selectedAuctionForBid.currentBid || selectedAuctionForBid.startingBid || 0) + 1
                  }
                  value={bidAmount}
                  onChange={setBidAmount}
                  style={{ width: '100%' }}
                  placeholder="Enter bid amount"
                />
              </div>
            </>
          )}
        </Space>
      </Modal>

      {/* Create Auction Modal */}
      <Modal
        title="Create Auction"
        open={createAuctionModalVisible}
        onCancel={() => {
          setCreateAuctionModalVisible(false);
          setSelectedPlayerForAuction(null);
          setStartingBid(null);
          setAuctionDuration(null);
        }}
        onOk={handleCreateAuction}
        confirmLoading={createAuctionLoading}
        okText="Create"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Select Player</label>
            <Select
              placeholder="Choose a player from your squad"
              value={selectedPlayerForAuction}
              onChange={setSelectedPlayerForAuction}
              style={{ width: '100%' }}
              options={squadPlayers.map((player) => ({
                label: `${player.name} (${player.position})`,
                value: player._id || player.id,
              }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Starting Bid (SamPts)</label>
            <InputNumber
              min={0}
              value={startingBid}
              onChange={setStartingBid}
              style={{ width: '100%' }}
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Auction Duration</label>
            <Select
              placeholder="Select duration"
              value={auctionDuration}
              onChange={setAuctionDuration}
              style={{ width: '100%' }}
              options={[
                { label: '12 hours', value: 12 },
                { label: '24 hours', value: 24 },
                { label: '48 hours', value: 48 },
                { label: '72 hours', value: 72 },
              ]}
            />
          </div>
        </Space>
      </Modal>

      {/* ── Player Detail Modal ── */}
      <Modal
        open={playerModalVisible}
        onCancel={() => { setPlayerModalVisible(false); setSelectedPlayer(null); }}
        footer={[
          <Button key="sign" type="primary" onClick={() => {
            setPlayerModalVisible(false);
            handleSignFreeAgent(selectedPlayer?.id || selectedPlayer?._id, selectedPlayer?.name);
          }}>
            Sign Player
          </Button>,
          <Button key="close" onClick={() => { setPlayerModalVisible(false); setSelectedPlayer(null); }}>
            Close
          </Button>,
        ]}
        width={680}
        title={null}
        bodyStyle={{ padding: 0 }}
      >
        {selectedPlayer && (() => {
          const p = selectedPlayer;
          const posObj = POSITIONS[p.position] || {};
          const posColor = posObj.color || '#999';
          const ovrVal = p.rating || p.overallRating || 0;
          const ovrColor = ovrVal >= 80 ? '#52c41a' : ovrVal >= 70 ? '#faad14' : ovrVal >= 60 ? '#1890ff' : '#999';
          const fmtSalary = (v) => {
            if (!v) return '—';
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M SP`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}K SP`;
            return `${v} SP`;
          };

          return (
            <div>
              {/* Hero banner */}
              <div style={{
                background: `linear-gradient(135deg, ${posColor}dd, ${posColor}88)`,
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}>
                <Avatar
                  src={p.photo}
                  size={90}
                  style={{ border: '3px solid rgba(255,255,255,0.8)', backgroundColor: posColor, fontWeight: 'bold', fontSize: 28, color: '#fff' }}
                >
                  {!p.photo && (posObj.abbr || p.position)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge color={posColor} text={<span style={{ color: '#fff', fontWeight: 600 }}>{posObj.name || p.position}</span>} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{p.club || 'Free Agent'}</span>
                    {p.nationality && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>• {p.nationality}</span>}
                  </div>
                </div>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', backgroundColor: ovrColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid rgba(255,255,255,0.9)',
                }}>
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{ovrVal || '—'}</span>
                </div>
              </div>

              {/* Quick stats row */}
              <div style={{
                display: 'flex', justifyContent: 'space-around', padding: '16px 20px',
                backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Age</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{p.age || '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Salary</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>{fmtSalary(p.salary)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Mkt Value</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>{fmtSalary(p.marketValue)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Total Pts</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{p.fantasyPointsTotal ? p.fantasyPointsTotal.toFixed(1) : '—'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Avg Pts</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{p.fantasyPointsAvg ? p.fantasyPointsAvg.toFixed(1) : '—'}</div>
                </div>
              </div>

              {/* Detailed stats */}
              <div style={{ padding: '20px 28px' }}>
                {/* Season performance */}
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Season Performance</div>
                <Row gutter={[16, 8]} style={{ marginBottom: 20 }}>
                  {[
                    { label: 'Appearances', value: p.appearances },
                    { label: 'Goals', value: p.goalsScored },
                    { label: 'Assists', value: p.assists },
                    { label: 'Clean Sheets', value: p.cleanSheets },
                    { label: 'Minutes', value: p.minutesPlayed },
                    { label: 'Yellow Cards', value: p.yellowCards },
                    { label: 'Red Cards', value: p.redCards },
                    { label: 'Saves', value: p.saves },
                  ].map((stat, i) => (
                    <Col span={6} key={i}>
                      <div style={{ textAlign: 'center', padding: '8px 4px', backgroundColor: '#fafafa', borderRadius: 6 }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{stat.value || 0}</div>
                        <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase' }}>{stat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                {/* Attacking stats */}
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Attacking</div>
                <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                  {[
                    { label: 'Shots', value: p.shotsTotal },
                    { label: 'On Target', value: p.shotsOnTarget },
                    { label: 'Dribbles', value: p.dribblesCompleted },
                    { label: 'Key Passes', value: p.keyPasses },
                  ].map((stat, i) => (
                    <Col span={6} key={i}>
                      <div style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{stat.value || 0}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{stat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Defensive stats */}
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Defensive</div>
                <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                  {[
                    { label: 'Tackles', value: p.tacklesWon },
                    { label: 'Interceptions', value: p.interceptions },
                    { label: 'Blocks', value: p.blockedShots },
                    { label: 'Duels Won', value: p.aerialDuelsWon },
                  ].map((stat, i) => (
                    <Col span={6} key={i}>
                      <div style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{stat.value || 0}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{stat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Passing & Per-game averages */}
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Per-Game Averages</div>
                <Row gutter={[16, 8]}>
                  {[
                    { label: 'Pass Accuracy', value: p.passAccuracy ? `${p.passAccuracy}%` : '—', pct: p.passAccuracy },
                    { label: 'Tackles/G', value: p.tacklesPerGame?.toFixed(1) },
                    { label: 'Key Passes/G', value: p.keyPassesPerGame?.toFixed(1) },
                    { label: 'Dribbles/G', value: p.dribblesPerGame?.toFixed(1) },
                  ].map((stat, i) => (
                    <Col span={6} key={i}>
                      <div style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{stat.value || '0.0'}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{stat.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {p.preferredFoot && (
                  <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
                    Preferred Foot: <strong>{p.preferredFoot}</strong>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Transfers;
