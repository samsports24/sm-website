import { useEffect, useState } from 'react'
import { Row, Col, Form, Input, DatePicker, Button, notification, Table } from 'antd'
import User1 from '../assets/user-pic-1.png'
// import Color from '../assets/color-icon.svg'
import { HiOutlineCamera, HiPencil } from 'react-icons/hi'
import { useSelector } from 'react-redux'
import { getStaff, updateUserProfile } from '../redux'
import dayjs from 'dayjs'
import AddUser from '../components/modal/AddUser'

const EditProfile = () => {
  const user = useSelector((state) => state.user.userDetails)
  const [loading, setLoading] = useState(false)
  const [staffLoading, setStaffLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [allStaff, setAllStaff] = useState([])
  const [imageSrc, setImageSrc] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setStaffLoading(true)
    const res = await getStaff()
    setAllStaff(res)
    setStaffLoading(false)
  }

  const handleFile = (file) => {
    setFile(file)
    const src = URL.createObjectURL(file)
    setImageSrc(src)
  }

  const updateUser = async (payload) => {
    setLoading(true)
    const res = await updateUserProfile(payload)
    if (res) {
      notification.success({
        message: res,
        duration: 3,
      })
    }
    setLoading(false)
  }

  const onFinish = async (values) => {
    const userName = values?.userName ? values?.userName : user?.userName || ''
    const currentPassword = values?.currentPassword
      ? values?.currentPassword
      : user?.currentPassword || ''
    const newPassword = values?.newPassword ? values?.newPassword : user?.newPassword || ''
    const firstName = values?.firstName ? values?.firstName : user?.firstName || ''
    const lastName = values?.lastName ? values?.lastName : user?.lastName || ''
    const phone = values?.phoneNumber ? values?.phoneNumber : user?.phone || ''
    const dateOfBirth = values?.dateOfBirth
      ? values?.dateOfBirth?.toISOString()
      : user?.dateOfBirth || ''
    const joinDate = values?.joinDate ? values?.joinDate?.toISOString() : user?.joinDate || ''
    const state = values?.state ? values?.state : user?.state || ''
    const country = values?.country ? values?.country : user?.country || ''
    const timezone = values?.timezone ? values?.timezone : user?.timezone || ''
    

    if (values?.newPassword) {
      if (values?.newPassword === values?.confirmPassword) {
        if (file) {
          let formdata = new FormData()
          formdata.append('pictures', file)
          formdata.append('userName', userName)
          formdata.append('currentPassword', currentPassword)
          formdata.append('newPassword', newPassword)
          formdata.append('firstName', firstName)
          formdata.append('lastName', lastName)
          formdata.append('phone', phone)
          formdata.append('dateOfBirth', dateOfBirth)
          formdata.append('joinDate', joinDate)
          formdata.append('state', state)
          formdata.append('country', country)
          formdata.append('timezone', timezone)
          

          await updateUser(formdata)
        } else {
          const obj = {
            userName,
            currentPassword,
            newPassword,
            firstName,
            lastName,
            phone,
            dateOfBirth,
            joinDate,
            state,
            country,
            timezone,
          }

          await updateUser(obj)
        }
      } else {
        notification.error({
          message: `Password not match`,
          duration: 3,
        })
      }
    } else {
      if (file) {
        let formdata = new FormData()
        formdata.append('pictures', file)
        formdata.append('userName', userName)
        formdata.append('firstName', firstName)
        formdata.append('lastName', lastName)
        formdata.append('phone', phone)
        formdata.append('dateOfBirth', dateOfBirth)
        formdata.append('joinDate', joinDate)
        formdata.append('state', state)
        formdata.append('country', country)
        formdata.append('timezone', timezone)

        await updateUser(formdata)
      } else {
        const obj = {
          userName,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          joinDate,
          state,
          country,
          timezone,
        }
        await updateUser(obj)
      }
    }
  }

  return (
    <div className='profile-container'>
      <div className='profile'>
        <div className='title'>
          <h2>Profile Information</h2>
        </div>
        <div className='profile-form'>
          <Form
            form={form}
            layout='vertical'
            onFinish={onFinish}
            fields={[
              {
                name: 'userName',
                value: user?.userName,
              },
              {
                name: 'currentPassword',
                value: '',
              },
              {
                name: 'newPassword',
                value: '',
              },
              {
                name: 'confirmPassword',
                value: '',
              },
              {
                name: 'firstName',
                value: user?.firstName,
              },
              {
                name: 'lastName',
                value: user?.lastName,
              },
              {
                name: 'phoneNumber',
                value: user?.phoneNumber,
              },
              {
                name: 'email',
                value: user?.email,
              },
              {
                name: 'dateOfBirth',
                value: dayjs(user?.dateOfBirth),
              },
              {
                name: 'joinDate',
                value: dayjs(user?.joinDate),
              },
              {
                name: 'state',
                value: user?.state,
              },
              {
                name: 'country',
                value: user?.country,
              },
            ]}
          >
            <Row gutter={[24, 0]} justify='space-between'>
              <Col xs={24} md={24} lg={24}>
                <Row gutter={[24, 0]} justify='space-between'>
                  <Col xs={24} md={24} lg={5} xl={4}>
                    <div className='profile-pic'>
                      <p>Profile Photo</p>
                      <div style={{ position: 'relative', width: 'max-content' }}>
                        <img src={imageSrc || user?.image || User1} />
                        <div className='profile_camera_icon'>
                          <label htmlFor='fileInput' style={{ marginTop: '5px' }}>
                            <HiOutlineCamera color='#fff' size={18} />
                          </label>
                          <input
                            type='file'
                            hidden
                            id='fileInput'
                            onChange={(e) => handleFile(e?.target?.files[0])}
                            accept='image/jpg,image/png,image/jpeg'
                          />
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={24} lg={19} xl={20}>
                    <Row gutter={[24, 0]} justify='space-between'>
                      <Col xs={24} md={12} lg={12}>
                        <Form.Item
                          name='userName'
                          label='User Name'
                          rules={[
                            {
                              required: false,
                              message: 'The entered user name is not valid!',
                            },
                          ]}
                          requiredMark='optional'
                        >
                          <Input autoComplete='off' type='text' placeholder='User Name' />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={12}>
                        <Form.Item
                          name='currentPassword'
                          label='Current Password'
                          rules={[
                            {
                              required: false,
                              message: 'The entered password is not valid!',
                            },
                          ]}
                          requiredMark='optional'
                        >
                          <Input
                            autoComplete='off'
                            type='password'
                            placeholder='Current Password'
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={12}>
                        <Form.Item
                          name='newPassword'
                          label='New Password'
                          rules={[
                            {
                              required: false,
                              message: 'The entered password is not valid!',
                            },
                          ]}
                          requiredMark='optional'
                        >
                          <Input autoComplete='off' type='password' placeholder='New Password' />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} lg={12}>
                        <Form.Item
                          name='confirmPassword'
                          label='Confirm Password'
                          rules={[
                            {
                              required: form.getFieldValue('newPassword') ? true : false,
                              message: 'The entered password is not valid!',
                            },
                          ]}
                          requiredMark='optional'
                        >
                          <Input
                            autoComplete='off'
                            type='password'
                            placeholder='Confirm Password'
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <div className='personal-information'>
                  <h3>Personal Information</h3>
                </div>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='firstName'
                  label='First Name'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='first name' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='lastName'
                  label='Last Name'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='last name' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='phoneNumber'
                  label='Phone Number'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='phone number' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='email'
                  label='Email Address'
                  rules={[
                    {
                      required: false,
                      message: 'The entered email is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input disabled autoComplete='off' type='email' placeholder='xyz@gmail.com' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='dateOfBirth'
                  label='Date of Birth'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <DatePicker format={'YYYY/MM/DD'} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='joinDate'
                  label='Join Date'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <DatePicker format={'YYYY/MM/DD'} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='state'
                  label='state'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='state' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='country'
                  label='Country'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='Country' />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} lg={12}>
                <Form.Item
                  name='timezone'
                  label='Timezone'
                  rules={[
                    {
                      required: false,
                      message: 'The entered password is not valid!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='text' placeholder='Timezone' />
                </Form.Item>
              </Col>

              <Col xs={24} md={24} lg={24}>
                <Form.Item>
                  <div className='form-btn'>
                    <Button className='reset-btn'>Reset</Button>
                    <Button loading={loading} type='primary' htmlType='submit'>
                      Save Changes
                    </Button>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {user?.userType === 'owner' && (
        <div className='profile staff'>
          <div className='title'>
            <h2>My Staff</h2>
            <AddUser getData={getData} />
          </div>
          <div className=''>
            <Table
              loading={staffLoading}
              columns={[
                {
                  dataIndex: 'no',
                  title: 'sr#',
                },
                {
                  dataIndex: 'name',
                  title: 'Name',
                },
                {
                  dataIndex: 'email',
                  title: 'Email',
                },
                {
                  dataIndex: 'type',
                  title: 'Employement',
                },
                {
                  dataIndex: 'action',
                  title: 'Actions',
                },
              ]}
              dataSource={allStaff?.map((staff, index) => ({
                key: staff?._id,
                no: index + 1,
                name: staff?.name,
                email: staff?.email,
                type: staff?.userType?.toUpperCase(),
                action: <AddUser edit={true} data={staff} getData={getData} />,
              }))}
              size='small'
              pagination={false}
            />
          </div>
        </div>
      )}

      {/* <div className='setting-container'>
        <h2>Settings</h2>
        <div className='setting-flex'>
          <div className='setting'>
            <div className='options'>
              <p>Side Bar Theme</p>
              <div className='color-div'>
                <div className='color-pic'>
                  <img src={Color} />
                </div>
                <p>Change Color</p>
              </div>
            </div>
            <div className='options'>
              <p>Background Theme</p>
              <div className='color-div'>
                <div className='color-pic'>
                  <img src={Color} />
                </div>
                <p>Change Color</p>
              </div>
            </div>
          </div>
          <div className='btn-container'>
            <Button className='reset-btn'>Reset</Button>
            <Button type='primary'>Save Changes</Button>
          </div>
        </div>
      </div> */}
    </div>
  )
}

export default EditProfile
