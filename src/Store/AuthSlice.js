import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  channel:null,
  channelStatus:false,
  groupStatus:false,
  groupChannel:null,
  lastMessage:null
  
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      (state.status = false), (state.userData = null);
    },
    getChannel:(state,action)=>{
     state.channelStatus=true
      state.channel=action.payload
    },
    groupStatus:(state,action)=>{
      state.groupStatus=action.payload
    },
    chatShow:(state,action)=>{
      state.channelStatus=action.payload
    },
    handleGroupChannle:(state,action)=>{
      state.groupChannel=action.payload
    },
    getLastMessage:(state,action)=>{
      state.lastMessage=action.payload
    }
  },
});

export const { login, logout,getChannel,groupStatus,chatShow,handleGroupChannle,getLastMessage} = AuthSlice.actions;

export default AuthSlice.reducer;
