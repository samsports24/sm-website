import { Image } from 'antd'

// Component
import StandingHeader from '../components/StandingHeader'

// Chart
import { Line } from '@ant-design/plots'

const data = [
  { day: 1, value: 1500, category: 'Category 1' },
  { day: 2, value: 1480, category: 'Category 1' },
  { day: 3, value: 1460, category: 'Category 1' },
  {
    day: 4,
    value: 1440,
    category: 'Category 1',
  },
  {
    day: 4,
    value: 300,
    category: 'Category 3',
  },
  {
    day: 5,
    value: 1420,
    category: 'Category 1',
  },
  {
    day: 3,
    value: 1150,
    category: 'Category 2',
  },
  {
    day: 6,
    value: 1350,
    category: 'Category 1',
  },
  {
    day: 6,
    value: 1250,
    category: 'Category 2',
  },
  {
    day: 7,
    value: 1400,
    category: 'Category 1',
  },
  {
    day: 8,
    value: 1420,
    category: 'Category 1',
  },
  { day: 8, value: 400, category: 'Category 3' },
  {
    day: 9,
    value: 1450,
    category: 'Category 1',
  },
  {
    day: 10,
    value: 1500,
    category: 'Category 1',
  },
  {
    day: 10,
    value: 1400,
    category: 'Category 2',
  },
  {
    day: 11,
    value: 1530,
    category: 'Category 1',
  },
  {
    day: 11,
    value: 1700,
    category: 'Category 2',
  },
  {
    day: 12,
    value: 1560,
    category: 'Category 1',
  },
  {
    day: 12,
    value: 1400,
    category: 'Category 2',
  },
  { day: 12, value: 500, category: 'Category 3' },
  {
    day: 13,
    value: 1590,
    category: 'Category 1',
  },
  {
    day: 14,
    value: 1700,
    category: 'Category 1',
  },
  {
    day: 15,
    value: 1730,
    category: 'Category 1',
  },
  {
    day: 16,
    value: 1760,
    category: 'Category 1',
  },
  {
    day: 17,
    value: 1790,
    category: 'Category 1',
  },
  { day: 17, value: 600, category: 'Category 3' },
  {
    day: 17,
    value: 1100,
    category: 'Category 2',
  },
  {
    day: 18,
    value: 1820,
    category: 'Category 1',
  },
  {
    day: 19,
    value: 1790,
    category: 'Category 1',
  },
  {
    day: 20,
    value: 1760,
    category: 'Category 1',
  },
  { day: 20, value: 450, category: 'Category 3' },
  {
    day: 21,
    value: 1730,
    category: 'Category 1',
  },
  {
    day: 22,
    value: 1600,
    category: 'Category 1',
  },
  {
    day: 22,
    value: 800,
    category: 'Category 2',
  },
  {
    day: 23,
    value: 1500,
    category: 'Category 1',
  },
  {
    day: 24,
    value: 1800,
    category: 'Category 1',
  },
  { day: 24, value: 300, category: 'Category 3' },
  {
    day: 25,
    value: 1840,
    category: 'Category 1',
  },
  {
    day: 26,
    value: 1860,
    category: 'Category 1',
  },
  {
    day: 27,
    value: 1700,
    category: 'Category 1',
  },
  { day: 27, value: 200, category: 'Category 3' },
  {
    day: 27,
    value: 1400,
    category: 'Category 2',
  },
  {
    day: 28,
    value: 1650,
    category: 'Category 1',
  },
  { day: 28, value: 250, category: 'Category 3' },
  {
    day: 29,
    value: 1600,
    category: 'Category 1',
  },
  {
    day: 30,
    value: 1500,
    category: 'Category 1',
  },
  {
    day: 30,
    value: 1450,
    category: 'Category 2',
  },
]

const StandingDetail = () => {
  const config = {
    data,
    xField: 'day',
    yField: 'value',
    smooth: true,
    legend: false,
    seriesField: 'category',
    xAxis: {
      label: {
        formatter: (v) => `${v}.`,
      },
      grid: {
        line: {
          style: {
            lineWidth: 0,
          },
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}`,
      },
      grid: {
        line: {
          style: {
            lineWidth: 0,
          },
        },
      },
    },
    color: ['#80D0A3', '#D9BA83', '#1A35DD'],
    lineStyle: {
      lineWidth: 3,
      shadowColor: 'black',
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 20,
    },
  }

  return (
    <div className='standing_detail_container'>
      {/* HEADER */}
      <StandingHeader />

      <h2 className='heading'>RED ZONE DRAGONS: MAIN </h2>

      <section className='detail_container'>
        <div className='image_box'>
          <Image preview={false} src={require('../assets/dragons_big.png')} alt={'Image'} />
        </div>
        <div className='detail_content_box'>
          <h3>RED ZONE DRAGONS</h3>
          <div className='detail'>
            <div className='detail_row'>
              <p className='text1'>Last Visit:</p>
              <p className='text2'>130 days, 19 hours, 42 minutes ago</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Division:</p>
              <p className='text2'>North</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Conference:</p>
              <p className='text2'>The Manning Conference</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Accounting Balance:</p>
              <p className='text2'>$0.00</p>
            </div>
            <div className='detail_row'>
              <p className='text1'>Record (W-L-T):</p>
              <p className='text2'>
                11-6-0 (Franchise Schedule | Career Record | All-Time Series Records )
              </p>
            </div>
            <div className='detail_row'>
              <p className='text1'>YTD Points:</p>
              <p className='text2'>5555.525</p>
            </div>
          </div>
        </div>
      </section>

      <section className='chart_container'>
        <Line {...config} />
      </section>
    </div>
  )
}

export default StandingDetail
