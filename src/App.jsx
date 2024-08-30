import { useEffect, useState } from "react";
import Chat from "./Components/Chat/Chat";
import Details from "./Components/Details/Details";
import Lists from "./Components/Lists/Lists";
import Login from "./Components/Login/Login";
import Notification from "./Components/Notification/Notification";
import { useDispatch, useSelector } from "react-redux";
import { login as StoreLogin, logout } from "./Store/AuthSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Conf/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Conf/Firebase";




const App = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const status = useSelector((state) => state.authReducers.status);
  const channelStatus = useSelector((state) => state.authReducers.channelStatus);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async(user) => {
      
      if (user) {
        const docRef=doc(db,"users",user.uid)
        const docSnap=await  getDoc(docRef)
        
        if (docSnap.exists()) {
          getUser(user.uid)
        }
        else{
          <Login/>
        }
      }
      else{
        dispatch(logout())
        setLoading(false)
      }
    });
    const getUser = async (uid) => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        // console.log(docSnap);
        if (docSnap.exists()) {
          // console.log("Document data:", docSnap.data());

          dispatch(StoreLogin(docSnap.data()));
        } else {
          // docSnap.data() will be undefined in this case
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

 


  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="container">
          {status ? (
            <>
              <Lists />
              {channelStatus ? <Chat />:null}
              {channelStatus ? <Details />:null}
            </>
          ) : (
            <Login />
          )}
          <Notification />
        </div>
      )}
    </>
  );
};

export default App;
