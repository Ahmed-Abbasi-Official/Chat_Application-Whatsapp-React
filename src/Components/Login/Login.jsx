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
      <div className="z-10 fixed top-[20%] left-[20%]">
        {loader ? (
          <ColorRing
            visible={true}
            height="400"
            width="400"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#1f8ef1', '#1f8ef1', '#fff', '#1f8ef1', '#fff']}
          />
        ) : null}
      </div>
      <div className="login px-5">
        <div className="item">
          <h2>Welcome back,</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter Your email"
              name="email"
              value={value.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Enter Your password"
              name="password"
              value={value.password}
              onChange={handleChange}
            />
            <button type="submit" onClick={loginAccount} disabled={loader}>
              Sign In
            </button>
          </form>
        </div>
        <div className="separator"></div>
        <div className="item">
          <h2>Create an Account</h2>
          <form onSubmit={handleLogin}>
            <label htmlFor="file">
              {avatar && (
                <img src={avatar.Url || "./avatar.png"} alt="Avatar Preview" />
              )}
              Upload an Image
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
            />
            <input
              type="text"
              placeholder="Enter Your email"
              name="email"
              value={value.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Enter Your password"
              name="password"
              value={value.password}
              onChange={handleChange}
            />
            <button onClick={newAccount} type="submit" disabled={loader}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
