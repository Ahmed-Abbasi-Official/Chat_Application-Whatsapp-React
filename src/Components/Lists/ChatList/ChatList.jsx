


import React, { useEffect, useState } from "react";
import "./ChatList.css";
import "./AddUser.css";
import { useDispatch, useSelector } from "react-redux";
import { chatShow, getChannel } from "../../../Store/AuthSlice";
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../Conf/Firebase";
import { arrayUnion } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import upload from "../../../Conf/Upload";
import { groupStatus, handleGroupChannle } from "../../../Store/AuthSlice";
const ChatList = ({toggleLists}) => {
  const [addmode, setMode] = useState(false);
  const [chats, setChats] = useState([]);
  const userData = useSelector((state) => state.authReducers.userData);
  const [users, setUsers] = useState(null);
  const [value, setValue] = useState("");
  const [group, setGroup] = useState(false);
  const [createGroup, setCreateGroup] = useState(false);
  const [groupValue, setGroupValue] = useState("");
  const [groupUsers, setGroupUsers] = useState(null);
  const [avatar, setAvatar] = useState("");
  let [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const channel = useSelector((state) => state.authReducers.channel);
  const lastMessage = useSelector((state) => state.authReducers.lastMessage);
  // console.log(lastMessage);
  

  // const chatId = searchParams.get('chatId');

  useEffect(() => {
    let unsubscribe;

    const uniqueUserIds = new Set();

    const fetchChats = async () => {
      try {
        const q = doc(db, "usersChats", userData.userID);
        unsubscribe = onSnapshot(q, async (res) => {
          const items = res.data().chats;

          const promise = items.map(async (item) => {
            const docRef = doc(db, "users", item.reciverId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              return docSnap.data();
            } else {
              console.log("No such document!");
              return null;
            }
          });

          const chatData = await Promise.all(promise);

          const newChats = chatData.filter((data) => {
            if (data !== null && !uniqueUserIds.has(data.userID)) {
              uniqueUserIds.add(data.userID);
              return true;
            }
            return false;
          });

          setChats((prev) => [...prev, ...newChats]);
        });
        // console.log(chats);
      } catch (error) {
        console.log("error ===>", error);
      }
    };

    fetchChats();
    handleGroups();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData.userID]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("username", "==", value));

      const querySnapshot = await getDocs(q);
      const user = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        user.push(doc.data());
      });
      // console.log("user>----------",user);
      setUsers(user);
    } catch (error) {
      console.log(error);
    }
  };

  const ChatID = () => {
    let id = ``;
    if (userData.userID < users[0].userID) {
      id = `${userData.userID}${users[0].userID}`;
    } else {
      id = `${users[0].userID}${userData.userID}`;
    }
    return id;
  };

  const handleAdd = async () => {
    console.log(ChatID());

    const userDataChatRef = doc(db, "usersChats", userData.userID);
    const userChatRef = doc(db, "usersChats", users[0].userID);

    const res = await updateDoc(userDataChatRef, {
      chats: arrayUnion({
        chatId: ChatID(),
        lastMessage: "",
        senderId: userData.userID,
        reciverId: users[0].userID,
        timestamp: Date.now(),
      }),
    });

    const res2 = await updateDoc(userChatRef, {
      chats: arrayUnion({
        chatId: ChatID(),
        lastMessage: "",
        senderId: users[0].userID,
        reciverId: userData.userID,
        timestamp: Date.now(),
      }),
    });
    console.log("result>---", res, res2);
  };

  const handleChannel = (user) => {
    dispatch(getChannel(user));
    

    // Create a new URL object based on the current window location
    const url = new URL(window.location.href);

    // Set the search parameter
    url.searchParams.set("chatId", user.userID);

    // Update the URL without reloading the page
    window.history.pushState({}, "", url);

    // Optionally, update the state based on the new chatId
    setParams(url.searchParams.get("chatId"));
  };

  const handleDelete = async (user) => {
    // user.userId===reciverid === delete

    const userRef = doc(db, "usersChats", userData.userID);
    const userIDToRemove = user.userID;
    const snapshot = await getDoc(userRef);
    const items = snapshot.data()?.chats;
    items.map(async (item) => {
      if (item.reciverId === userIDToRemove) {
        // console.log(item);
        const docRef = doc(db, "usersChats", userData.userID);
        // Perform the update

        await updateDoc(docRef, {
          chats: arrayRemove(item),
        });
        console.log("done==>", item);
      } else {
        console.log("not done");
      }
    });

    setChats((prev) => prev.filter((val) => val.userID !== userIDToRemove));
  };

  const handleGroupPic = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAvatar(file);
    console.log(url);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const dpUrl = await upload(avatar);
    console.log(dpUrl);

    const groupRef = collection(db, "GroupsChats");
    const session = await addDoc(groupRef, {
      groupName: groupValue,
      groupDp: dpUrl || "no-image",
      groupId: userData.userID,
      time: Date.now(),
      chats: [],
      ID:userData.userID
    });

    console.log(session);
    setCreateGroup(false);
  };
  

  const handleGroupChannel = (group) => {
    dispatch(groupStatus(true));
    dispatch(handleGroupChannle(group));
  };

  const handleGroups = async () => {
    try {
      const q = query(
        collection(db, "GroupsChats"),
        where("groupId", "==",userData.userID )
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const array = [];
        querySnapshot.forEach((doc) => {
          array.push(doc.data());
        });
        // console.log("Current cities in CA: ", array);
        setGroupUsers(array);
      });
    } catch (error) {
      console.log(error);
    }
    setCreateGroup(false);
    console.log(avatar);
  };
  

  return (
    <>
      <div className="chatList">
        <div className="search">
          <p
            className="text-sm"
            onClick={() => {
              dispatch(chatShow(false));
              dispatch(groupStatus(false));
              setGroup(false);
            }}
          >
            Add User
          </p>
          <img
            src={addmode ? "./minus.png" : "./plus.png"}
            alt=""
            className="add"
            onClick={() => {
              setMode((prev) => !prev);
            }}
          />
          <p className="text-sm">Groups</p>
          <span
            className="text-xl cursor-pointer"
            onClick={() => setGroup(true)}
          >
            <i class="fa-solid fa-people-group"></i>
          </span>
        </div>

        {group ? (
          <div className="flex justify-start items-start px-6 gap-8 flex-col">
            <div className="flex justify-start items-center gap-24">
              <p>Create Group</p>
              <span
                className="cursor-pointer"
                onClick={() => setCreateGroup(!createGroup)}
              >
                {" "}
                <i class="fa-solid fa-user-group"></i>
              </span>
            </div>

            {/* ===================
                 Group Chat
           ======================== */}

            {groupUsers?.map((users) => {
              return (
                <div
                  // style={{
                  //   backgroundColor:
                  //     userData.userID === users.groupId
                  //       ? "rgba(17 , 25 , 40 , 0.4)"
                  //       : "black",
                  // }}

                  onClick={() => {
                    handleGroupChannel(users);
                    dispatch(chatShow(true));
                    toggleLists()
                  }}
                  className="item px-2 py-2"
                >
                  <img src={users?.groupDp || ""} alt="" />
                  <div className="texts">
                    <div className="userName">
                      <span>{users?.groupName || "Unknown User"}</span>{" "}
                    </div>
                    {/* <p>{user?.lastMessgae}</p> */}
                  </div>
                  <button className="text-center text-sm text-red-400">
                    <i
                      class="fa-solid fa-trash"
                      onClick={() => {
                        // handleDelete(user);
                      }}
                    ></i>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          chats.map((user) => (
            <>
              <div
              
                style={{
                  backgroundColor:
                    channel?.userID === user.userID
                      ? "rgba(17 , 25 , 40 , 0.4)"
                      : "",
                      width:'100%',
                      minWidth:"100%"
                }}
                className="item    "
                key={user.chatId}
                onClick={() => {
                  handleChannel(user);
                  toggleLists()
                }}
              >
                <img src={user?.url || ""} alt="" />
                <div className="texts">
                  <div className="userName">
                    <span>{user?.username || "Unknown User"}</span>{" "}
                  </div>
                  <p>
  {lastMessage?.message.match(/https?/i) ? (
    lastMessage?.message.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i) ? (
      <p>There is an Image</p>
    ) : (
      <p>There is a link</p>
    )
  ) : (
    <p>{lastMessage?.message}</p>
  )}
</p>

                </div>
                <button className="text-center text-sm text-red-400">
                  <i
                    class="fa-solid fa-trash"
                    onClick={() => {
                      handleDelete(user);
                    }}
                  ></i>
                </button>
              </div>
            </>
          ))
        )}
        {addmode && (
          <div className="addUser mt-20">
            <form onSubmit={handleSearch}>
              <input
              className="text-black"
                type="text"
                placeholder="Username"
                name="Username"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                }}
                required
              />
              <button type="submit">Search</button>
            </form>
            {users && users.length > 0 ? (
  <>
    <div className="user">
      <div className="details">
        <img src={users[0].url} alt="" />
        <span>{users[0].username}</span>
      </div>
      <button onClick={handleAdd}>Add User</button>
    </div>
  </>
) : (
  <p className="mt-4">Please Enter correct Name</p>
)}
          </div>
        ) }
        {createGroup && (
          <div className="addUser">
            <form onSubmit={handleCreateGroup}>
              <label htmlFor="file" className="mt-4 cursor-pointer text-sm">
                Upload Pic
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleGroupPic}
              />

              <img src={(avatar && avatar) || "./avatar.png"} alt="" />

              <input
                type="text"
                className="text-black"
                placeholder="Enter Group name"
                value={groupValue}
                onChange={(e) => {
                  setGroupValue(e.target.value);
                }}
                required
              />
              <button type="submit">Create</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatList;

