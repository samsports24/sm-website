import React from 'react'
import { Column } from '@ant-design/charts'
import theme from '../../theme.json'

const ColumnChart = ({ data }) => {
  const Arr = [
    {
      month: 'Jan',
      cost: 10000,
    },
    {
      month: 'Feb',
      cost: 12000,
    },
    {
      month: 'Mar',
      cost: 11500,
    },
    {
      month: 'Apr',
      cost: 20000,
    },
    {
      month: 'May',
      cost: 22000,
    },
    {
      month: 'June',
      cost: 16000,
    },
    {
      month: 'July',
      cost: 8000,
    },
    {
      month: 'Aug',
      cost: 8000,
    },
    {
      month: 'Sept',
      cost: 9000,
    },
    {
      month: 'Oct',
      cost: 26000,
    },
    {
      month: 'Nov',
      cost: 9600,
    },
    {
      month: 'Dec',
      cost: 30000,
    },
  ]

  console.log('Arr', Arr)
  const config = {
    data,
    xField: 'month',
    yField: 'cost',
    color: theme['primary-color'],
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: 'gray',
        },
      },
    },
    meta: {
      cost: {
        alias: 'Cost (Rs)',
      },
      sales: {
        alias: 'xyz',
      },
    },
  }
  return <Column {...config} style={{ margin: '60px 0' }} />
}

// loading={Arr.length > 0 ? false : true}
export default ColumnChart
