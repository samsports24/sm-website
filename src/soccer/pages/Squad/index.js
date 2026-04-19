import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Spin, Modal, message, Row, Col, Statistic, Progress,
  Button, Input, Select, Empty,
} from 'antd';
import {
  DeleteOutlined, CrownOutlined, AlertOutlined, TeamOutlined,
  SaveOutlined, ThunderboltOutlined, DollarOutlined, SearchOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken, POSITIONS, SQUAD_SIZE, ACADEMY_SIZE } from '../../config/constants';
import '../../styles/global.css';
import '../../../pages/NFLRivals/nfl-rivals.css';

/* ── Position colour map ── */
const POS_COLOR = {};
Object.entries(POSITIONS).forEach(([key, val]) => { POS_COLOR[key] = val.color; });

const POS_OPTIONS = Object.entries(POSITIONS).map(([k, v]) => ({ label: v.abbr, value: k }));

/* ── Zones ── */
const ZONES = [
  { role: 'starter',    label: 'Starters',    max: 11, color: '#4ade80', sublabel: '100% scoring' },
  { role: 'substitute', label: 'Bench',        max: 5,  color: '#fbbf24', sublabel: '50% scoring' },
  { role: 'academy',    label: 'Reserves',     max: ACADEMY_SIZE || 9, color: '#a78bfa', sublabel: '0% scoring' },
];

const formatValue = (v) => {
  if (!v) return '$0';
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
};

const Squad = () => {
  const navigate = useNavigate();
  const { leagueName, leagueColor, teamName, team } = useSoccerLeague();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [captain, setCaptain] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [dragPlayerId, setDragPlayerId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Search state
  const [searchQ, setSearchQ] = useState('');
  const [searchPos, setSearchPos] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { fetchSquadData(); }, [team]);

  const fetchSquadData = async () => {
    setLoading(true);
    try {
      attachSoccerToken();
      const squadRes = await soccerAPI.get('/api/v1/teams/squad');
      if (squadRes?.data?.data) {
        const sq = squadRes.data.data;
        const players = (sq.players || []).map((p, idx) => ({
          id: p._id, _id: p._id, number: p.number,
          name: p.name || p.displayName, position: p.position,
          club: p.club || p.realClub || p.team?.name || 'Unknown',
          rating: p.rating || 0,
          salary: p.salary || 0,
          marketValue: p.marketValue || p.realMarketValue || 0,
          photo: p.photo || p.headshot || null,
          age: p.age || null,
          fantasyPoints: p.fantasyPointsAvg || p.fantasyPointsTotal || 0,
          isInjured: (sq.injured || []).includes(p._id),
          zone: idx < 11 ? 'starter' : idx < 16 ? 'substitute' : 'academy',
        }));
        setAllPlayers(players);
        setCaptain(sq.captain || sq.captainId || null);
        setDirty(false);
      }
    } catch (e) { console.error(e); message.error('Failed to load squad data'); }
    finally { setLoading(false); }
  };

  /* ── Drag & Drop ── */
  const handleDragStart = (e, pid) => { setDragPlayerId(pid); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnd = () => { setDragPlayerId(null); setDropTarget(null); };
  const handleDragOver = (e, zoneRole) => { e.preventDefault(); setDropTarget(zoneRole); };
  const handleDragLeave = (e, zoneRole) => { if (dropTarget === zoneRole) setDropTarget(null); };
  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    if (!dragPlayerId) return;
    setAllPlayers(prev => prev.map(p => p.id === dragPlayerId ? { ...p, zone: targetZone } : p));
    setDragPlayerId(null); setDropTarget(null); setDirty(true);
  };

  /* ── Zone change via dropdown ── */
  const changeZone = useCallback((pid, newZone) => {
    setAllPlayers(prev => prev.map(p => p.id === pid ? { ...p, zone: newZone } : p));
    setDirty(true);
  }, []);

  /* ── Release player ── */
  const removePlayer = (pid) => {
    Modal.confirm({
      title: 'Release Player', content: 'Release this player from your squad?',
      okText: 'Release', cancelText: 'Cancel', okButtonProps: { danger: true },
      onOk: async () => {
        try {
          attachSoccerToken();
          await soccerAPI.delete(`/api/v1/teams/squad/${pid}`);
          setAllPlayers(prev => prev.filter(p => p.id !== pid));
          message.success('Player released');
        } catch (e) { message.error('Failed to release player'); }
      },
    });
  };

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      attachSoccerToken();
      const payload = {
        starters: allPlayers.filter(p => p.zone === 'starter').map(p => p.id),
        substitutes: allPlayers.filter(p => p.zone === 'substitute').map(p => p.id),
        academy: allPlayers.filter(p => p.zone === 'academy').map(p => p.id),
      };
      await soccerAPI.put('/api/v1/teams/squad/zones', payload);
      message.success('Squad saved!');
      setDirty(false);
    } catch (e) { message.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  /* ── Search ── */
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      attachSoccerToken();
      const params = new URLSearchParams();
      if (searchQ) params.append('name', searchQ);
      if (searchPos) params.append('position', searchPos);
      params.append('limit', '20');
      const res = await soccerAPI.get(`/api/v1/players/search?${params.toString()}`);
      setSearchResults(res.data?.data || []);
    } catch (e) { message.error('Search failed'); }
    finally { setSearchLoading(false); }
  };

  const signPlayer = async (player) => {
    try {
      attachSoccerToken();
      await soccerAPI.post('/api/v1/teams/squad/sign', { playerId: player._id });
      message.success(`Signed ${player.name || player.displayName}!`);
      await fetchSquadData();
    } catch (e) { message.error(e.response?.data?.message || 'Failed to sign player'); }
  };

  /* ── AI Coach analysis ── */
  const analyzeSquad = () => {
    const tips = [];
    const starters = allPlayers.filter(p => p.zone === 'starter');
    const bench = allPlayers.filter(p => p.zone === 'substitute');
    const academy = allPlayers.filter(p => p.zone === 'academy');

    if (starters.length < 11) tips.push({ icon: '🏟️', color: '#fbbf24', text: `Only ${starters.length}/11 starters assigned. Drag players to Starters for 100% scoring.` });
    if (starters.length === 11) tips.push({ icon: '✅', color: '#4ade80', text: 'Full Starting XI assigned. Ready to compete!' });
    if (bench.length < 5) tips.push({ icon: '🪑', color: '#94a3b8', text: `Bench has ${bench.length}/5 spots filled. Bench players earn 50% scoring.` });
    if (!starters.some(p => p.position === 'GK')) tips.push({ icon: '🧤', color: '#ef4444', text: 'No goalkeeper in Starting XI!' });
    if (academy.length < (ACADEMY_SIZE || 3)) tips.push({ icon: '⭐', color: '#a78bfa', text: `${academy.length}/${ACADEMY_SIZE || 3} academy spots filled — you need ${ACADEMY_SIZE || 3} to pass squad validation.` });

    return tips;
  };

  /* ── Render mini card ── */
  const renderMiniCard = (p, zone) => {
    const pos = p.position || '';
    const posColor = POS_COLOR[pos] || '#94a3b8';
    const isDragging = dragPlayerId === p.id;
    const rating = p.rating || 0;
    const ratingTier = rating >= 80 ? 'elite' : rating >= 65 ? 'good' : 'avg';
    const isCaptain = captain === p.id;

    return (
      <div key={p.id} className={`mc-card${isDragging ? ' mc-dragging' : ''}`}
        style={{ '--mc-pos-color': posColor }}
        draggable onDragStart={(e) => handleDragStart(e, p.id)} onDragEnd={handleDragEnd}>
        <button className="mc-cut" onClick={() => removePlayer(p.id)} title="Release">
          <DeleteOutlined />
        </button>
        <div className="mc-pos-badge" style={{ background: posColor }}>{POSITIONS[pos]?.abbr || pos}</div>
        <div className="mc-photo-wrap">
          <div className="mc-photo-ring"><div className="mc-photo-ring-inner" /></div>
          {p.photo ? (
            <img src={p.photo} alt="" className="mc-photo" />
          ) : (
            <div className="mc-photo-ph"><span>{(p.name || '?').charAt(0)}</span></div>
          )}
          {p.isInjured && <span className="mc-injured"><AlertOutlined /></span>}
        </div>
        <div className="mc-name">
          {isCaptain && <CrownOutlined style={{ color: '#fbbf24', marginRight: 3, fontSize: 10 }} />}
          {(p.name || 'Unknown').split(' ').pop()}
        </div>
        <div className="mc-details">
          <span className={`mc-rating mc-rating--${ratingTier}`}>{rating}</span>
          <span className="mc-value">{formatValue(p.marketValue)}</span>
        </div>
        <select className="mc-zone-select" value={zone.role}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => changeZone(p.id, e.target.value)}>
          {ZONES.map(z => <option key={z.role} value={z.role}>{z.label}</option>)}
        </select>
      </div>
    );
  };

  const renderEmptySlot = (zone, idx) => (
    <div key={`empty-${zone.role}-${idx}`} className="mc-card mc-empty">
      <div className="mc-empty-icon">+</div>
      <div className="mc-empty-label">{zone.label}</div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  const totalValue = allPlayers.reduce((s, p) => s + (p.marketValue || 0), 0);
  const valuePct = Math.min(100, Math.round((totalValue / 600000000) * 100));

  return (
    <div className="nflr-page">
      <h2 className="nflr-page-title"><TeamOutlined /> Squad Builder</h2>

      {/* ═══ Stats Bar ═══ */}
      <Card className="nflr-card" bordered={false} style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col xs={12} sm={3}>
            <Statistic title="Players" value={allPlayers.length} suffix={`/ ${SQUAD_SIZE + ACADEMY_SIZE}`}
              valueStyle={{ color: allPlayers.length >= SQUAD_SIZE ? '#4ade80' : '#e2e8f0' }} />
          </Col>
          {ZONES.map(z => (
            <Col xs={12} sm={3} key={z.role}>
              <Statistic title={z.label} value={allPlayers.filter(p => p.zone === z.role).length}
                suffix={`/ ${z.max}`} valueStyle={{ color: z.color }} />
            </Col>
          ))}
          <Col xs={24} sm={9}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Budget</span>
              <strong style={{ color: '#4ade80', fontSize: 14 }}>
                {formatValue(totalValue)} / {formatValue(600000000)}
              </strong>
            </div>
            <Progress percent={valuePct} strokeColor="#4ade80" showInfo={false} size="small" />
          </Col>
        </Row>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Button block type="primary" size="large" icon={<SaveOutlined />}
            loading={saving} disabled={!dirty} onClick={handleSave}
            style={{ background: dirty ? `linear-gradient(135deg, ${leagueColor}, ${leagueColor}bb)` : undefined, border: 'none', fontWeight: 700 }}>
            {dirty ? 'Save Squad' : 'Squad Saved'}
          </Button>
          <Button size="large" icon={<DollarOutlined />}
            onClick={() => navigate('/buy-sam-points?from=soccer', { state: { fromRivals: true } })}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700, color: '#fff', flex: '0 0 auto' }}>
            Buy SP
          </Button>
        </div>
      </Card>

      {/* ═══ AI Coach ═══ */}
      <div style={{
        background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.2)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 'fit-content' }}>
          <MedicineBoxOutlined style={{ fontSize: 20, color: leagueColor }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: leagueColor, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.5px' }}>AI COACH</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analyzeSquad().map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#CBD5E1' }}>
              <span>{tip.icon}</span>
              <span style={{ color: tip.color, fontWeight: 500 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Drag Instruction ═══ */}
      <div style={{ marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
        Drag players between zones to assign roles, or use the dropdown on each player
      </div>

      {/* ═══ Starter & Bench Zones — Card Grid ═══ */}
      {ZONES.filter(z => z.role !== 'academy').map(zone => {
        const zonePlayers = allPlayers.filter(p => p.zone === zone.role);
        const emptySlots = Math.max(0, zone.max - zonePlayers.length);
        return (
          <div key={zone.role}
            className={`mc-zone${dropTarget === zone.role ? ' mc-zone-drop' : ''}${dragPlayerId ? ' mc-zone-dragging' : ''}`}
            onDragOver={(e) => handleDragOver(e, zone.role)}
            onDragLeave={(e) => handleDragLeave(e, zone.role)}
            onDrop={(e) => handleDrop(e, zone.role)}
            style={{ '--zone-accent': zone.color }}>
            <div className="mc-zone-header">
              <span className="mc-zone-dot" style={{ background: zone.color }} />
              <span className="mc-zone-label">{zone.label}</span>
              <span className="mc-zone-count">{zonePlayers.length}/{zone.max}</span>
              <span className="mc-zone-scoring">{zone.sublabel}</span>
            </div>
            <div className="mc-grid">
              {zonePlayers.map(p => renderMiniCard(p, zone))}
              {emptySlots > 0 && Array.from({ length: Math.min(emptySlots, 4) }).map((_, i) => renderEmptySlot(zone, i))}
            </div>
          </div>
        );
      })}

      {/* ═══ Academy / Reserves — Horizontal Scroll Carousel ═══ */}
      {(() => {
        const zone = ZONES.find(z => z.role === 'academy');
        const zonePlayers = allPlayers.filter(p => p.zone === 'academy');
        return (
          <div
            className={`mc-zone mc-zone-bench${dropTarget === 'academy' ? ' mc-zone-drop' : ''}${dragPlayerId ? ' mc-zone-dragging' : ''}`}
            onDragOver={(e) => handleDragOver(e, 'academy')}
            onDragLeave={(e) => handleDragLeave(e, 'academy')}
            onDrop={(e) => handleDrop(e, 'academy')}
            style={{ '--zone-accent': zone.color }}>
            <div className="mc-zone-header">
              <span className="mc-zone-dot" style={{ background: zone.color }} />
              <span className="mc-zone-label">Reserves</span>
              <span className="mc-zone-count">{zonePlayers.length}/{zone.max}</span>
              <span className="mc-zone-scoring">{zone.sublabel}</span>
            </div>
            {zonePlayers.length > 0 ? (
              <div className="mc-carousel">
                <div className="mc-carousel-track">
                  {zonePlayers.map(p => renderMiniCard(p, zone))}
                </div>
              </div>
            ) : (
              <div className="mc-zone-empty-msg">
                {dragPlayerId ? 'Drop here for Reserves' : 'No reserve players — search below to sign players'}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ Player Search ═══ */}
      <Card className="nflr-card" bordered={false} style={{ marginBottom: 20, marginTop: 24 }}>
        <h3 className="nflr-card-heading"><SearchOutlined /> Find Players</h3>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10}>
            <Input placeholder="Search by name..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              onPressEnter={handleSearch} allowClear prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.3)' }} />} />
          </Col>
          <Col xs={12} sm={6}>
            <Select placeholder="Position" allowClear style={{ width: '100%' }}
              value={searchPos || undefined} onChange={v => setSearchPos(v || '')} options={POS_OPTIONS} />
          </Col>
          <Col xs={12} sm={8}>
            <Button type="primary" block loading={searchLoading} onClick={handleSearch}
              style={{ background: `linear-gradient(135deg, ${leagueColor}, ${leagueColor}bb)`, border: 'none', fontWeight: 700 }}>Search</Button>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          {searchLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin size="large" /></div>
          ) : searchResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(p => {
                const pos = p.position || '';
                const posColor = POS_COLOR[pos] || '#94a3b8';
                const alreadyOwned = allPlayers.some(op => op.id === p._id);
                return (
                  <div key={p._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
                      background: 'rgba(0,0,0,0.3)', flexShrink: 0,
                    }}>
                      {p.photo ? <img src={p.photo} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                        : <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: posColor, fontWeight: 800, fontSize: 16 }}>{(p.name || '?').charAt(0)}</div>}
                    </div>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 800,
                      color: '#fff', padding: '2px 7px', borderRadius: 6,
                      background: posColor, letterSpacing: 0.8,
                    }}>{POSITIONS[pos]?.abbr || pos}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>{p.name || p.displayName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{p.club || p.realClub} {p.age ? `Age ${p.age}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#4ade80' }}>{p.rating || 0}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{formatValue(p.marketValue || p.realMarketValue || 0)}</div>
                    </div>
                    <Button size="small" type="primary" disabled={alreadyOwned}
                      onClick={() => signPlayer(p)}
                      style={{ background: alreadyOwned ? undefined : `linear-gradient(135deg, ${leagueColor}, ${leagueColor}bb)`, border: 'none', fontWeight: 700, fontSize: 12 }}>
                      {alreadyOwned ? 'Owned' : 'Sign'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="Search for players to sign" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Squad;
