import React, { useState } from "react";
import "../css/formDialog.css";
import "../css/style.css";
import { Search } from "./IconsComponent";

const AddRoomFormDialog = ({ isOpen, onClose, onSubmit, userPermissions }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(inputValue);
    setInputValue("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
      <div className="formDialogOverlay">
        <div className="formDialogContainer">
          <div className="close-and-text">
          <span className="main-text-form">
            {userPermissions <= 1 ? "Введите название проекта" : "Введите код комнаты проекта"}
          </span>
            <button className="modal-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="search-projects2">
            <form className="form-search2" onSubmit={handleSubmit}>
              <input
                  type="text"
                  className="input-search"
                  placeholder={userPermissions <= 1 ? "Название проекта..." : "Код комнаты проекта..."}
                  name="search"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
              ></input>
              <button type="submit" className="search-button">
                <Search className="search-img"></Search>
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default AddRoomFormDialog;
