import { Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

// import Arrow from '../assets/arrow-right.svg'
import { popularLeaguesData } from './mockData'
import PopularLeagueCard from '../components/cards/popularLeagueCard'

const MyLeague = () => {
  const navigate = useNavigate()

  return (
    <div className='total_payment_container'>
      {/* BREADCRUMB */}
      {/* <section className='_breadcrumb'>
        <Button className='_back_button' type='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p className='color_text'>Home</p>,
            },
            {
              title: <p>My League</p>,
            },
          ]}
        />
      </section> */}

      <h1 className='heading'>My League</h1>

      <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
        {popularLeaguesData?.map((value, index) => (
          <Col xs={24} sm={12} xl={8} xxl={6} key={index}>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/league')}>
              <PopularLeagueCard data={value} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default MyLeague
