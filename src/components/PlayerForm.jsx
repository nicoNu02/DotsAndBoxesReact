const PlayerForm = ({ handleSubmit, handleChange }) => {
  return (
    <form className="form-player" onSubmit={handleSubmit}>
      <input onChange={handleChange}></input>
      <button type="submit">Enviar</button>
    </form>
  );
};

export default PlayerForm;
