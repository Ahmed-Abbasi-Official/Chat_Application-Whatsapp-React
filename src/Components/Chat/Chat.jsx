import "./Chat.css";
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { getLastMessage } from "../../Store/AuthSlice";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../Conf/Firebase";
import upload from "../../Conf/Upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [groupValue, setGroupValue] = useState("");
  const [message, setMessage] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const userData = useSelector((state) => state.authReducers.userData);
  const groupStatus = useSelector((state) => state.authReducers.groupStatus);
  const channel = useSelector((state) => state.authReducers.channel);
  const groupChannel = useSelector((state) => state.authReducers.groupChannel);
  const dispatch = useDispatch();
  // console.log(groupChannel);
  const handleEmoji = (e) => {
    setValue((prev) => prev + e.emoji);
  };

  useEffect(() => {
    getAllMessages();
    getGroupMessages();
  }, [channel, userData.userID]);

  const chatId = (currentId) => {
    let id = "";
    if (userData.userID < channel.userID) {
      id = `${userData.userID}${channel.userID}`;
    } else {
      id = `${channel.userID}${userData.userID}`;
    }
    return id;
  };

  const handleSendMessage = async () => {
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, "messages"), {
      message: value,
      sentTime: new Date().toISOString(),
      sender: userData.userID,
      receiver: channel.userID,
      timeStamp: serverTimestamp(),
      chatId: chatId(),
    });
    setValue("");
    console.log("Document written with ID: ", docRef.id);
  };

  const getAllMessages = async () => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId()),
      orderBy("timeStamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allMessages = [];
      querySnapshot.forEach((doc) => {
        allMessages.push({
          ...doc.data(),
          messageID: doc.id,
          direction:
            doc.data().sender === userData.userID ? "outgoing" : "incoming",
        });
      });

      setMessage(allMessages);

      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        console.log(lastMessage);
        dispatch(getLastMessage(lastMessage));
      }
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date object
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Format the time as hh:mm
  };

  const formatTimeGroup = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp); // Convert milliseconds to JavaScript Date object
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }); // Format the time as hh:mm:ss
  };

  const handleDeleteMessage = (id) => {
    message &&
      message.map(async (val) =>
        val.messageID === id ? await deleteDoc(doc(db, "messages", id)) : ""
      );
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    const session = await upload(file);
    if (session) {
      if (groupStatus) {
        return setGroupValue(session);
      } else {
        return setValue(session);
      }
    }
  };

  const handleGroupMessage = async () => {
    try {
      const q = query(
        collection(db, "GroupsChats"),
        where("groupId", "==", userData.userID)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const groupChatDoc = querySnapshot.docs[0];
        console.log(groupChatDoc.data());

        const groupChatDocRef = doc(db, "GroupsChats", groupChatDoc.id); // Extracting the document ID
        console.log(groupChatDocRef);

        // Assuming newMessage is the new message you want to add to the chats array
        await updateDoc(groupChatDocRef, {
          chats: arrayUnion({
            messages: groupValue,
            senderId: userData.userID,
            senderName: userData.username,
            senderImg: userData.url,
            time: Date.now(),
          }),
        });

        console.log("Message added successfully!");
      } else {
        console.log("No group chat found with the specified groupId.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGroupMessages = async () => {
    try {
      const q = query(
        collection(db, "GroupsChats"),
        where("groupId", "==", "pnK5caMhduP5d2Cdp5ri7tg36GE3")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const chatsArray = querySnapshot.docs[0].data().chats;
          const newArray = chatsArray.map((val) => ({
            ...val,
            direction:
              val.senderId === userData.userID ? "outgoing" : "incoming",
            groupMessagesId: querySnapshot.docs[0].id,
          }));
          console.log(newArray[0].messages);

          setGroupMessages(newArray);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error getting group messages:", error);
    }
  };
  console.log(groupMessages);

  // console.log(groupStatus);
  return (
    <>
      {groupStatus ? (
        <div className="chat">
          <div className="top">
            <div className="user">
              <img src={groupChannel.groupDp} alt="" />
              <div className="texts">
                <span>{groupChannel.groupName}</span>
                {/* <p>Lorem ipsum dolor sit amet.</p> */}
              </div>
            </div>
            <div className="icons">
              {/* <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" /> */}
              <img src="./info.png" alt="" />
            </div>
          </div>
          <div className="center">
            {groupStatus
              ? groupMessages &&
                groupMessages.map((val) => (
                  <>
                    <div
                      className={`${
                        val.direction === "outgoing"
                          ? "message own "
                          : "message "
                      }`}
                      key={val?.groupId}
                    >
                      <div className="texts">
                        <p className="flex flex-col">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="avatar-container">
                              <img
                                src={val.senderImg}
                                alt=""
                                className="avatar-image"
                              />
                            </span>
                            <span className="text-sm ml-2">
                              {val?.senderName}
                            </span>{" "}
                            {/* Added margin-left for spacing */}
                          </div>

                          
                          {val?.messages.match(
                          /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i
                        ) ? (
                          <img src={val?.messages} alt="" />
                        ) : (
                          <p>{val?.messages}</p>
                        )}
                          
                        </p>

                        <span className="timeText">
                          {formatTimeGroup(val.time)}
                        </span>
                      </div>
                      {/* <button className="text-center text-sm text-red-400">
                        <i
                          class="fa-solid fa-trash"
                          onClick={() => {
                            handleDeleteMessage(val.messageID);
                          }}
                        ></i>
                      </button> */}
                    </div>
                  </>
                ))
              : message &&
                message.map((val) => (
                  <>
                    <div
                      className={`${
                        val.direction === "outgoing" ? "message own" : "message"
                      }`}
                      key={val.messageID}
                    >
                      <div className="texts">
                        {val?.message.match(
                          /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i
                        ) ? (
                          <img src={val?.message} alt="" />
                        ) : (
                          <p>{val?.message}</p>
                        )}

                        <span className="timeText">
                          {formatTime(val.timeStamp)}
                        </span>
                      </div>
                    </div>
                  </>
                ))}
                      {/* <button className="text-center text-4xl">
                        <i
                          class="fa-solid fa-trash"
                          onClick={() => {
                            handleDeleteMessage(val.messageID);
                          }}
                        ></i>
                      </button> */}
          </div>
          <div className="bottom">
            <div className="icons">
              <label htmlFor="file">
                <img src="./img.png" alt="" />
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
              {/* <img src="./mic.png" alt="" /> */}
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              onClick={() => setOpen(false)}
              value={groupValue}
              onChange={(e) => setGroupValue(e.target.value)}
            />

            <div className="emoji">
              <img
                src="./emoji.png"
                alt=""
                onClick={() => setOpen((prev) => !prev)}
              />
              <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </div>
            </div>
            <button
              className="sendButton"
              onClick={() => {
                setOpen(false);
                handleGroupMessage();
                getGroupMessages();
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="chat">
          <div className="top">
            <div className="user">
              <img src={channel.url} alt="" />
              <div className="texts">
                <span>{channel.username}</span>
                {/* <p>Lorem ipsum dolor sit amet.</p> */}
              </div>
            </div>
          </div>
          <div className="center">
            {message &&
              message.map((val) => (
                <>
                  <div
                    className={`${
                      val.direction === "outgoing" ? "message own" : "message"
                    }`}
                    key={val.messageID}
                  >
                    <div className="texts">
                      {val?.message.match(
                        /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i
                      ) ? (
                        <img src={val?.message} alt="" />
                      ) : (
                        <p>{val?.message}</p>
                      )}

                      <span className="timeText">
                        {formatTime(val.timeStamp)}
                    <button className="text-center text-[9px] text-red-400 mx-14">
                      <i
                        class="fa-solid fa-trash"
                        onClick={() => {
                          handleDeleteMessage(val.messageID);
                        }}
                      ></i>
                    </button>
                      </span>
                    </div>
                  </div>
                </>
              ))}
          </div>
          <div className="bottom ">
            <div className="icons  ">
              <label htmlFor="file">
                <img src="./img.png" alt="" />
              </label>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              onClick={() => setOpen(false)}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <div className="emoji ">
              <img
                src="./emoji.png"
                alt=""
                onClick={() => setOpen((prev) => !prev)}
              />
              <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </div>
            </div>
            <button
              className="sendButton"
              onClick={() => {
                setOpen(false);
                handleSendMessage();
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
