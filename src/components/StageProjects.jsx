import React, { Component } from "react";
import "./../css/style.css";
import { GroupUsers, Settings, Plus } from "./IconsComponent";
import StatusAndStageName from "./StatusAndStageName";
import UserInProject from "./UsersInProject";

class StageProjects extends Component {
  state = {
    componentSNaS: [],
    open: false,
  };

  componentDidMount() {
    const fetchedStageName = [
      "Пример сделанного вовремя",
      "Пример просроченного",
      "Пример в процессе выполнения",
    ];
    const fetchedStatusProject = ["green", "red", "yellow"];
    let componentSNaS = fetchedStageName.map((StageName1, index) => (
      <StatusAndStageName
        key={index}
        stageName={StageName1}
        iconType={fetchedStatusProject[index]}
      />
    ));
    this.setState({ componentSNaS });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { mainText, projectCode } = this.props;

    return (
      <div className="stage-container">
        <div className="main-stage-content">
          <div className="project-and-icons">
            <span className="main-text">{mainText}</span>
            <div className="project-icons">
              <button onClick={this.handleClickOpen} className="hidden-button">
                <GroupUsers className="group_users-img"></GroupUsers>
              </button>
              <UserInProject
                isOpen={this.state.open}
                closeModal={this.handleClose}
              ></UserInProject>
              <Settings className="settings-img"></Settings>
            </div>
          </div>
          <div className="stage-and-icon">
            <span className="stage-text">Этапы проекта</span>
            <Plus className="plus-img"></Plus>
          </div>
          <div className="stages">
            {" "}
            {this.state.componentSNaS}
            {/* <StatusAndStageName
              iconType="green"
              stageName="Пример сделанного вовремя"
            />
            <StatusAndStageName
              iconType="red" 
              stageName="Пример просроченного" 
            />
            <StatusAndStageName
              iconType="yellow"
              stageName="Пример в процессе выполнения"
            /> */}
          </div>
        </div>
        <div className="Project-code">
          <span className="main-text">Код: {projectCode}</span>
        </div>
      </div>
    );
  }
}

export default StageProjects;
