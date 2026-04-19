import { useState } from 'react'
import { Modal, Button, Input, Form, Select } from 'antd'
import { createStaff, updateStaff } from '../../redux'
import { HiPencil } from 'react-icons/hi'

const AddUser = ({ edit, data, getData }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => setIsModalVisible(true)
  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const onFinish = async (values) => {
    setLoading(true)
    const { userName, name, email, password, userType } = values
    const obj = {
      userName,
      email,
      name,
      userType,
      password,
    }

    if (edit) {
      delete obj.password
      const res = await updateStaff({ ...obj, id: data?._id })
      if (res) {
        handleCancel()
        getData()
      }
    } else {
      const res = await createStaff(obj)
      if (res) {
        handleCancel()
        getData()
      }
    }

    setLoading(false)
  }

  return (
    <>
      {edit ? (
        <HiPencil onClick={showModal} />
      ) : (
        <Button type='primary' onClick={showModal}>
          Add New
        </Button>
      )}

      <Modal
        centered
        open={isModalVisible}
        footer={false}
        onCancel={handleCancel}
        closeIcon={false}
        closable={false}
        width={'1200px'}
        className='coupon_modal'
      >
        <div className='close_modal_button' onClick={handleCancel}>
          x
        </div>
        <div className='modal_body'>
          <h2 className='modal_header_heading main_heading'>
            {edit ? 'Update Staff Profile' : 'Add New Staff'}
          </h2>
          <div>
            <Form
              form={form}
              layout='vertical'
              onFinish={onFinish}
              fields={[
                {
                  name: 'userName',
                  value: data?.userName,
                },
                {
                  name: 'userType',
                  value: data?.userType,
                },
                {
                  name: 'email',
                  value: data?.email,
                },
                {
                  name: 'name',
                  value: data?.name,
                },
              ]}
            >
              <Form.Item
                name='userName'
                label='Username'
                rules={[
                  {
                    required: true,
                    message: 'The entered password is reqired!',
                  },
                ]}
                requiredMark='optional'
              >
                <Input autoComplete='off' type='text' />
              </Form.Item>
              <Form.Item
                name='name'
                label='Name'
                rules={[
                  {
                    required: true,
                    message: 'The entered password is reqired!',
                  },
                ]}
                requiredMark='optional'
              >
                <Input autoComplete='off' type='text' />
              </Form.Item>
              <Form.Item
                name='email'
                label='Email'
                rules={[
                  {
                    type: 'email',
                    message: 'The input is not valid E-mail!',
                  },
                  {
                    required: true,
                    message: 'Please input your E-mail!',
                  },
                ]}
                requiredMark='optional'
              >
                <Input autoComplete='off' />
              </Form.Item>

              {!edit && (
                <Form.Item
                  name='password'
                  label='Password'
                  rules={[
                    {
                      required: true,
                      message: 'password is reqired!',
                    },
                  ]}
                  requiredMark='optional'
                >
                  <Input autoComplete='off' type='password' />
                </Form.Item>
              )}
              <Form.Item
                name='userType'
                label='Employement Type'
                rules={[
                  {
                    required: true,
                    message: 'Type is reqired!',
                  },
                ]}
                requiredMark='optional'
              >
                <Select style={{ width: '100%' }}>
                  <Select.Option key={'gm'} value={'gm'}>
                    GM
                  </Select.Option>
                  <Select.Option key={'agm'} value={'agm'}>
                    AGM
                  </Select.Option>
                  <Select.Option key={'staff'} value={'staff'}>
                    Staff
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <div className='form-btn'>
                  {/* <Button onClick={handleCancel} className='reset-btn'>
                    Cancel
                  </Button> */}
                  <Button loading={loading} type='primary' htmlType='submit'>
                    {edit ? 'Update' : 'Submit'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
          {/* <div className='modal_footer'>
            <Button type='primary' className='button_1' onClick={handleSubmit}>
              Submit
            </Button>
            <Button onClick={handleCancel} type='primary' className='button_2'>
              Cancel
            </Button>
          </div> */}
        </div>
      </Modal>
    </>
  )
}

export default AddUser
