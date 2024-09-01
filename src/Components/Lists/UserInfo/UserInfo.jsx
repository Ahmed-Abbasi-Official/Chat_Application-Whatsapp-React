import React from "react";
import { useDispatch, useSelector } from "react-redux";
import appwriteAuth from "../../../Appwrite/Auth";
import { logout } from "../../../Store/AuthSlice";

const UserInfo = () => {
  const dispatch=useDispatch()
  const userData = useSelector((state) => state.authReducers.userData);

  return (
    <div className="p-2 flex items-center justify-between sm:flex-col  md:flex-row sm:items-start">
      <div className="flex items-center gap-3 sm:gap-1">
        {<img src={userData.url} alt="" className="w-16 h-16   rounded-full" />}
        <h2 className="md:text-sm  sm:text-base xs:text-sm">{userData.username}</h2>
      </div>
      <div className="flex gap-5 sm:gap-2">
        <button className="w-full px-2 py-2 ml-3 bg-[#1f8ef1] text-white rounded-md font-medium cursor-pointer text-sm md:mt-4"
        onClick={()=>{
          dispatch(logout())
          appwriteAuth.logout()
          

        }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
