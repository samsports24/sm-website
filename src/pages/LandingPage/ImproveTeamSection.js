import { Typography, Row, Col } from 'antd'

const ImproveTeamSection = () => {
  const ImporveSection = () => {
    return (
      <div className='desc-card'>
        <Typography.Title level={1}>DRAFT</Typography.Title>
        <p>
          Share your product or service offerings here. Give your prospective clients an overview of
          why they should use it. Differentiate it from the others listed on this page.
        </p>
      </div>
    )
  }

  return (
    <div className='improve-team'>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <div className='left'>
            <Typography.Title level={1}>
              IMPROVE
              <br />
              YOUR TEAM
            </Typography.Title>
            <Typography.Title
              level={1}
            >{`"Make your TEAM the dominant force of your Fantasy league"`}</Typography.Title>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className='right'>
            <ImporveSection />
            <ImporveSection />
            <ImporveSection />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default ImproveTeamSection
