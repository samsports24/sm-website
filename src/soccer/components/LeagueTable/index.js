import React, { useMemo } from 'react';
import { Table, Badge } from 'antd';

const LeagueTable = ({ standings = [], currentTeamId }) => {
  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => {
      if (b.fantasyPoints !== a.fantasyPoints) {
        return b.fantasyPoints - a.fantasyPoints;
      }
      return b.leaguePoints - a.leaguePoints;
    });
  }, [standings]);

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 60,
      render: (_, record, index) => (
        <span style={{ fontWeight: 'bold' }}>{index + 1}</span>
      ),
    },
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (text, record) => (
        <span
          style={{
            fontWeight: record.teamId === currentTeamId ? 'bold' : 'normal',
            color: record.teamId === currentTeamId ? '#1890ff' : 'inherit',
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'P',
      dataIndex: 'played',
      key: 'played',
      width: 50,
      align: 'center',
    },
    {
      title: 'W',
      dataIndex: 'won',
      key: 'won',
      width: 50,
      align: 'center',
      render: (val) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{val}</span>,
    },
    {
      title: 'D',
      dataIndex: 'drawn',
      key: 'drawn',
      width: 50,
      align: 'center',
    },
    {
      title: 'L',
      dataIndex: 'lost',
      key: 'lost',
      width: 50,
      align: 'center',
      render: (val) => <span style={{ color: '#ff4d4f' }}>{val}</span>,
    },
    {
      title: 'GF',
      dataIndex: 'goalsFor',
      key: 'goalsFor',
      width: 50,
      align: 'center',
    },
    {
      title: 'GA',
      dataIndex: 'goalsAgainst',
      key: 'goalsAgainst',
      width: 50,
      align: 'center',
    },
    {
      title: 'GD',
      dataIndex: 'goalDifference',
      key: 'goalDifference',
      width: 60,
      align: 'center',
      render: (val) => (
        <span style={{ color: val > 0 ? '#52c41a' : val < 0 ? '#ff4d4f' : '#999' }}>
          {val > 0 ? '+' : ''}{val}
        </span>
      ),
    },
    {
      title: 'Pts',
      dataIndex: 'leaguePoints',
      key: 'leaguePoints',
      width: 60,
      align: 'center',
      render: (val) => <span style={{ fontWeight: 'bold' }}>{val}</span>,
    },
    {
      title: 'Fantasy Pts',
      dataIndex: 'fantasyPoints',
      key: 'fantasyPoints',
      width: 100,
      align: 'center',
      render: (val) => (
        <Badge
          count={val}
          style={{
            backgroundColor: '#1890ff',
            fontWeight: 'bold',
          }}
        />
      ),
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>League Standings</h3>
      <Table
        columns={columns}
        dataSource={sortedStandings.map((item, idx) => ({ ...item, key: idx }))}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: true }}
        rowClassName={(record) =>
          record.teamId === currentTeamId ? 'highlighted-row' : ''
        }
        style={{
          fontSize: '13px',
        }}
      />
    </div>
  );
};

export default LeagueTable;
