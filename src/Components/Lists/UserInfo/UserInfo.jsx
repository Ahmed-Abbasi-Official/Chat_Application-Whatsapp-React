import React, { useEffect, useState } from "react";
import "./UserInfo.css";
import { useSelector } from "react-redux";
import appwriteAuth from "../../../Appwrite/Auth";
const UserInfo = () => {

  const userData = useSelector((state) => state.authReducers.userData);

  return (
    <div className="userInfo">
      <div className="user">
        {<img src={userData.url} alt="" className="userImg" />}
        <h2>{userData.username}</h2>
      </div>
      <div className="icons">
        <button className="btn">Logout</button>
      </div>
    </div>
  );
};

export default UserInfo;
