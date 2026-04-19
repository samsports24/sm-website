import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Modal,
  Progress,
  Badge,
  Tag,
  List,
  Empty,
  Spin,
  message,
  Space,
  Row,
  Col,
  Input,
  InputNumber,
  Statistic,
  Divider,
  Timeline,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { soccerAPI, attachSoccerToken } from '../../config/constants';
import useSoccerLeague from '../../hooks/useSoccerLeague';

const GovernancePage = () => {
  const { leagueId } = useSoccerLeague();
  const [commissioerInfo, setCommissionerInfo] = useState(null);
  const [activeVotes, setActiveVotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState({});
  const [noConfidenceModal, setNoConfidenceModal] = useState(false);
  const [pauseModal, setPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseDuration, setPauseDuration] = useState(7);
  const [activeTab, setActiveTab] = useState('votes');

  // Fetch commissioner info
  const fetchCommissionerInfo = async () => {
    try {
      const response = await soccerAPI.get(
        `/api/v1/governance/${leagueId}/commissioner-info`,
        attachSoccerToken()
      );
      setCommissionerInfo(response.data);
    } catch (error) {
      console.error('Error fetching commissioner info:', error);
    }
  };

  // Fetch active votes
  const fetchActiveVotes = async () => {
    try {
      const response = await soccerAPI.get(
        `/api/v1/governance/${leagueId}/active-votes`,
        attachSoccerToken()
      );
      setActiveVotes(response.data.votes || []);
    } catch (error) {
      console.error('Error fetching active votes:', error);
      message.error('Failed to load active votes');
    }
  };

  // Fetch governance history
  const fetchHistory = async () => {
    try {
      const response = await soccerAPI.get(
        `/api/v1/governance/${leagueId}/history`,
        attachSoccerToken()
      );
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching governance history:', error);
      message.error('Failed to load governance history');
    }
  };

  // Fetch all governance data
  const fetchGovernanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCommissionerInfo(),
        fetchActiveVotes(),
        fetchHistory(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId) {
      fetchGovernanceData();
      const interval = setInterval(fetchGovernanceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [leagueId]);

  // Cast vote
  const handleCastVote = async (voteId, vote) => {
    Modal.confirm({
      title: 'Confirm Your Vote',
      content: `Are you sure you want to vote ${vote.toUpperCase()}?`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setVotingLoading((prev) => ({ ...prev, [voteId]: true }));
        try {
          await soccerAPI.post(
            `/api/v1/governance/vote/${voteId}/cast`,
            { vote },
            attachSoccerToken()
          );
          message.success(`Vote recorded: ${vote.toUpperCase()}`);
          fetchActiveVotes();
        } catch (error) {
          console.error('Error casting vote:', error);
          message.error(error.response?.data?.message || 'Failed to cast vote');
        } finally {
          setVotingLoading((prev) => ({ ...prev, [voteId]: false }));
        }
      },
    });
  };

  // Initiate no confidence vote
  const handleInitiateNoConfidence = async () => {
    Modal.confirm({
      title: 'Initiate Vote of No Confidence',
      content:
        'Are you sure you want to initiate a vote of no confidence in the commissioner? This is a serious action.',
      okText: 'Proceed',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoading(true);
        try {
          await soccerAPI.post(
            `/api/v1/governance/${leagueId}/no-confidence`,
            {},
            attachSoccerToken()
          );
          message.success('No confidence vote initiated');
          setNoConfidenceModal(false);
          fetchGovernanceData();
        } catch (error) {
          console.error('Error initiating no confidence vote:', error);
          message.error(
            error.response?.data?.message || 'Failed to initiate no confidence vote'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Propose league pause
  const handleProposePause = async () => {
    if (!pauseReason.trim()) {
      message.error('Please provide a reason for the pause');
      return;
    }

    Modal.confirm({
      title: 'Propose League Pause',
      content: `Propose pausing the league for ${pauseDuration} days with reason: "${pauseReason}"?`,
      okText: 'Propose',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          await soccerAPI.post(
            `/api/v1/governance/${leagueId}/propose-pause`,
            {
              reason: pauseReason,
              duration: pauseDuration,
            },
            attachSoccerToken()
          );
          message.success('League pause proposed');
          setPauseModal(false);
          setPauseReason('');
          setPauseDuration(7);
          fetchGovernanceData();
        } catch (error) {
          console.error('Error proposing pause:', error);
          message.error(
            error.response?.data?.message || 'Failed to propose league pause'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Get vote status badge
  const getVoteStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'processing', text: 'Active' },
      passed: { color: 'success', text: 'Passed' },
      failed: { color: 'error', text: 'Failed' },
      abstain: { color: 'default', text: 'Abstained' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Badge status={config.color} text={config.text} />;
  };

  // Get motion type tag
  const getMotionTypeTag = (type) => {
    const typeConfig = {
      'no-confidence': { color: 'red', icon: <LockOutlined /> },
      'league-pause': { color: 'orange', icon: <PauseCircleOutlined /> },
      'election': { color: 'blue', icon: <UserOutlined /> },
      'rule-change': { color: 'purple', icon: <FileTextOutlined /> },
    };
    const config = typeConfig[type] || typeConfig['rule-change'];
    return (
      <Tag color={config.color} icon={config.icon}>
        {type.replace('-', ' ').toUpperCase()}
      </Tag>
    );
  };

  // Render active votes tab
  const renderActiveVotesTab = () => {
    if (activeVotes.length === 0) {
      return (
        <Empty
          description="No active votes"
          style={{ marginTop: '40px' }}
        />
      );
    }

    return (
      <List
        dataSource={activeVotes}
        renderItem={(vote) => (
          <Card
            key={vote.id}
            style={{ marginBottom: '16px' }}
            hoverable
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    {getMotionTypeTag(vote.type)}
                    {getVoteStatusBadge(vote.status)}
                  </Space>
                  <h3 style={{ margin: 0 }}>{vote.title}</h3>
                  <p style={{ margin: 0, color: '#666' }}>{vote.description}</p>
                  <small>
                    Proposed by: <strong>{vote.proposer}</strong>
                  </small>
                </Space>
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Time Remaining"
                  value={vote.timeRemaining}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Yes Votes"
                    value={vote.yesCount}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title="No Votes"
                    value={vote.noCount}
                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Abstain"
                    value={vote.abstainCount}
                    prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  />
                </Card>
              </Col>
            </Row>

            <Progress
              percent={Math.round(
                (vote.yesCount / (vote.yesCount + vote.noCount + vote.abstainCount || 1)) * 100
              )}
              status={
                vote.yesCount > vote.noCount ? 'success' : 'exception'
              }
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `${percent}% Yes`}
            />

            <Space style={{ marginTop: '16px' }} wrap>
              <Button
                type="primary"
                icon={<LikeOutlined />}
                loading={votingLoading[vote.id]}
                onClick={() => handleCastVote(vote.id, 'yes')}
              >
                Vote Yes
              </Button>
              <Button
                danger
                icon={<DislikeOutlined />}
                loading={votingLoading[vote.id]}
                onClick={() => handleCastVote(vote.id, 'no')}
              >
                Vote No
              </Button>
            </Space>
          </Card>
        )}
      />
    );
  };

  // Render elections tab
  const renderElectionsTab = () => {
    const elections = history.filter((item) => item.type === 'election');

    if (elections.length === 0) {
      return (
        <Empty
          description="No elections in progress"
          style={{ marginTop: '40px' }}
        />
      );
    }

    return (
      <List
        dataSource={elections}
        renderItem={(election) => (
          <Card
            key={election.id}
            style={{ marginBottom: '16px' }}
            hoverable
          >
            <h3>{election.title}</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              {election.description}
            </p>

            {election.candidates && election.candidates.length > 0 ? (
              <List
                dataSource={election.candidates}
                renderItem={(candidate) => (
                  <Card
                    type="inner"
                    style={{ marginBottom: '12px' }}
                    size="small"
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={16}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <h4 style={{ margin: 0 }}>
                            <UserOutlined /> {candidate.name}
                          </h4>
                          <p style={{ margin: 0, color: '#666' }}>
                            {candidate.platform}
                          </p>
                          <small>
                            Experience: {candidate.experience} years
                          </small>
                        </Space>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Space direction="vertical" align="center">
                          {candidate.voteCount !== undefined && (
                            <Statistic
                              value={candidate.voteCount}
                              title="Votes"
                            />
                          )}
                          {election.status === 'active' && (
                            <Button
                              type="primary"
                              onClick={() =>
                                handleElectionVote(
                                  election.id,
                                  candidate.id
                                )
                              }
                              loading={votingLoading[`election-${election.id}`]}
                            >
                              Vote
                            </Button>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                )}
              />
            ) : (
              <Empty description="No candidates" />
            )}

            {election.status === 'concluded' && election.winner && (
              <Card
                type="inner"
                style={{ marginTop: '16px', background: '#f6ffed' }}
                bordered={false}
              >
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Winner
                </Tag>
                <h4 style={{ margin: '8px 0 0 0' }}>{election.winner.name}</h4>
              </Card>
            )}
          </Card>
        )}
      />
    );
  };

  // Handle election vote
  const handleElectionVote = async (electionId, candidateId) => {
    Modal.confirm({
      title: 'Confirm Vote',
      content: 'Are you sure you want to vote for this candidate?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setVotingLoading((prev) => ({
          ...prev,
          [`election-${electionId}`]: true,
        }));
        try {
          await soccerAPI.post(
            `/api/v1/governance/election/${electionId}/vote`,
            { candidateId },
            attachSoccerToken()
          );
          message.success('Vote recorded');
          fetchGovernanceData();
        } catch (error) {
          console.error('Error voting in election:', error);
          message.error(
            error.response?.data?.message || 'Failed to record vote'
          );
        } finally {
          setVotingLoading((prev) => ({
            ...prev,
            [`election-${electionId}`]: false,
          }));
        }
      },
    });
  };

  // Render history tab
  const renderHistoryTab = () => {
    if (history.length === 0) {
      return (
        <Empty
          description="No governance history"
          style={{ marginTop: '40px' }}
        />
      );
    }

    return (
      <Timeline
        items={history.map((item) => ({
          color:
            item.status === 'passed'
              ? 'green'
              : item.status === 'failed'
              ? 'red'
              : 'blue',
          children: (
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {getMotionTypeTag(item.type)}
                  {getVoteStatusBadge(item.status)}
                </Space>
                <h4 style={{ margin: 0 }}>{item.title}</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {item.description}
                </p>
                <small>
                  Proposed by: <strong>{item.proposer}</strong>
                </small>
                {item.completedDate && (
                  <small>
                    Completed: <strong>{item.completedDate}</strong>
                  </small>
                )}
                {item.yesCount !== undefined && (
                  <Space>
                    <Tag>Yes: {item.yesCount}</Tag>
                    <Tag>No: {item.noCount}</Tag>
                    {item.abstainCount !== undefined && (
                      <Tag>Abstain: {item.abstainCount}</Tag>
                    )}
                  </Space>
                )}
              </Space>
            </Card>
          ),
        }))}
      />
    );
  };

  if (loading && !commissioerInfo && activeVotes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading governance data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>League Governance</h1>

      {/* Commissioner Info Card */}
      {commissioerInfo && (
        <Card
          style={{ marginBottom: '24px' }}
          title={
            <Space>
              <UserOutlined />
              <span>Commissioner</span>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Current Commissioner"
                value={commissioerInfo.name}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tenure"
                value={commissioerInfo.tenure}
                suffix="days"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Approval Rating"
                value={commissioerInfo.approvalRating}
                suffix="%"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Members"
                value={commissioerInfo.memberCount}
                prefix={<TeamOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button
            type="primary"
            danger
            size="large"
            onClick={() => setNoConfidenceModal(true)}
          >
            Initiate No Confidence Vote
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={() => setPauseModal(true)}
          >
            Propose League Pause
          </Button>
          <Button
            size="large"
            onClick={() => fetchGovernanceData()}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'votes',
            label: (
              <span>
                <CheckCircleOutlined /> Active Votes ({activeVotes.length})
              </span>
            ),
            children: renderActiveVotesTab(),
          },
          {
            key: 'elections',
            label: (
              <span>
                <UserOutlined /> Elections
              </span>
            ),
            children: renderElectionsTab(),
          },
          {
            key: 'history',
            label: (
              <span>
                <FileTextOutlined /> History
              </span>
            ),
            children: renderHistoryTab(),
          },
        ]}
      />

      {/* No Confidence Modal */}
      <Modal
        title="Initiate Vote of No Confidence"
        open={noConfidenceModal}
        onCancel={() => setNoConfidenceModal(false)}
        footer={null}
      >
        <p>
          A vote of no confidence is a serious action that will call into
          question the current commissioner&apos;s ability to lead the league. This
          requires approval from the majority of league members.
        </p>
        <p style={{ fontWeight: 'bold' }}>
          Current Commissioner: {commissioerInfo?.name}
        </p>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            danger
            block
            size="large"
            onClick={handleInitiateNoConfidence}
            loading={loading}
          >
            Confirm Initiate No Confidence Vote
          </Button>
          <Button
            block
            onClick={() => setNoConfidenceModal(false)}
          >
            Cancel
          </Button>
        </Space>
      </Modal>

      {/* Propose Pause Modal */}
      <Modal
        title="Propose League Pause"
        open={pauseModal}
        onCancel={() => {
          setPauseModal(false);
          setPauseReason('');
          setPauseDuration(7);
        }}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Reason for Pause
            </label>
            <Input.TextArea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Enter the reason for proposing a league pause..."
              rows={4}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Duration (days)
            </label>
            <InputNumber
              min={1}
              max={90}
              value={pauseDuration}
              onChange={setPauseDuration}
              style={{ width: '100%' }}
            />
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              block
              size="large"
              onClick={handleProposePause}
              loading={loading}
            >
              Propose Pause
            </Button>
            <Button
              block
              onClick={() => {
                setPauseModal(false);
                setPauseReason('');
                setPauseDuration(7);
              }}
            >
              Cancel
            </Button>
          </Space>
        </Space>
      </Modal>
    </div>
  );
};

export default GovernancePage;
