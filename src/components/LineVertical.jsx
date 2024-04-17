const LineVertical = ({ handleClick, state, turn }) => {
  const stateClass =
    state == 0 ? "" : state == 2 ? "selected-red" : "selected-blue";

  return (
    <div className={`line-vertical ${stateClass}`} onClick={handleClick}></div>
  );
};

export default LineVertical;
