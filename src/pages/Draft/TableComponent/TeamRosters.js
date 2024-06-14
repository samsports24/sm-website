import React, { useEffect, useState } from 'react'
import { Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { setSelectedPlayer } from '../../../redux/actions/draftAction'
import { getDraftTeamRoster, getRosterForDraftPick } from '../../../redux/actions/rosterAction'
import { sortedArray } from '../../../config/helperFunctions'

const TeamRosters = ({ tableScroll }) => {
  const { activeTab,draftRounds } = useSelector((state) => state?.draft)
  const SETTING = useSelector((state) => state?.user?.setting)
  const { roasterdraftdata,roasterroundandpick } = useSelector((state) => state?.roster)


  console.log('roasterdraftdata',roasterdraftdata);
// console.log('roasterdraftdata',roasterdraftdata);
  const [loading, setLoading] = useState('')
 
 console.log('inside here roasterroundandpick',roasterroundandpick);

  const dispatch = useDispatch()

  useEffect(() => {
    if (activeTab == 3) 
    getData()
    get_Pick_and_round_Data()
  }, [activeTab])



  // const positionOrder = {
  //   QB: 1,
  //   BQB: 2,
  //   RB: 3,
  //   FB: 4,
  //   WR: 5,
  //   TE: 6,
  //   G: 7,
  //   C: 8,
  //   OT: 9,
  //   OL: 10,


  //   DT: 11,
  //   NT: 12,
  //   DE: 13,
  //   DL: 14,
  //   ILB: 15,
  //   OLB: 16,
  //   LB: 17,
  //   CB: 18,
  //   S: 19,
  //   SS: 20,
  //   DB: 21,
  //   LS: 22,


    
  //   P: 23,
  //   K: 24,
  // }


  const positionOrder = {
    QB: 1,
    BQB: 2,
    RB: 3,
    FB: 4,
    WR: 5,
    TE: 6,
    G: 7,
    C: 8,
    OT: 9,
    OL: 10,
    K: 11,
    P: 12,
   

    DT: 13,
    NT: 14,
    DE: 15,
    DL: 16,
    ILB: 17,
    OLB: 18,
    LB: 19,
    CB: 20,
    S: 21,
    SS: 22,
    DB: 23,
    LS: 24,


   }



// console.log('roasterdraftdata',roasterdraftdata);

  // const updatedRoasterdraftdata = roasterdraftdata?.map((item) => {
  //   console.log('item._id?._id',item._id?._id);
  //   if (item._id?._id === roasterroundandpick?.playerPick._id) {
  //     const updatedItem = {
  //       ...item,
  //       round: roasterroundandpick?.round || '-',
  //       pick: roasterroundandpick?.position || '-'
  //     };
     
  //     return updatedItem;
  //   }
  //   return  item;
  // });

  // console.log('roasterdraftdata',roasterdraftdata);

  // const updatedRoasterdraftdata = roasterdraftdata?.map((item) => {
  //  // console.log('roasterroundandpick?.playerPick?._id',roasterroundandpick?.playerPick?._id);
  //   console.log('roasterroundandpick',roasterroundandpick);
  // //  console.log('item?._id?._id',item?._id?._id);
  //   if (item?._id?._id === roasterroundandpick?.playerPick?._id) {
  //     const updatedItem = {
  //       ...item,
  //       round: roasterroundandpick?.round || '-',
  //       pick: roasterroundandpick?.position || '-'
  //     };
  //     return updatedItem;
  //   }
  //   return item;
  // });
  

  const updatedRoasterdraftdata = roasterdraftdata?.map((item) => {
    let updatedItem = { ...item }; // Create a copy of the current item
  
    roasterroundandpick?.forEach((pick) => {
      if (item?._id?._id === pick?.playerPick?._id) {
        updatedItem = {
          ...updatedItem,
          round: pick?.round || '-',
          pick: pick?.position || '-'
        };
      }
    });
  
    return updatedItem;
  });
  
  
  const sortedRoasterdraftdata = updatedRoasterdraftdata?.slice()?.sort((a, b) => {

    if (a && b && a.Position && b.Position) {
    
      const orderA = positionOrder[a.Position] || Infinity;
      const orderB = positionOrder[b.Position] || Infinity;
  
      // Compare the positions based on their order
      return orderA - orderB;
    }

    return 0;
  });
  
  sortedRoasterdraftdata?.forEach(item => {
  if (["DT", "NT", "DE", "DL", "ILB", "OLB", "LB", "CB", "S", "SS", "DB", "LS"].includes(item?.Position)) {
    item.Position = "IDP";
  }
});
  
// console.log('sortedRoasterdraftdata',sortedRoasterdraftdata);


  const getData = async () => {
    setLoading('roasterdraftdata')
    console.log('SETTING?.date inside get team roster',SETTING?.week);
    await getDraftTeamRoster(SETTING?.week)
    setLoading('')
  }

  const get_Pick_and_round_Data = async () => {
  setLoading('roasterroundandpick')
    console.log('SETTING?.date inside get team roster',SETTING?.week);
    await getRosterForDraftPick(SETTING?.week)
    setLoading('')
  }




  const columns = [
    // {
    //   width: 70,
    //   title: 'Rank',
    //   dataIndex: 'Rank',
    //   key: 'Rank',
    //   render: (t) => <p>{t || '-'}</p>,
    // },

    {
      width: 150,
      title: 'LINE-UP',
      dataIndex: 'lineup',
      key: 'lineup',
      render: (_, obj) => (
      
        <div className='table_player_name_box'>
          <p
            onClick={() => dispatch(setSelectedPlayer(obj?.player_id))}
          //  style={{ cursor: 'pointer',width:'30%',background:'#00BFFF',borderRadius:'20px',textAlign:'center' }}
          >
            {obj?.Position || obj?._id?.Position || '-'}{' '}
          </p>{' '}
          {/* <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p> */}
        </div>
      ),
    },
    {
      width: 150,
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
      render: (_, obj) => (

      
      
        <div className='table_player_name_box'>
          <p
            onClick={() => dispatch(setSelectedPlayer(obj?.player_id))}
            style={{ cursor: 'pointer' }}
          >
            {obj?.Name || obj?._id?.Name || '-'}{' '}
          </p>{' '}
          {/* <p>
            {obj?.Position} - {obj?.Team}{' '}
          </p> */}
        </div>
      ),
    },
    {
      width: 150,
      title: 'POSITION',
      dataIndex: 'pos',
      key: 'pos',
      render: (_, obj) => {
      
        console.log('obj',obj);
        console.log('obj?.Position',obj?._id?.Position);
        return (
          <div className='table_player_name_box nrc_container'>
            <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
              {obj?.Position || obj?._id?.Position || '-'}
            </p>
          </div>
        )
      },
    },
    {
      width: 150,
      title: 'TEAM',
      dataIndex: 'team',
      key: 'team',
      render: (_, obj) => {
        return (
          <div className='table_player_name_box nrc_container'>
            <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
              {obj?.Team || obj?._id?.Team || '-'}
            </p>
          </div>
        )
      },
    },
    {
      width: 180,
      title: 'CAP HIT',
      dataIndex: 'caphit',
      key: 'caphit',
      render: (_, obj) => {
        // console.log('obj',obj);
        return (
          <div className='table_player_name_box nrc_container'>
            <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
              {/* {obj?.PlayerCap || '-'} */}
           {(obj?.currentYearSalaryCap ? `$${obj.currentYearSalaryCap.toLocaleString()}` : '-')}


            </p>
          </div>
        )
      },
    },

    {
      width: 180,
      title: 'Round',
      dataIndex: 'caphit',
      key: 'caphit',

  
      render: (_, obj) => {
        return (
          <div className='table_player_name_box nrc_container'>
            <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
              {obj?.round || '-'}
            </p>
          </div>
        )
      },
    },


    {
      width: 180,
      title: 'PICK',
      dataIndex: 'caphit',
      key: 'caphit',
      render: (_, obj) => {
        return (
          <div className='table_player_name_box nrc_container'>
            <p onClick={() => dispatch(setSelectedPlayer(obj))} style={{ cursor: 'pointer' }}>
              {obj?.pick || '-'}
            </p>
          </div>
        )
      },
    },
  ]



// console.log('playerPick',playerPick);
 


  return (
    <Table
      loading={loading === 'roasterdraftdata'}
      dataSource={sortedRoasterdraftdata}
      columns={columns}
      scroll={tableScroll}
      bordered={false}
      rowKey='_id'
      rowClassName={(_, index) => (index % 2 === 1 ? 'table-row-light' : 'table-row-dark')}
      pagination={false}
    />
  )
}

export default TeamRosters
