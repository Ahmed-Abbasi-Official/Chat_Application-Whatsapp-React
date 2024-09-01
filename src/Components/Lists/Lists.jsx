import './Lists.css'
import React from 'react'
import UserInfo from './UserInfo/UserInfo'
import ChatList from './ChatList/ChatList'

const Lists = ({toggleLists}) => {
  return (
    <>
    <div className='list'>
        <div className=' '><UserInfo /></div>
        <div className='w-full '><ChatList toggleLists={toggleLists}  /></div>
    </div>
    </>
  )
}

export default Lists