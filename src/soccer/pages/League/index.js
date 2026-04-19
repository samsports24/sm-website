import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Statistic,
  List,
  Badge,
  Space,
  Spin,
  Empty,
  Table,
  Tooltip,
  message,
  Modal,
} from 'antd';
import { CopyOutlined, UserAddOutlined, TrophyOutlined } from '@ant-design/icons';
import LeagueTable from '../../components/LeagueTable';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken } from '../../config/constants';

const League = () => {
  const { league, leagueName, leagueFlag, leagueColor, season } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [leagueStats, setLeagueStats] = useState({
    members: 0,
    commissioner: '',
    joinCode: '',
    topScorer: null,
    mostAssists: null,
  });
  const [currentTeamId, setCurrentTeamId] = useState(null);

  useEffect(() => {
    fetchLeagueData();
  }, [league]);

  const fetchLeagueData = async () => {
    setLoading(true);
    try {
      attachSoccerToken();

      // Fetch standings, fixtures, and league info in parallel
      const [standingsRes, fixturesRes, infoRes] = await Promise.allSettled([
        soccerAPI.get('/league/standings'),
        soccerAPI.get('/league/fixtures'),
        soccerAPI.get('/league/info'),
      ]);

      if (standingsRes.status === 'fulfilled' && standingsRes.value?.data?.data) {
        const data = standingsRes.value.data.data;
        setStandings(Array.isArray(data) ? data : []);
      }

      if (fixturesRes.status === 'fulfilled' && fixturesRes.value?.data?.data) {
        const data = fixturesRes.value.data.data;
        setFixtures(Array.isArray(data) ? data : []);
      }

      if (infoRes.status === 'fulfilled' && infoRes.value?.data?.data) {
        const info = infoRes.value.data.data;
        setLeagueStats({
          members: info.members || info.teams?.length || league?.teams?.length || 0,
          commissioner: info.commissionerName || info.commissioner?.name || '',
          joinCode: info.joinCode || league?.joinCode || '',
          topScorer: info.topScorer || null,
          mostAssists: info.mostAssists || null,
        });
        if (info.myTeamId) setCurrentTeamId(info.myTeamId);
      } else if (league) {
        // Fallback to Redux league data
        setLeagueStats({
          members: league.teams?.length || league.users?.length || 0,
          commissioner: '',
          joinCode: league.joinCode || '',
          topScorer: null,
          mostAssists: null,
        });
      }
    } catch {
      // APIs may not be ready
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJoinCode = () => {
    if (leagueStats.joinCode) {
      navigator.clipboard.writeText(leagueStats.joinCode);
      message.success('Join code copied to clipboard!');
    }
  };

  const handleInviteTeam = () => {
    Modal.confirm({
      title: 'Invite Team',
      content: leagueStats.joinCode
        ? `Share this join code with your friends: ${leagueStats.joinCode}`
        : 'No join code available for this league.',
      okText: 'Copy & Close',
      cancelText: 'Close',
      onOk: handleCopyJoinCode,
    });
  };

  const fixtureColumns = [
    {
      title: 'Match',
      dataIndex: 'home',
      key: 'match',
      render: (home, record) => {
        const homeName = typeof home === 'object' ? home.name : home;
        const awayName = typeof record.away === 'object' ? record.away.name : record.away;
        return `${homeName || 'TBD'} vs ${awayName || 'TBD'}`;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time) => time || '',
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
      {/* League Info Header */}
      <Card
        style={{
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${leagueColor || '#ff7a45'} 0%, ${leagueColor ? leagueColor + '99' : '#d84315'} 100%)`,
          color: '#fff',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <div>
              <h1 style={{ margin: 0, marginBottom: '8px', color: '#fff' }}>
                {leagueName}
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>
                {leagueFlag} {leagueName} {season ? `• Season ${season}` : ''}
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={handleInviteTeam}
              style={{ marginRight: '8px' }}
            >
              Invite Teams
            </Button>
            {leagueStats.joinCode && (
              <Tooltip title={leagueStats.joinCode}>
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCopyJoinCode}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
                >
                  {leagueStats.joinCode}
                </Button>
              </Tooltip>
            )}
          </Col>
        </Row>
      </Card>

      {/* League Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Members"
              value={leagueStats.members || 0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Commissioner"
              value={leagueStats.commissioner || 'Not set'}
              valueStyle={{ fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Top Scorer"
              value={leagueStats.topScorer?.name || 'N/A'}
              valueStyle={{ fontSize: '14px' }}
              suffix={leagueStats.topScorer ? `${leagueStats.topScorer.goals || 0}G` : ''}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Most Assists"
              value={leagueStats.mostAssists?.name || 'N/A'}
              valueStyle={{ fontSize: '14px' }}
              suffix={leagueStats.mostAssists ? `${leagueStats.mostAssists.assists || 0}A` : ''}
            />
          </Card>
        </Col>
      </Row>

      {/* League Table */}
      <Card style={{ marginBottom: '24px' }}>
        {standings.length === 0 ? (
          <Empty description="No standings data yet, play some matches to see results!" />
        ) : (
          <LeagueTable standings={standings} currentTeamId={currentTeamId} />
        )}
      </Card>

      {/* Fixtures */}
      <Card title="Upcoming Fixtures" style={{ marginBottom: '24px' }}>
        {fixtures.length === 0 ? (
          <Empty description="No upcoming fixtures scheduled" />
        ) : (
          <Table
            columns={fixtureColumns}
            dataSource={fixtures.map((f, idx) => ({ ...f, key: f._id || idx }))}
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* League Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top Scorer">
            {leagueStats.topScorer ? (
              <List
                dataSource={[leagueStats.topScorer]}
                renderItem={(player) => (
                  <List.Item>
                    <List.Item.Meta
                      title={player.name}
                      description={player.club || player.team || ''}
                    />
                    <Space>
                      <Badge count={player.goals || 0} style={{ backgroundColor: '#ff4d4f' }} />
                      <span>Goals</span>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No scorer data available" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Most Assists">
            {leagueStats.mostAssists ? (
              <List
                dataSource={[leagueStats.mostAssists]}
                renderItem={(player) => (
                  <List.Item>
                    <List.Item.Meta
                      title={player.name}
                      description={player.club || player.team || ''}
                    />
                    <Space>
                      <Badge count={player.assists || 0} style={{ backgroundColor: '#52c41a' }} />
                      <span>Assists</span>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No assist data available" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default League;
