import React, { useEffect, useState } from 'react'
import { Input, Select, Table } from 'antd'
import { useSelector } from 'react-redux'
import { updateTeamConfDivision } from '../../redux/actions/teamActions'

const TeamAndOwnership = () => {
  const { currentLeague } = useSelector((state) => state.league)
  const [tableData, setTableData] = useState([])

  useEffect(() => {
    const teamsLength = currentLeague?.teams?.length
   // const remainingEmptyRows = 32 - teamsLength
    const remainingEmptyRows = 5 - teamsLength

    const emptyData = Array.from({ length: remainingEmptyRows }, (_, index) => ({
      key: (index + teamsLength).toString(),
      teamName: '',
      userName: '',
      email: '',
      division: '',
      financialCap: '',
    }))

    const modifyData = currentLeague?.teams?.map((v, index) => {
      return {
        id: v?._id,
        key: index.toString(),
        teamName: v?.name,
        userName: v?.user?.userName,
        email: v?.user?.email,
        division: v?.division?._id ? v?.division?._id : '',
        financialCap: '',
      }
    })

    const _initialData = [...modifyData, ...emptyData]
    setTableData(_initialData)
  }, [currentLeague])

  const handleInputChange = async (value, record, column) => {
    const newData = tableData.map((item) => {
      if (item.key === record.key) {
        return { ...item, [column]: value }
      }
      return item
    })
    setTableData(newData)
    await updateTeamConfDivision({
      teamId: record.id,
      division: value,
      conference: currentLeague?.divisions?.find((v) => v?._id === value)?.conference,
    })
  }

  const columns = [
    {
      title: 'Team Names',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (_, record) => (
        <Input
          value={record.teamName}
          onChange={(e) => handleInputChange(e.target.value, record.key, 'teamName')}
          disabled={true}
        />
      ),
      width: 200,
    },
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (_, record) => (
        <Input
          disabled={true}
          value={record.userName}
          onChange={(e) => handleInputChange(e.target.value, record.key, 'userName')}
        />
      ),
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (_, record) => (
        <Input
          disabled={true}
          type='email'
          value={record.email}
          onChange={(e) => handleInputChange(e.target.value, record.key, 'email')}
        />
      ),
      width: 200,
    },
    {
      title: 'Select Division',
      dataIndex: 'selectDivision',
      key: 'selectDivision',
      render: (_, record) => (
        <Select
          mode=''
          size={'middle'}
          placeholder='Please select'
          style={{
            width: '100%',
          }}
          disabled={!record?.id}
          value={record.division}
          onChange={(value) => handleInputChange(value, record, 'division')}
          options={currentLeague?.divisions?.map((v) => {
            return {
              value: v?._id,
              label: v?.name,
            }
          })}
        />
      ),
      width: 200,
    },
    {
      title: 'Financial Cap',
      dataIndex: 'financialCap',
      key: 'financialCap',
      render: (_, record, index) => (
        <div className={`financial_cap_box ${index % 2 === 0 ? 'greenBg' : 'redBg'}`}>
          {record?.financialCap ? record?.financialCap : ''}
        </div>
      ),
      width: 200,
    },
  ]

  return (
    <div className='team_ownership_container'>
      <div className='t_o_form_box'>
        <Table columns={columns} dataSource={tableData} pagination={false} scroll={{ x: 1000 }} />
      </div>
    </div>
  )
}

export default TeamAndOwnership
