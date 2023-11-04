import { Breadcrumb, Button, Col, Row } from 'antd'
import { useNavigate } from 'react-router-dom'

import Arrow from '../assets/arrow-right.svg'
import DollorIcon from '../assets/dollor-icon.svg'
import AddCoupon from '../components/modal/AddCoupon'

const TotalPayment = () => {
  const navigate = useNavigate()

  const Card = ({ data }) => {
    return (
      <div className='payment_card'>
        <div className='top-div'>
          <h3>{data?.title}</h3>
        </div>
        <div className='card-body'>
          <div className='card_table'>
            {data?.data?.map((v, i) => {
              return (
                <div key={i} className='table_row'>
                  <p>{v?.key}</p>
                  <div className='lead'>
                    <img src={DollorIcon} />
                    <p>${v?.value?.toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='total_payment_container'>
      {/* BREADCRUMB */}
      <section className='_breadcrumb'>
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
              title: <p>Create Sign Up Header</p>,
            },
          ]}
        />
      </section>

      <h1 className='heading'>Choose Your Game</h1>

      <Row gutter={[30, 30]}>
        <Col xs={24} md={12}>
          <Card
            data={{
              title: 'Your Total Payment Today',
              data: [
                {
                  key: 'Fee',
                  value: 15.25,
                },
                {
                  key: 'Draft Order Bid',
                  value: 15.0,
                },
                {
                  key: 'Fee',
                  value: 30.25,
                },
              ],
            }}
          />
        </Col>
        <Col xs={24} md={12}>
          <Card
            data={{
              title: 'Transaction Breakdown',
              data: [
                {
                  key: 'SUSD Total',
                  value: 15.25,
                },
                {
                  key: 'SCO Total @$0.0004',
                  value: 15.0,
                },
                {
                  key: 'Gas Fee',
                  value: 30.25,
                },
              ],
            }}
          />
        </Col>
      </Row>

      <section className='total_container'>
        <p>Total</p>
        <p>7,18500123</p>
      </section>

      <section className='button_section'>
        <Button type='primary' onClick={() => navigate('/my-league')}>
          MAKE PAYMENT
        </Button>
        <AddCoupon />
      </section>
    </div>
  )
}

export default TotalPayment
