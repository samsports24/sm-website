import { useState } from 'react'
import { Modal, Button, Form, Input } from 'antd'
import { useDispatch } from 'react-redux'
import { createProject, updateProject } from '../../redux'

const AddProject = ({ newProject, data }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const onFinish = async (values) => {
    setLoading(true)
    if (newProject) {
      await dispatch(createProject(values))
      form.resetFields()
    } else {
      // console.log('in update')
      await dispatch(
        updateProject({
          ...values,
          id: data._id,
        }),
      )
    }
    setLoading(false)
    setIsModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <>
      <Button type='primary' className='addProjectBtn' onClick={showModal}>
        Add Project
      </Button>

      <Modal
        title={'New Project'}
        visible={isModalVisible}
        footer={false}
        onCancel={handleCancel}
        width={'600px'}
      >
        <Form
          layout='vertical'
          form={form}
          fields={
            data
              ? [
                  {
                    name: 'title',
                    value: data.title,
                  },
                  {
                    name: 'description',
                    value: data.description,
                  },
                ]
              : [
                  {
                    name: 'description',
                    value: '',
                  },
                ]
          }
          onFinish={onFinish}
        >
          <Form.Item
            label='Project Name'
            name={'title'}
            rules={[
              {
                required: true,
                message: 'Project Name is Required',
              },
            ]}
            requiredMark={'optional'}
          >
            <Input />
          </Form.Item>
          <Form.Item label='Project Description' name={'description'}>
            <Input.TextArea rows={4} style={{ resize: 'none' }} />
          </Form.Item>
          <Form.Item>
            <Button htmlType='submit' loading={loading} type='primary'>
              Add Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AddProject
