import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaBars } from "react-icons/fa"; // Import hamburger icon

const UserInfo = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userData = useSelector((state) => state.authReducers.userData);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  

  return (
    <div>
      {/* Sidebar Toggle Button for small screens */}
      <div className="lg:hidden p-4 fixed z-20 ">
        <FaBars
          className="text-blue-500 text-2xl cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-800 text-white transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:flex   ${isSidebarOpen ? "pt-8 pl-8 flex justify-start items-start" : ""}   justify-between items-center lg:w-auto lg:bg-transparent lg:text-black lg:items-center px-4  `}
      >
        <div className={`flex justify-center items-center lg:gap-2 md:gap-2  mt-10 lg:mt-0 mr-3  `}>
          <img
            src={userData.url}
            alt=""
            className="sm:w-16 sm:h-16 rounded-full  mb-6 w-16 h-16"
          />
          <h2 className={` text-white md:font-bold md:text-lg mb-6 font-bold text-xl ${isSidebarOpen ? "mx-3" : ""}`}>{userData.username}</h2>
        </div>
        <div className={` text-center lg:text-left mb-5 ${isSidebarOpen ? "mt-14" : ""} `}>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-2 rounded text-sm  ">
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:ml-64 p-4 ${isSidebarOpen ? "lg:hidden" : ""}`}>
        {/* Main content goes here */}
      </div>
    </div>
  );
};

export default UserInfo;
