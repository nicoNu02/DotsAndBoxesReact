import { useState } from "react";

const useModals = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  return [showModal, toggleModal];
};

export default useModals;
