import React, { useState } from "react";
import "./logic.css";

const TicTacToe = () => {
  const [print, setPrint] = useState("");
  const [flag, setFlag] = useState(1);
  const [winner, setWinner] = useState("");

  const handleBoxClick = (id) => {
    const button = document.getElementById(id);
    if (button.value === "") {
      if (flag === 1) {
        button.value = "X";
        setFlag(0);
      } else {
        button.value = "O";
        setFlag(1);
      }
      checkWin();
    }
  };

  const checkWin = () => {
    const board = [];
    for (let i = 1; i <= 9; i++) {
      board.push(document.getElementById("b" + i).value);
    }

    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        return;
      }
    }

    const isDraw = !board.includes("");
    if (isDraw) {
      setWinner("draw");
    }
  };

  const resetGame = () => {
    for (let i = 1; i <= 9; i++) {
      const button = document.getElementById("b" + i);
      button.value = "";
    }
    setFlag(1);
    setWinner("");
  };

  return (
    <div id="main">
      <div>
       <h1>TIC TAC TOE</h1>
       <p id="ins">
        Game starts by just Tap on box
        <br /> <br />
        First Player starts as <b>Player X </b><br/>And Second Player as{" "}
        <b>Player 0</b>
       </p>
      </div>

      <div className="ui">
        <div className="row">
          {[1, 2, 3].map((i) => (
            <input
              key={i}
              type="button"
              id={"b" + i}
              className="cell"
              onClick={() => handleBoxClick("b" + i)}
              readOnly
            />
          ))}
        </div>
        <div className="row">
          {[4, 5, 6].map((i) => (
            <input
              key={i}
              type="button"
              id={"b" + i}
              className="cell"
              onClick={() => handleBoxClick("b" + i)}
              readOnly
            />
          ))}
        </div>
        <div className="row">
          {[7, 8, 9].map((i) => (
            <input
              key={i}
              type="button"
              id={"b" + i}
              className="cell"
              onClick={() => handleBoxClick("b" + i)}
              readOnly
            />
          ))}
        </div>
      </div>
      <br />
      {winner ? (
        <div>
          {winner === "draw" ? (
            <p id="print">Match Draw!</p>
          ) : (
            <p id="print">Player {winner} won!</p>
          )}
          <button id="but" onClick={resetGame}>
            RESET
          </button>
        </div>
      ) : (
        <p id="print">{flag ? "Player X Turn" : "Player O Turn"}</p>
      )}
    </div>
  );
};

export default TicTacToe;
