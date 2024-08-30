import { useDispatch, useSelector } from 'react-redux'
import './Details.css'
import React from 'react'
import appwriteAuth from '../../Appwrite/Auth'
import { logout } from '../../Store/AuthSlice'

const Details = () => {
  const channel = useSelector((state) => state.authReducers.channel);
  const dispatch=useDispatch()
  const groupChannel = useSelector((state) => state.authReducers.groupChannel);
  const groupStatus = useSelector((state) => state.authReducers.groupStatus);
  console.log(groupChannel);
  console.log(groupStatus);
  
  const deleteAcc=async()=>{
    const userData=await appwriteAuth.logout()
    if (userData) {
      dispatch(logout())
    }
  }
  return (
    <>
    <div className='detail'>
      <div className="user">
       {groupStatus ? (
        <>
         <img src={groupChannel?.groupDp} alt="" />
         <h2>{groupChannel?.groupName}</h2>
        </>
       ):(
        <>
         <img src={channel?.url} alt="" />
         <h2>{channel?.username}</h2>
        </>
       )}
        {/* <p>Lorem ipsum dolor sit amet.</p> */}
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
    
        <button className='logout' onClick={deleteAcc}>Logout</button>
      </div>
    </div>
    </>
  )
}

export default Details