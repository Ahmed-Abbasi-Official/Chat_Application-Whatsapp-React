import { useEffect, useState } from "react";
import Chat from "./Components/Chat/Chat";
import Lists from "./Components/Lists/Lists";
import Login from "./Components/Login/Login";
import Notification from "./Components/Notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { login as StoreLogin, logout } from "./Store/AuthSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Conf/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Conf/Firebase";
import { FaBars } from "react-icons/fa"; // Import hamburger icon
import { getMobile } from "./Store/AuthSlice";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showLists, setShowLists] = useState(true);
  const dispatch = useDispatch();

  const status = useSelector((state) => state.authReducers.status);
  const channelStatus = useSelector((state) => state.authReducers.channelStatus);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          getUser(user.uid);
        } else {
          <Login />;
        }
      } else {
        dispatch(logout());
        setLoading(false);
      }
    });

    const getUser = async (uid) => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          dispatch(StoreLogin(docSnap.data()));
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      unsub();
    };
  }, [dispatch]);

  const toggleLists = () => {
    setShowLists(!showLists);
    dispatch(getMobile(showLists))
  };


  

  

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="container">
          {status ? (
            <>
              <div className="md:hidden">
                {/* Burger Menu for smaller screens */}
             
                 {channelStatus &&  <FaBars
                  className="text-blue-500 text-4xl mx-2 cursor-pointer"
                  onClick={toggleLists}
                  />}
             
                {showLists && <Lists toggleLists={toggleLists} />}
              </div>
              <div className="hidden md:block ">
                <Lists />
              </div>
              {channelStatus ? <Chat toggleLists={toggleLists} /> : null}
            </>
          ) : (
            <Login />
          )}
        </div>
      )}
    </>
  );
};

export default App;
