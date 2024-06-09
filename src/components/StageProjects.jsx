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
      stages: [],
      openUsers: false,
      openAddtage: false,
      selectedComponent: null,
      newStageName: "",
      newStageWeight: "",
    };
    // this.handleStageChange = this.handleStageChange.bind(this);
    // this.handleClickOpen = this.handleClickOpen.bind(this);
    // this.handleClose = this.handleClose.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleFormSubmit = this.handleFormSubmit.bind(this);
    // this.handleAddEmptyStage = this.handleAddEmptyStage.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    // Check if the project has changed
    if (this.props.nameProject !== prevProps.nameProject) {
      // Fetch the new stages from the server or update the state with the new stages
      this.props.socket.emit('fetch-stages', { roomCode: this.props.roomCode });

      this.props.socket.on('fetch-stages-response', (data) => {
        const stages = data.stages.map(stage => ({
          name: stage.stagename,
          weight: stage.weight,
          completed: stage.completed || false
        }));
        this.setState({ stages: stages });
      });
    }
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

  handleStageChange = (index, stageName, isChecked) => {
    console.log(index, stageName, isChecked);
    // Update the stage's 'completed' state
    this.props.stages[index].completed = isChecked;
    // Emit the 'stages-updated' event to the server with the updated stages
    if (this.props.socket) {
      this.props.socket.emit('stages-updated', { roomCode: this.props.roomCode, stages: this.props.stages });
    }
    // Emit the 'update-stage' event to the server with the stage name and the new completion status
      if (this.props.socket) {
        this.props.socket.emit('update-stage', {
          roomCode: this.props.roomCode,
          stageName: stageName,
          completed: isChecked
        });
      }
    setTimeout(() => {
      this.props.socket.emit('fetch-user-projects', { userID: this.props.userID });
    }, 5000);
    // Force a re-render of the StatusAndStageName component
    this.forceUpdate();
  };

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
              index={index}
              stageName={stage.name}
              iconType={stage.completed ? "green" : "red"}
              onChange={this.handleStageChange}
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
              socket={this.props.socket}
              roomCode={this.props.roomCode}
          />
        </div>
      </div>
    );
  }
}

export default StageProjects;
