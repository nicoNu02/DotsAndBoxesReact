const SquareCenter = ({ handleSquareClick, pos, completedPositions }) => {
  const containsPosRed = containsTuple(completedPositions.red, pos);
  const containsPosBlue = containsTuple(completedPositions.blue, pos);
  let stateClass = containsPosRed
    ? "completed-red"
    : containsPosBlue
    ? "completed-blue"
    : "";
  return (
    <div
      className={`square-center ${stateClass}`}
      onClick={handleSquareClick}
    ></div>
  );
};

export default SquareCenter;

function containsTuple(arr, targetTuple) {
  return arr.some((tuple) =>
    [...tuple].every((element, index) => element == targetTuple[index])
  );
}
