import React from "react";
import { Users, Union, Envelope } from "./IconsComponent";
import "./../css/style.css";
import AvatarAndName from "./AvatarAndName";
import Popup from "reactjs-popup";
import UserInformation from "./UserInformation";
import AppSettings from "./AppSettings";
import MessegesSpace from "./MessegesSpace";
function Header() {
  const userName = localStorage.getItem("user"); // Get the username from local storage

  return (
    <div className="header-container">
      <div className="logo-container">
        <Users className="users-img"></Users>
        <div className="text-nearby-img">
          <span className="white-logo-text">Neo</span>
          <span className="blue-logo-text">Workspace</span>
        </div>
      </div>
      <div className="avatar-and-icons-container">
        <Popup
          trigger={
            <button type="submit" className="hidden-button">
              <AvatarAndName userName={userName}></AvatarAndName>
            </button>
          }
          position="bottom center"
        >
          <UserInformation userName={userName}></UserInformation>
        </Popup>
        <Popup
          trigger={
            <button type="submit" className="hidden-button">
              <Union alt="union" className="union-img" />
            </button>
          }
          position="bottom right"
        >
          <AppSettings></AppSettings>
        </Popup>
        <Popup
          trigger={
            <button type="submit" className="hidden-button">
              <Envelope className="envelope-img"></Envelope>
            </button>
          }
          position="bottom right"
          offsetX={16}
        >
          <MessegesSpace></MessegesSpace>
        </Popup>
      </div>
    </div>
  );
}

export default Header;
