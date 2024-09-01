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
import { LineWave } from "react-loader-spinner"; // Import LineWave loader

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [groupValue, setGroupValue] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const [message, setMessage] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [loading, setLoading] = useState(false); // State for loader
  const userData = useSelector((state) => state.authReducers.userData);
  const groupStatus = useSelector((state) => state.authReducers.groupStatus);
  const channel = useSelector((state) => state.authReducers.channel);
  const groupChannel = useSelector((state) => state.authReducers.groupChannel);
  const dispatch = useDispatch();

  const handleEmoji = (e) => {
    setValue((prev) => prev + e.emoji);
  };

  useEffect(() => {
    getAllMessages();
    getGroupMessages();
  }, [channel, userData.userID]);

  const chatId = () => {
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
    await addDoc(collection(db, "messages"), {
      message: value,
      sentTime: new Date().toISOString(),
      sender: userData.userID,
      receiver: channel.userID,
      timeStamp: serverTimestamp(),
      chatId: chatId(),
    });
    setValue("");
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
        const data = doc.data();
        allMessages.push({
          ...data,
          messageID: doc.id,
          direction:
            data.sender === userData.userID ? "outgoing" : "incoming",
          timeStamp: data.timeStamp ? data.timeStamp.toDate() : new Date() // Ensure timeStamp is a JavaScript Date object
        });
      });
  
      setMessage(allMessages);
  
      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        dispatch(getLastMessage(lastMessage));
      }
    });
  };
  

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000); // Convert Firestore timestamp to JavaScript Date object
    
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit",second: "2-digit", }); // Format the time as hh:mm
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
  
  
  
  const handleDeleteMessage = async (id) => {
    await deleteDoc(doc(db, "messages", id));
  };

  const handleAvatar = async (e) => {
    setLoading(true); // Start loader
    const file = e.target.files[0];
    const session = await upload(file);
    if (session) {
      if (groupStatus) {
        setGroupValue(session);
      } else {
        setValue(session);
      }
    }
    setLoading(false); // Stop loader
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
        const groupChatDocRef = doc(db, "GroupsChats", groupChatDoc.id);

        await updateDoc(groupChatDocRef, {
          chats: arrayUnion({
            messages: groupValue,
            senderId: userData.userID,
            senderName: userData.username,
            senderImg: userData.url,
            time: Date.now(),
          }),
        });
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
            time: val.time ? new Date(val.time) : new Date() // Ensure time is a JavaScript Date object
          }));
          setGroupMessages(newArray);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error getting group messages:", error);
    }
  };
  

  const isSendButtonDisabled = groupStatus ? !groupValue.trim() : !value.trim();

  return (
    <>
      {groupStatus ? (
        <div className="chat">
          <div className="top">
            <div className="user">
              <img src={groupChannel.groupDp} alt="" />
              <div className="texts">
                <span>{groupChannel.groupName}</span>
              </div>
            </div>
            <div className="icons">
              <img src="./info.png" alt="" />
            </div>
          </div>
          <div className="center">
            {groupMessages &&
              groupMessages.map((val) => (
                <div
                  className={`${
                    val.direction === "outgoing" ? "message own" : "message"
                  }`}
                  key={val.groupMessagesId}
                  onMouseEnter={() => setHoveredMessageId(val.groupMessagesId)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="texts">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="avatar-container">
                        <img src={val.senderImg} alt="" className="avatar-image" />
                      </span>
                      <span className="text-sm ml-2">{val.senderName}</span>
                    </div>
                    {val.messages.match(
                      /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i
                    ) ? (
                      <img src={val.messages} alt="" />
                    ) : (
                      <p>{val.messages}</p>
                    )}
                    <div className="timeText">
                      <span>{formatTimeGroup(val.time)}</span>
                      <button
                        className="delete-icon text-center text-red-400"
                        onClick={() => handleDeleteMessage(val.groupMessagesId)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              className="send"
              onClick={handleGroupMessage}
              disabled={isSendButtonDisabled}
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
              </div>
            </div>
            <div className="icons">
              <img src="./info.png" alt="" />
            </div>
          </div>
          <div className="center">
            {message &&
              message.map((val) => (
                <div
                  className={`${
                    val.direction === "outgoing" ? "message own" : "message"
                  }`}
                  key={val.messageID}
                  onMouseEnter={() => setHoveredMessageId(val.messageID)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  {loading && (
                    <div className="loader-container">
                      <LineWave
                        height="300"
                        width="300"
                        color="#4fa94d"
                        ariaLabel="line-wave"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                      />
                    </div>
                  )}
                  <div className="texts">
                    {val.message.match(
                      /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i
                    ) ? (
                      <img src={val.message} alt="" />
                    ) : (
                      <p>{val.message}</p>
                    )}
                    <div className="timeText">
                      <span>{formatTime(val.timeStamp)}</span>
                      <button
                        className="delete-icon text-center text-red-400"
                        onClick={() => handleDeleteMessage(val.messageID)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              onClick={() => setOpen(false)}
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
              className="send"
              onClick={handleSendMessage}
              disabled={isSendButtonDisabled}
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
