import React, { useEffect, useCallback, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Navbar from "../components/NavBar";
import Spinner from '../components/Spinner';
import axios from "axios";
import VideoPermissionModal from "react-modal";
import { useDarkMode } from '../context/DarkModeContext';
import "../App.css";

const RoomPage = () => {
  const socket = useSocket();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [gifList, setGifList] = useState([]);
  const [isGifModalVisible, setIsGifModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const videoWidth = deviceWidth <= 767 ? '325px' : '640px';
  const videoHeight = deviceWidth <= 767 ? '280px' : '470px';
  const MyvideoWidth = deviceWidth <= 767 ? '320px' : '150px';
  const MyvideoHeight = deviceWidth <= 767 ? '280px' : '100px';


  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  function startsWithHttps(str) {
    // Regular expression pattern to match "https" at the start of the string
    const pattern = /^https/i; // Case-insensitive match
  
    // Test if the string matches the pattern
    return pattern.test(str);
  }

  const showChat = () => {
    setIsChatVisible(true);
  };

  const hideChat = () => {
    setIsChatVisible(false);
  };

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
    scrollToBottom();
    return () => {
      socket.off("message");
    };
  }, [messages]);

  const searchGifs = async () => {
    const options = {
      method: "GET",
      url: "https://api.giphy.com/v1/gifs/search",
      params: {
        q: query,
        limit: 20,
        api_key: process.env.REACT_APP_API_KEY,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data.data);
      setGifList(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const searchTrendingGifs = async () => {
    const options = {
      method: "GET",
      url: "https://api.giphy.com/v1/gifs/trending",
      params: {
        limit: 20,
        api_key: process.env.REACT_APP_API_KEY,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data.data);
      setGifList(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = () => {
    socket.emit("sendMessage", { text: message }); // sending text message 
    setMessage("");
  };

  const handleSendGIF = (e) => {
    const gifSrc = e.target.src;
    setMessage(gifSrc);
   if(message){
    handleSendMessage();
   }
  }

  // Function to execute when "Enter" key is pressed
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleSendMessage();
  }
};

  const handleGifButtonClick = () => {
    setIsGifModalVisible(!isGifModalVisible); // Toggle the visibility of the GIF modal
    searchTrendingGifs();
  };

  const handleUserJoined = useCallback((data) => {
    const { id } = data;
    setRemoteSocketId(id);
  }, []);

  
  const handleUserLeft = useCallback(() => {
    setRemoteSocketId(null);
    setRemoteStream(null);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setIsOpen(false); // close Permission Modal
  }, [myStream]);

  const handleSkipRoom = () => {
    socket.emit('skipRoom'); // Emit an event to the server to skip the room
  };

  const handleSkipNavigate=useCallback(
    (data) => {
      const { roomName } = data;
        navigate(`/room/video/${roomName}`);
    },
    [navigate]
  );

   // Function to handle incoming remote stream
   const handleRemoteStream = (stream) => {
    setIsOpen(true);
  };

  const handleExitConversation = () => {
    // Logic to leave the room and exit conversation
    socket.emit("exitConversation"); // Send a message to the server to handle user leaving the room
    navigate('/');
  }

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
    //  sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

   const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {

    socket.on("user:joined", handleUserJoined);
    socket.on("user:left", handleUserLeft);
    socket.on("room:skip:join", handleSkipNavigate);
    socket.on('remoteStream', handleRemoteStream);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off('remoteStream', handleRemoteStream);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    handleCallUser();
  }, [remoteSocketId]);

  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <>
      <div className="navBar">
       <Navbar />
      </div>
      <div className="container">
        <div className={`${darkMode ? "left darkMode " : "left"}`} >

        <div className="row">
            {
            remoteSocketId && (
              <> 
                {myStream && (
                  <VideoPermissionModal
                  isOpen={isOpen}
                  onRequestClose={() => setIsOpen(false)}
                  contentLabel="Permission Required"
                  shouldCloseOnOverlayClick={false} // Prevent closing on overlay click
                  className="modal-content"
                  overlayClassName="modal-overlay"
                >
                  <p>Please Allow to send Your Video </p>
                  <button id="allow" onClick={sendStreams}>Allow</button>
                </VideoPermissionModal>
                ) } 
              </>
             ) 
            }
          </div>

            <div className="stream-container">
            {remoteStream? (
              <ReactPlayer
                className="video-stream"
                playing
                height={videoHeight}
                width={videoWidth}
                url={remoteStream}
              />
              ):(
                <div className="tempFrame">
                  <Spinner />
                </div>
              )}
            </div>

            {myStream && (
            <div className="stream-container">
              <ReactPlayer
                className="video-stream local-stream"
                playing
                muted
                height={MyvideoHeight}
                width={MyvideoWidth}
                url={myStream}
                onClick={hideChat}
              />
            </div>
          )}
        </div>

        <div className={`${darkMode ? "right darkMode " : "right"}`} >
          <div className={`chat-container ${isChatVisible ? '' : 'hide'}`}>
            <div className="roomDetail"> 
               {
                 remoteSocketId?(
                 <> <span>You are now Connected to a random User!</span> <button onClick={handleExitConversation} >Exit</button></>
                 ):(
                  <span>Please Wait! We are connecting you to random User...</span>
                 )
               }
            </div>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.user === "admin" ? "admin" : message.user === remoteSocketId ? "received" : "sent"}`}
                >
                  <p className="message-text">
                    <b>
                    {message.user === "admin" ? "admin : " : remoteSocketId === message.user ? "Stranger : " : "You : "}
                    </b>
                    {
                       startsWithHttps(message.text)?( <img src={message.text} height="70px" width="70px" /> ):( <span>{message.text}</span>   )
                    }
                  </p>
                </div>
              ))}
               <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="input-container">
            <button className="skip-button" onClick={handleSkipRoom} > Skip </button>
            <input
              type="text"
              className="input-text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
             <button className="gifbtn" onClick={handleGifButtonClick}>
              GIF
            </button>
            <button className="send-button" onClick={handleSendMessage}>
              {" "}
              Send{" "}
            </button>
          </div>
        </div>
        
        {
        isGifModalVisible &&(
          <div className="gifModal">
            <input
              className="queryInput"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="searchbtn" onClick={searchGifs}>
              Search
            </button>
            <button className="crossbtn" onClick={handleGifButtonClick}>
               ×
            </button>
            <div className="gif">
              {
                (gifList.length !== 0)?(
                  <>
                  {gifList.map((gif, index) => (
                <div className="gif__image-container" key={index}   >
                  <img
                    className="gif__image"
                    src={gif.images.fixed_height.url}
                    alt="gif"
                    height="80px"
                    width="80px"
                    onClick={handleSendGIF}
                  />
                </div>
              ))}
              </>
                ):(
                  <div className="spinCon">
                    <Spinner />
                  </div>
                )
              }
              
            </div>
        </div>
        )
      }
      {
        (deviceWidth <= 767)&&(<div className="openChat" onClick={showChat} ></div>)
      }
      </div>
    </>
  );
};

export default RoomPage;
