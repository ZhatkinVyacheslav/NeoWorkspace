import React, { Component } from "react";
import "./../css/style.css";
import { GroupUsers, Settings, Plus } from "./IconsComponent";
import StatusAndStageName from "./StatusAndStageName";
import UserInProject from "./UsersInProject";
import AddStage from "./AddStage";

class StageProjects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      componentSNaS: [],
      openUsers: false,
      openAddtage: false,
      selectedComponent: null,
      newStageName: "",
      newStageWeight: "",
    };
    // this.handleStageChange = this.handleStageChange.bind(this);
    // this.handleClickOpen = this.handleClickOpen.bind(this);
    // this.handleClose = this.handleClose.bind(this);
    // this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleFormSubmit = this.handleFormSubmit.bind(this);
    // this.handleAddEmptyStage = this.handleAddEmptyStage.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.stages !== prevState.componentSNaS) {
      let componentSNaS = nextProps.stages.map((stage, index) => (
        <StatusAndStageName
          key={index}
          stageName={stage.name}
          iconType={stage.completed ? "green" : "red"}
          onChange={() => this.handleStageChange(index)}
        />
      ));
      return { componentSNaS };
    }
    console.log(this.state.stages.map);
    return null;
  }

  handleClickOpenUsers = () => {
    if (!this.state.openUsers) this.setState({ openUsers: true });
    else this.setState({ openUsers: false });
    if (this.state.openAddtage) this.setState({ openAddtage: false });
  };

  handleClickOpenAddStage = () => {
    if (!this.state.openAddtage) this.setState({ openAddtage: true });
    else this.setState({ openAddtage: false });
    if (this.state.openUsers) this.setState({ openUsers: false });
  };

  handleClose = () => {
    if (this.state.openUsers) this.setState({ openUsers: false });
    if (this.state.openAddtage) this.setState({ openAddtage: false });
  };

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleClose();
    }
  };

  handleStageChange(index) {
    this.props.onStageChange(index);
  }

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  SubmitNewStages1 = (stageName1, stageImportance1) => {
    this.props.submitStages(stageName1, stageImportance1);
  }

  handleFormSubmit = (event) => {
    event.preventDefault();
    this.props.onAddStage(this.state.newStageName, this.state.newStageWeight);
    this.setState({ newStageName: "", newStageWeight: "" });
    console.log("Submitting stages");
  };

  handleAddEmptyStage = () => {
    this.setState((prevState) => {
      const stages = prevState.stages
        ? [...prevState.stages, { name: "", weight: "", completed: false }]
        : [
            {
              name: "",
              weight: "",
              completed: false,
            },
          ];
      return { stages };
    });
  };

  componentWillUnmount() {
    // Remove the event listener for window.onbeforeunload
    window.onbeforeunload = null;
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.socket) {
      this.socket.off("join", this.handleJoin);
    }
  }

  render() {
    const { nameProject, projectCode, selectedProject } = this.props;
    const stages = this.props.stages.map((stage, index) => {
      return (
        <StatusAndStageName
          key={index}
          stageName={stage.name}
          iconType={stage.completed ? "green" : "red"}
          onChange={() => this.props.onStageChange(index)}
          showCheckbox={true}
          isChecked={stage.completed}
        />
      );
    });

    if (!selectedProject) {
      return (
        <div className="stage-container">
          <div className="stage-contant">
            <span className="main-text">Выберите проект...</span>
          </div>
        </div>
      );
    }

    return (
      // <div className="stage-container">
      //   <div className="stage-contant">
      //   <div className="main-stage-content">
      //     <div className="project-and-icons">
      //       <span className="main-text">{nameProject}</span>
      //       <div className="project-icons">
      //         <button onClick={this.handleClickOpen} className="hidden-button">
      //           <GroupUsers className="group_users-img"></GroupUsers>
      //         </button>
      //         <UserInProject
      //             isOpen={this.state.open}
      //             closeModal={this.handleClose}
      //             users={this.props.users}
      //         />
      //         <Settings className="settings-img"></Settings>
      //       </div>
      //     </div>
      //     <div className="stage-and-icon">
      //       <span className="stage-text">Этапы проекта</span>
      //       <Plus className="plus-img" onClick={this.handleAddEmptyStage}></Plus>
      //     </div>
      //     <div className="stages">
      //       {stages}
      //     </div>
      //     <button onClick={this.props.submitStages}>Submit Stages</button>
      //     <form onSubmit={this.handleFormSubmit}>
      //       <input
      //           type="text"
      //           name="newStageName"
      //           value={this.state.newStageName}
      //           onChange={this.handleInputChange}
      //           placeholder="Stage Name"
      //       />
      //       <input
      //           type="number"
      //           name="newStageWeight"
      //           value={this.state.newStageWeight}
      //           onChange={this.handleInputChange}
      //           placeholder="Stage Weight"
      //       />
      //       <button type="submit">Add Stage</button>
      //     </form>
      //   </div>
      //   <div className="Project-code">
      //     <span className="main-text">Код: {projectCode}</span>
      //   </div>
      //   </div>
      // </div>
      <div className="stage-container">
        <div className="stage-contant">
          <div className="main-stage-content">
            <div className="project-and-icons">
              <span className="main-text">{nameProject}</span>
              <div className="project-icons">
                <button
                  onClick={(event) => {
                    this.handleClickOpenUsers();
                    event.stopPropagation();
                  }}
                  className="hidden-button"
                >
                  <GroupUsers className="group_users-img"></GroupUsers>
                </button>
                <button className="hidden-button">
                  <Settings className="settings-img"></Settings>
                </button>
              </div>
            </div>
            <div className="stage-and-icon">
              <span className="stage-text">Этапы проекта</span>
              <button
                onClick={(event) => {
                  this.handleClickOpenAddStage();
                  event.stopPropagation();
                }}
                className="hidden-button"
              >
                <Plus className="plus-img"></Plus>
              </button>
            </div>
            <div className="stages">{stages}</div>
          </div>
          <div className="Project-code">
            <span className="main-text">Код: {projectCode}</span>
          </div>
        </div>
        <div className="user-in-project-content">
          <UserInProject
            isOpen={this.state.openUsers}
            closeModal={this.handleClose}
            users={this.props.users}
          ></UserInProject>
          <AddStage
              isOpen={this.state.openAddtage}
              closeAddStage={this.handleClose}
              setWrapperRef={this.setWrapperRef}
              SubmitNewStages={this.SubmitNewStages1}
              SubmitDataBased={this.props.submitStages}
          />
        </div>
      </div>
    );
  }
}

export default StageProjects;
