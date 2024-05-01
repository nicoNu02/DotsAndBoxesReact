import { useState } from "react";
import "./App.css";
import Board from "./components/Board";
import useModals from "./hooks/useModals";
import ModalWinner from "./components/ModalWinner";
import { io } from "socket.io-client";
import PlayerForm from "./components/PlayerForm";
//initialBoard = [
//   [0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0],
// ];

//horizontal = odd row
// vertical even row
const initialCompleted = {
  red: [],
  blue: [],
};
function App() {
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState(null);
  const [turn, setTurn] = useState(false); // false = red -- true = blue
  const [score, setScore] = useState([0, 0]); // red--blue
  const [completedPositions, setCompletedPositions] =
    useState(initialCompleted);
  const [showModalWinner, toggleModalWinner] = useModals();
  const [lastWinner, setLastWinner] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [isHost, setIsHost] = useState(null);

  const handleClick = (row, col) => {
    socket?.emit("lineClickedFromClient", {
      row,
      col,
      clientBoard: board,
    });
  };

  const resetBoard = () => {
    setCompletedPositions(initialCompleted);
    setScore([0, 0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSocket = io("wss://dotsandboxeswsserver.glitch.me/", {
      autoConnect: true,
    });
    newSocket?.emit("req-to-play", playerName);
    setSocket(newSocket);
    setConnected(true);
  };

  socket?.on("winner", (data) => {
    setLastWinner(data);
    toggleModalWinner();
  });

  socket?.on("opponent-found", (data) => {
    setOpponentName(data.opponentName);
    setBoard(data.board);
    setIsHost(data.isHost);
    setScore(data.score);
    setCompletedPositions(data.completedPositions);
    setTurn(data.turn);
  });
  socket?.on("update", (data) => {
    const { board, turn, score, completedPositions } = data;
    setTurn(turn);
    setScore(score);
    setBoard(board);
    setCompletedPositions(completedPositions);
  });
  const handleChange = (e) => {
    const num = parseInt(e.target.value);
    setBoardSize(num);
    resetBoard();
  };
  const handleResetBoard = () => {
    socket?.emit("reset");
  };
  return (
    <>
      {!connected && (
        <PlayerForm
          handleChange={(e) => setPlayerName(e.target.value)}
          handleSubmit={handleSubmit}
        />
      )}
      {connected && !opponentName && (
        <h1 style={{ color: "white" }}>Esperando oponente...</h1>
      )}
      {connected && opponentName && (
        <>
          <h1 style={{ color: "white" }}>
            Hola{" "}
            <em style={{ color: isHost ? "#dc3545" : "#007bff" }}>
              {playerName}
            </em>
            , tu rival es:{" "}
            <em style={{ color: isHost ? "#007bff" : "#dc3545" }}>
              {opponentName}
            </em>
          </h1>
          <h2 style={{ color: turn ? "#007bff" : "#dc3545" }}>
            {turn && !isHost
              ? "Your turn"
              : !turn && !isHost
              ? "Opponent's turn"
              : !turn && isHost
              ? "Your turn"
              : "Opponent's turn"}
          </h2>
          {/* <select name="size" onChange={handleChange}>
            <option value={5}>5x5</option>
            <option value={6}>6x6</option>
            <option value={7}>7x7</option>
          </select> */}
          <h3 style={{ color: "white" }} className="score">
            Red: {score[0]} Blue: {score[1]}
          </h3>

          <Board
            board={board}
            boardSize={boardSize}
            completedPositions={completedPositions}
            handleClick={handleClick}
          />
          {isHost ? (
            <button className={"reset-board-button"} onClick={handleResetBoard}>
              Reset Board
            </button>
          ) : null}
        </>
      )}

      {showModalWinner && (
        <ModalWinner
          lastWinner={lastWinner}
          toggleModalWinner={toggleModalWinner}
        />
      )}
    </>
  );
}

export default App;
