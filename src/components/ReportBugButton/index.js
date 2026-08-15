import React, { useState } from 'react'
import { Modal, Form, Input, Button, notification } from 'antd'
import { BugOutlined } from '@ant-design/icons'
import { publicAPI } from '../../config/constants'

// Floating "Report a Bug" button + modal. Collects name, email, team and the
// bug, then posts to the NFL backend which emails julien.sevat@icloud.com.
const ReportBugButton = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const openModal = () => {
    form.setFieldsValue({
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('email') || '',
      teamName: '',
      bug: '',
    })
    setOpen(true)
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await publicAPI.post('/league/bug-report', values)
      notification.success({
        message: res?.data?.data?.message || 'Thanks! Your bug report was sent.',
        duration: 3,
      })
      setOpen(false)
      form.resetFields()
    } catch (err) {
      notification.error({
        message: err?.response?.data?.message || 'Could not send your report. Please try again.',
        duration: 4,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        title='Report a bug'
        className='report-bug-fab'
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 24,
          border: 'none',
          background: '#D4A843',
          color: '#1a1a2e',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}
      >
        <BugOutlined /> Report a Bug
      </button>

      <Modal
        title='Report a Bug'
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout='vertical' onFinish={onSubmit} autoComplete='off'>
          <Form.Item name='name' label='Your name' rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input placeholder='Your name' />
          </Form.Item>
          <Form.Item
            name='email'
            label='Your email'
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input placeholder='you@example.com' />
          </Form.Item>
          <Form.Item name='teamName' label='Team name' rules={[{ required: true, message: 'Please enter your team name' }]}>
            <Input placeholder='Your team' />
          </Form.Item>
          <Form.Item name='bug' label='Describe the bug' rules={[{ required: true, message: 'Please describe the bug' }]}>
            <Input.TextArea rows={4} placeholder='What happened? What did you expect?' />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type='primary' htmlType='submit' loading={loading} block>
              Send report
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ReportBugButton
