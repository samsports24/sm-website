import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Tabs,
  Button,
  Modal,
  Select,
  Space,
  Empty,
  Spin,
  Alert,
  message,
  InputNumber,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TradeCard from '../../components/TradeCard';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken } from '../../config/constants';

const Trades = () => {
  const { leagueName, team, league } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [proposeTradeModalVisible, setProposeTradeModalVisible] = useState(false);
  const [tradesData, setTradesData] = useState({
    incoming: [],
    outgoing: [],
    history: [],
  });
  const [tradeDeadlineWarning, setTradeDeadlineWarning] = useState(false);

  // Propose Trade Modal State
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [yourPlayers, setYourPlayers] = useState([]);
  const [theirPlayers, setTheirPlayers] = useState([]);
  const [yourSamPoints, setYourSamPoints] = useState(0);
  const [theirSamPoints, setTheirSamPoints] = useState(0);

  // Dropdowns Data
  const [leagueTeams, setLeagueTeams] = useState([]);
  const [ownSquad, setOwnSquad] = useState([]);
  const [selectedTeamSquad, setSelectedTeamSquad] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [proposingTrade, setProposingTrade] = useState(false);

  // Fetch trades on component mount
  useEffect(() => {
    if (team?._id) {
      fetchTrades();
    }
  }, [team?._id]);

  // Attach token on mount
  useEffect(() => {
    attachSoccerToken();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await soccerAPI.get(`/api/v1/trades/team/${team._id}`);
      const allTrades = response.data.data || response.data || [];

      // Categorize trades
      const incoming = [];
      const outgoing = [];
      const history = [];

      allTrades.forEach((trade) => {
        const tradeData = mapTradeToCardProps(trade);

        if (
          trade.receiver?.team?._id === team._id &&
          (trade.status === 'pending' || trade.status === 'countered')
        ) {
          incoming.push(tradeData);
        } else if (
          trade.sender?.team?._id === team._id &&
          (trade.status === 'pending' || trade.status === 'countered')
        ) {
          outgoing.push(tradeData);
        } else if (
          ['accepted', 'rejected', 'cancelled'].includes(trade.status)
        ) {
          history.push(tradeData);
        }
      });

      setTradesData({
        incoming,
        outgoing,
        history,
      });

      // Check for approaching deadline (if league has deadline info)
      if (league?.tradeDeadline) {
        const now = new Date();
        const deadline = new Date(league.tradeDeadline);
        const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
        setTradeDeadlineWarning(daysUntilDeadline > 0 && daysUntilDeadline <= 3);
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      message.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const mapTradeToCardProps = (trade) => {
    const isOurTeamSender = trade.sender?.team?._id === team._id;
    const senderTeamName = trade.sender?.team?.name || 'Unknown Team';
    const receiverTeamName = trade.receiver?.team?.name || 'Unknown Team';

    return {
      _id: trade._id,
      otherTeamName: isOurTeamSender ? receiverTeamName : senderTeamName,
      yourPlayers: isOurTeamSender
        ? trade.sender?.players || []
        : trade.receiver?.players || [],
      theirPlayers: isOurTeamSender
        ? trade.receiver?.players || []
        : trade.sender?.players || [],
      yourSamPoints: isOurTeamSender
        ? trade.sender?.samPoints || 0
        : trade.receiver?.samPoints || 0,
      theirSamPoints: isOurTeamSender
        ? trade.receiver?.samPoints || 0
        : trade.sender?.samPoints || 0,
      status: trade.status,
      createdAt: trade.createdAt,
      rawTrade: trade,
    };
  };

  const handleAcceptTrade = (tradeId) => {
    Modal.confirm({
      title: 'Accept Trade',
      content: 'Are you sure you want to accept this trade?',
      okText: 'Accept',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await soccerAPI.post(`/api/v1/trades/accept/${tradeId}`);
          message.success('Trade accepted!');
          fetchTrades();
        } catch (error) {
          console.error('Failed to accept trade:', error);
          message.error('Failed to accept trade');
        }
      },
    });
  };

  const handleRejectTrade = (tradeId) => {
    Modal.confirm({
      title: 'Reject Trade',
      content: 'Are you sure you want to reject this trade?',
      okText: 'Reject',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await soccerAPI.post(`/api/v1/trades/reject/${tradeId}`);
          message.success('Trade rejected');
          fetchTrades();
        } catch (error) {
          console.error('Failed to reject trade:', error);
          message.error('Failed to reject trade');
        }
      },
    });
  };

  const handleCounterTrade = (tradeId) => {
    // Find the trade and pre-fill the modal
    const allTrades = [...tradesData.incoming, ...tradesData.outgoing];
    const trade = allTrades.find((t) => t._id === tradeId);

    if (trade) {
      // Pre-fill with counter values (swap players and points)
      setSelectedTeam(trade.rawTrade.sender?.team?._id);
      setYourPlayers(
        trade.rawTrade.receiver?.players?.map((p) => p._id) || []
      );
      setTheirPlayers(
        trade.rawTrade.sender?.players?.map((p) => p._id) || []
      );
      setYourSamPoints(trade.rawTrade.receiver?.samPoints || 0);
      setTheirSamPoints(trade.rawTrade.sender?.samPoints || 0);
    }

    setProposeTradeModalVisible(true);
  };

  const handleCancelTrade = (tradeId) => {
    Modal.confirm({
      title: 'Cancel Trade',
      content: 'Are you sure you want to cancel this trade proposal?',
      okText: 'Cancel',
      cancelText: 'Keep',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await soccerAPI.post(`/api/v1/trades/cancel/${tradeId}`);
          message.success('Trade cancelled');
          fetchTrades();
        } catch (error) {
          console.error('Failed to cancel trade:', error);
          message.error('Failed to cancel trade');
        }
      },
    });
  };

  const openProposeTradeModal = async () => {
    // Reset form
    setSelectedTeam(null);
    setYourPlayers([]);
    setTheirPlayers([]);
    setYourSamPoints(0);
    setTheirSamPoints(0);
    setSelectedTeamSquad([]);

    // Fetch league teams and own squad
    try {
      setModalLoading(true);

      // Fetch own squad
      const ownSquadResponse = await soccerAPI.get('/api/v1/teams/squad');
      const squadData = ownSquadResponse.data.data || ownSquadResponse.data || [];
      setOwnSquad(squadData);

      // Fetch league standings (for team list)
      if (league?._id) {
        const standingsResponse = await soccerAPI.get(
          `/api/v1/leagues/standings/${league._id}`
        );
        const teams = standingsResponse.data.data || standingsResponse.data || [];
        const otherTeams = teams.filter((t) => t._id !== team._id);
        setLeagueTeams(otherTeams);
      }
    } catch (error) {
      console.error('Failed to fetch modal data:', error);
      message.error('Failed to load teams and players');
    } finally {
      setModalLoading(false);
    }

    setProposeTradeModalVisible(true);
  };

  const handleSelectedTeamChange = async (teamId) => {
    setSelectedTeam(teamId);
    setTheirPlayers([]);
    setSelectedTeamSquad([]);

    if (!teamId) return;

    try {
      setModalLoading(true);
      const response = await soccerAPI.get(`/api/v1/teams/squad/${teamId}`);
      const squadData = response.data.data || response.data || [];
      setSelectedTeamSquad(squadData);
    } catch (error) {
      console.error('Failed to fetch team squad:', error);
      message.error('Failed to load team players');
    } finally {
      setModalLoading(false);
    }
  };

  const handleProposeTrade = async () => {
    if (!selectedTeam) {
      message.error('Please select a team');
      return;
    }

    if (yourPlayers.length === 0 && theirPlayers.length === 0) {
      if (yourSamPoints === 0 && theirSamPoints === 0) {
        message.error('Please select players or add SamPoints');
        return;
      }
    }

    try {
      setProposingTrade(true);
      const payload = {
        receiverTeamId: selectedTeam,
        senderPlayers: yourPlayers,
        receiverPlayers: theirPlayers,
        senderSamPoints: yourSamPoints,
        receiverSamPoints: theirSamPoints,
      };

      await soccerAPI.post('/api/v1/trades/propose', payload);
      message.success('Trade proposal sent!');
      setProposeTradeModalVisible(false);
      fetchTrades();

      // Reset form
      setSelectedTeam(null);
      setYourPlayers([]);
      setTheirPlayers([]);
      setYourSamPoints(0);
      setTheirSamPoints(0);
    } catch (error) {
      console.error('Failed to propose trade:', error);
      message.error(
        error.response?.data?.message || 'Failed to propose trade'
      );
    } finally {
      setProposingTrade(false);
    }
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
        <h2>{leagueName} Trade Center</h2>
      </div>

      {/* Trade Deadline Warning */}
      {tradeDeadlineWarning && (
        <Alert
          message="Trade Deadline Approaching"
          description="Trading closes in 3 days. Make your moves now!"
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      <div style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openProposeTradeModal}
          size="large"
        >
          Propose Trade
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'incoming',
            label: `Incoming (${tradesData.incoming.length})`,
            children:
              tradesData.incoming.length === 0 ? (
                <Empty description="No incoming trades" />
              ) : (
                <div>
                  {tradesData.incoming.map((trade) => (
                    <TradeCard
                      key={trade._id}
                      trade={trade}
                      onAccept={() => handleAcceptTrade(trade._id)}
                      onReject={() => handleRejectTrade(trade._id)}
                      onCounter={() => handleCounterTrade(trade._id)}
                    />
                  ))}
                </div>
              ),
          },
          {
            key: 'outgoing',
            label: `Outgoing (${tradesData.outgoing.length})`,
            children:
              tradesData.outgoing.length === 0 ? (
                <Empty description="No outgoing trades" />
              ) : (
                <div>
                  {tradesData.outgoing.map((trade) => (
                    <TradeCard
                      key={trade._id}
                      trade={trade}
                      onCancel={() => handleCancelTrade(trade._id)}
                    />
                  ))}
                </div>
              ),
          },
          {
            key: 'history',
            label: `History (${tradesData.history.length})`,
            children:
              tradesData.history.length === 0 ? (
                <Empty description="No trade history" />
              ) : (
                <div>
                  {tradesData.history.map((trade) => (
                    <TradeCard key={trade._id} trade={trade} />
                  ))}
                </div>
              ),
          },
        ]}
      />

      {/* Propose Trade Modal */}
      <Modal
        title="Propose Trade"
        open={proposeTradeModalVisible}
        onCancel={() => setProposeTradeModalVisible(false)}
        okText="Send Proposal"
        onOk={handleProposeTrade}
        confirmLoading={proposingTrade}
        width={600}
      >
        <Spin spinning={modalLoading}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Trade With Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Trade With
              </label>
              <Select
                placeholder="Select a team"
                style={{ width: '100%' }}
                value={selectedTeam}
                onChange={handleSelectedTeamChange}
                options={leagueTeams.map((t) => ({
                  label: t.name,
                  value: t._id,
                }))}
              />
            </div>

            {/* Your Players Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Your Players
              </label>
              <Select
                mode="multiple"
                placeholder="Select players to offer"
                style={{ width: '100%' }}
                value={yourPlayers}
                onChange={setYourPlayers}
                options={ownSquad.map((p) => ({
                  label: `${p.name} (${p.position})`,
                  value: p._id,
                }))}
              />
            </div>

            {/* Their Players Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Their Players
              </label>
              <Select
                mode="multiple"
                placeholder="Select players to request"
                style={{ width: '100%' }}
                value={theirPlayers}
                onChange={setTheirPlayers}
                disabled={!selectedTeam}
                options={selectedTeamSquad.map((p) => ({
                  label: `${p.name} (${p.position})`,
                  value: p._id,
                }))}
              />
            </div>

            {/* Your SamPoints */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Your SamPoints (Optional)
              </label>
              <InputNumber
                placeholder="Enter SamPoints to offer"
                style={{ width: '100%' }}
                min={0}
                value={yourSamPoints}
                onChange={(val) => setYourSamPoints(val || 0)}
              />
            </div>

            {/* Their SamPoints */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Their SamPoints (Optional)
              </label>
              <InputNumber
                placeholder="Enter SamPoints to request"
                style={{ width: '100%' }}
                min={0}
                value={theirSamPoints}
                onChange={(val) => setTheirSamPoints(val || 0)}
              />
            </div>
          </Space>
        </Spin>
      </Modal>
    </div>
  );
};

export default Trades;
