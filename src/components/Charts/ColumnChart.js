import React from 'react'
import { Pie } from '@ant-design/plots'
import { useSelector } from 'react-redux'

const DonoughtChart = () => {
  const { currentLeague } = useSelector((state) => state.league)
  const user = useSelector((state) => state.user)
  const teamId = user?.userDetails?.team?._id || user?.userDetails?.team

  // Build chart data from real team financials if available
  const team = user?.userDetails?.team
  const salary = typeof team === 'object' ? (team.totalSalary || team.salary || 0) : 0
  const cap = currentLeague?.salaryCap || 300000000
  const used = salary
  const remaining = Math.max(cap - used, 0)

  const data = used > 0 || remaining > 0
    ? [
        { type: 'Salary Used', value: used },
        { type: 'Cap Space', value: remaining },
      ]
    : [{ type: 'No Data', value: 1 }]

  const hasData = used > 0 || remaining > 0

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    legend: false,
    radius: 1,
    color: hasData ? ['#22C55E', '#1A2332'] : ['#1A2332'],
    innerRadius: 0.5,
    label: {
      type: 'outer',
      offset: '30%',
      content: hasData ? '{name} {percentage}' : '',
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
    },
    interactions: [
      { type: 'element-selected' },
      { type: 'element-active' },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          color: '#22C55E',
          fontSize: '35px',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: hasData ? `${Math.round((used / cap) * 100)}%` : '--',
      },
    },
  }
  return <Pie {...config} />
}
export default DonoughtChart
