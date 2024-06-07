import React from "react";
import User from "./User";
import "../css/style.css";

class UserInProject extends React.Component {
  state = {
    componentUsers: [],
    isOpen: false,
  };

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.users && nextProps.users !== prevState.componentUsers) {
      let componentUsers = nextProps.users.map((user, index) => (
        <User key={index} userName={user.name} userRole={user.role} />
      ));
      return { componentUsers };
    }
    return null;
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeModal();
    }
  };

  render() {
    const { isOpen } = this.props;

    if (!isOpen) return null;

    return (
      <div className="users-container" ref={this.setWrapperRef}>
        <div className="users-and-icon1">
          <span className="main-text1">Участники проекта</span>
        </div>
        <div className="users">
          <div>{this.state.componentUsers}</div>
        </div>
      </div>
    );
  }
}

export default UserInProject;
