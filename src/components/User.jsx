import React from "react";
import { Avatar } from "./IconsComponent";
import "../css/style.css";
import "../css/formDialog.css";

function User(props) {
  return (
    <div class="avatar-user1">
      <Avatar className="avatar-user-img" />
      <div class="Name-and-role">
        <span class="Name-user">{props.userName}</span>
        <span class="Role-user">{props.userRole}</span>
      </div>
    </div>
  );
}

export default User;
