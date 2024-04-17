import { useEffect, useState } from "react";
import "./App.css";
import Dot from "./components/Dot";
import LineHorizontal from "./components/LineHorizontal";
import LineVertical from "./components/LineVertical";
import SquareCenter from "./components/SquareCenter";
import Board from "./components/Board";
import useModals from "./hooks/useModals";
import ModalWinner from "./components/ModalWinner";
import { io } from "socket.io-client";
// const initialBoard = [
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
function fillBoard(boardSize) {
  let arr = [];
  let arr1 = Array(boardSize).fill(0);
  let arr2 = Array(boardSize + 1).fill(0);
  for (let i = 0; i <= boardSize * 2; i++) {
    if (i % 2 == 0) arr.push(arr1);
    else arr.push(arr2);
  }
  return arr;
}
const initialCompleted = {
  red: [],
  blue: [],
};

//horizontal = odd row
// vertical even row
const socket = io("http://localhost:3000", { autoConnect: true });
function App() {
  //TODO: GAME OVER WHEN PLAYER SCORE > BOARDSIZE^2 / 2
  const [boardSize, setBoardSize] = useState(5);
  let initialBoard = fillBoard(boardSize);
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState(false); // false = red -- true = blue
  const [score, setScore] = useState([0, 0]); // red--blue
  const [completedPositions, setCompletedPositions] =
    useState(initialCompleted);
  const [showModalWinner, toggleModalWinner] = useModals();
  const [lastWinner, setLastWinner] = useState([]);
  const [connected, setConnected] = useState(true);
  const handleClick = (row, col) => {
    const {
      newBoard: newSquarePosition,
      completed: completedSquare,
      points,
      squareCompleted,
      selected: selected,
    } = checkSquareCompleted(row, col, board, turn, completedPositions);
    setBoard(newSquarePosition);
    setCompletedPositions((prevCompletedPositions) => ({
      ...prevCompletedPositions,
      red: [...squareCompleted.red],
      blue: [...squareCompleted.blue],
    }));

    completedSquare
      ? turn
        ? setScore([score[0], score[1] + points])
        : setScore([score[0] + points, score[1]])
      : !selected && setTurn(!turn);
    socket.emit("board", newSquarePosition);
  };
  socket?.on("connect", (socket) => {
    setConnected(!connected);
  });
  const handleSquareClick = (row, col) => {};
  const resetBoard = () => {
    setBoard(initialBoard);
    setCompletedPositions(initialCompleted);
    setScore([0, 0]);
  };
  useEffect(() => {
    if (score[0] > (boardSize * boardSize) / 2) {
      setLastWinner(["Red", score[0]]);
      resetBoard();
      toggleModalWinner();

      console.log("red wins");
    }
    if (score[1] > (boardSize * boardSize) / 2) {
      setLastWinner(["Blue", score[1]]);
      resetBoard();
      toggleModalWinner();
      console.log("blue wins");
    }
  }, [score]);

  const handleChange = (e) => {
    const num = parseInt(e.target.value);
    setBoardSize(num);
    initialBoard = fillBoard(num);
    resetBoard();
  };
  return (
    <>
      {connected && (
        <div>
          <h1>Hola {socket.id}</h1>
          {console.log(connected)}
        </div>
      )}
      <select name="size" onChange={handleChange}>
        <option value={5}>5x5</option>
        <option value={6}>6x6</option>
        <option value={7}>7x7</option>
      </select>
      <h1 className="score">
        Red: {score[0]} Blue: {score[1]}
      </h1>
      <Board
        board={board}
        boardSize={boardSize}
        completedPositions={completedPositions}
        handleClick={handleClick}
        handleSquareClick={handleSquareClick}
      />
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

function checkSquareCompleted(row, col, board, turn, completedPositions) {
  const newBoard = deepCopyArray(board);
  let points = 0;
  let completed = false;
  let squareCompleted = { ...completedPositions };
  if (newBoard[row][col] != 0)
    return {
      newBoard: newBoard,
      completed: completed,
      squareCompleted: squareCompleted,
      selected: true,
    };

  newBoard[row][col] = turn ? 3 : 2;

  let topBorder = [];
  let rightBorder = [];
  let bottomBorder = [];
  let leftBorder = [];

  let secondTopBorder = [];
  let secondRightBorder = [];
  let secondBottomBorder = [];
  let secondLeftBorder = [];

  if (row % 2 == 0) {
    //horizontal
    if (row == 0) {
      //first row
      //check if it is already a completed square
      if (newBoard[row + 1][col + 1] == 4 || newBoard[row + 1][col + 1] == 5)
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
      topBorder = newBoard[row][col] != 0 ? [row, col] : [];
      rightBorder = newBoard[row + 1][col + 1] != 0 ? [row + 1, col + 1] : [];
      bottomBorder = newBoard[row + 2][col] != 0 ? [row + 2, col] : [];
      leftBorder = newBoard[row + 1][col] != 0 ? [row + 1, col] : [];
      // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
    } else if (row == newBoard.length - 1) {
      //last row
      if (newBoard[row - 1][col + 1] == 4 || newBoard[row - 1][col + 1] == 5)
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
      topBorder = newBoard[row - 2][col] != 0 ? [row - 2, col] : [];
      rightBorder = newBoard[row - 1][col + 1] != 0 ? [row - 1, col + 1] : [];
      bottomBorder = newBoard[row][col] != 0 ? [row, col] : [];
      leftBorder = newBoard[row - 1][col] != 0 ? [row - 1, col] : [];
    } else {
      //middle rows
      if (newBoard[row + 1][col + 1] != 4 && newBoard[row + 1][col + 1] != 5) {
        topBorder = newBoard[row][col] != 0 ? [row, col] : [];
        rightBorder = newBoard[row + 1][col + 1] != 0 ? [row + 1, col + 1] : [];
        bottomBorder = newBoard[row + 2][col] != 0 ? [row + 2, col] : [];
        leftBorder = newBoard[row + 1][col] != 0 ? [row + 1, col] : [];
        // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
        if (
          newBoard[row - 1][col + 1] != 4 &&
          newBoard[row - 1][col + 1] != 5
        ) {
          secondTopBorder = newBoard[row - 2][col] != 0 ? [row - 2, col] : [];
          secondRightBorder =
            newBoard[row - 1][col + 1] != 0 ? [row - 1, col + 1] : [];
          secondBottomBorder = newBoard[row][col] != 0 ? [row, col] : [];
          secondLeftBorder = newBoard[row - 1][col] != 0 ? [row - 1, col] : [];
          // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
        }
      } else
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
    }
  } else {
    //vertical
    if (col == 0) {
      //left column
      if (newBoard[row][col + 1] == 4 || newBoard[row][col + 1] == 5)
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
      topBorder = newBoard[row - 1][col] != 0 ? [row - 1, col] : [];
      rightBorder = newBoard[row][col + 1] != 0 ? [row, col + 1] : [];
      bottomBorder = newBoard[row + 1][col] != 0 ? [row + 1, col] : [];
      leftBorder = newBoard[row][col] != 0 ? [row, col] : [];
      // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
    } else if (col == newBoard[1].length - 1) {
      //right column
      //check if it is already a completed square
      if (newBoard[row][col] == 4 || newBoard[row][col] == 5)
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
      topBorder = newBoard[row - 1][col - 1] != 0 ? [row - 1, col - 1] : [];
      rightBorder = newBoard[row][col] != 0 ? [row, col] : [];
      bottomBorder = newBoard[row + 1][col - 1] != 0 ? [row + 1, col - 1] : [];
      leftBorder = newBoard[row][col - 1] != 0 ? [row, col - 1] : [];
      // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
    } else {
      //middle columns
      if (newBoard[row][col - 2] != 4 && newBoard[row][col - 2] != 5) {
        // left side
        topBorder = newBoard[row - 1][col - 1] != 0 ? [row - 1, col - 1] : [];
        rightBorder = newBoard[row][col] != 0 ? [row, col] : [];
        bottomBorder =
          newBoard[row + 1][col - 1] != 0 ? [row + 1, col - 1] : [];
        leftBorder = newBoard[row][col - 1] != 0 ? [row, col - 1] : [];
        // console.log(topBorder, rightBorder, bottomBorder, leftBorder);
        if (newBoard[row][col + 1] != 4 && newBoard[row][col + 1] != 5) {
          //right side
          secondTopBorder = newBoard[row - 1][col] != 0 ? [row + 1, col] : [];
          secondRightBorder = newBoard[row][col + 1] != 0 ? [row, col + 1] : [];
          secondBottomBorder =
            newBoard[row + 1][col] != 0 ? [row + 1, col] : [];
          secondLeftBorder = newBoard[row][col] != 0 ? [row, col] : [];
          // console.log(
          //   secondTopBorder,
          //   secondRightBorder,
          //   secondBottomBorder,
          //   secondLeftBorder
          // );
        }
      } else
        return {
          newBoard: newBoard,
          completed: completed,
          squareCompleted: squareCompleted,
        };
    }
  }

  if (
    topBorder.length &&
    rightBorder.length &&
    bottomBorder.length &&
    leftBorder.length
  ) {
    // newBoard[rightBorder[0]][rightBorder[1]] = turn ? 5 : 4;
    const squarePosition = [rightBorder[0], rightBorder[1]];

    turn
      ? (squareCompleted = {
          ...squareCompleted,
          blue: [...squareCompleted.blue, squarePosition],
        })
      : (squareCompleted = {
          ...squareCompleted,
          red: [...squareCompleted.red, squarePosition],
        });
    completed = true;
    points++;
  }

  if (
    secondTopBorder.length &&
    secondRightBorder.length &&
    secondBottomBorder.length &&
    secondLeftBorder.length
  ) {
    // newBoard[secondRightBorder[0]][secondRightBorder[1]] = turn ? 5 : 4;
    const squarePosition = [secondRightBorder[0], secondRightBorder[1]];
    turn
      ? (squareCompleted = {
          ...squareCompleted,
          blue: [...squareCompleted.blue, squarePosition],
        })
      : (squareCompleted = {
          ...squareCompleted,
          red: [...squareCompleted.red, squarePosition],
        });

    completed = true;
    points++;
  }
  return {
    newBoard: newBoard,
    completed: completed,
    points,
    squareCompleted,
  };
}

function deepCopyArray(arr) {
  return arr.map((innerArr) => [...innerArr]);
}
