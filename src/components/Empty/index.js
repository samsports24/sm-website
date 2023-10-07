import { Typography } from 'antd'

const Empty = ({ text, height }) => {
  return (
    <div
      style={{
        height: height ? height : '150px',
        border: '1px solid rgba(255,255,255,0.4)',
        padding: '30px',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography.Title level={5} style={{ color: 'white', textTransform: 'uppercase' }}>
        {text}
      </Typography.Title>
    </div>
  )
}

export default Empty
