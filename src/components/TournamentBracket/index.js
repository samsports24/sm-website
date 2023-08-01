import React from 'react'
// import { Image } from 'antd'
import { FlowAnalysisGraph } from '@ant-design/graphs'

// Image
import TeamLogo1 from '../../assets/Heat Wave Square 2.png'
import DefianceLogo from '../../assets/Defiance 60x60.png'
// import StormLogo from '../../assets/Storm 60x60.png'
// import RageLogo from '../../assets/Rage 60x60.png'
// import TroutLogo from '../../assets/Trout 60x60.png'

const data = {
  nodes: [
    {
      id: '5',
      value: {
        title: '',
        items: [
          {
            id: '03',
            text: 'Team 3',
            value: '1000万',
            icon: TeamLogo1,
            trend: '45.9%',
          },
          {
            id: '04',
            text: 'Team 4',
            value: '1000万',
            icon: DefianceLogo,
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '6',
      value: {
        title: '',
        items: [
          {
            id: '01',
            text: 'Team 1',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '7',
      value: {
        title: '',
        items: [
          {
            text: 'Team 1',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
          {
            text: 'Team 3',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '8',
      value: {
        title: '',
        items: [
          {
            text: 'Team 5',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
          {
            text: 'Team 6',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '9',
      value: {
        title: '',
        items: [
          {
            text: 'Team 7',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
          {
            text: 'Team 8',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '10',
      value: {
        title: '',
        items: [
          {
            text: 'Team 6',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
          {
            text: 'Team 8',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '0',
      value: {
        title: 'spmd1',
        items: [
          {
            text: '曝光UV',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
          {
            text: '点击UV',
            value: '10万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '1.9%',
          },
        ],
      },
    },
    {
      id: '1',
      value: {
        title: '开通营销页1',
        items: [
          {
            text: '访问UV',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '2',
      value: {
        title: '开通营销页2',
        items: [
          {
            text: '访问UV',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '3',
      value: {
        title: '去向页面1',
        items: [
          {
            text: '访问UV',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
    {
      id: '4',
      value: {
        title: '去向页面2',
        items: [
          {
            text: '访问UV',
            value: '1000万',
            icon: 'https://gw.alipayobjects.com/zos/antfincdn/iFh9X011qd/7797962c-04b6-4d67-9143-e9d05f9778bf.png',
            trend: '45.9%',
          },
        ],
      },
    },
  ],
  edges: [
    {
      source: '6',
      target: '7',
    },
    {
      source: '5',
      target: '7',
    },
    {
      source: '7',
      target: '0',
    },
    {
      source: '8',
      target: '10',
    },
    {
      source: '9',
      target: '10',
    },
    {
      source: '10',
      target: '0',
    },
    {
      source: '0',
      target: '1',
    },
    {
      source: '0',
      target: '2',
    },
    {
      source: '1',
      target: '3',
    },
    {
      source: '2',
      target: '4',
    },
  ],
}

const TournamentBracket = () => {
  const config = {
    data,
    style: {
      background: 'transparent',
    },
    // Node or Box Configuration and style
    nodeCfg: {
      size: [180, 80],
      items: {
        padding: 0,
        containerStyle: {
          // fill: '#fff',
          fill: 'red',
          // background: '#30215D66',
          height: '100%',
          width: '100%',
        },
      },
      customContent: (item, group, cfg) => {
        const { startX, startY } = cfg
        const { text, icon, id } = item

        icon &&
          group?.addShape('image', {
            attrs: {
              x: startX,
              y: startY,
              width: 50,
              height: 50,
              img: icon,
            },
            // name: `image-${Math.random()}`,
          })

        group.addShape('rect', {
          attrs: {
            x: startX,
            y: startY + 20,
            fill: '#FFFFFF',
            width: 50,
            height: 50,
          },
        })

        text &&
          group?.addShape('text', {
            attrs: {
              textBaseline: 'top',
              x: startX + 100,
              y: startY + 20,
              text,
              // fill: '#aaa',
              fill: '#FFFFFF',
              fontSize: '16px',
            },
            // group 内唯一字段
            name: `text-${Math.random()}`,
          })
        return id ? 50 : 0
      },
      nodeStateStyles: {
        // hover: {
        //   stroke: '#1890ff',
        //   lineWidth: 2,
        // },
      },
      title: {
        containerStyle: {
          fill: 'transparent',
        },
        style: {
          display: 'none',
          fill: '#000',
          fontSize: 12,
        },
      },
      style: {
        fill: '#30215D66',
        stroke: '#6E698066',
        radius: [2, 2, 2, 2],
        display: 'flex',
      },
    },
    // Edge / line Configuration and style
    edgeCfg: {
      type: 'polyline',
      style: { stroke: '#6E698066', lineWidth: 2 },
      label: {
        style: {
          fill: '#aaa',
          fontSize: 12,
          fillOpacity: 0.5,
        },
      },
      edgeStateStyles: {
        hover: {
          // stroke: '#FF5733',
          stroke: '#6E698066',
          lineWidth: 2,
        },
      },
    },
    markerCfg: (cfg) => {
      const { edges } = data
      return {
        position: 'right',
        show: edges.find((item) => item.source === cfg.id),
      }
    },
    layout: {
      ranksepFunc: () => 30,
      nodesepFunc: () => 30,
    },
    // behaviors: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    // behaviors: ['drag-canvas', 'zoom-canvas'],
    behaviors: ['scroll-canvas'],
  }

  return <FlowAnalysisGraph {...config} />
}

export default TournamentBracket
