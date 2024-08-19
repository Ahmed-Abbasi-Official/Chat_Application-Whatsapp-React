import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
const Notification = () => {
  return (
    <div className='notification'>
        <ToastContainer position='top-center'/>
    </div>
  )
}

export default Notification