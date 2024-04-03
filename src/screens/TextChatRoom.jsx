import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import axios from "axios";
import Navbar from "../components/NavBar";
import Spinner from '../components/Spinner';
import "../App.css";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [gifList, setGifList] = useState([]);
  const [isGifModalVisible, setIsGifModalVisible] = useState(false);

  function startsWithHttps(str) {
    // Regular expression pattern to match "https" at the start of the string
    const pattern = /^https/i; // Case-insensitive match
  
    // Test if the string matches the pattern
    return pattern.test(str);
  }
  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });

    return () => {
      socket.off("message");
    };
  }, [messages]);

  const handleSendMessage = () => {
    socket.emit("sendMessage", { text: message });
    setMessage("");
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

  const handleGifButtonClick = () => {
    setIsGifModalVisible(!isGifModalVisible); // Toggle the visibility of the GIF modal
    searchTrendingGifs();
  };

  const handleSendGIF = (e) => {
  const gifSrc = e.target.src;
  setMessage(gifSrc);
  //handleSendMessage();
}

  // Function to execute when "Enter" key is pressed
function handleKeyPress(event) {
  if (event.key === "Enter") {
    // Call your function here
    handleSendMessage();
  }
}

document.addEventListener("keydown", handleKeyPress);


  const handleUserJoined = useCallback((data) => {
    const { id } = data;
    setRemoteSocketId(id);
  }, []);

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

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);

    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);

  return (
    <>
      <div className="navBar">
        <Navbar />
      </div>
      <div className="container">

      {
        isGifModalVisible &&(
          <div className="gifModal">
          <div>
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
        </div>
        )
      }

      {
        remoteSocketId?(
          <div className="chatSection">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.user === remoteSocketId ? "received" : "sent" //{message.user}
                  }`}
                >
                  <p className="message-text">
                    <b>
                      {remoteSocketId === message.user
                        ? "Stranger : "
                        : "You : "}
                    </b>
                    {
                       startsWithHttps(message.text)?( <img src={message.text} height="70px" width="70px" /> ):( <span>{message.text}</span>   )
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="input-container">
            <button className="skip-button"> Skip </button>
            <input
              type="text"
              className="input-text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
        ):(
        <Spinner />
         )
      }
      </div>
    </>
  );
};

export default RoomPage;
