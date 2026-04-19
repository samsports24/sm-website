import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Switch,
  Form,
  InputNumber,
  Select,
  Button,
  Space,
  Table,
  Modal,
  message,
  Spin,
  Empty,
  Row,
  Col,
  Alert,
  Divider,
  Tag,
} from 'antd';
import { DeleteOutlined, UserDeleteOutlined, CrownOutlined } from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken } from '../../config/constants';

const Commissioner = () => {
  const { league, isCommissioner, leagueName } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState({
    transferWindowEnabled: false,
    freeAgentAuctionsEnabled: false,
    ownerToOwnerAuctionsEnabled: false,
    tradeReviewEnabled: false,
    commissionerTradeApproval: false,
    commissionerAuctionApproval: false,
    allowedFormations: [],
    salaryCap: 200000000,
    salaryCapEnabled: true,
    draftType: 'snake',
    draftPositionMode: 'random',
    startingSamPoints: 300000000,
    preAuctionDraftPoints: 1000000,
    auctionDuration: 24,
    isPublic: true,
    chatEnabled: true,
    requireCaptain: false,
    scoringType: 'sam',
  });

  const leagueId = league?._id;

  // Fetch fresh league data with teams/members
  const fetchLeagueData = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    try {
      attachSoccerToken();
      const res = await soccerAPI.get(`/api/v1/leagues/${leagueId}`);
      const lg = res?.data?.data || res?.data;

      if (lg) {
        // Map league settings to local state
        setSettings({
          transferWindowEnabled: lg.transferWindowEnabled || false,
          freeAgentAuctionsEnabled: lg.freeAgentAuctionsEnabled || false,
          ownerToOwnerAuctionsEnabled: lg.ownerToOwnerAuctionsEnabled || false,
          tradeReviewEnabled: lg.tradeReviewEnabled || false,
          commissionerTradeApproval: lg.commissionerTradeApproval || false,
          commissionerAuctionApproval: lg.commissionerAuctionApproval || false,
          allowedFormations: lg.allowedFormations || [],
          salaryCap: lg.salaryCap || 200000000,
          salaryCapEnabled: lg.salaryCapEnabled !== false,
          draftType: lg.draftType || 'snake',
          draftPositionMode: lg.draftPositionMode || 'random',
          startingSamPoints: lg.startingSamPoints || 300000000,
          preAuctionDraftPoints: lg.preAuctionDraftPoints || 1000000,
          auctionDuration: lg.auctionDuration || 24,
          isPublic: lg.isPublic !== false,
          chatEnabled: lg.chatEnabled !== false,
          requireCaptain: lg.requireCaptain || false,
          scoringType: lg.scoringType || 'sam',
        });

        // Build members list from teams
        const teams = lg.teams || [];
        const commissionerId = lg.commissioner?._id || lg.commissioner;
        const coCommIds = (lg.coCommissioners || []).map((c) =>
          typeof c === 'string' ? c : c?._id
        );

        const memberList = teams.map((t) => {
          const ownerId = t.owner?._id || t.owner;
          let role = 'member';
          if (String(ownerId) === String(commissionerId)) role = 'commissioner';
          else if (coCommIds.some((id) => String(id) === String(ownerId))) role = 'co-commissioner';

          return {
            _id: t._id,
            ownerId,
            name: t.owner?.userName || t.owner?.name || 'Unknown',
            teamName: t.name || t.teamName || 'Unnamed Team',
            role,
            logo: t.logo || t.crest,
          };
        });

        setMembers(memberList);
        form.setFieldsValue(settings);
      }
    } catch (err) {
      console.error('Failed to fetch league:', err);
      message.error('Failed to load league data');
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    Modal.confirm({
      title: 'Save Settings',
      content: 'Are you sure you want to save these changes? This will affect all league members.',
      okText: 'Save',
      cancelText: 'Cancel',
      className: 'wr-dark-confirm',
      onOk: async () => {
        setSaving(true);
        try {
          attachSoccerToken();
          await soccerAPI.put(`/api/v1/leagues/settings/${leagueId}`, settings);
          message.success('League settings updated!');
          fetchLeagueData();
        } catch (err) {
          message.error(err?.response?.data?.message || 'Failed to save settings');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleKickMember = (teamId, teamName) => {
    Modal.confirm({
      title: 'Remove Team',
      content: `Are you sure you want to remove "${teamName}" from the league? This action cannot be undone.`,
      okText: 'Remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      className: 'wr-dark-confirm',
      onOk: async () => {
        try {
          attachSoccerToken();
          await soccerAPI.delete(`/api/v1/teams/${teamId}`);
          message.success(`${teamName} removed from league`);
          fetchLeagueData();
        } catch (err) {
          message.error(err?.response?.data?.message || 'Failed to remove team');
        }
      },
    });
  };

  const handleTransferCommissioner = (ownerId, ownerName) => {
    Modal.confirm({
      title: 'Transfer Commissioner Role',
      content: `Are you sure you want to transfer commissioner powers to ${ownerName}? You will lose your commissioner privileges.`,
      okText: 'Transfer',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      className: 'wr-dark-confirm',
      onOk: async () => {
        try {
          attachSoccerToken();
          await soccerAPI.post(`/api/v1/governance/${leagueId}/transfer-commissioner`, {
            transferToUserId: ownerId,
          });
          message.success(`Commissioner role transferred to ${ownerName}`);
          fetchLeagueData();
        } catch (err) {
          message.error(err?.response?.data?.message || 'Failed to transfer commissioner');
        }
      },
    });
  };

  const memberColumns = [
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (name, record) => (
        <Space>
          {record.logo && (
            <img
              src={record.logo}
              alt=''
              style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }}
            />
          )}
          <span style={{ color: '#e2e8f0' }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span style={{ color: '#94a3b8' }}>{name}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color =
          role === 'commissioner' ? '#ff7a45' : role === 'co-commissioner' ? '#3b82f6' : '#64748b';
        return (
          <Tag color={color} style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>
            {role === 'commissioner' && <CrownOutlined style={{ marginRight: 4 }} />}
            {role}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size='small'>
          {record.role === 'member' && (
            <Button
              type='text'
              size='small'
              style={{ color: '#3b82f6' }}
              onClick={() => handleTransferCommissioner(record.ownerId, record.name)}
            >
              <CrownOutlined /> Make Commissioner
            </Button>
          )}
          {record.role !== 'commissioner' && (
            <Button
              type='text'
              danger
              size='small'
              icon={<UserDeleteOutlined />}
              onClick={() => handleKickMember(record._id, record.teamName)}
            >
              Remove
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!isCommissioner) {
    return (
      <Alert
        message='Access Denied'
        description='Only league commissioners can access these settings.'
        type='error'
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#e2e8f0' }}>{leagueName}, Commissioner Settings</h2>
      </div>

      {/* League Features */}
      <Card
        title={<span style={{ color: '#e2e8f0' }}>League Features</span>}
        style={{
          marginBottom: '24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Form layout='vertical'>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Transfer Window</span>}>
                <Switch
                  checked={settings.transferWindowEnabled}
                  onChange={(v) => handleSettingChange('transferWindowEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Free Agent Auctions</span>}>
                <Switch
                  checked={settings.freeAgentAuctionsEnabled}
                  onChange={(v) => handleSettingChange('freeAgentAuctionsEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Owner-to-Owner Auctions</span>}>
                <Switch
                  checked={settings.ownerToOwnerAuctionsEnabled}
                  onChange={(v) => handleSettingChange('ownerToOwnerAuctionsEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Salary Cap Enabled</span>}>
                <Switch
                  checked={settings.salaryCapEnabled}
                  onChange={(v) => handleSettingChange('salaryCapEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Trade Review</span>}>
                <Switch
                  checked={settings.tradeReviewEnabled}
                  onChange={(v) => handleSettingChange('tradeReviewEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Commissioner Approval</span>}>
                <Switch
                  checked={settings.commissionerTradeApproval}
                  onChange={(v) => handleSettingChange('commissionerTradeApproval', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Auction Approval</span>}>
                <Switch
                  checked={settings.commissionerAuctionApproval}
                  onChange={(v) => handleSettingChange('commissionerAuctionApproval', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Public League</span>}>
                <Switch
                  checked={settings.isPublic}
                  onChange={(v) => handleSettingChange('isPublic', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Chat Enabled</span>}>
                <Switch
                  checked={settings.chatEnabled}
                  onChange={(v) => handleSettingChange('chatEnabled', v)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label={<span style={{ color: '#94a3b8' }}>Require Captain</span>}>
                <Switch
                  checked={settings.requireCaptain}
                  onChange={(v) => handleSettingChange('requireCaptain', v)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Formation Restrictions */}
      <Card
        title={<span style={{ color: '#e2e8f0' }}>Formation Restrictions</span>}
        style={{
          marginBottom: '24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Form layout='vertical'>
          <Form.Item label={<span style={{ color: '#94a3b8' }}>Allowed Formations</span>}>
            <Select
              mode='multiple'
              value={settings.allowedFormations}
              onChange={(value) => handleSettingChange('allowedFormations', value)}
              style={{ width: '100%' }}
              options={[
                { label: '4-3-3', value: '4-3-3' },
                { label: '4-4-2', value: '4-4-2' },
                { label: '3-5-2', value: '3-5-2' },
                { label: '4-2-3-1', value: '4-2-3-1' },
                { label: '3-4-3', value: '3-4-3' },
                { label: '5-3-2', value: '5-3-2' },
                { label: '5-4-1', value: '5-4-1' },
              ]}
            />
          </Form.Item>
        </Form>
      </Card>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* League Rules */}
      <Card
        title={<span style={{ color: '#e2e8f0' }}>League Rules</span>}
        style={{
          marginBottom: '24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Salary Cap</span>}>
              <InputNumber
                value={settings.salaryCap}
                onChange={(v) => handleSettingChange('salaryCap', v)}
                formatter={(value) => `${(value / 1000000).toFixed(0)}M SP`}
                parser={(value) => parseInt(value.replace(/[A-Z\s]/g, '')) * 1000000}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Draft Type</span>}>
              <Select
                value={settings.draftType}
                onChange={(v) => handleSettingChange('draftType', v)}
                options={[
                  { label: 'Snake', value: 'snake' },
                  { label: 'Auction', value: 'auction' },
                  { label: 'Auto', value: 'auto' },
                  { label: 'Linear', value: 'linear' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Draft Position Mode</span>}>
              <Select
                value={settings.draftPositionMode}
                onChange={(v) => handleSettingChange('draftPositionMode', v)}
                options={[
                  { label: 'Auction', value: 'auction' },
                  { label: 'Random', value: 'random' },
                  { label: 'Join Order', value: 'join_order' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Scoring Type</span>}>
              <Select
                value={settings.scoringType}
                onChange={(v) => handleSettingChange('scoringType', v)}
                options={[
                  { label: 'SAM Metric', value: 'sam' },
                  { label: 'Custom', value: 'custom' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Starting SamPoints</span>}>
              <InputNumber
                value={settings.startingSamPoints}
                onChange={(v) => handleSettingChange('startingSamPoints', v)}
                formatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                parser={(value) => parseInt(value.replace(/[A-Z\s]/g, '')) * 1000000}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Form.Item label={<span style={{ color: '#94a3b8' }}>Auction Duration (hrs)</span>}>
              <InputNumber
                value={settings.auctionDuration}
                onChange={(v) => handleSettingChange('auctionDuration', v)}
                min={1}
                max={72}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Button
          type='primary'
          size='large'
          onClick={handleSaveSettings}
          loading={saving}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            fontWeight: 700,
            borderRadius: 8,
            height: 44,
            paddingInline: 40,
          }}
        >
          Save All Settings
        </Button>
      </div>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* League Members Management */}
      <Card
        title={
          <span style={{ color: '#e2e8f0' }}>
            League Members ({members.length})
          </span>
        }
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        headStyle={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {members.length === 0 ? (
          <Empty description={<span style={{ color: '#94a3b8' }}>No members</span>} />
        ) : (
          <Table
            columns={memberColumns}
            dataSource={members.map((m, idx) => ({ ...m, key: m._id || idx }))}
            pagination={false}
            size='small'
            style={{ background: 'transparent' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Commissioner;
