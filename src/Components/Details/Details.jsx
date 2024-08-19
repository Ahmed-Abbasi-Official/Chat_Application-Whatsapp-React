import { useDispatch, useSelector } from 'react-redux'
import './Details.css'
import React from 'react'
import appwriteAuth from '../../Appwrite/Auth'
import { logout } from '../../Store/AuthSlice'

const Details = () => {
  const channel = useSelector((state) => state.authReducers.channel);
  const dispatch=useDispatch()
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
        <img src={channel.url} alt="" />
        <h2>{channel.username}</h2>
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
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
             <div className="photoDetails">
             <img src="https://images.pexels.com/photos/609549/pexels-photo-609549.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
             <span>photo_2024_2.png</span>
             </div>
            <img src="./download.png" alt=""  className='icon'/>
            </div>
            
            <div className="photoItem">
             <div className="photoDetails">
             <img src="https://images.pexels.com/photos/609549/pexels-photo-609549.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
             <span>photo_2024_2.png</span>
             </div>
            <img src="./download.png" alt=""  className='icon'/>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button>Block user</button>
        <button className='logout' onClick={deleteAcc}>Logout</button>
      </div>
    </div>
    </>
  )
}

export default Details