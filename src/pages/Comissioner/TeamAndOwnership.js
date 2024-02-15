import React, { useEffect, useState } from 'react'
import { Input, Select, Table } from 'antd'
import { getDivisions } from '../../redux/actions/confAndDivisionAction'

const TeamAndOwnership = ({ data }) => {
  //   const initialData = Array.from({ length: 32 }, (_, index) => ({
  //     key: index.toString(),
  //     teamName: '',
  //     userName: '',
  //     email: '',
  //     selectDivision: '',
  //     financialCap: '-',
  //   }))

  const [tableData, setTableData] = useState([])
  const [divisions, setDivisions] = useState([])
  console.log('🚀 ~ TeamAndOwnership ~ divisions:', divisions)

  useEffect(() => {
    const teamsLength = data?.teams?.length
    const remainingEmptyRows = 32 - teamsLength

    const emptyData = Array.from({ length: remainingEmptyRows }, (_, index) => ({
      key: (index + remainingEmptyRows).toString(),
      teamName: '',
      userName: '',
      email: '',
      selectDivision: '',
      financialCap: '',
    }))

    const modifyData = data?.teams?.map((v, index) => {
      return {
        id: v?._id,
        key: index.toString(),
        teamName: v?.name,
        userName: v?.user?.userName,
        email: v?.user?.email,
        selectDivision: '',
        financialCap: '',
      }
    })

    const _initialData = [...modifyData, ...emptyData]
    // console.log('🚀 ~ useEffect ~ _initialData:', _initialData)
    setTableData(_initialData)
  }, [data])

  useEffect(() => {
    // if (data?.conferences?.length > 0) {
    //   const _divisions = [...data?.conferences[0]?.divisions, ...data?.conferences[1]?.divisions]
    //   setDivisions(_divisions)
    // }
  }, [data])

  const handleInputChange = (value, key, column) => {
    const newData = tableData.map((item) => {
      if (item.key === key) {
        return { ...item, [column]: value }
      }
      return item
    })
    setTableData(newData)
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
          value={record.selectDivision}
          onChange={(value) => handleInputChange(value, record.key, 'selectDivision')}
          options={divisions?.map((v) => {
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

  useEffect(() => {
    _getDivision()
  }, [])

  const _getDivision = async () => {
    const res = await getDivisions()
    if (res) {
      setDivisions(res)
    }
  }

  return (
    <div className='team_ownership_container'>
      <div className='t_o_form_box'>
        <Table columns={columns} dataSource={tableData} pagination={false} />
      </div>
    </div>
  )
}

export default TeamAndOwnership
