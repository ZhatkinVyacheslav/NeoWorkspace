import React from "react";
import { Search, Pencil, PlusCircle } from "./IconsComponent";
import "./../css/style.css";
import Projectblock from "./ProjectBlock";
import AddRoomFormDialog from "./AddRoomFormDalog";

class ProjectsSpace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: null,
      projects: [],
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = (roomCode) => {
    // Здесь вы можете отправить код комнаты на сервер
    console.log(`Отправлен код комнаты: ${roomCode}`);
  };

  handleClickSelected = (index, project) => {
    this.setState({ selectedIndex: index, loading: true });
    this.props.onSelect(project.name, this.props.roomCode);
    this.props.joinRoomWithCode(project.roomCode);
  }

  componentDidMount() {
    const { projectName, roomCode, projectCompleteness } = this.props;
    if(this.props.projects){
      this.setState({ loading : false });
    }else{
      console.log('Loading...');
    }
    let componentProjects = (
        <Projectblock
            nameProject={`${projectName} | ${roomCode}`}
            persentProject={projectCompleteness}
            onClick={() => this.handleClickSelected(0, projectName)}
            className={this.state.selectedIndex === 0 ? 'selected' : ''}
        />
    );
    this.updateProjectBlocks();

    this.setState({ componentProjects });
  }
  componentDidUpdate(prevProps) {
    if (this.props.projects && this.props.projects !== prevProps.projects) {
      this.updateProjectBlocks();
    }
  }

  updateProjectBlocks = () => {
    const projectBlocks = this.props.projects.map((project, index) => {
      return (
          <Projectblock
              key={index}
              nameProject={`${project.name} | ${project.roomCode}`}
              persentProject={project.completeness}
              onClick={() => this.handleClickSelected(index, project)}
              className={this.state.selectedIndex === index ? 'selected' : ''}
          />
      );
    });

    this.setState({ componentProjects: projectBlocks });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
        nextProps.projectName !== prevState.projectName ||
        nextProps.roomCode !== prevState.roomCode ||
        nextProps.projectCompleteness !== prevState.projectCompleteness
    ) {
      return {
        projectName: nextProps.projectName,
        roomCode: nextProps.roomCode,
        projectCompleteness: nextProps.projectCompleteness
      };
    }
    // Return null to indicate no change to state.
    return null;
  }

  componentWillUnmount() {
    // Remove the event listener for window.onbeforeunload
    window.onbeforeunload = null;
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.socket) {
      this.socket.off('join', this.handleJoin);
    }
  }

  render() {
    console.log(this.props.loading);
    if (this.props.loading) {
      return <div>Loading...</div>; // Or render a spinner
    } else {
      const projectBlocks = this.props.projects.map((project, index) => {
        // If the project's name and roomCode are both 'None', don't render it
        if (project.name === 'None' && project.roomCode === 'None') {
          return null;
        }
        // Access the "completeness" value from the "projects" array for each project
        const completed = project.completeness;
        // Otherwise, render the Projectblock component
        return (
            <Projectblock
                key={index}
                nameProject={`${project.name} | ${project.roomCode}`}
                persentProject={completed}
                onClick={() => this.handleClickSelected(index, project)}
                className={this.state.selectedIndex === index ? 'selected' : ''}
            />
        );
      });
      return (
          <div className="projects-container">
            <div className="project-and-icons">
              <span className="main-text">Проект</span>
              <div className="project-icons">
                <Pencil className="pencil-img"></Pencil>
                <button onClick={this.handleClickOpen} className="hidden-button">
                  <PlusCircle alt="Plus Circle" className="plus-circle-img"/>
                </button>
                <AddRoomFormDialog
                    isOpen={this.state.open}
                    onClose={this.handleClose}
                    onSubmit={this.props.onSubmit}
                    userPermissions={this.props.userPermissions}
                />
              </div>
            </div>
            <div className="search-projects">
              <form className="form-search">
                <input
                    type="text"
                    className="input-search"
                    placeholder="Поиск.."
                    name="search"
                ></input>
                <button type="submit" className="search-button">
                  <Search className="search-img"></Search>
                </button>
              </form>
            </div>
            <div className="folder-projects">
              <div className="folder">
                <div className="folder-content1">
                  {projectBlocks}
                </div>
              </div>
            </div>
          </div>
      );
    }
  }
}

export default ProjectsSpace;
