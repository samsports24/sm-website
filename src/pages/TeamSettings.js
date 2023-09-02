import React from // useState
'react'

import { Button, Breadcrumb, Row, Col, Form, Input } from 'antd'

import Arrow from '../assets/arrow-right.svg'

// Component
import Header from '../components/Header'
import ButtonsAndPagination from '../components/Pagination/ButtonsAndPagination'
// import { updateTeam } from '../redux/actions/teamActions'
// import { useSelector } from 'react-redux'

const TeamSetting = () => {
  // const user = useSelector((state) => state.user.userDetails)
  // console.log(user)
  // const { team } = user
  // const [loading, setLoading] = useState(false)
  // const [file, setFile] = useState(null)
  // // const [imageSrc, setImageSrc] = useState(null)
  // const [form] = Form.useForm()

  // // console.log(imageSrc)

  // const handleFile = (file) => {
  //   setFile(file)
  //   // const src = URL.createObjectURL(file)
  //   // setImageSrc(src)
  // }
  // console.log(handleFile)

  // const _updateTeam = async (payload) => {
  //   setLoading(true)
  //   const res = await updateTeam(payload)
  //   if (res) {
  //     console.log("===>")
  //   }
  //   setLoading(false)
  // }

  // const onFinish = async (values) => {
  //   const name = values?.name ? values?.name : team?.name || ''
  //   const picture = values?.logo ? values?.logo : team?.logo || ''
  //   const gmName = values?.gmName ? values?.gmName : team?.gmName || ''
  //   const abbreviation = values?.abbreviation ? values?.abbreviation : team?.abbreviation || ''
  //   const gmTwitter = values?.gmTwitter ? values?.gmTwitter : team?.gmTwitter || ''
  //   const city = values?.city ? values?.city : team?.city || ''
  //   const hometown = values?.hometown ? values?.hometown : team?.hometown || ''
  //   const teamTwitter = values?.teamTwitter ? values?.teamTwitter : team?.teamTwitter || ''

  //   if (file) {
  //     let formdata = new FormData()
  //     formdata.append('name', name)
  //     formdata.append('pictures', file)

  //     await _updateTeam(formdata)
  //   } else {
  //     const obj = {
  //       name,
  //       picture,
  //       gmName,
  //       abbreviation,
  //       gmTwitter,
  //       city,
  //       hometown,
  //       teamTwitter,
  //     }
  //     await _updateTeam(obj)
  //   }
  // }

  return (
    <div className='practice_squad_container team_trade_main'>
      {/* BACK BUTTON */}
      <Button className='back_button' type='primary'>
        Back
      </Button>

      {/* BREADCRUMB */}
      <section className='breadcrumb'>
        <Breadcrumb
          className='customize_breadcrumb'
          separator={<img src={Arrow} />}
          items={[
            {
              title: <p>Home</p>,
            },
            {
              title: <p>Team</p>,
            },
            {
              title: <p>Roster</p>,
            },
            {
              title: <p>Player Interface</p>,
            },
          ]}
        />
      </section>

      {/* HEADER */}
      <Header />

      <ButtonsAndPagination />

      <hr className='divider' />

      <section className='squad_card_container transparent'>
        <Form
          // form={form}
          layout='vertical'
          // onFinish={onFinish}
          // fields={[
          //   {
          //     name: 'name',
          //     value: team?.name,
          //   },
          //   {
          //     name: 'logo',
          //     value: team?.logo,
          //   },
          //   {
          //     name: 'gmName',
          //     value: team?.gmName,
          //   },
          //   {
          //     name: 'abbreviation',
          //     value: team?.abbreviation,
          //   },
          //   {
          //     name: 'gmTwitter',
          //     value: team?.gmTwitter,
          //   },
          //   {
          //     name: 'city',
          //     value: team?.city,
          //   },
          //   {
          //     name: 'hometown',
          //     value: team?.hometown,
          //   },
          //   {
          //     name: 'teamTwitter',
          //     value: team?.teamTwitter,
          //   },
          // ]}
        >
          <Row gutter={[30, 30]}>
            <Col xs={24}>
              <div className='header'>
                <h2>TEAM SETTINGS</h2>
              </div>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'name'} label='Team Name'>
                <Input placeholder='Team Name Here...' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'gmName'} label='GM Name'>
                <Input placeholder='GM Name Here...' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'abbreviation'} label='Team Abbreviation (3 Letters Max)'>
                <Input placeholder='ABC' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'gmTwitter'} label='GM Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'city'} label='Team City'>
                <Input placeholder='City name here' />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12} xl={4}>
              <Form.Item name={'hometown'} label='GM Hometown'>
                <Input placeholder='Hometown name here' />
              </Form.Item>
            </Col>
            <Col lg={24} xl={8}>
              <Form.Item name={'picture'} label='Team Logo'>
                <Button type='primary'>Add Image</Button>
              </Form.Item>
            </Col>
            <Col lg={0} xl={8} />

            <Col xs={24} lg={12} xl={8}>
              <Form.Item name={'teamTwitter'} label='Team Twitter Handle'>
                <Input placeholder='www.twitter.com/teamname' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Button
                  //  loading={loading}
                  type='primary'
                  htmlType='submit'
                >
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </section>
    </div>
  )
}

export default TeamSetting
