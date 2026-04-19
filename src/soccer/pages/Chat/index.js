import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Space,
  Badge,
  Avatar,
  Spin,
  Empty,
  Row,
  Col,
  message,
} from 'antd';
import { SendOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import useSoccerLeague from '../../hooks/useSoccerLeague';
import { soccerAPI, attachSoccerToken } from '../../config/constants';

const Chat = () => {
  const { league, leagueName, user } = useSoccerLeague();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages from API
  const fetchMessages = async () => {
    if (!league?._id) return;

    try {
      attachSoccerToken();
      const response = await soccerAPI.get(`/api/v1/chat/${league._id}`);
      const msgs = Array.isArray(response.data) ? response.data : response.data.messages || [];
      // Sort messages so newest are at the bottom
      setMessages(msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Don't show error toast on initial load, only on explicit refetch
    }
  };

  // Fetch league members/standings
  const fetchMembers = async () => {
    if (!league?._id) return;

    try {
      attachSoccerToken();
      const response = await soccerAPI.get(`/api/v1/leagues/standings/${league._id}`);
      const standings = Array.isArray(response.data) ? response.data : response.data.standings || [];

      // Extract unique members from standings (each entry has a team with owner)
      const uniqueMembers = {};
      standings.forEach((standing) => {
        if (standing.team?.owner) {
          const ownerId = standing.team.owner._id || standing.team.owner.id;
          if (!uniqueMembers[ownerId]) {
            uniqueMembers[ownerId] = {
              id: ownerId,
              name: standing.team.owner.name || standing.team.owner.username || 'Unknown Member',
              profileImage: standing.team.owner.profileImage,
              status: 'offline', // Presence tracking not yet implemented
            };
          }
        }
      });

      setMembers(Object.values(uniqueMembers));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMessages(), fetchMembers()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [league?._id]);

  // Setup polling for new messages every 10 seconds
  useEffect(() => {
    if (!league?._id) return;

    // Poll immediately, then set up interval
    const poll = () => {
      fetchMessages();
    };

    poll();
    pollIntervalRef.current = setInterval(poll, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [league?._id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !league?._id) return;

    setSending(true);
    try {
      attachSoccerToken();
      await soccerAPI.post('/api/v1/chat/send', {
        leagueId: league._id,
        message: messageInput,
      });

      setMessageInput('');
      // Refetch messages after sending
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;

    setDeletingId(messageId);
    try {
      attachSoccerToken();
      await soccerAPI.delete(`/api/v1/chat/${messageId}`);
      message.success('Message deleted');
      // Refetch messages after deletion
      await fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      message.error('Failed to delete message. You can only delete your own messages.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      if (diff < 60 * 1000) return 'just now';
      if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
      if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;

      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const isOwnMessage = (messageUserId) => {
    return user?._id === messageUserId || user?.id === messageUserId;
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
      <Row gutter={[16, 16]} style={{ minHeight: 'calc(100vh - 100px)' }}>
        {/* Chat Section */}
        <Col xs={24} lg={16}>
          <Card title={`${leagueName} Chat`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Messages List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '16px',
                maxHeight: 'calc(100vh - 300px)',
                paddingRight: '8px',
              }}
            >
              {messages.length === 0 ? (
                <Empty description="No messages yet. Be the first to chat!" />
              ) : (
                <List
                  dataSource={messages}
                  renderItem={(message) => {
                    const messageUser = message.user;
                    const userName = messageUser?.name || messageUser?.username || 'Unknown';
                    const userId = messageUser?._id || messageUser?.id;

                    return message.type === 'system' ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '8px',
                          marginBottom: '12px',
                          fontSize: '12px',
                          color: '#999',
                        }}
                      >
                        {message.content || message.message}
                      </div>
                    ) : (
                      <List.Item
                        style={{
                          padding: '8px 0',
                          marginBottom: '12px',
                          borderBottom: 'none',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (isOwnMessage(userId)) {
                            e.currentTarget.style.backgroundColor = '#f9f9f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor: '#1890ff',
                                cursor: 'pointer',
                              }}
                              src={messageUser?.profileImage}
                            >
                              {!messageUser?.profileImage && getInitials(userName)}
                            </Avatar>
                          }
                          title={
                            <div>
                              <strong>{userName}</strong>
                              <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          }
                          description={
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <div
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '6px',
                                  marginTop: '4px',
                                  flex: 1,
                                }}
                              >
                                {message.content || message.message}
                              </div>
                              {isOwnMessage(userId) && (
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteMessage(message._id)}
                                  loading={deletingId === message._id}
                                  style={{ marginTop: '4px' }}
                                />
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={handleSendMessage}
                disabled={sending}
                style={{ borderRadius: '6px 0 0 6px' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={sending}
                disabled={!messageInput.trim()}
                style={{ borderRadius: '0 6px 6px 0' }}
              >
                Send
              </Button>
            </Space.Compact>
          </Card>
        </Col>

        {/* Members Sidebar */}
        <Col xs={24} lg={8}>
          <Card title={`Online Members (${members.length})`}>
            <List
              dataSource={members}
              renderItem={(member) => (
                <List.Item
                  style={{
                    padding: '8px 0',
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <Avatar
                          style={{
                            backgroundColor: '#1890ff',
                          }}
                          src={member.profileImage}
                        >
                          {!member.profileImage && getInitials(member.name)}
                        </Avatar>
                        {member.status === 'online' && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#52c41a',
                              borderRadius: '50%',
                              border: '2px solid #fff',
                            }}
                          />
                        )}
                      </div>
                    }
                    title={member.name}
                    description={
                      <Badge
                        status="success"
                        text="online"
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* League Info */}
          <Card title="League Info" style={{ marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>League</div>
                <div style={{ fontWeight: 'bold' }}>{leagueName}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>Total Members</div>
                <div style={{ fontWeight: 'bold' }}>{members.length}</div>
              </div>
              <Button
                type="primary"
                block
                icon={<TeamOutlined />}
              >
                View League
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Chat;
