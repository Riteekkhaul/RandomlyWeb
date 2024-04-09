import React, { useState, useCallback, useEffect } from "react";
import AgeVerificationModal from "../components/AgeVerificationModal";
import textChat from "../images/text-chat.jpg";
import videoChat from "../images/video-chat.png";
import Navbar from "../components/NavBar";
import "../styling/lobby.css";

import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  // const [email, setEmail] = useState("");
  // const [room, setRoom] = useState("");
  const [interest, setInterest] = useState("");
  const [area, setArea] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleVideoChatClick = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { interest, area, type: "Video" });
    },
    [interest, area, socket]
  );

  const handleTextChatClick = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { interest, area, type: "Text" });
    },
    [interest, area, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { type, roomName } = data;
      console.log("chat Type:", type);
      if (type == "Text") {
        navigate(`/room/text/${roomName}`);
      } else {
        navigate(`/room/video/${roomName}`);
      }
    },
    [navigate]
  );

  
  const handleAreaChange = (event) => {
    setArea(event.target.value);
  };

  const handleInterestChange = (event) => {
    setInterest(event.target.value);
  };

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <>
      <div>
        <Navbar />
        <div className="homepage">
          <marquee behavior="scroll" direction="left" className="marqueeStyle">
            Protect your privacy: Avoid disclosing sensitive or personal
            information while connecting with random persons. -- We prioritize
            your privacy: Please note that we do not store any user data.
          </marquee>
          <h1 className="welcome">Welcome to Randomly</h1>
          <div className="userInputCon">
            <label htmlFor="area"> Area</label>
            <select
              id="area"
              className="selectStyle"
              value={area}
              onChange={handleAreaChange}
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">AP</option>
              <option value="Assam">AS</option>
              <option value="Assam">UP</option>
              <option value="Assam">MH</option>
              <option value="Assam">MP</option>
              {/* Add more options for other states */}
            </select>

            <label htmlFor="interest"> Interest</label>
            <select
              id="interest"
              className="selectStyle"
              value={interest}
              onChange={handleInterestChange}
            >
              <option value="">Select Interest</option>
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Technology">Technology</option>
              <option value="Technology">Travel</option>
              {/* Add more options for other interests */}
            </select>
          </div>
          <div className="button-container">
            <button className="text-chat-button" onClick={handleTextChatClick}>
              <img src={textChat} alt="Text Chat" height="80px" width="120px" />
              <p className="btntext">
                Text <br /> Chat{" "}
              </p>
            </button>
            <p className="or">or</p>
            <button
              className="video-chat-button"
              onClick={handleVideoChatClick}
            >
              <img
                src={videoChat}
                alt="Video Chat"
                height="80px"
                width="120px"
              />
              <p className="btntext">
                Video <br /> Chat{" "}
              </p>
            </button>
          </div>

          <div className="serviceSection">  </div>
          <div className="footer" > 
            <button className="footerbtn" >Contact</button>
            <button className="footerbtn" >Services</button>
            <button className="footerbtn" >Feedback</button>
            <button className="footerbtn" >Report an Issue</button>
          </div>
        </div>
      </div>
      <AgeVerificationModal />
    </>
  );
};

export default LobbyScreen;
