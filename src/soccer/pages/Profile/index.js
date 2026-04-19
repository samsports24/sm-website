import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Tabs,
  Row,
  Col,
  Statistic,
  List,
  Badge,
  Spin,
  Empty,
  Modal,
  message,
} from 'antd';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken } from '../../config/constants';

const Profile = () => {
  const { teamName, leagueName, user } = useSoccerLeague();
  const walletData = useSelector((state) => state.user?.SamPoints);
  const availableSP = (walletData?.SamPoints || 0) + (walletData?.preAuctionPoints || 0);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [myTeams, setMyTeams] = useState([]);
  const [spHistory, setSpHistory] = useState([]);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    samPoints: 0,
    stats: {
      totalFantasyPoints: 0,
      bestMatchweek: 0,
      winRate: 0,
      totalMatches: 0,
    },
    settings: {
      notifications: true,
      emailNotifications: true,
      timezone: 'UTC',
      favoriteClub: '',
      receivePromo: false,
    },
  });

  // Sync user data from Redux
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        username: user.username || user.userName || user.name || '',
        email: user.email || '',
        avatar: user.profileImage || user.avatar || '',
        samPoints: availableSP,
      }));
    }
    setLoading(false);
  }, [user, availableSP]);

  // Fetch teams and SP history from soccer API
  useEffect(() => {
    const fetchData = async () => {
      try {
        attachSoccerToken();
        const [teamsRes, historyRes] = await Promise.allSettled([
          soccerAPI.get('/api/v1/teams/my-teams'),
          soccerAPI.get('/api/v1/notifications'),
        ]);

        if (teamsRes.status === 'fulfilled' && teamsRes.value?.data?.data) {
          const teams = (Array.isArray(teamsRes.value.data.data) ? teamsRes.value.data.data : []).map((t, i) => ({
            id: t._id || i,
            name: t.name || 'Team',
            league: t.leagueName || t.league?.name || leagueName || 'League',
            ranking: t.position || 0,
            fantasyPoints: t.fantasyPoints || t.totalPoints || 0,
          }));
          setMyTeams(teams);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value?.data?.data) {
          setSpHistory(Array.isArray(historyRes.value.data.data) ? historyRes.value.data.data : []);
        }
      } catch {
        // APIs may not exist yet
      }
    };
    fetchData();
  }, [leagueName]);

  useEffect(() => {
    form.setFieldsValue({
      username: profileData.username,
      email: profileData.email,
      timezone: profileData.settings.timezone,
      favoriteClub: profileData.settings.favoriteClub,
      notifications: profileData.settings.notifications,
      emailNotifications: profileData.settings.emailNotifications,
      receivePromo: profileData.settings.receivePromo,
    });
  }, [profileData, form]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      attachSoccerToken();
      await soccerAPI.put('/api/v1/users/update-profile', {
        username: values.username,
        email: values.email,
        timezone: values.timezone,
        favoriteClub: values.favoriteClub,
        notifications: values.notifications,
        emailNotifications: values.emailNotifications,
        receivePromo: values.receivePromo,
      });
      setProfileData((prev) => ({
        ...prev,
        username: values.username,
        email: values.email,
        settings: {
          ...prev.settings,
          timezone: values.timezone,
          favoriteClub: values.favoriteClub,
          notifications: values.notifications,
          emailNotifications: values.emailNotifications,
          receivePromo: values.receivePromo,
        },
      }));
      setIsEditing(false);
      message.success('Profile updated successfully!');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Logout',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => {
        localStorage.removeItem('token');
        window.location.href = '/';
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Profile Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar
              src={profileData.avatar || undefined}
              size={120}
              style={{
                border: '4px solid #1890ff',
                margin: '0 auto',
              }}
            >
              {profileData.username ? profileData.username.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <h1 style={{ margin: '0 0 8px 0' }}>{profileData.username || 'No username set'}</h1>
              <div style={{ fontSize: '14px', color: '#666' }}>{profileData.email || ''}</div>
              <div style={{ marginTop: '16px' }}>
                <Badge
                  status="success"
                  text="Active Member"
                />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEditProfile}
              style={{ marginRight: '8px' }}
            >
              Edit Profile
            </Button>
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Card>

      {/* SamPoints Section */}
      <Card title="SamPoints Balance" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Current Balance"
              value={profileData.samPoints}
              valueStyle={{ fontSize: '28px', color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={18}>
            <div>
              <h4 style={{ marginBottom: '12px' }}>Recent Activity</h4>
              {spHistory.length === 0 ? (
                <Empty description="No activity yet" />
              ) : (
                <List
                  dataSource={spHistory.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.reason || item.description || 'Transaction'}
                        description={item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}
                      />
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: (item.amount || 0) > 0 ? '#52c41a' : '#ff4d4f',
                        }}
                      >
                        {(item.amount || 0) > 0 ? '+' : ''}{item.amount || 0}
                      </span>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* My Teams */}
      <Card title="My Teams" style={{ marginBottom: '24px' }}>
        {myTeams.length === 0 ? (
          <Empty description="No teams yet, join a league to get started!" />
        ) : (
          <Row gutter={[16, 16]}>
            {myTeams.map((team) => (
              <Col key={team.id} xs={24} sm={12} lg={6}>
                <Card hoverable>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{team.name}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{team.league}</div>
                  </div>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Statistic
                        title="Ranking"
                        value={team.ranking || '--'}
                        valueStyle={{ fontSize: '18px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Fantasy Pts"
                        value={team.fantasyPoints || 0}
                        valueStyle={{ fontSize: '18px' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* Stats */}
      <Card title="Stats" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Fantasy Pts"
              value={profileData.stats.totalFantasyPoints}
              valueStyle={{ fontSize: '20px' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Best Matchweek"
              value={profileData.stats.bestMatchweek}
              valueStyle={{ fontSize: '20px' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Win Rate"
              value={profileData.stats.winRate ? (profileData.stats.winRate * 100).toFixed(0) : 0}
              suffix="%"
              valueStyle={{ fontSize: '20px' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              title="Total Matches"
              value={profileData.stats.totalMatches}
              valueStyle={{ fontSize: '20px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Settings */}
      <Card title="Settings">
        {isEditing ? (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Invalid email format' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Timezone" name="timezone">
              <Select
                options={[
                  { label: 'UTC', value: 'UTC' },
                  { label: 'EST', value: 'EST' },
                  { label: 'CST', value: 'CST' },
                  { label: 'PST', value: 'PST' },
                  { label: 'GMT', value: 'GMT' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Favorite Club" name="favoriteClub">
              <Input placeholder="Enter your favorite club" />
            </Form.Item>

            <Form.Item label="Notifications" name="notifications" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Email Notifications" name="emailNotifications" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Promotional Emails" name="receivePromo" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Row gutter={[8, 8]}>
              <Col>
                <Button type="primary" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </Col>
              <Col>
                <Button onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        ) : (
          <Form layout="vertical">
            <Form.Item label="Timezone">
              <span>{profileData.settings.timezone}</span>
            </Form.Item>

            <Form.Item label="Favorite Club">
              <span>{profileData.settings.favoriteClub || 'Not set'}</span>
            </Form.Item>

            <Form.Item label="Push Notifications">
              <Badge status={profileData.settings.notifications ? 'success' : 'default'} text={profileData.settings.notifications ? 'Enabled' : 'Disabled'} />
            </Form.Item>

            <Form.Item label="Email Notifications">
              <Badge status={profileData.settings.emailNotifications ? 'success' : 'default'} text={profileData.settings.emailNotifications ? 'Enabled' : 'Disabled'} />
            </Form.Item>

            <Form.Item label="Promotional Emails">
              <Badge status={profileData.settings.receivePromo ? 'success' : 'default'} text={profileData.settings.receivePromo ? 'Enabled' : 'Disabled'} />
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Profile;
