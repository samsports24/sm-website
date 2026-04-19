import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Empty,
  Spin,
  message,
  Tag,
  Statistic,
  Divider,
  Space,
  Popconfirm,
  Avatar,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SwapOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { soccerAPI, attachSoccerToken } from '../../config/constants';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import styled from 'styled-components';

const Container = styled.div`
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;

const StatsContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ListingCard = styled(Card)`
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .team-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .team-name {
        font-size: 18px;
        font-weight: 600;
        color: #1890ff;
      }

      .league-tag {
        font-size: 12px;
      }
    }

    .price {
      font-size: 20px;
      font-weight: 700;
      color: #52c41a;
    }
  }

  .team-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 16px 0;
    padding: 12px 0;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;

    .stat {
      display: flex;
      justify-content: space-between;
      font-size: 12px;

      .label {
        color: #999;
      }

      .value {
        font-weight: 600;
        color: #262626;
      }
    }
  }

  .description {
    margin: 12px 0;
    font-size: 13px;
    color: #595959;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 16px;

    button {
      flex: 1;
    }
  }
`;

const Exchange = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [form] = Form.useForm();
  const [listingForm] = Form.useForm();
  const [offerForm] = Form.useForm();
  const { userTeams = [] } = useSoccerLeague();

  // State management
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});

  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [loadingMyOffers, setLoadingMyOffers] = useState(false);
  const [loadingReceivedOffers, setLoadingReceivedOffers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [listModalVisible, setListModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [submittingList, setSubmittingList] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // API calls
  const fetchListings = useCallback(async () => {
    setLoadingBrowse(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/listings`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      message.error('Failed to load team listings');
    } finally {
      setLoadingBrowse(false);
    }
  }, []);

  const fetchMyListings = useCallback(async () => {
    setLoadingMyListings(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/my-listings`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch my listings');
      const data = await response.json();
      setMyListings(data.data || []);
    } catch (error) {
      console.error('Error fetching my listings:', error);
      message.error('Failed to load your listings');
    } finally {
      setLoadingMyListings(false);
    }
  }, []);

  const fetchMyOffers = useCallback(async () => {
    setLoadingMyOffers(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/my-offers`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch my offers');
      const data = await response.json();
      setMyOffers(data.data || []);
    } catch (error) {
      console.error('Error fetching my offers:', error);
      message.error('Failed to load your offers');
    } finally {
      setLoadingMyOffers(false);
    }
  }, []);

  const fetchReceivedOffers = useCallback(async () => {
    setLoadingReceivedOffers(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/received-offers`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch received offers');
      const data = await response.json();
      setReceivedOffers(data.data || []);
    } catch (error) {
      console.error('Error fetching received offers:', error);
      message.error('Failed to load received offers');
    } finally {
      setLoadingReceivedOffers(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/history`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      message.error('Failed to load transaction history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/stats`, {
        headers: attachSoccerToken(),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Stats failure is not critical
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    fetchStats();
    switch (activeTab) {
      case 'browse':
        fetchListings();
        break;
      case 'my-listings':
        fetchMyListings();
        break;
      case 'my-offers':
        fetchMyOffers();
        break;
      case 'received-offers':
        fetchReceivedOffers();
        break;
      case 'history':
        fetchHistory();
        break;
      default:
        break;
    }
  }, [activeTab, fetchListings, fetchMyListings, fetchMyOffers, fetchReceivedOffers, fetchHistory, fetchStats]);

  // List team handler
  const handleListTeam = async (values) => {
    setSubmittingList(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...attachSoccerToken(),
        },
        body: JSON.stringify({
          teamId: values.teamId,
          askingPrice: values.askingPrice,
          description: values.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to list team');
      const data = await response.json();

      message.success('Team listed successfully!');
      setListModalVisible(false);
      listingForm.resetFields();
      fetchMyListings();
      fetchListings();
    } catch (error) {
      console.error('Error listing team:', error);
      message.error('Failed to list team. Please try again.');
    } finally {
      setSubmittingList(false);
    }
  };

  // Make offer handler
  const handleMakeOffer = async (values) => {
    if (!selectedListing) return;
    setSubmittingOffer(true);
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...attachSoccerToken(),
        },
        body: JSON.stringify({
          listingId: selectedListing.id,
          amount: values.amount,
          message: values.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to make offer');
      const data = await response.json();

      message.success('Offer submitted successfully!');
      setOfferModalVisible(false);
      offerForm.resetFields();
      setSelectedListing(null);
      fetchMyOffers();
      fetchListings();
    } catch (error) {
      console.error('Error making offer:', error);
      message.error('Failed to make offer. Please try again.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Buy now handler
  const handleBuyNow = async (listingId) => {
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/buy-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...attachSoccerToken(),
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) throw new Error('Failed to complete purchase');
      const data = await response.json();

      message.success('Purchase completed successfully!');
      fetchListings();
      fetchHistory();
    } catch (error) {
      console.error('Error buying now:', error);
      message.error('Failed to complete purchase. Please try again.');
    }
  };

  // Delist handler
  const handleDelist = async (listingId) => {
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/delist/${listingId}`, {
        method: 'DELETE',
        headers: attachSoccerToken(),
      });

      if (!response.ok) throw new Error('Failed to delist team');
      message.success('Team delisted successfully');
      fetchMyListings();
      fetchListings();
    } catch (error) {
      console.error('Error delisting team:', error);
      message.error('Failed to delist team. Please try again.');
    }
  };

  // Accept offer handler
  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/offer/${offerId}/accept`, {
        method: 'POST',
        headers: attachSoccerToken(),
      });

      if (!response.ok) throw new Error('Failed to accept offer');
      message.success('Offer accepted successfully!');
      fetchReceivedOffers();
      fetchHistory();
      fetchListings();
    } catch (error) {
      console.error('Error accepting offer:', error);
      message.error('Failed to accept offer. Please try again.');
    }
  };

  // Reject offer handler
  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/offer/${offerId}/reject`, {
        method: 'POST',
        headers: attachSoccerToken(),
      });

      if (!response.ok) throw new Error('Failed to reject offer');
      message.success('Offer rejected');
      fetchReceivedOffers();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      message.error('Failed to reject offer. Please try again.');
    }
  };

  // Withdraw offer handler
  const handleWithdrawOffer = async (offerId) => {
    try {
      const response = await fetch(`${soccerAPI}/api/v1/exchange/offer/${offerId}/withdraw`, {
        method: 'POST',
        headers: attachSoccerToken(),
      });

      if (!response.ok) throw new Error('Failed to withdraw offer');
      message.success('Offer withdrawn');
      fetchMyOffers();
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      message.error('Failed to withdraw offer. Please try again.');
    }
  };

  // Render Browse Tab
  const renderBrowseTab = () => {
    if (loadingBrowse) {
      return <Spin />;
    }

    if (listings.length === 0) {
      return <Empty description="No teams available on the Exchange" />;
    }

    return (
      <Row gutter={[16, 16]}>
        {listings.map((listing) => (
          <Col key={listing.id} xs={24} sm={12} lg={8} xl={6}>
            <ListingCard
              hoverable
              cover={
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '30px',
                    textAlign: 'center',
                    color: 'white',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  {listing.team?.logo ? (
                    <img
                      src={listing.team.logo}
                      alt={listing.team.name}
                      style={{ maxHeight: '100px', maxWidth: '100px' }}
                    />
                  ) : (
                    listing.team?.name?.charAt(0)
                  )}
                </div>
              }
            >
              <div className="team-header">
                <div className="team-info">
                  <div className="team-name">{listing.team?.name}</div>
                  <Tag className="league-tag">{listing.team?.league}</Tag>
                </div>
                <div className="price">${listing.askingPrice?.toLocaleString()}</div>
              </div>

              <div className="team-stats">
                <div className="stat">
                  <span className="label">Squad Size</span>
                  <span className="value">{listing.team?.squadSize || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">Team Value</span>
                  <span className="value">${listing.teamValue?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="stat">
                  <span className="label">Owner</span>
                  <span className="value">{listing.seller?.username || 'Unknown'}</span>
                </div>
                <div className="stat">
                  <span className="label">Posted</span>
                  <span className="value">
                    {listing.createdAt
                      ? new Date(listing.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {listing.description && <div className="description">{listing.description}</div>}

              <div className="action-buttons">
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => {
                    setSelectedListing(listing);
                    setOfferModalVisible(true);
                  }}
                >
                  Make Offer
                </Button>
                <Button
                  type="default"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: `Buy ${listing.team?.name}?`,
                      content: `Purchase this team for $${listing.askingPrice?.toLocaleString()}?`,
                      okText: 'Buy Now',
                      okType: 'primary',
                      onOk: () => handleBuyNow(listing.id),
                    });
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </ListingCard>
          </Col>
        ))}
      </Row>
    );
  };

  // Render My Listings Tab
  const renderMyListingsTab = () => {
    if (loadingMyListings) {
      return <Spin />;
    }

    if (myListings.length === 0) {
      return (
        <Empty
          description="No teams listed for sale"
          style={{ marginTop: '40px' }}
        >
          <Button type="primary" onClick={() => setListModalVisible(true)}>
            List Your First Team
          </Button>
        </Empty>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {myListings.map((listing) => (
          <Col key={listing.id} xs={24} sm={12} lg={8} xl={6}>
            <ListingCard
              cover={
                <div
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '30px',
                    textAlign: 'center',
                    color: 'white',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  {listing.team?.logo ? (
                    <img
                      src={listing.team.logo}
                      alt={listing.team.name}
                      style={{ maxHeight: '100px', maxWidth: '100px' }}
                    />
                  ) : (
                    listing.team?.name?.charAt(0)
                  )}
                </div>
              }
            >
              <div className="team-header">
                <div className="team-info">
                  <div className="team-name">{listing.team?.name}</div>
                  <Tag className="league-tag">{listing.team?.league}</Tag>
                </div>
                <div className="price">${listing.askingPrice?.toLocaleString()}</div>
              </div>

              <div className="team-stats">
                <div className="stat">
                  <span className="label">Squad Size</span>
                  <span className="value">{listing.team?.squadSize || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">Team Value</span>
                  <span className="value">${listing.teamValue?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="stat">
                  <span className="label">Views</span>
                  <span className="value">{listing.views || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">Offers</span>
                  <span className="value">{listing.offerCount || 0}</span>
                </div>
              </div>

              {listing.description && <div className="description">{listing.description}</div>}

              <div className="action-buttons">
                <Popconfirm
                  title="Delete listing?"
                  description="Remove this team from the Exchange?"
                  onConfirm={() => handleDelist(listing.id)}
                  okText="Yes"
                  cancelText="No"
                  style={{ flex: 1 }}
                >
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    block
                  >
                    Delist
                  </Button>
                </Popconfirm>
              </div>
            </ListingCard>
          </Col>
        ))}
      </Row>
    );
  };

  // My Offers columns
  const myOffersColumns = [
    {
      title: 'Team',
      dataIndex: ['listing', 'team', 'name'],
      key: 'team',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Asking Price',
      dataIndex: ['listing', 'askingPrice'],
      key: 'askingPrice',
      render: (price) => `$${price?.toLocaleString()}`,
    },
    {
      title: 'My Offer',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <strong>${amount?.toLocaleString()}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'processing',
          accepted: 'success',
          rejected: 'error',
          withdrawn: 'default',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Popconfirm
            title="Withdraw offer?"
            description="This action cannot be undone."
            onConfirm={() => handleWithdrawOffer(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger size="small">
              Withdraw
            </Button>
          </Popconfirm>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
  ];

  // Received Offers columns
  const receivedOffersColumns = [
    {
      title: 'Team',
      dataIndex: ['listing', 'team', 'name'],
      key: 'team',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Asking Price',
      dataIndex: ['listing', 'askingPrice'],
      key: 'askingPrice',
      render: (price) => `$${price?.toLocaleString()}`,
    },
    {
      title: 'Offered Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <strong>${amount?.toLocaleString()}</strong>,
    },
    {
      title: 'From',
      dataIndex: ['buyer', 'username'],
      key: 'buyer',
      render: (username) => username || 'Unknown',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'processing',
          accepted: 'success',
          rejected: 'error',
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'pending' ? (
          <Space size="small">
            <Popconfirm
              title="Accept offer?"
              description={`Accept $${record.amount?.toLocaleString()} from ${
                record.buyer?.username
              }?`}
              onConfirm={() => handleAcceptOffer(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
              >
                Accept
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject offer?"
              onConfirm={() => handleRejectOffer(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="default"
                danger
                size="small"
                icon={<CloseOutlined />}
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Tag color={record.status === 'accepted' ? 'success' : 'error'}>
            {record.status?.toUpperCase()}
          </Tag>
        ),
    },
  ];

  // History columns
  const historyColumns = [
    {
      title: 'Team',
      dataIndex: ['team', 'name'],
      key: 'team',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const icons = {
          listing: <PlusOutlined />,
          delisting: <DeleteOutlined />,
          offer: <DollarOutlined />,
          sale: <SwapOutlined />,
        };
        return <Badge icon={icons[type] || '-'} text={type?.toUpperCase()} />;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (amount ? `$${amount?.toLocaleString()}` : '-'),
    },
    {
      title: 'Seller',
      dataIndex: ['seller', 'username'],
      key: 'seller',
      render: (username) => username || 'Unknown',
    },
    {
      title: 'Buyer',
      dataIndex: ['buyer', 'username'],
      key: 'buyer',
      render: (username) => username || 'Unknown',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <Container>
      {/* Header with List Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1>Team Exchange</h1>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setListModalVisible(true)}
        >
          List My Team
        </Button>
      </div>

      {/* Stats Banner */}
      {!loadingStats && (
        <StatsContainer>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Active Listings"
                value={stats.totalListings || 0}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Total Volume"
                value={stats.totalVolume || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => `$${value?.toLocaleString()}`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Avg. Price"
                value={stats.averagePrice || 0}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => `$${value?.toLocaleString()}`}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Completed Sales"
                value={stats.completedSales || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </StatsContainer>
      )}

      {/* Tabs */}
      <Card style={{ borderRadius: '8px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'browse',
              label: (
                <span>
                  <ShoppingCartOutlined /> Browse
                </span>
              ),
              children: renderBrowseTab(),
            },
            {
              key: 'my-listings',
              label: (
                <span>
                  <UserOutlined /> My Listings ({myListings.length})
                </span>
              ),
              children: renderMyListingsTab(),
            },
            {
              key: 'my-offers',
              label: (
                <span>
                  <DollarOutlined /> My Offers ({myOffers.length})
                </span>
              ),
              children: loadingMyOffers ? (
                <Spin />
              ) : myOffers.length === 0 ? (
                <Empty description="No offers sent yet" style={{ marginTop: '40px' }} />
              ) : (
                <Table
                  columns={myOffersColumns}
                  dataSource={myOffers}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'received-offers',
              label: (
                <span>
                  <SwapOutlined /> Received Offers ({receivedOffers.length})
                </span>
              ),
              children: loadingReceivedOffers ? (
                <Spin />
              ) : receivedOffers.length === 0 ? (
                <Empty description="No offers received yet" style={{ marginTop: '40px' }} />
              ) : (
                <Table
                  columns={receivedOffersColumns}
                  dataSource={receivedOffers}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined /> History
                </span>
              ),
              children: loadingHistory ? (
                <Spin />
              ) : history.length === 0 ? (
                <Empty description="No transaction history" style={{ marginTop: '40px' }} />
              ) : (
                <Table
                  columns={historyColumns}
                  dataSource={history}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* List Team Modal */}
      <Modal
        title="List Your Team for Sale"
        visible={listModalVisible}
        onCancel={() => {
          setListModalVisible(false);
          listingForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={listingForm}
          layout="vertical"
          onFinish={handleListTeam}
        >
          <Form.Item
            name="teamId"
            label="Select Team"
            rules={[{ required: true, message: 'Please select a team' }]}
          >
            <Select
              placeholder="Choose a team to sell"
              options={userTeams?.map((team) => ({
                label: team.name,
                value: team.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="askingPrice"
            label="Asking Price ($)"
            rules={[
              { required: true, message: 'Please enter asking price' },
              {
                type: 'number',
                min: 0,
                message: 'Price must be greater than 0',
              },
            ]}
          >
            <InputNumber
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) =>
                value?.replace(/\$\s?|(,*)/g, '')
              }
              placeholder="10000"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
            rules={[
              {
                max: 500,
                message: 'Description cannot exceed 500 characters',
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Add details about your team, players, achievements, etc."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submittingList}
              >
                List Team
              </Button>
              <Button
                onClick={() => {
                  setListModalVisible(false);
                  listingForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Make Offer Modal */}
      <Modal
        title={`Make an Offer on ${selectedListing?.team?.name || 'Team'}`}
        visible={offerModalVisible}
        onCancel={() => {
          setOfferModalVisible(false);
          offerForm.resetFields();
          setSelectedListing(null);
        }}
        footer={null}
        width={500}
      >
        {selectedListing && (
          <>
            <div style={{ marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ fontSize: '12px', color: '#999' }}>Asking Price</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    ${selectedListing.askingPrice?.toLocaleString()}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: '12px', color: '#999' }}>Team Value</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    ${selectedListing.teamValue?.toLocaleString() || 'N/A'}
                  </div>
                </Col>
              </Row>
            </div>

            <Form
              form={offerForm}
              layout="vertical"
              onFinish={handleMakeOffer}
            >
              <Form.Item
                name="amount"
                label="Your Offer Amount ($)"
                rules={[
                  { required: true, message: 'Please enter an offer amount' },
                  {
                    type: 'number',
                    min: 0,
                    message: 'Amount must be greater than 0',
                  },
                ]}
              >
                <InputNumber
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) =>
                    value?.replace(/\$\s?|(,*)/g, '')
                  }
                  placeholder="Enter your offer"
                />
              </Form.Item>

              <Form.Item
                name="message"
                label="Message to Seller (Optional)"
                rules={[
                  {
                    max: 300,
                    message: 'Message cannot exceed 300 characters',
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Add a personal message with your offer..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingOffer}
                  >
                    Submit Offer
                  </Button>
                  <Button
                    onClick={() => {
                      setOfferModalVisible(false);
                      offerForm.resetFields();
                      setSelectedListing(null);
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Exchange;
