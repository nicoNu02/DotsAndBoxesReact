import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const initialCompletedPositions = {
  red: [],
  blue: [],
};
const boardSize = 5;
let board = fillBoard(boardSize);
const allUsers = {};
const allRooms = [];
let score = [0, 0];
let turn = false;
let completedPositions = initialCompletedPositions;
let opponentPlayer;
let currentUSer;
io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("req-to-play", (data) => {
    if (allRooms[0]) {
      if (!allRooms[0].player2.online) {
        currentUSer = allUsers[socket.id];
        currentUSer.playerName = data;

        for (const key in allUsers) {
          const user = allUsers[key];
          if (user.online && socket.id !== key) {
            opponentPlayer = user;
            break;
          }
        }
      } else if (!allRooms[0].player1.online) {
        opponentPlayer = allUsers[socket.id];
        opponentPlayer.playerName = data;

        for (const key in allUsers) {
          const user = allUsers[key];
          if (user.online && socket.id !== key) {
            currentUSer = user;
            break;
          }
        }
      }
    } else {
      currentUSer = allUsers[socket.id];
      currentUSer.playerName = data;

      for (const key in allUsers) {
        const user = allUsers[key];
        if (user.online && socket.id !== key) {
          opponentPlayer = user;
          break;
        }
      }
    }
    if (opponentPlayer) {
      allRooms[0] = {
        player1: opponentPlayer,
        player2: currentUSer,
      };
      currentUSer?.socket.emit("opponent-found", {
        opponentName: opponentPlayer?.playerName,
        board: board,
        isHost: false,
        completedPositions,
        score,
        turn,
      });
      opponentPlayer?.socket.emit("opponent-found", {
        opponentName: currentUSer?.playerName,
        board: board,
        isHost: true,
        completedPositions,
        score,
        turn,
      });
    }
    console.log(allRooms);
    console.log(
      opponentPlayer?.socket.connected,
      currentUSer?.socket.connected
    );
  });

  socket.on("lineClickedFromClient", (data) => {
    let actualTurn;
    if (socket.id === opponentPlayer.socket.id) {
      actualTurn = false;
    } else if (socket.id === currentUSer.socket.id) {
      actualTurn = true;
    }
    if (actualTurn === turn) {
      const { row, col, clientBoard } = data;
      const {
        newBoard,
        completedPositions: newCompletedPositions,
        newTurn,
      } = gameUpdate(row, col, clientBoard, turn, completedPositions);
      board = newBoard;
      completedPositions = newCompletedPositions;
      turn = newTurn;
    }

    if (
      score[0] <= (boardSize * boardSize) / 2 &&
      score[1] <= (boardSize * boardSize) / 2
    ) {
      currentUSer?.socket.emit("update", {
        board: board,
        score: score,
        turn: turn,
        completedPositions: completedPositions,
      });
      opponentPlayer?.socket.emit("update", {
        board: board,
        score: score,
        turn: turn,
        completedPositions: completedPositions,
      });
    }

    let lastWinner = [];
    if (score[0] > (boardSize * boardSize) / 2) {
      lastWinner = ["Red", score[0]];
      opponentPlayer?.socket.emit("winner", lastWinner);
      currentUSer?.socket.emit("winner", lastWinner);
    }
    if (score[1] > (boardSize * boardSize) / 2) {
      lastWinner = ["Blue", score[1]];
      opponentPlayer?.socket.emit("winner", lastWinner);
      currentUSer?.socket.emit("winner", lastWinner);
      board = fillBoard(boardSize);
      completedPositions = initialCompletedPositions;
      score = [0, 0];
      turn = false;
      currentUSer?.socket.emit("update", {
        board: board,
        score: score,
        turn: turn,
        completedPositions: completedPositions,
      });
      opponentPlayer?.socket.emit("update", {
        board: board,
        score: score,
        turn: turn,
        completedPositions: completedPositions,
      });
    }
  });

  socket.on("disconnect", (socket) => {
    console.log(
      socket,
      opponentPlayer.socket.connected,
      currentUSer.socket.connected
    );
    if (!opponentPlayer.socket.connected) {
      allRooms[0].player1.online = false;
    }
    if (!currentUSer.socket.connected) {
      allRooms[0].player2.online = false;
    }
    console.log(socket, allRooms);
    console.log("disconnect");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

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

function gameUpdate(row, col, board, turn, completedPositions) {
  let newTurn = turn;
  const {
    newBoard: newSquarePosition,
    completed: completedSquare,
    points,
    squareCompleted,
    selected: selected,
  } = checkSquareCompleted(row, col, board, newTurn, completedPositions);
  let newCompletedPositions = {
    ...completedPositions,
    red: [...squareCompleted.red],
    blue: [...squareCompleted.blue],
  };

  completedSquare && sumScore(newTurn, points);
  if (selected) {
    return {
      newBoard: newSquarePosition,
      completedPositions: newCompletedPositions,
      newTurn,
    };
  } else if (!selected && completedSquare) {
    return {
      newBoard: newSquarePosition,
      completedPositions: newCompletedPositions,
      newTurn,
    };
  } else if (!selected && !completedSquare) {
    newTurn = !turn;
    return {
      newBoard: newSquarePosition,
      completedPositions: newCompletedPositions,
      newTurn,
    };
  }
  // return {
  //   newBoard: newSquarePosition,
  //   completedPositions: newCompletedPositions,
  // };
}

function sumScore(turn, points) {
  if (turn) {
    score[1] = score[1] + points;
  } else {
    score[0] = score[0] + points;
  }
}

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
