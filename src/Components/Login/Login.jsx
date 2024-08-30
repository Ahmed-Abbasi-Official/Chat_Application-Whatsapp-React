import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import appwriteAuth from "../../Appwrite/Auth";
import { useDispatch } from "react-redux";
import { login } from "../../Store/AuthSlice";
import appwriteServices from "../../Appwrite/Services";
import upload from "../../Conf/Upload";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Conf/Firebase";

const Login = () => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [value, setValue] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [avatar, setAvatar] = useState({
    file: null,
    Url: "",
  });

  const handleChange = (e) => {
    setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar({
        file: file,
        Url: URL.createObjectURL(file),
      });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
  };

  const validateFields = () => {
    if (!value.email || !value.password || (!value.name && avatar.file)) {
      toast.error("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const newAccount = async () => {
    if (!validateFields()) return;

    try {
      setLoader(true);
      const session = await appwriteAuth.createAccount(value);
      console.log("Session:", session);

      if (!session) {
        throw new Error("Account creation failed.");
      }

      const userData = await appwriteAuth.getCurrentUser();
      console.log("User Data:", userData);

      if (!userData || !userData.displayName || !userData.email || !userData.uid) {
        throw new Error("Invalid user data received.");
      }

      const name = userData.displayName;
      const email = userData.email;
      const uid = userData.uid;

      await uploadDocument({ name, email, uid });
      toast.success("Welcome");
      setLoader(false);

    } catch (error) {
      console.error("Error in newAccount:", error);
      toast.error(error.message);
    }
  };

  const uploadDocument = async (userData) => {
    console.log("Uploading document with user data:", userData);

    if (!userData || !userData.name || !userData.email || !userData.uid) {
      console.error("Invalid user data received:", userData);
      throw new Error("Invalid user data received.");
    }

    if (!avatar || !avatar.file) {
      throw new Error("Avatar file is missing.");
    }

    const imgUrl = await upload(avatar.file);

    const payload = {
      username: userData.name,
      email: userData.email,
      url: imgUrl,
      userID: userData.uid,
      blocked: [],
    };

    try {
      await appwriteServices.createUsers(payload, userData.uid);
      await appwriteServices.createUsersChats({ chats: [] }, userData.uid);
      console.log("Document uploads completed successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }

    try {
      const docRef = doc(db, "users", userData.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dispatch(login(docSnap.data()));
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const loginAccount = async () => {
    if (!validateFields()) return;

    try {
      setLoader(true);
      const session = await appwriteAuth.login(value);
      if (session) {
        const userData = await appwriteAuth.getCurrentUser();
        if (userData) {
          dispatch(login(userData));
          toast.success("Welcome");
          setLoader(false);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
      setLoader(false);
    }
  };

  return (
    <>
      {loader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <ColorRing
            visible={true}
            height={80}
            width={80}
            ariaLabel="loading-indicator"
            colors={['#1f8ef1', '#1f8ef1', '#ffffff', '#1f8ef1', '#ffffff']}
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center md:justify-center min-h-screen p-5">
        <div className="item w-full md:w-1/2 mb-2 md:mb-0">
          <h2 className="text-center font-bold text-xl mb-1 md:mb-5">Welcome back,</h2>
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <input
              type="text"
              placeholder="Enter Your email"
              name="email"
              value={value.email}
              onChange={handleChange}
              className="w-full md:mb-3 md:p-3 px-3 py-2 mb-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="Enter Your password"
              name="password"
              value={value.password}
              onChange={handleChange}
              className="w-full md:mb-3 md:p-3 px-3 py-2 mb-2 border rounded-md"
            />
            <button
              type="submit"
              onClick={loginAccount}
              disabled={loader}
              className="w-full py-3 bg-blue-500 text-white rounded-md"
            >
              Sign In
            </button>
          </form>
        </div>
        <div className="separator md:mx-10"></div>
        <div className="item w-full md:w-1/2">
          <h2 className="text-center  text-sm md:mb-5 mb-2">Create an Account</h2>
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <label htmlFor="file" className="cursor-pointer flex justify-center flex-col items-center">
              {avatar && (
                <img
                  src={avatar.Url || "./avatar.png"}
                  alt="Avatar Preview"
                  className="md:mb-5 mb-3 w-16 h-16 md:w-24 md:h-24 rounded-full object-cover text-center"
                />
              )}
              <span className="text-blue-500 md:text-lg text-sm">Upload an Image</span>
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
            <input
              type="text"
              name="name"
              required={true}
              placeholder="Enter Your name"
              value={value.name}
              onChange={handleChange}
              className="w-full md:mb-3 md:p-3 px-3 py-2 mb-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Enter Your email"
              name="email"
              value={value.email}
              onChange={handleChange}
              className="w-full md:mb-3 md:p-3 px-3 py-2 mb-2 border rounded-md"
            />
            <input
              type="password"
              placeholder="Enter Your password"
              name="password"
              value={value.password}
              onChange={handleChange}
              className="w-full md:mb-3 md:p-3 px-3 py-2 mb-2  border rounded-md"
            />
            <button
              onClick={newAccount}
              type="submit"
              disabled={loader}
              className="w-full py-3 bg-green-500 text-white rounded-md"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
