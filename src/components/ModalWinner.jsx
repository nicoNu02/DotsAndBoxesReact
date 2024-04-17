const ModalWinner = ({ lastWinner, toggleModalWinner }) => {
  return (
    <div className="modal-winner">
      <h1>
        {lastWinner[0]} Wins : {lastWinner[1]}
      </h1>
      <button
        type="button"
        className="close-modal-winner"
        onClick={toggleModalWinner}
      >
        Cerrar
      </button>
    </div>
  );
};

export default ModalWinner;
