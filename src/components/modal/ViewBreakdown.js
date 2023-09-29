import { Modal, Table } from 'antd'
import React, { useState } from 'react'

const ViewBreakdown = ({ data }) => {
  const [open, setOpen] = useState(false)

  const showModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const columns = [
    {
      title: 'Score Breakdown',
      dataIndex: 'metric',
      width: 300,
      render: (val) => {
        return <p style={{ minWidth: '300px !important' }}>{val}</p>
      },
    },
    {
      title: 'Stats',
      dataIndex: 'units',
    },
    {
      title: 'Pts Per Unit',
      dataIndex: 'pointsPerUnit',
      render: (val) => {
        return <span>{val?.toFixed(2)}</span>
      },
    },
    {
      title: 'Points',
      dataIndex: 'total',
      render: (val) => {
        return <span>{val?.toFixed(2)}</span>
      },
    },
  ]

  const OLcolumns = [
    {
      title: 'Score Breakdown for OL',
      dataIndex: 'metric',
      render: (val) => {
        return <p style={{ minWidth: '300px !important' }}>{val}</p>
      },
    },
    {
      title: 'Stats',
      dataIndex: 'units',
    },
  ]

  function addSpacesToCamelCase(inputString) {
    const stringWithSpaces = inputString.replace(/([a-z])([A-Z])/g, '$1 $2')
    const wordsArray = stringWithSpaces.split(' ')
    const capitalizedWords = wordsArray.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    return capitalizedWords.join(' ')
  }

  return (
    <>
      <button className='view_button' onClick={showModal}>
        View Breakdown
      </button>
      <Modal
        centered
        open={open}
        onCancel={closeModal}
        footer={null}
        closeIcon={false}
        className='view_breakdown_modal'
        closable={false}
      >
        <div className='view_breakdown_modal_body'>
          <Table
            columns={data?.player?.FantasyPosition === 'OL' ? OLcolumns : columns}
            dataSource={
              data?.player?.FantasyPosition === 'OL'
                ? Object.entries(data?.player?.playerScoreBreakDown?.[0]).map(
                    ([metric, units], index) => ({
                      key: index,
                      metric:
                        metric === 'playerSnap'
                          ? addSpacesToCamelCase(metric + 'Percentage')
                          : addSpacesToCamelCase(metric),
                      units: metric === 'playerSnap' ? units + '%' : units,
                    }),
                  )
                : data?.player?.playerScoreBreakDown
            }
            pagination={false}
            scroll={{
              x: 600,
              y: 500,
            }}
            bordered={false}
            summary={() => {
              return (
                data?.player?.FantasyPosition !== 'OL' && (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        Total
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>{data?.player?.playerScore}</Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )
              )
            }}
          />
        </div>
      </Modal>
    </>
  )
}

export default ViewBreakdown
