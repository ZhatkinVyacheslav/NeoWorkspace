import React, { Component } from "react";
import "./../css/style.css";
import { GroupUsers, Settings, Plus } from "./IconsComponent";
import StatusAndStageName from "./StatusAndStageName";
import UserInProject from "./UsersInProject";

class StageProjects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      componentSNaS: [],
      open: false,
      newStageName: '',
      newStageWeight: '',
    };
    this.handleStageChange = this.handleStageChange.bind(this);
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleAddEmptyStage = this.handleAddEmptyStage.bind(this);
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
      return {componentSNaS};
    }
    return null;
  }

  handleStageChange(index)
  {
    this.props.onStageChange(index);
  }

  handleClickOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleInputChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  handleFormSubmit = (event) => {
    event.preventDefault();
    this.props.onAddStage(this.state.newStageName, this.state.newStageWeight);
    this.setState({newStageName: '', newStageWeight: ''});
    console.log("Submitting stages");
  };

  handleAddEmptyStage = () => {
    this.setState(prevState => {
      const stages = prevState.stages ? [...prevState.stages, {name: '', weight: '', completed: false}] : [{
        name: '',
        weight: '',
        completed: false
      }];
      return {stages};
    });
  };

  render() {
    const { nameProject, projectCode, selectedProject } = this.props;

    if (!selectedProject) {
      return (
          <div className="stage-container">
            <span className="main-text">Выберите проект...</span>
          </div>
      )
    }

    return (
        <div className="stage-container">
          <div className="main-stage-content">
            <div className="project-and-icons">
              <span className="main-text">{nameProject}</span>
              <div className="project-icons">
                <button onClick={this.handleClickOpen} className="hidden-button">
                  <GroupUsers className="group_users-img"></GroupUsers>
                </button>
                <UserInProject
                    isOpen={this.state.open}
                    closeModal={this.handleClose}
                    users={this.props.users}
                />
                <Settings className="settings-img"></Settings>
              </div>
            </div>
            <div className="stage-and-icon">
              <span className="stage-text">Этапы проекта</span>
              <Plus className="plus-img" onClick={this.handleAddEmptyStage}></Plus>
            </div>
            <div className="stages">
              {this.props.stages.map((stage, index) => (
                  <StatusAndStageName
                      key={index}
                      stageName={stage.name}
                      iconType={stage.completed ? "green" : "red"}
                      onChange={() => this.props.onStageChange(index)}
                      showCheckbox={true} // or false depending on the requirement
                  />
              ))}
            </div>
            <button onClick={this.props.submitStages}>Submit Stages</button>
            <form onSubmit={this.handleFormSubmit}>
              <input
                  type="text"
                  name="newStageName"
                  value={this.state.newStageName}
                  onChange={this.handleInputChange}
                  placeholder="Stage Name"
              />
              <input
                  type="number"
                  name="newStageWeight"
                  value={this.state.newStageWeight}
                  onChange={this.handleInputChange}
                  placeholder="Stage Weight"
              />
              <button type="submit">Add Stage</button>
            </form>
          </div>
          <div className="Project-code">
            <span className="main-text">Код: {projectCode}</span>
          </div>
        </div>
    );
  }
}

export default StageProjects;
