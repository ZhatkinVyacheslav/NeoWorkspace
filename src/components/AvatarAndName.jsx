import React from "react";
import { Avatar } from "./IconsComponent";
import "./../css/style.css";

function AvatarAndName(props) {
  return (
    <div class="avatar">
      <Avatar className="avatar-img" />
      <div class="text-nearby-img">
        <span class="white-logo-text">{props.userName}</span>
      </div>
    </div>
  );
}

export default AvatarAndName;
