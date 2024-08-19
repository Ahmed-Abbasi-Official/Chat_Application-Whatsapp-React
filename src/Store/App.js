import { configureStore } from "@reduxjs/toolkit";
import authReducers from './AuthSlice'
const store=configureStore({
    reducer:{
        authReducers
    }
})

export default store