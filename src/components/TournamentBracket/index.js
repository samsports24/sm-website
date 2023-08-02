import { useCallback, useState, useEffect } from 'react'
import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import 'reactflow/dist/style.css'

import TextUpdaterNode from './TextUpdaterNode'

import TeamLogo1 from '../../assets/Heat Wave Square 2.png'
import DefianceLogo from '../../assets/Defiance 60x60.png'

const rfStyle = {
  backgroundColor: 'transparent',
}

const initialNodes = [
  {
    id: '0',
    type: 'textUpdater',
    position: { x: 0, y: 0 },
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
  },
  {
    id: '1',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 0, y: 200 },
    // sourcePosition: 'right',
  },
  {
    id: '2',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    // style: { border: '1px solid #777', padding: 10 },
    position: { x: 0, y: 400 },
  },
  {
    id: '3',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    // style: { border: '1px solid #777', padding: 10 },
    position: { x: 0, y: 600 },
  },
  {
    id: '4',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    // style: { border: '1px solid #777', padding: 10 },
    position: { x: 400, y: 100 },
  },
  {
    id: '5',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    // style: { border: '1px solid #777', padding: 10 },
    position: { x: 400, y: 500 },
  },
  {
    id: '6',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 800, y: 300 },
    targetPosition: 'left',
  },
  {
    id: '7',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 1200, y: 300 },
    targetPosition: 'left',
  },
  {
    id: '8',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 1600, y: 500 },
    targetPosition: 'left',
  },
  {
    id: '9',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 1600, y: 100 },
    targetPosition: 'left',
  },
  {
    id: '10',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 2000, y: 0 },
    targetPosition: 'left',
  },
  {
    id: '11',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 2000, y: 200 },
    targetPosition: 'left',
  },
  {
    id: '12',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 2000, y: 400 },
    targetPosition: 'left',
  },
  {
    id: '13',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 2000, y: 600 },
    targetPosition: 'left',
  },
  {
    id: '14',
    type: 'textUpdater',
    data: {
      team1: { name: 'Heat Wave', icon: TeamLogo1 },
      team2: { name: 'Defiance', icon: DefianceLogo },
    },
    position: { x: 1000, y: 500 },
    targetPosition: 'left',
    hideHandle: 'top',
  },
]
// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { textUpdater: TextUpdaterNode }

function Flow() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState([])

  useEffect(() => {
    setEdges([
      {
        id: 'e1-2',
        source: '0',
        target: '4',
        targetHandle: 'y',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2a-3',
        source: '1',
        target: '4',
        targetHandle: 'y',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '2',
        target: '5',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '3',
        target: '5',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '4',
        target: '6',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
        sourceBottom: true,
      },
      {
        id: 'e2b-4',
        source: '5',
        target: '6',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
        sourceBottom: true,
      },
      {
        id: 'e2b-4',
        source: '7',
        target: '6',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '7',
        target: '9',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '7',
        target: '8',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '9',
        target: '10',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '9',
        target: '11',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '8',
        target: '12',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '8',
        target: '13',
        targetHandle: 'y',
        sourceHandle: 'b',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '6',
        target: '14',
        targetHandle: 'x',
        sourceHandle: 'c',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
      {
        id: 'e2b-4',
        source: '7',
        target: '14',
        targetHandle: 'x',
        sourceHandle: 'c',
        animated: false,
        type: 'step',
        style: { stroke: '#fff' },
      },
    ])
  }, [])

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  )
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      style={rfStyle}
    />
  )
}

export default Flow
