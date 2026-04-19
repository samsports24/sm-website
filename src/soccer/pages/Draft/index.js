import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
  Empty,
  Spin,
  Switch,
  Alert,
  Tooltip,
  Tag,
  Tabs,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  StarOutlined,
  StarFilled,
  StopOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken, POSITIONS } from '../../config/constants';

const Draft = () => {
  const { leagueName, league, team, user } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [draftStatus, setDraftStatus] = useState({
    isLive: false,
    currentRound: 0,
    currentPick: 0,
    totalPicks: 0,
    timeRemaining: 0,
    teams: [],
    currentTeam: null,
    currentTeamName: '',
  });
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterPosition, setFilterPosition] = useState(null);
  const [autoPick, setAutoPick] = useState(false);
  const [draftBoard, setDraftBoard] = useState([]);

  // Watchlist, queue, and blacklist (stored locally per session)
  const [watchlist, setWatchlist] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [activePlayerTab, setActivePlayerTab] = useState('all');

  const myTeamId = team?._id || null;
  const leagueId = league?._id;

  // Use ref for timer to avoid re-render loops
  const timerRef = useRef(null);

  const fetchDraftData = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    try {
      attachSoccerToken();
      const [statusRes, playersRes, boardRes] = await Promise.allSettled([
        soccerAPI.get(`/api/v1/drafts/${leagueId}/status`),
        soccerAPI.get(`/api/v1/drafts/${leagueId}/available-players`),
        soccerAPI.get(`/api/v1/drafts/${leagueId}/board`),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.data?.data) {
        const s = statusRes.value.data.data;
        setDraftStatus({
          isLive: s.isLive || s.status === 'live' || false,
          currentRound: s.currentRound || 0,
          currentPick: s.currentPick || s.overallPick || 0,
          totalPicks: s.totalPicks || 0,
          timeRemaining: s.timeRemaining || s.timer || 0,
          teams: Array.isArray(s.teams) ? s.teams : [],
          currentTeam: s.currentTeam || s.onTheClock || null,
          currentTeamName: s.currentTeamName || s.onTheClockName || '',
        });
      }

      if (playersRes.status === 'fulfilled' && playersRes.value?.data?.data) {
        setAvailablePlayers(Array.isArray(playersRes.value.data.data) ? playersRes.value.data.data : []);
      }

      if (boardRes.status === 'fulfilled' && boardRes.value?.data?.data) {
        setDraftBoard(Array.isArray(boardRes.value.data.data) ? boardRes.value.data.data : []);
      }
    } catch {
      // APIs may not be ready yet
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  // Fetch on mount + when league loads
  useEffect(() => {
    if (leagueId) fetchDraftData();
    else setLoading(false);
  }, [leagueId, fetchDraftData]);

  // Countdown timer — use ref-based interval to avoid dependency re-render loop
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!draftStatus.isLive) return;

    timerRef.current = setInterval(() => {
      setDraftStatus((prev) => {
        if (prev.timeRemaining <= 1) {
          // Schedule cleanup outside the state updater
          setTimeout(() => clearInterval(timerRef.current), 0);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [draftStatus.isLive]); // Only depends on isLive, NOT timeRemaining

  // ── Watchlist / Blacklist handlers ──
  const toggleWatchlist = (playerId) => {
    setWatchlist((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const toggleBlacklist = (playerId) => {
    setBlacklist((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleMakePick = async (playerId) => {
    if (!leagueId) return;
    try {
      attachSoccerToken();
      await soccerAPI.post(`/api/v1/drafts/${leagueId}/pick`, { playerId });
      message.success('Player drafted!');
      await fetchDraftData();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to make pick');
    }
  };

  // ── Filtered + categorized player lists ──
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((p) => {
      const pid = p._id || p.id;
      const name = p.name || p.Name || '';
      const position = p.position || p.Position || '';
      const matchesSearch = name.toLowerCase().includes(searchText.toLowerCase());
      const matchesPosition = !filterPosition || position === filterPosition;
      const notBlacklisted = activePlayerTab === 'blacklist' || !blacklist.includes(pid);
      return matchesSearch && matchesPosition && notBlacklisted;
    });
  }, [availablePlayers, searchText, filterPosition, blacklist, activePlayerTab]);

  const watchlistPlayers = useMemo(() => {
    return availablePlayers.filter((p) => watchlist.includes(p._id || p.id));
  }, [availablePlayers, watchlist]);

  const blacklistPlayers = useMemo(() => {
    return availablePlayers.filter((p) => blacklist.includes(p._id || p.id));
  }, [availablePlayers, blacklist]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isMyTurn = myTeamId && (
    String(draftStatus.currentTeam) === String(myTeamId) ||
    draftStatus.currentTeamName === team?.name
  );

  // ── Player row renderer (shared across tabs) ──
  const renderPlayerRow = (player) => {
    const pid = player._id || player.id;
    const isWatched = watchlist.includes(pid);
    const isBlocked = blacklist.includes(pid);
    const name = player.name || player.Name || '';
    const pos = player.position || player.Position || '';
    const posColor = POSITIONS[pos]?.color || '#999';

    return (
      <div
        key={pid}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10,
          opacity: isBlocked && activePlayerTab !== 'blacklist' ? 0.4 : 1,
        }}
      >
        {/* Photo */}
        {player.photo && (
          <img
            src={player.photo}
            alt=""
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}

        {/* Name + Position */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            <Tag color={posColor} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{pos}</Tag>
            {player.club && <span>{player.club}</span>}
          </div>
        </div>

        {/* Rating */}
        <div style={{ textAlign: 'center', minWidth: 40 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{player.rating || player.overallRating || '-'}</div>
          <div style={{ fontSize: 9, opacity: 0.4 }}>OVR</div>
        </div>

        {/* Salary */}
        {player.salary > 0 && (
          <div style={{ textAlign: 'center', minWidth: 50 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {player.salary >= 1000000 ? `${(player.salary / 1000000).toFixed(1)}M` : `${(player.salary / 1000).toFixed(0)}K`}
            </div>
            <div style={{ fontSize: 9, opacity: 0.4 }}>SAL</div>
          </div>
        )}

        {/* Action buttons */}
        <Space size={4}>
          <Tooltip title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}>
            <Button
              type="text"
              size="small"
              icon={isWatched ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
              onClick={(e) => { e.stopPropagation(); toggleWatchlist(pid); }}
            />
          </Tooltip>
          <Tooltip title={isBlocked ? 'Remove from blacklist' : 'Blacklist (skip in auto-pick)'}>
            <Button
              type="text"
              size="small"
              icon={<StopOutlined style={{ color: isBlocked ? '#ff4d4f' : undefined }} />}
              onClick={(e) => { e.stopPropagation(); toggleBlacklist(pid); }}
            />
          </Tooltip>
          <Button
            type="primary"
            size="small"
            onClick={() => handleMakePick(pid)}
            disabled={!isMyTurn}
          >
            Draft
          </Button>
        </Space>
      </div>
    );
  };

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
        <h2>{leagueName} Draft</h2>
      </div>

      {/* Draft Not Live */}
      {!draftStatus.isLive && (
        <Alert
          message="Draft is not live"
          description="Check back for the next scheduled draft. The commissioner will start the draft when all teams are ready."
          type="info"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Draft Status Header */}
      {draftStatus.isLive && (
        <Card
          style={{
            marginBottom: '24px',
            background: isMyTurn
              ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
              : 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
            color: '#fff',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Current Round"
                value={draftStatus.currentRound || '--'}
                valueStyle={{ color: '#fff' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Overall Pick"
                value={draftStatus.currentPick || '--'}
                suffix={draftStatus.totalPicks ? `/${draftStatus.totalPicks}` : ''}
                valueStyle={{ color: '#fff' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Time Left"
                value={formatTime(draftStatus.timeRemaining)}
                prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontSize: '24px' }}
              />
            </Col>
            <Col xs={24} sm={6}>
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>On the Clock</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {draftStatus.currentTeamName || 'Waiting...'}
                </div>
                {isMyTurn && <Badge status="success" text="Your Turn!" />}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Your Turn Spotlight */}
      {isMyTurn && watchlistPlayers.length > 0 && (
        <Card
          title={<span><StarFilled style={{ color: '#fadb14', marginRight: 6 }} />Quick Pick from Watchlist</span>}
          style={{ marginBottom: '24px' }}
          type="inner"
        >
          <Row gutter={[12, 12]}>
            {watchlistPlayers.slice(0, 6).map((player) => (
              <Col key={player._id || player.id} xs={12} sm={8} lg={4}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => handleMakePick(player._id || player.id)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 12 }}>{player.name || player.Name}</div>
                  <Tag color={POSITIONS[player.position || player.Position]?.color} style={{ fontSize: 10 }}>
                    {player.position || player.Position}
                  </Tag>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', margin: '4px 0' }}>
                    {player.rating || player.overallRating || '-'}
                  </div>
                  <Button type="primary" size="small" block>Draft</Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Draft Board */}
      <Card title="Draft Board" style={{ marginBottom: '24px' }}>
        {draftBoard.length === 0 ? (
          <Empty description="Draft board will appear when the draft begins" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Round</th>
                  {draftStatus.teams.map((t) => (
                    <th
                      key={t._id || t.id}
                      style={{
                        border: '1px solid #ddd',
                        padding: '8px',
                        backgroundColor: String(t._id || t.id) === String(myTeamId) ? '#e6f7ff' : '#fff',
                        fontWeight: 'bold',
                      }}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draftBoard.map((row, idx) => (
                  <tr key={row.round || idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                      Rd {row.round || idx + 1}
                    </td>
                    {(row.picks || []).map((pick, pIdx) => (
                      <td
                        key={pIdx}
                        style={{
                          border: '1px solid #ddd',
                          padding: '8px',
                          backgroundColor: pick.player ? '#f5f5f5' : '#fff',
                        }}
                      >
                        {pick.player?.name || pick.playerName || pick || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Auto-pick Toggle */}
      {draftStatus.isLive && (
        <Card style={{ marginBottom: '24px' }}>
          <Space>
            <span>Enable Auto-Pick</span>
            <Switch checked={autoPick} onChange={setAutoPick} disabled={!isMyTurn} />
          </Space>
        </Card>
      )}

      {/* Available Players with Tabs: All / Watchlist / Blacklist */}
      <Card
        title="Players"
        extra={
          <Space>
            <Tag color="gold"><StarFilled /> {watchlist.length} Watchlist</Tag>
            <Tag color="red"><StopOutlined /> {blacklist.length} Blacklist</Tag>
          </Space>
        }
      >
        {/* Filters */}
        <Space direction="vertical" style={{ width: '100%', marginBottom: '12px' }}>
          <Input
            placeholder="Search players..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
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
        </Space>

        {/* Tabs: All Players / Watchlist / Blacklist */}
        <Tabs
          activeKey={activePlayerTab}
          onChange={setActivePlayerTab}
          items={[
            {
              key: 'all',
              label: `All Players (${filteredPlayers.length})`,
              children: filteredPlayers.length === 0 ? (
                <Empty description="No players matching your filter" />
              ) : (
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  {filteredPlayers.map(renderPlayerRow)}
                </div>
              ),
            },
            {
              key: 'watchlist',
              label: <span><StarFilled style={{ color: '#fadb14' }} /> Watchlist ({watchlistPlayers.length})</span>,
              children: watchlistPlayers.length === 0 ? (
                <Empty description="Star players to add them to your watchlist" />
              ) : (
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  {watchlistPlayers.map(renderPlayerRow)}
                </div>
              ),
            },
            {
              key: 'blacklist',
              label: <span><StopOutlined style={{ color: '#ff4d4f' }} /> Blacklist ({blacklistPlayers.length})</span>,
              children: blacklistPlayers.length === 0 ? (
                <Empty description="Block players you don't want to auto-pick" />
              ) : (
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  {blacklistPlayers.map(renderPlayerRow)}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Draft;
