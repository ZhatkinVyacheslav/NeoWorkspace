import React from "react";
import "../css/style.css";
import { AvatarB, ExitDoor } from "./IconsComponent";

function UserInformation(props) {
  return (
    <div className="user-information-container">
      <div className="main-information">
        <div className="avatar-username-role">
          <div className="avatarB">
            <AvatarB className="avatarB-img" />
            <div className="text-nearbyB-img">
              <span className="white-logo-text big-text">{props.userName}</span>
            </div>
          </div>
        </div>
        <div className="information">
          <span className="inf-text">Кликов в этом приложении: 2</span>
          <span className="inf-text">Выполненых проектов: 1</span>
          <span className="inf-text">Участи в проектах: 2</span>
        </div>
      </div>
      <button className="hidden-button">
        <div className="exit">
          <span className="exit-text">Выйти</span>
          <ExitDoor></ExitDoor>
        </div>
      </button>
    </div>
  );
}

export default UserInformation;
