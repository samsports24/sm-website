import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Spin, Modal, Input, Select, message, Empty } from 'antd';
import {
  SaveOutlined, ClockCircleOutlined, ReloadOutlined,
  DeleteOutlined, CrownOutlined, AlertOutlined,
  SearchOutlined, CheckOutlined,
} from '@ant-design/icons';
import PitchView from '../../components/PitchView';
import FormationSelector from '../../components/FormationSelector';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken, FORMATIONS, POSITIONS, STARTING_XI } from '../../config/constants';
import './lineup.css';

/* ── Position colour map ── */
const POS_COLOR = {};
Object.entries(POSITIONS).forEach(([key, val]) => { POS_COLOR[key] = val.color; });

const ZONES = [
  { role: 'starter', label: 'Starting XI', max: 11 },
  { role: 'substitute', label: 'Substitutes', max: 5 },
];

const Lineup = () => {
  const { team, teamName, matchweek, leagueName } = useSoccerLeague();

  useEffect(() => { attachSoccerToken(); }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [formation, setFormation] = useState('4-3-3');
  const [starters, setStarters] = useState(Array(11).fill(null));
  const [substitutes, setSubstitutes] = useState(Array(5).fill(null));
  const [captain, setCaptain] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [matchdayDeadline, setMatchdayDeadline] = useState(null);
  const [dragPlayerId, setDragPlayerId] = useState(null);

  // Search modal state
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterPosition, setFilterPosition] = useState(null);

  useEffect(() => {
    if (!team?._id) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [squadResult, lineupResult] = await Promise.allSettled([
          soccerAPI.get('/api/v1/teams/squad'),
          soccerAPI.get(`/api/v1/lineups/${team._id}`),
        ]);

        if (squadResult.status === 'fulfilled' && squadResult.value?.data?.data) {
          const sq = squadResult.value.data.data;
          setAllPlayers(sq.players || []);
        }

        if (lineupResult.status === 'fulfilled' && lineupResult.value?.data?.data) {
          const lineup = lineupResult.value.data.data;
          if (lineup.formation) setFormation(lineup.formation);
          if (lineup.starters) {
            const arr = [...lineup.starters]; while (arr.length < 11) arr.push(null);
            setStarters(arr.slice(0, 11));
          }
          if (lineup.substitutes) {
            const arr = [...lineup.substitutes]; while (arr.length < 5) arr.push(null);
            setSubstitutes(arr.slice(0, 5));
          }
          if (lineup.captain) setCaptain(lineup.captain);
          if (lineup.deadline) setMatchdayDeadline(new Date(lineup.deadline));
        }
      } catch (e) { console.error(e); message.error('Failed to load lineup'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [team?._id]);

  /* ── Drag & Drop between zones ── */
  const handleDragStart = (e, pid) => { setDragPlayerId(pid); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnd = () => setDragPlayerId(null);
  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    if (!dragPlayerId) return;
    // Find the player
    const allSlotted = [...starters, ...substitutes].filter(Boolean);
    const player = allSlotted.find(p => (p._id || p.id) === dragPlayerId);
    if (!player) { setDragPlayerId(null); return; }

    // Remove from current zone
    setStarters(prev => prev.map(p => (p && (p._id || p.id) === dragPlayerId) ? null : p));
    setSubstitutes(prev => prev.map(p => (p && (p._id || p.id) === dragPlayerId) ? null : p));

    // Add to target zone
    if (targetZone === 'starter') {
      setStarters(prev => {
        const idx = prev.indexOf(null);
        if (idx === -1) return prev;
        const next = [...prev]; next[idx] = player; return next;
      });
    } else {
      setSubstitutes(prev => {
        const idx = prev.indexOf(null);
        if (idx === -1) return prev;
        const next = [...prev]; next[idx] = player; return next;
      });
    }
    setDragPlayerId(null);
  };
  const handleDragOver = (e) => e.preventDefault();

  /* ── Remove player from slot ── */
  const removeFromSlot = (pid) => {
    setStarters(prev => prev.map(p => (p && (p._id || p.id) === pid) ? null : p));
    setSubstitutes(prev => prev.map(p => (p && (p._id || p.id) === pid) ? null : p));
  };

  /* ── Slot click → open modal ── */
  const handleSlotClick = (idx) => { setSelectedSlot({ type: 'starter', index: idx }); setSelectModalVisible(true); setSearchText(''); setFilterPosition(null); };
  const handleSubClick = (idx) => { setSelectedSlot({ type: 'substitute', index: idx }); setSelectModalVisible(true); setSearchText(''); setFilterPosition(null); };

  const handlePlayerSelect = (player) => {
    if (!selectedSlot) return;
    if (selectedSlot.type === 'starter') {
      const next = [...starters]; next[selectedSlot.index] = player; setStarters(next);
    } else {
      const next = [...substitutes]; next[selectedSlot.index] = player; setSubstitutes(next);
    }
    setSelectModalVisible(false); setSelectedSlot(null);
  };

  /* ── Save / Auto-fill ── */
  const handleSaveLineup = () => {
    if (!team?._id) { message.error('Team not found'); return; }
    Modal.confirm({
      title: 'Confirm Lineup', content: 'Save this lineup?',
      okText: 'Save', cancelText: 'Cancel',
      onOk: async () => {
        setSaving(true);
        try {
          const payload = {
            formation,
            starters: starters.map(p => p?._id || p?.id).filter(Boolean),
            substitutes: substitutes.map(p => p?._id || p?.id).filter(Boolean),
            captain: captain?._id || captain?.id,
          };
          const res = await soccerAPI.post(`/api/v1/lineups/${team._id}/set`, payload);
          if (res.data?.data) {
            const u = res.data.data;
            if (u.formation) setFormation(u.formation);
            if (u.starters) { const a = [...u.starters]; while (a.length < 11) a.push(null); setStarters(a.slice(0,11)); }
            if (u.substitutes) { const a = [...u.substitutes]; while (a.length < 5) a.push(null); setSubstitutes(a.slice(0,5)); }
            if (u.captain) setCaptain(u.captain);
          }
          message.success('Lineup saved!');
        } catch (e) { message.error(e.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
      },
    });
  };

  const handleAutoFill = () => {
    if (!team?._id) { message.error('Team not found'); return; }
    Modal.confirm({
      title: 'Auto-Fill Lineup', content: 'Automatically populate based on ratings?',
      okText: 'Auto-Fill', cancelText: 'Cancel',
      onOk: async () => {
        setAutoFilling(true);
        try {
          const res = await soccerAPI.post(`/api/v1/lineups/${team._id}/auto-fill`);
          if (res.data?.data) {
            const u = res.data.data;
            if (u.formation) setFormation(u.formation);
            if (u.starters) { const a = [...u.starters]; while (a.length < 11) a.push(null); setStarters(a.slice(0,11)); }
            if (u.substitutes) { const a = [...u.substitutes]; while (a.length < 5) a.push(null); setSubstitutes(a.slice(0,5)); }
            if (u.captain) setCaptain(u.captain);
          }
          message.success('Lineup auto-filled!');
        } catch (e) { message.error(e.response?.data?.message || 'Failed to auto-fill'); }
        finally { setAutoFilling(false); }
      },
    });
  };

  /* ── Filter for modal ── */
  const filterPlayers = () => {
    return allPlayers.filter(p => {
      const matchSearch = !searchText || (p.name || '').toLowerCase().includes(searchText.toLowerCase()) || (p.club || '').toLowerCase().includes(searchText.toLowerCase());
      const matchPos = !filterPosition || p.position === filterPosition;
      const alreadyUsed = [...starters, ...substitutes].some(s => s && ((s._id || s.id) === (p._id || p.id)));
      return matchSearch && matchPos && !alreadyUsed;
    });
  };

  /* ── Deadline countdown ── */
  const deadlineStr = () => {
    if (!matchdayDeadline) return '--';
    const diff = matchdayDeadline - Date.now();
    if (diff <= 0) return 'PASSED';
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  /* ── Render mini card ── */
  const renderMiniCard = (p, zoneRole) => {
    if (!p) return null;
    const pos = p.position || '';
    const posColor = POS_COLOR[pos] || '#94a3b8';
    const isDragging = dragPlayerId === (p._id || p.id);
    const rating = p.rating || 0;
    const ratingTier = rating >= 80 ? 'elite' : rating >= 65 ? 'good' : 'avg';
    const isCaptain = captain && ((captain._id || captain.id || captain) === (p._id || p.id));
    const pid = p._id || p.id;

    return (
      <div key={pid} className={`mc-card${isDragging ? ' mc-dragging' : ''}`}
        style={{ '--mc-pos-color': posColor }}
        draggable onDragStart={(e) => handleDragStart(e, pid)} onDragEnd={handleDragEnd}>
        <button className="mc-cut" onClick={() => removeFromSlot(pid)} title="Remove">
          <DeleteOutlined />
        </button>
        <div className="mc-pos-badge" style={{ background: posColor }}>{POSITIONS[pos]?.abbr || pos}</div>
        <div className="mc-photo-wrap">
          <div className="mc-photo-ring"><div className="mc-photo-ring-inner" /></div>
          {p.photo || p.headshot ? (
            <img src={p.photo || p.headshot} alt="" className="mc-photo" />
          ) : (
            <div className="mc-photo-ph"><span>{(p.name || '?').charAt(0)}</span></div>
          )}
        </div>
        <div className="mc-name">
          {isCaptain && <CrownOutlined style={{ color: '#fbbf24', marginRight: 3, fontSize: 10 }} />}
          {(p.name || 'Unknown').split(' ').pop()}
        </div>
        <div className="mc-details">
          <span className={`mc-rating mc-rating--${ratingTier}`}>{rating}</span>
        </div>
        <select className="mc-zone-select" value={zoneRole}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            removeFromSlot(pid);
            if (e.target.value === 'starter') {
              setStarters(prev => { const idx = prev.indexOf(null); if (idx === -1) return prev; const n = [...prev]; n[idx] = p; return n; });
            } else {
              setSubstitutes(prev => { const idx = prev.indexOf(null); if (idx === -1) return prev; const n = [...prev]; n[idx] = p; return n; });
            }
          }}>
          {ZONES.map(z => <option key={z.role} value={z.role}>{z.label}</option>)}
        </select>
      </div>
    );
  };

  const renderEmptySlot = (zone, idx, onClick) => (
    <div key={`empty-${zone}-${idx}`} className="mc-card mc-empty" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="mc-empty-icon">+</div>
      <div className="mc-empty-label">TAP TO ADD</div>
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  const filledStarters = starters.filter(Boolean).length;
  const filledSubs = substitutes.filter(Boolean).length;

  return (
    <div className="sl-page">

      {/* ── Top Bar ── */}
      <div className="sl-topbar">
        <div className="sl-topbar-left">
          <h2 className="sl-topbar-title">{teamName} Lineup</h2>
          <span className="sl-topbar-sub">MW {matchweek || '?'} • {leagueName}</span>
        </div>
        <div className="sl-topbar-right">
          <div className="sl-topbar-stat">
            <ClockCircleOutlined style={{ color: '#fbbf24' }} />
            <span className="sl-topbar-stat-val">{deadlineStr()}</span>
          </div>
          <button className="sl-btn sl-btn-auto" onClick={handleAutoFill} disabled={autoFilling}>
            <ReloadOutlined spin={autoFilling} /> AUTO FILL
          </button>
          <button className="sl-btn sl-btn-save" onClick={handleSaveLineup} disabled={saving}>
            {saving ? <Spin size="small" /> : <><SaveOutlined /> SAVE</>}
          </button>
        </div>
      </div>

      {/* ── Formation Selector ── */}
      <div className="sl-formation-bar">
        <FormationSelector current={formation} onChange={setFormation} />
      </div>

      {/* ── Pitch View ── */}
      <div className="sl-pitch-wrap">
        <PitchView
          formation={formation}
          starters={starters}
          substitutes={substitutes}
          captain={captain}
          onSlotClick={handleSlotClick}
          onSubClick={handleSubClick}
          editable={true}
        />
      </div>

      {/* ── Starter Zone ── */}
      <div className="mc-zone" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'starter')}>
        <div className="mc-zone-header">
          <span className="mc-zone-title">Starting XI</span>
          <span className="mc-zone-count">{filledStarters}/11</span>
        </div>
        <div className="mc-grid">
          {starters.map((p, i) =>
            p ? renderMiniCard(p, 'starter') : renderEmptySlot('starter', i, () => handleSlotClick(i))
          )}
        </div>
      </div>

      {/* ── Substitute Zone (carousel) ── */}
      <div className="mc-zone mc-zone-bench" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'substitute')}>
        <div className="mc-zone-header">
          <span className="mc-zone-title">Substitutes</span>
          <span className="mc-zone-count">{filledSubs}/5</span>
        </div>
        <div className="mc-carousel">
          <div className="mc-carousel-track">
            {substitutes.map((p, i) =>
              p ? renderMiniCard(p, 'substitute') : renderEmptySlot('substitute', i, () => handleSubClick(i))
            )}
          </div>
        </div>
      </div>

      {/* ── Player Selection Modal ── */}
      <Modal title="Select Player" open={selectModalVisible} onCancel={() => setSelectModalVisible(false)} width={680} footer={null}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Input placeholder="Search player…" value={searchText} onChange={e => setSearchText(e.target.value)} allowClear prefix={<SearchOutlined />} />
          <Select placeholder="Position" allowClear value={filterPosition} onChange={setFilterPosition} style={{ width: 160 }}
            options={Object.entries(POSITIONS).map(([k, v]) => ({ label: v.name, value: k }))} />
        </div>
        {filterPlayers().length === 0 ? <Empty description="No players found" /> : (
          <div className="sl-player-grid">
            {filterPlayers().slice(0, 20).map(p => {
              const pos = p.position || '';
              const posColor = POS_COLOR[pos] || '#94a3b8';
              return (
                <div key={p._id || p.id} className="sl-pick-card" onClick={() => handlePlayerSelect(p)} style={{ '--mc-pos-color': posColor }}>
                  <div className="mc-pos-badge" style={{ background: posColor }}>{POSITIONS[pos]?.abbr || pos}</div>
                  <div className="mc-photo-wrap" style={{ width: 44, height: 44 }}>
                    {p.photo || p.headshot ? (
                      <img src={p.photo || p.headshot} alt="" className="mc-photo" style={{ width: 44, height: 44 }} />
                    ) : (
                      <div className="mc-photo-ph" style={{ width: 44, height: 44 }}><span style={{ fontSize: 18 }}>{(p.name || '?').charAt(0)}</span></div>
                    )}
                  </div>
                  <span className="sl-pick-name">{p.name || 'Unknown'}</span>
                  <span className={`mc-rating mc-rating--${p.rating >= 80 ? 'elite' : p.rating >= 65 ? 'good' : 'avg'}`}>{p.rating || 0}</span>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Lineup;
