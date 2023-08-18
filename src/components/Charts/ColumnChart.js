import { Pie } from '@ant-design/plots'

const DonoughtChart = () => {
  const data = [
    {
      type: 'type 1',
      value: 30,
    },
    {
      type: 'type 2',
      value: 40,
    },
    {
      type: 'type 3',
      value: 15,
    },
    {
      type: 'type 4',
      value: 15,
    },
  ]
  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    legend: false,
    radius: 1,
    color: ['#30215D', '#289FC9', '#043d41', '#103927'],
    innerRadius: 0.5,
    label: {
      type: 'outer',
      offset: '30%',
      content: 'Lorem Ipsum {value}',
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          color: '#00A7E5',
          fontSize: '35px',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '100%',
      },
    },
  }
  return <Pie {...config} />
}
export default DonoughtChart
