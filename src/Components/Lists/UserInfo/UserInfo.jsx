import React from "react";
import { useDispatch, useSelector } from "react-redux";
import appwriteAuth from "../../../Appwrite/Auth";
import { logout } from "../../../Store/AuthSlice";

const UserInfo = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.authReducers.userData);

  return (
    <div className="p-4 flex items-center justify-between flex-wrap sm:flex-col sm:items-start">
      <div className="flex items-center gap-4 sm:gap-2">
        <img
          src={userData.url}
          alt=""
          className="w-16 h-16 rounded-full sm:w-12 sm:h-12"
        />
        <h2 className="text-lg sm:text-base">{userData.username}</h2>
      </div>
      <div className="flex gap-4 sm:gap-2 sm:mt-3 w-full sm:w-auto">
        <button
          className="w-full px-3 py-2 mt-4 bg-[#1f8ef1] text-white rounded-md font-medium cursor-pointer text-sm"
          onClick={() => {
            dispatch(logout());
            appwriteAuth.logout();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
