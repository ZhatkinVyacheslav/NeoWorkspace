import React from "react";
import { Avatar } from "./IconsComponent";
import "../css/style.css";

function User(props) {
  return (
    <div className="avatar-user1">
      <Avatar className="avatar-user-img" />
      <div className="Name-and-role">
        <span className="Name-user">{props.userName}</span>
        <span className="Role-user">{props.userRole}</span>
      </div>
    </div>
  );
}

export default User;
