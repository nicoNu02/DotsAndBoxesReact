const LineHorizontal = ({ handleClick, state }) => {
  const stateClass =
    state == 0 ? "" : state == 2 ? "selected-red" : "selected-blue";
  return (
    <div
      className={`line-horizontal ${stateClass}`}
      onClick={handleClick}
    ></div>
  );
};

export default LineHorizontal;
