import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import TextChatRoom from './screens/TextChatRoom';
import VideoChatRoom from './screens/VideoChatRoom';
import TicTacToe from "./games/TicTacToe/TicTacToe";
import { DarkModeProvider } from './context/DarkModeContext';


function App() {
  return (
    <DarkModeProvider>
    <div className="App">
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
        <Route path="/room/text/:roomId" element={<TextChatRoom />} />
        <Route path="/room/video/:roomId" element={<VideoChatRoom />} />
        <Route path="/game/tictactoe" element={<TicTacToe />} />
      </Routes>
    </div>
    </DarkModeProvider>
  );
}

export default App;
