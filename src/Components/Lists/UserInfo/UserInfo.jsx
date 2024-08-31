import React from "react";
import { useSelector } from "react-redux";
import appwriteAuth from "../../../Appwrite/Auth";

const UserInfo = () => {
  const userData = useSelector((state) => state.authReducers.userData);

  return (
    <div className="p-5 flex items-center justify-between sm:flex-col sm:items-start">
      <div className="flex items-center gap-3 sm:gap-1">
        {<img src={userData.url} alt="" className="w-12 h-12 sm:w-10 sm:h-10 xs:w-8 xs:h-8 rounded-full" />}
        <h2 className="text-lg sm:text-base xs:text-sm">{userData.username}</h2>
      </div>
      <div className="flex gap-5 sm:gap-2">
        <button className="w-full px-2 py-2 ml-3 bg-[#1f8ef1] text-white rounded-md font-medium cursor-pointer text-sm">
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
