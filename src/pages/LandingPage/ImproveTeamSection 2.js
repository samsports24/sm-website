import { Typography, Row, Col } from 'antd'

const ImproveTeamSection = () => {
  const data = [
    {
      title: 'DRAFT',
      description:
        // 'Share your product or service offerings here. Give your prospective clients an overview of why they should use it. Differentiate it from the others listed on this page.',
        'Drafting your team lies in its long-term focus, depth, strategic complexity, and continuous engagement. Managers must think beyond the current season, balancing immediate needs with future potential, making the draft process a critical and intricate game aspect.',
    },
    {
      title: 'AUCTION',
      description:
        'Features an exciting auction system that lets owners bid on digital players. This mirrors the intense negotiations and competition in real sports leagues, adding a thrilling dimension to team building.',
    },
    {
      title: 'TRADE',
      description:
        'Owners can engage in player trades, make roster adjustments, and even cut players when necessary. These decisions directly impact team performance, offering the game a dynamic and strategic element.',
    },
  ]

  return (
    <div className='improve-team paddingInline'>
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
            {data.map((v) => {
              return (
                <div className='desc-card' key={v?.title}>
                  <Typography.Title level={1}>{v?.title}</Typography.Title>
                  <p>{v?.description}</p>
                </div>
              )
            })}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default ImproveTeamSection
