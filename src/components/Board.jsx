import useMediaQuery from "../hooks/useMedia";
import Dot from "./Dot";
import LineHorizontal from "./LineHorizontal";
import LineVertical from "./LineVertical";
import SquareCenter from "./SquareCenter";

const Board = ({
  boardSize,
  board,
  handleClick,
  handleSquareClick,
  completedPositions,
}) => {
  const md = useMediaQuery("(max-width: 500px)");
  const stylesLarge = {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, 20px 100px) 20px`,
    gridTemplateRows: `20px repeat(${boardSize}, 100px 20px)`,
  };
  const styleSmall = {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, 20px 50px) 20px`,
    gridTemplateRows: `20px repeat(${boardSize}, 50px 20px)`,
  };
  return (
    <div className="board-container" style={md ? styleSmall : stylesLarge}>
      {board.map((row, index) => {
        return row.map((el, i) => {
          return row.length == boardSize ? (
            i == 0 ? (
              <>
                <Dot key={`${index}${i}"dot"`} />
                <LineHorizontal
                  key={`${index}${i}"hor"`}
                  handleClick={() => handleClick(index, i)}
                  state={el}
                />
              </>
            ) : i == board[0].length - 1 ? (
              <>
                <Dot key={`${index}${i}"dot"`} />

                <LineHorizontal
                  key={`${index}${i}"hor"`}
                  handleClick={() => handleClick(index, i)}
                  state={el}
                />
                <Dot key={`${index}${i}"dot-2"`} />
              </>
            ) : (
              <>
                <Dot key={`${index}${i}"dot"`} />
                <LineHorizontal
                  key={`${index}${i}"hor"`}
                  handleClick={() => handleClick(index, i)}
                  state={el}
                />
              </>
            )
          ) : i == 0 ? (
            <>
              <LineVertical
                key={`${index}${i}"ver"`}
                handleClick={() => handleClick(index, i)}
                state={el}
              />
            </>
          ) : (
            <>
              <SquareCenter
                key={`${index}${i}"sqr"`}
                handleSquareClick={() => handleSquareClick(index, i)}
                pos={[index, i]}
                completedPositions={completedPositions}
              />
              <LineVertical
                key={`${index}${i}"ver"`}
                handleClick={() => handleClick(index, i)}
                state={el}
              />
            </>
          );
        });
      })}
    </div>
  );
};

export default Board;
