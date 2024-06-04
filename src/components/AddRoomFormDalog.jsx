import React, { useState } from "react";
import "../css/formDialog.css";
import "../css/style.css";
import { Search } from "./IconsComponent";

const AddRoomFormDialog = ({ isOpen, onClose, onSubmit }) => {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(roomCode);
    setRoomCode("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="formDialogOverlay">
      <div className="formDialogContainer">
        <div className="close-and-text">
          <span className="main-text-form">Введите код комнаты проекта</span>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="search-projects2">
          <form className="form-search2">
            <input
              type="text"
              className="input-search"
              placeholder="Код комнаты проекта..."
              name="search"
            ></input>
            <button
              type="submit"
              className="search-button"
              handleSubmit={handleSubmit}
            >
              <Search className="search-img"></Search>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRoomFormDialog;
