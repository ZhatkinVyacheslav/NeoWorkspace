import React from "react";
import { Avatar } from "./IconsComponent";
import "./../css/style.css";

function AvatarAndName(props) {
  return (
    <div className="avatar">
      <Avatar className="avatar-img" />
      <div className="text-nearby-img">
        <span className="white-logo-text">{props.userName}</span>
      </div>
    </div>
  );
}

export default AvatarAndName;
