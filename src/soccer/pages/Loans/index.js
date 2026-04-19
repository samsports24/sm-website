import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Modal,
  Select,
  InputNumber,
  Table,
  Badge,
  Empty,
  Spin,
  message,
  Space,
  Tag,
  Row,
  Col,
  Form,
  Input,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { soccerAPI, attachSoccerToken } from '../../config/constants';
import useSoccerLeague from '../../hooks/useSoccerLeague';

const LoansPage = () => {
  const { leagueId, teamId } = useSoccerLeague();
  const [form] = Form.useForm();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [offeringLoan, setOfferingLoan] = useState(false);

  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedReceivingTeam, setSelectedReceivingTeam] = useState(null);

  // Data states
  const [loansOut, setLoansOut] = useState([]);
  const [loansIn, setLoansIn] = useState([]);
  const [leagueLoans, setLeagueLoans] = useState([]);
  const [squadPlayers, setSquadPlayers] = useState([]);
  const [leagueTeams, setLeagueTeams] = useState([]);

  // Active tab
  const [activeTab, setActiveTab] = useState('loansOut');

  // Helper function to calculate days remaining
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper function to get loan status
  const getLoanStatus = (loan) => {
    if (loan.status === 'active') {
      return { label: 'Active', color: 'green' };
    } else if (loan.status === 'pending') {
      return { label: 'Pending', color: 'blue' };
    } else if (loan.status === 'completed') {
      return { label: 'Completed', color: 'default' };
    } else if (loan.status === 'recalled') {
      return { label: 'Recalled', color: 'red' };
    } else if (loan.status === 'rejected') {
      return { label: 'Rejected', color: 'orange' };
    }
    return { label: loan.status, color: 'default' };
  };

  // Fetch team loans
  const fetchTeamLoans = async () => {
    try {
      const token = attachSoccerToken();
      const response = await fetch(
        `${soccerAPI}/loans/team/${teamId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch team loans');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching team loans:', error);
      message.error('Failed to load team loans');
      return { loansOut: [], loansIn: [] };
    }
  };

  // Fetch league loans
  const fetchLeagueLoans = async () => {
    try {
      const token = attachSoccerToken();
      const response = await fetch(
        `${soccerAPI}/loans/league/${leagueId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch league loans');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching league loans:', error);
      message.error('Failed to load league loans');
      return [];
    }
  };

  // Fetch squad players for offer modal
  const fetchSquadPlayers = async () => {
    try {
      const token = attachSoccerToken();
      const response = await fetch(
        `${soccerAPI}/teams/${teamId}/squad`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch squad');
      const data = await response.json();
      setSquadPlayers(data.players || []);
    } catch (error) {
      console.error('Error fetching squad:', error);
      message.error('Failed to load squad players');
    }
  };

  // Fetch league teams for offer modal
  const fetchLeagueTeams = async () => {
    try {
      const token = attachSoccerToken();
      const response = await fetch(
        `${soccerAPI}/leagues/${leagueId}/standings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch league standings');
      const data = await response.json();
      const teams = data.standings?.map((entry) => ({
        id: entry.teamId,
        name: entry.teamName,
        logo: entry.logo,
      })) || [];
      setLeagueTeams(teams.filter((t) => t.id !== teamId));
    } catch (error) {
      console.error('Error fetching league teams:', error);
      message.error('Failed to load league teams');
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!teamId || !leagueId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamData, leagueData] = await Promise.all([
          fetchTeamLoans(),
          fetchLeagueLoans(),
        ]);

        setLoansOut(teamData.loansOut || []);
        setLoansIn(teamData.loansIn || []);
        setLeagueLoans(leagueData || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, leagueId]);

  // Fetch squad and teams when offer modal opens
  useEffect(() => {
    if (showOfferModal) {
      fetchSquadPlayers();
      fetchLeagueTeams();
    }
  }, [showOfferModal]);

  // Handle offer loan submission
  const handleOfferLoan = async (values) => {
    if (!selectedPlayer) {
      message.error('Please select a player');
      return;
    }
    if (!selectedReceivingTeam) {
      message.error('Please select a receiving team');
      return;
    }

    setOfferingLoan(true);
    try {
      const token = attachSoccerToken();
      const payload = {
        playerId: selectedPlayer,
        receiverTeamId: selectedReceivingTeam,
        duration: values.duration,
        loanFee: values.loanFee || 0,
        buyOptionPrice: values.buyOptionPrice || null,
        leagueId: leagueId,
      };

      const response = await fetch(`${soccerAPI}/loans/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to offer loan');
      }

      message.success('Loan offer sent successfully!');
      form.resetFields();
      setSelectedPlayer(null);
      setSelectedReceivingTeam(null);
      setShowOfferModal(false);

      // Refresh loans
      const teamData = await fetchTeamLoans();
      setLoansOut(teamData.loansOut || []);
    } catch (error) {
      console.error('Error offering loan:', error);
      message.error(error.message || 'Failed to offer loan');
    } finally {
      setOfferingLoan(false);
    }
  };

  // Handle accept loan offer
  const handleAcceptLoan = async (loanId) => {
    Modal.confirm({
      title: 'Accept Loan Offer',
      content: 'Are you sure you want to accept this loan offer?',
      okText: 'Accept',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/accept`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to accept loan');

          message.success('Loan offer accepted!');
          const teamData = await fetchTeamLoans();
          setLoansIn(teamData.loansIn || []);
        } catch (error) {
          console.error('Error accepting loan:', error);
          message.error('Failed to accept loan');
        }
      },
    });
  };

  // Handle reject loan offer
  const handleRejectLoan = async (loanId) => {
    Modal.confirm({
      title: 'Reject Loan Offer',
      content: 'Are you sure you want to reject this loan offer?',
      okText: 'Reject',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/reject`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to reject loan');

          message.success('Loan offer rejected!');
          const teamData = await fetchTeamLoans();
          setLoansIn(teamData.loansIn || []);
        } catch (error) {
          console.error('Error rejecting loan:', error);
          message.error('Failed to reject loan');
        }
      },
    });
  };

  // Handle cancel outgoing offer
  const handleCancelOffer = async (loanId) => {
    Modal.confirm({
      title: 'Cancel Loan Offer',
      content: 'Are you sure you want to cancel this loan offer?',
      okText: 'Cancel',
      cancelText: 'Close',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/cancel`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to cancel offer');

          message.success('Loan offer cancelled!');
          const teamData = await fetchTeamLoans();
          setLoansOut(teamData.loansOut || []);
        } catch (error) {
          console.error('Error cancelling offer:', error);
          message.error('Failed to cancel offer');
        }
      },
    });
  };

  // Handle return loaned player early
  const handleReturnEarly = async (loanId) => {
    Modal.confirm({
      title: 'Return Player Early',
      content: 'Are you sure you want to return this player early?',
      okText: 'Return',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/return-early`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to return player');

          message.success('Player returned successfully!');
          const teamData = await fetchTeamLoans();
          setLoansIn(teamData.loansIn || []);
        } catch (error) {
          console.error('Error returning player:', error);
          message.error('Failed to return player');
        }
      },
    });
  };

  // Handle recall loaned player
  const handleRecallPlayer = async (loanId) => {
    Modal.confirm({
      title: 'Recall Loaned Player',
      content: 'Are you sure you want to recall this player?',
      okText: 'Recall',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/recall`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to recall player');

          message.success('Player recalled successfully!');
          const teamData = await fetchTeamLoans();
          setLoansOut(teamData.loansOut || []);
        } catch (error) {
          console.error('Error recalling player:', error);
          message.error('Failed to recall player');
        }
      },
    });
  };

  // Handle exercise buy option
  const handleExerciseBuyOption = async (loanId) => {
    Modal.confirm({
      title: 'Exercise Buy Option',
      content: 'Are you sure you want to purchase this player?',
      okText: 'Purchase',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const token = attachSoccerToken();
          const response = await fetch(`${soccerAPI}/loans/${loanId}/buy`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Failed to exercise buy option');

          message.success('Player purchased successfully!');
          const teamData = await fetchTeamLoans();
          setLoansIn(teamData.loansIn || []);
        } catch (error) {
          console.error('Error exercising buy option:', error);
          message.error('Failed to exercise buy option');
        }
      },
    });
  };

  // Render loan card
  const renderLoanCard = (loan, actionType) => {
    const status = getLoanStatus(loan);
    const daysRemaining = getDaysRemaining(loan.endDate);
    const canReturnEarly = actionType === 'in' && loan.status === 'active';
    const canRecall = actionType === 'out' && loan.status === 'active';
    const canBuy = actionType === 'in' && loan.status === 'active' && loan.buyOptionPrice;

    return (
      <Card key={loan.id} className="loan-card" style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
          <Col>
            <h3 style={{ margin: 0 }}>{loan.playerName}</h3>
            <p style={{ margin: '4px 0', color: '#666' }}>
              {loan.playerPosition}
            </p>
          </Col>
          <Col>
            <Badge color={status.color} text={status.label} />
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={[16, 8]} style={{ marginBottom: '12px' }}>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <TeamOutlined /> From:{' '}
                <strong>{loan.fromTeam}</strong>
              </div>
              <div>
                <TeamOutlined /> To: <strong>{loan.toTeam}</strong>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <CalendarOutlined /> Duration:{' '}
                <strong>{loan.duration} weeks</strong>
              </div>
              <div>
                <CalendarOutlined /> Days Left:{' '}
                <strong>{daysRemaining}</strong>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 8]} style={{ marginBottom: '12px' }}>
          <Col span={12}>
            <div>
              <DollarOutlined /> Loan Fee:{' '}
              <strong>${loan.loanFee?.toLocaleString() || '0'}</strong>
            </div>
          </Col>
          <Col span={12}>
            {loan.buyOptionPrice && (
              <div>
                <DollarOutlined /> Buy Option:{' '}
                <strong>${loan.buyOptionPrice?.toLocaleString()}</strong>
              </div>
            )}
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Space wrap>
          {actionType === 'outgoing' && loan.status === 'pending' && (
            <Button
              danger
              onClick={() => handleCancelOffer(loan.id)}
            >
              Cancel Offer
            </Button>
          )}

          {actionType === 'incoming' && loan.status === 'pending' && (
            <>
              <Button
                type="primary"
                onClick={() => handleAcceptLoan(loan.id)}
                icon={<CheckCircleOutlined />}
              >
                Accept
              </Button>
              <Button
                danger
                onClick={() => handleRejectLoan(loan.id)}
                icon={<CloseCircleOutlined />}
              >
                Reject
              </Button>
            </>
          )}

          {canReturnEarly && (
            <Button
              onClick={() => handleReturnEarly(loan.id)}
              icon={<ExclamationCircleOutlined />}
            >
              Return Early
            </Button>
          )}

          {canRecall && (
            <Button
              onClick={() => handleRecallPlayer(loan.id)}
              icon={<ExclamationCircleOutlined />}
            >
              Recall
            </Button>
          )}

          {canBuy && (
            <Button
              type="primary"
              onClick={() => handleExerciseBuyOption(loan.id)}
              icon={<DollarOutlined />}
            >
              Exercise Buy Option
            </Button>
          )}
        </Space>
      </Card>
    );
  };

  // Categorize loans
  const incomingOffers = loansIn.filter((l) => l.status === 'pending');
  const outgoingOffers = loansOut.filter((l) => l.status === 'pending');
  const activeLoansOut = loansOut.filter((l) => l.status === 'active');
  const activeLoansIn = loansIn.filter((l) => l.status === 'active');

  // Tab content components
  const MyLoansOutContent = () => {
    if (loading) return <Spin />;
    if (activeLoansOut.length === 0) return <Empty description="No active loans out" />;
    return (
      <div>
        {activeLoansOut.map((loan) => renderLoanCard(loan, 'out'))}
      </div>
    );
  };

  const MyLoansInContent = () => {
    if (loading) return <Spin />;
    if (activeLoansIn.length === 0) return <Empty description="No active loans in" />;
    return (
      <div>
        {activeLoansIn.map((loan) => renderLoanCard(loan, 'in'))}
      </div>
    );
  };

  const IncomingOffersContent = () => {
    if (loading) return <Spin />;
    if (incomingOffers.length === 0) return <Empty description="No incoming offers" />;
    return (
      <div>
        {incomingOffers.map((loan) => renderLoanCard(loan, 'incoming'))}
      </div>
    );
  };

  const OutgoingOffersContent = () => {
    if (loading) return <Spin />;
    if (outgoingOffers.length === 0) return <Empty description="No outgoing offers" />;
    return (
      <div>
        {outgoingOffers.map((loan) => renderLoanCard(loan, 'outgoing'))}
      </div>
    );
  };

  const LeagueActivityContent = () => {
    if (loading) return <Spin />;
    if (leagueLoans.length === 0) return <Empty description="No league loans" />;

    const columns = [
      {
        title: 'Player',
        dataIndex: 'playerName',
        key: 'playerName',
      },
      {
        title: 'Position',
        dataIndex: 'playerPosition',
        key: 'playerPosition',
      },
      {
        title: 'From Team',
        dataIndex: 'fromTeam',
        key: 'fromTeam',
      },
      {
        title: 'To Team',
        dataIndex: 'toTeam',
        key: 'toTeam',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const statusInfo = getLoanStatus({ status });
          return <Badge color={statusInfo.color} text={statusInfo.label} />;
        },
      },
      {
        title: 'Duration',
        dataIndex: 'duration',
        key: 'duration',
        render: (duration) => `${duration} weeks`,
      },
      {
        title: 'Loan Fee',
        dataIndex: 'loanFee',
        key: 'loanFee',
        render: (fee) => `$${fee?.toLocaleString() || '0'}`,
      },
      {
        title: 'Buy Option',
        dataIndex: 'buyOptionPrice',
        key: 'buyOptionPrice',
        render: (price) => price ? `$${price.toLocaleString()}` : 'N/A',
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={leagueLoans.map((loan) => ({ ...loan, key: loan.id }))}
        pagination={{ pageSize: 10 }}
      />
    );
  };

  const tabItems = [
    {
      key: 'loansOut',
      label: `My Loans Out (${activeLoansOut.length})`,
      children: <MyLoansOutContent />,
    },
    {
      key: 'loansIn',
      label: `My Loans In (${activeLoansIn.length})`,
      children: <MyLoansInContent />,
    },
    {
      key: 'incoming',
      label: `Incoming Offers (${incomingOffers.length})`,
      children: <IncomingOffersContent />,
    },
    {
      key: 'outgoing',
      label: `Outgoing Offers (${outgoingOffers.length})`,
      children: <OutgoingOffersContent />,
    },
    {
      key: 'league',
      label: 'League Activity',
      children: <LeagueActivityContent />,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <h1 style={{ margin: 0 }}>Player Loans</h1>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              form.resetFields();
              setSelectedPlayer(null);
              setSelectedReceivingTeam(null);
              setShowOfferModal(true);
            }}
          >
            + Offer Loan
          </Button>
        </Col>
      </Row>

      <Card>
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </Card>

      {/* Offer Loan Modal */}
      <Modal
        title="Offer Loan"
        open={showOfferModal}
        onOk={() => form.submit()}
        onCancel={() => setShowOfferModal(false)}
        okText="Send Offer"
        cancelText="Cancel"
        confirmLoading={offeringLoan}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOfferLoan}
        >
          <Form.Item
            label="Player"
            required
          >
            <Select
              placeholder="Select player from your squad"
              value={selectedPlayer}
              onChange={setSelectedPlayer}
              loading={squadPlayers.length === 0}
            >
              {squadPlayers.map((player) => (
                <Select.Option key={player.id} value={player.id}>
                  {player.name} ({player.position})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Receiving Team"
            required
          >
            <Select
              placeholder="Select team to receive loan"
              value={selectedReceivingTeam}
              onChange={setSelectedReceivingTeam}
              loading={leagueTeams.length === 0}
            >
              {leagueTeams.map((team) => (
                <Select.Option key={team.id} value={team.id}>
                  {team.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Duration (weeks)"
            name="duration"
            rules={[
              { required: true, message: 'Please enter duration' },
              { type: 'number', min: 1, message: 'Duration must be at least 1 week' },
            ]}
          >
            <InputNumber min={1} max={52} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Loan Fee ($)"
            name="loanFee"
            initialValue={0}
            rules={[
              { type: 'number', min: 0, message: 'Loan fee cannot be negative' },
            ]}
          >
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%' }}
              formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseInt(value.replace(/\$\s?|(,*)/g, ''), 10)}
            />
          </Form.Item>

          <Form.Item
            label="Buy Option Price ($) - Optional"
            name="buyOptionPrice"
            rules={[
              { type: 'number', min: 0, message: 'Buy option price cannot be negative' },
            ]}
          >
            <InputNumber
              min={0}
              step={10000}
              style={{ width: '100%' }}
              placeholder="Leave empty if no buy option"
              formatter={(value) => {
                if (!value) return '';
                return `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }}
              parser={(value) => {
                if (!value) return undefined;
                return parseInt(value.replace(/\$\s?|(,*)/g, ''), 10);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <Input.TextArea
              placeholder="Add any notes for the receiving team"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoansPage;
