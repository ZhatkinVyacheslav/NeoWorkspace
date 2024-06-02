import React from "react";
import "./../css/style.css";
import { Folder } from "./IconsComponent";

function UserFiles(props) {
  return (
    <div class="user-files">
      <Folder class="folder-img"></Folder>
      <span class="files-text">{props.fileName} (Добавил: {props.userName})</span>
    </div>
  );
}

export default UserFiles;
