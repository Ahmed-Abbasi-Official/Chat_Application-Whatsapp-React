import './Lists.css'
import React from 'react'
import UserInfo from './UserInfo/UserInfo'
import ChatList from './ChatList/ChatList'

const Lists = () => {
  return (
    <>
    <div className='list'>
        <UserInfo />
        <ChatList />
    </div>
    </>
  )
}

export default Lists