import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Tabs, Button, Modal, Select, Space, Row, Col,
  Statistic, Spin, Alert, Empty, Tag, Badge, Input, message, Progress,
} from 'antd';
import {
  ThunderboltOutlined, DeleteOutlined, TeamOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, SearchOutlined, CheckCircleOutlined,
  WarningOutlined, ReloadOutlined,
} from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import * as soccerService from '../../services/soccerService';
import '../../styles/global.css';
import '../../../pages/NFLRivals/nfl-rivals.css';

const { TabPane } = Tabs;
const { Option } = Select;

/* ── Helpers ── */
const fmt = (v) => {
  if (!v) return '€0';
  if (v >= 1e9) return `€${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `€${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `€${(v / 1e3).toFixed(0)}K`;
  return `€${v}`;
};

const phaseLabel = (p) => {
  const map = {
    league_phase: 'League Phase', playoff: 'Playoff', r16: 'Round of 16',
    qf: 'Quarter-Finals', sf: 'Semi-Finals',
  };
  return map[p] || p || 'Unknown';
};

const CLFantasy = () => {
  const { league, team, teamName, matchweek } = useSoccerLeague();
  const isCL = league?.realLeague === 'champions_league';

  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [elimStatus, setElimStatus] = useState(null);
  const [auctionWindow, setAuctionWindow] = useState(null);
  const [freeAgents, setFreeAgents] = useState([]);
  const [faSearch, setFaSearch] = useState('');
  const [faPos, setFaPos] = useState(null);
  const [faLoading, setFaLoading] = useState(false);
  const [dropping, setDropping] = useState(null);
  const [droppingAll, setDroppingAll] = useState(false);

  /* ── Data Loaders ── */
  const loadElimStatus = useCallback(async () => {
    if (!team?._id) return;
    try {
      const res = await soccerService.getCLEliminationStatus(team._id);
      setElimStatus(res.data?.data || null);
    } catch { setElimStatus(null); }
  }, [team?._id]);

  const loadAuctionWindow = useCallback(async () => {
    if (!league?._id) return;
    try {
      const res = await soccerService.getCLAuctionWindow(league._id);
      setAuctionWindow(res.data?.data || null);
    } catch { setAuctionWindow(null); }
  }, [league?._id]);

  const loadFreeAgents = useCallback(async () => {
    if (!league?._id) return;
    setFaLoading(true);
    try {
      const params = {};
      if (faSearch) params.search = faSearch;
      if (faPos) params.position = faPos;
      const res = await soccerService.getCLFreeAgents(league._id, params);
      setFreeAgents(res.data?.data?.players || []);
    } catch { setFreeAgents([]); }
    setFaLoading(false);
  }, [league?._id, faSearch, faPos]);

  useEffect(() => {
    if (!isCL) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      await Promise.allSettled([loadElimStatus(), loadAuctionWindow()]);
      setLoading(false);
    };
    load();
  }, [isCL, loadElimStatus, loadAuctionWindow]);

  /* ── Actions ── */
  const handleDropPlayer = async (playerId, playerName) => {
    Modal.confirm({
      title: `Drop ${playerName}?`,
      icon: <ExclamationCircleOutlined />,
      content: auctionWindow?.activeWindow
        ? 'This player will be removed from your squad. Their market value will be refunded to your budget since an auction window is active.'
        : 'This player will be removed from your squad. No budget refund — there is no active auction window.',
      okText: 'Drop Player',
      okType: 'danger',
      onOk: async () => {
        setDropping(playerId);
        try {
          await soccerService.dropEliminatedPlayer(team._id, playerId);
          message.success(`${playerName} dropped from squad`);
          loadElimStatus();
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to drop player');
        }
        setDropping(null);
      },
    });
  };

  const handleDropAll = async () => {
    const elimCount = elimStatus?.eliminatedPlayers?.length || 0;
    Modal.confirm({
      title: `Drop all ${elimCount} eliminated players?`,
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: auctionWindow?.activeWindow
        ? `All ${elimCount} eliminated players will be removed. Market values will be refunded (active auction window).`
        : `All ${elimCount} eliminated players will be removed. No refund — no active auction window.`,
      okText: 'Drop All',
      okType: 'danger',
      onOk: async () => {
        setDroppingAll(true);
        try {
          const res = await soccerService.dropAllEliminatedPlayers(team._id);
          message.success(res.data?.message || `Dropped ${elimCount} players`);
          loadElimStatus();
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to drop players');
        }
        setDroppingAll(false);
      },
    });
  };

  /* ── Non-CL guard ── */
  if (!isCL) {
    return (
      <div className="nflr-page" style={{ padding: 24 }}>
        <Alert
          type="info" showIcon
          message="CL Fantasy Only"
          description="This page is only available for European Cup Fantasy leagues. Switch to a CL league to access elimination and auction features."
        />
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spin size="large" /></div>;
  }

  const hasActiveWindow = !!auctionWindow?.activeWindow;
  const eliminatedPlayers = elimStatus?.eliminatedPlayers || [];
  const activePlayers = elimStatus?.activePlayers || 0;
  const totalSquad = elimStatus?.totalSquad || 0;
  const canPlay = elimStatus?.matchdayReady !== false;

  return (
    <div className="nflr-page" style={{ padding: '16px 24px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThunderboltOutlined style={{ color: '#722ed1' }} />
          CL Fantasy — {teamName}
        </h2>
        <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 13 }}>
          Matchweek {matchweek} · {league?.name}
        </p>
      </div>

      {/* ── Squad Readiness Alert ── */}
      {!canPlay && (
        <Alert
          type="error" showIcon style={{ marginBottom: 16 }}
          icon={<WarningOutlined />}
          message="Squad Not Ready"
          description={`You need at least 16 active players (11 starters + 5 subs). Currently: ${activePlayers} active. Drop eliminated players and sign replacements during the auction window.`}
        />
      )}

      {/* ── Status Cards ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Active Players" value={activePlayers} suffix={`/ ${totalSquad}`}
              valueStyle={{ color: activePlayers >= 16 ? '#52c41a' : '#ff4d4f', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Eliminated" value={eliminatedPlayers.length}
              valueStyle={{ color: eliminatedPlayers.length > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Auction Window" value={hasActiveWindow ? 'OPEN' : 'CLOSED'}
              valueStyle={{ color: hasActiveWindow ? '#52c41a' : '#8c8c8c', fontWeight: 700, fontSize: 18 }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Statistic title="Budget" value={fmt(elimStatus?.budget || team?.budget || 0)}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      {/* ── Tabs ── */}
      <Tabs defaultActiveKey="elimination" type="card">
        {/* ════ Elimination Tab ════ */}
        <TabPane tab={<span><ExclamationCircleOutlined /> Elimination ({eliminatedPlayers.length})</span>} key="elimination">
          {eliminatedPlayers.length === 0 ? (
            <Empty description="No eliminated players in your squad" style={{ padding: 40 }} />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {eliminatedPlayers.length} player{eliminatedPlayers.length !== 1 ? 's' : ''} from eliminated clubs
                </span>
                <Button type="primary" danger loading={droppingAll} onClick={handleDropAll}
                  icon={<DeleteOutlined />}>
                  Drop All Eliminated
                </Button>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {eliminatedPlayers.map(p => (
                  <Card key={p._id || p.playerId} size="small" style={{ borderRadius: 10, borderLeft: '3px solid #ff4d4f' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {p.photo && (
                        <img src={p.photo} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.displayName || p.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {p.realClub || p.club} · {p.primaryPosition || p.position}
                          <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
                            Eliminated — {phaseLabel(p.clEliminatedPhase)}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginRight: 12 }}>
                        <div style={{ fontWeight: 700, color: '#1890ff' }}>{fmt(p.marketValue || p.salary)}</div>
                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                          {hasActiveWindow ? 'Refund on drop' : 'No refund'}
                        </div>
                      </div>
                      <Button type="primary" danger size="small" loading={dropping === (p._id || p.playerId)}
                        onClick={() => handleDropPlayer(p._id || p.playerId, p.displayName || p.name)}
                        icon={<DeleteOutlined />}>
                        Drop
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabPane>

        {/* ════ Auction Window Tab ════ */}
        <TabPane tab={<span><ClockCircleOutlined /> Auction Window</span>} key="auction">
          {hasActiveWindow ? (
            <Card style={{ borderRadius: 12, borderLeft: '3px solid #52c41a', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <Badge status="processing" color="#52c41a" />
                <span style={{ fontWeight: 800, fontSize: 16, color: '#52c41a' }}>
                  {(auctionWindow.activeWindow.windowKey || '').replace(/_/g, ' ')}
                </span>
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Opened" value={new Date(auctionWindow.activeWindow.openedAt).toLocaleString()} valueStyle={{ fontSize: 14 }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Closes" value={new Date(auctionWindow.activeWindow.closesAt).toLocaleString()} valueStyle={{ fontSize: 14, color: '#fa8c16' }} />
                </Col>
              </Row>
              <div style={{ marginTop: 12, fontSize: 13, color: '#8c8c8c' }}>
                During this window you can drop eliminated players for a market value refund and sign free agents.
              </div>
            </Card>
          ) : (
            <Alert type="info" showIcon style={{ marginBottom: 20 }}
              message="No Active Auction Window"
              description="Auction windows open automatically after CL rounds complete. The next window will open on the Monday before the next CL matchweek."
            />
          )}

          {/* Past/All Windows */}
          {auctionWindow?.allWindows?.length > 0 && (
            <Card title="All Auction Windows" size="small" style={{ borderRadius: 12 }}>
              {auctionWindow.allWindows.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < auctionWindow.allWindows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <Badge status={w.status === 'open' ? 'processing' : w.status === 'closed' ? 'error' : 'default'}
                    color={w.status === 'open' ? '#52c41a' : w.status === 'closed' ? '#ff4d4f' : '#d9d9d9'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{(w.windowKey || '').replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {w.openedAt ? `${new Date(w.openedAt).toLocaleDateString()} — ${w.closesAt ? new Date(w.closesAt).toLocaleDateString() : 'TBD'}` : 'Not yet opened'}
                    </div>
                  </div>
                  <Tag color={w.status === 'open' ? 'green' : w.status === 'closed' ? 'red' : 'default'}>
                    {(w.status || 'pending').toUpperCase()}
                  </Tag>
                </div>
              ))}
            </Card>
          )}
        </TabPane>

        {/* ════ Free Agents Tab ════ */}
        <TabPane tab={<span><TeamOutlined /> Free Agents</span>} key="freeAgents">
          {!hasActiveWindow ? (
            <Alert type="warning" showIcon
              message="Auction Window Closed"
              description="Free agents are only available during an active auction window. The window will open automatically after CL rounds finish."
            />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <Input placeholder="Search player or club..." prefix={<SearchOutlined />}
                  value={faSearch} onChange={e => setFaSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 200 }} allowClear />
                <Select placeholder="Position" allowClear value={faPos} onChange={setFaPos}
                  style={{ width: 140 }}>
                  {['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','CF','ST'].map(p =>
                    <Option key={p} value={p}>{p}</Option>
                  )}
                </Select>
                <Button icon={<ReloadOutlined />} onClick={loadFreeAgents} loading={faLoading}>
                  Refresh
                </Button>
              </div>

              {faLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
              ) : freeAgents.length === 0 ? (
                <Empty description="No free agents found" />
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {freeAgents.map((p, i) => (
                    <Card key={p._id || i} size="small" hoverable style={{ borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {p.photo && (
                          <img src={p.photo} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{p.displayName}</div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {p.realClub} · <Tag style={{ fontSize: 10 }}>{p.primaryPosition}</Tag>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginRight: 8 }}>
                          <div style={{ fontWeight: 700, color: '#1890ff' }}>{p.overallRating || '—'}</div>
                          <div style={{ fontSize: 10, color: '#8c8c8c' }}>OVR</div>
                        </div>
                        <div style={{ textAlign: 'right', marginRight: 8 }}>
                          <div style={{ fontWeight: 700, color: '#52c41a' }}>{fmt(p.salary || p.marketValue)}</div>
                          <div style={{ fontSize: 10, color: '#8c8c8c' }}>Value</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#722ed1' }}>{p.fantasyPointsTotal || 0}</div>
                          <div style={{ fontSize: 10, color: '#8c8c8c' }}>FPts</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CLFantasy;
