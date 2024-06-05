import React from "react";
import { PlusB } from "./IconsComponent";
import User from "./User";
import "../css/formDialog.css";
import "../css/style.css";

class UserInProject extends React.Component {
  state = {
    componentUsers: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.users && nextProps.users !== prevState.componentUsers) {
      let componentUsers = nextProps.users.map((user, index) => (
          <User
              key={index}
              userName={user.name}
              userRole={user.role}
          />
      ));
      return { componentUsers };
    }
    return null;
  }

  render() {
    const { isOpen, closeModal } = this.props;

    if (!isOpen) return null;

    return (
        <div className="UsersDialogOverlay">
          <div className="users-container">
            <div className="close-and-text1">
              <div className="users-and-icon1">
                <span className="main-text1">Участники проекта</span>
                <PlusB className="plus-users-icon1"></PlusB>
              </div>
              <button className="modal-close1" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="users">
              <div>{this.state.componentUsers}</div>
            </div>
          </div>
        </div>
    );
  }
}

export default UserInProject;
