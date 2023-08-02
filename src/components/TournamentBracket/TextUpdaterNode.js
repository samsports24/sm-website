// import { useCallback } from 'react';
import { Handle, Position } from 'reactflow'

// import TeamLogo1 from '../../assets/Heat Wave Square 2.png'

// const handleStyle = { left: 10 };

function TextUpdaterNode({ data, isConnectable }) {
  //   const onChange = useCallback((evt) => {
  //     console.log(evt.target.value);
  //   }, []);

  return (
    <div className='text-updater-node'>
      <Handle type='target' id='x' position={Position.Top} isConnectable={isConnectable} />
      <Handle type='target' id='y' position={Position.Left} isConnectable={isConnectable} />
      <div className='custom-node' style={{ border: '1px solid #6E698066' }}>
        {/* Top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#30215D66',
            borderBottom: '1px solid #6E698066',
          }}
        >
          <div style={{ background: '#fff' }}>
            <img src={data?.team1?.icon} style={{ width: '60px', height: '60px' }} />
          </div>
          <div style={{ padding: '5px 20px 5px 10px' }}>
            <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{data?.team1?.name}</p>
            <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>Square (1)</p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#30215D66' }}>
          <div style={{ background: '#fff' }}>
            <img src={data?.team2?.icon} style={{ width: '60px', height: '60px' }} />
          </div>
          <div style={{ padding: '5px 20px 5px 10px' }}>
            <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{data?.team2?.name}</p>
            <p style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>Square (1)</p>
          </div>
        </div>
      </div>
      <Handle type='source' position={Position.Right} id='b' isConnectable={isConnectable} />
      <Handle type='source' position={Position.Bottom} id='c' isConnectable={isConnectable} />
    </div>
  )
}

export default TextUpdaterNode
