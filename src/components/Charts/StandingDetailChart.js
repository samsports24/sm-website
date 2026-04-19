import React from 'react'
import { Line } from '@ant-design/plots'

const StandingDetailChart = ({ data: propData }) => {
  // Use passed-in data or show empty state
  const data = propData && propData.length > 0
    ? propData
    : []

  if (data.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 300, color: 'rgba(255,255,255,0.3)',
        fontFamily: "'Inter', sans-serif", fontSize: 14,
      }}>
        No standings data available yet
      </div>
    )
  }

  const config = {
    data,
    xField: 'day',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    color: ['#22C55E', '#D4A843', '#3B82F6'],
    legend: {
      position: 'top',
    },
    xAxis: {
      title: { text: 'Week' },
      grid: { line: { style: { stroke: 'rgba(255,255,255,0.05)' } } },
    },
    yAxis: {
      title: { text: 'Points' },
      grid: { line: { style: { stroke: 'rgba(255,255,255,0.05)' } } },
    },
    animation: { appear: { animation: 'path-in', duration: 1000 } },
  }

  return <Line {...config} />
}
export default StandingDetailChart
