import React from "react";
import "./../css/style.css";
import { Folder } from "./IconsComponent";

function UserFiles(props) {
  return (
    <div className="user-files">
      <Folder className="folder-img"></Folder>
      <span className="files-text">{props.fileName} (Добавил: {props.userName})</span>
    </div>
  );
}

export default UserFiles;
