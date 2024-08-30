import React, { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import appwriteAuth from "../../Appwrite/Auth";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../Store/AuthSlice";
import appwriteServices from "../../Appwrite/Services";
import upload from "../../Conf/Upload";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Conf/Firebase";
const Login = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.authReducers.userData);
  const [errors, setErros] = useState(null);
  const [info, setInfo] = useState(null);
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

  const newAccount = async () => {
    setErros(""); // Assuming the correct function name is `setErrors`

    try {
      const session = await appwriteAuth.createAccount(value);
      console.log("Session:", session);

      if (session) {
        const userData = await appwriteAuth.getCurrentUser();
        console.log("User Data:", userData);
        const name = userData.displayName;
        const email = userData.email;
        const uid = userData.uid;

        if (name && email && uid) {
          // dispatch(login());

          await uploadDocument({ name, email, uid }); // Await here to ensure it completes before showing success message
          toast.success("Welcome");
        } else {
          console.error("No user data received");
          throw new Error("Invalid user data received.");
        }
      }
    } catch (error) {
      console.error("Error in newAccount:", error);
      toast.error(error.message);
    }
  };

  const uploadDocument = async (userData) => {
    console.log(userData);
    if (!userData || !userData.name || !userData.email || !userData.uid) {
      console.error("Invalid user data received:", userData);
      throw new Error("Invalid user data received.");
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
      // await appwriteServices.createUsersChats({ chats: [] }, userData.uid);
      console.log("Document uploads completed successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error; // Optional: rethrow the error for further handling
    }
    try {
      await appwriteServices.createUsersChats({ chats: [] }, userData.uid);
      console.log("Chats uploads completed successfully.");
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error; // Optional: rethrow the error for further handling
    }

    try {
      const docRef = doc(db, "users", userData.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dispatch(login(docSnap));
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const loginAccount = async () => {
    const session = await appwriteAuth.login(value);
    if (session) {
      const userData = await appwriteAuth.getCurrentUser();
      if (userData) {
        dispatch(login());
        toast.success("Welcome");
      }
    }
  };

  return (
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
          <button type="submit" onClick={loginAccount}>
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
          <button onClick={newAccount} type="submit">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
