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

  handleClickSelected = (index, text) => {
    this.setState({ selectedIndex: index });
    this.props.onSelect(text);
  }

  componentDidMount() {
    const { projectName, roomCode, projectCompleteness } = this.props;

    let componentProjects = (
        <Projectblock
            nameProject={`${projectName} | ${roomCode}`}
            persentProject={projectCompleteness}
            onClick={() => this.handleClickSelected(0, projectName)}
            className={this.state.selectedIndex === 0 ? 'selected' : ''}
        />
    );

    this.setState({ componentProjects });
  }

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

  render() {
    return (
      <div className="projects-container">
        <div className="project-and-icons">
          <span className="main-text">Проект</span>
          <div className="project-icons">
            <Pencil className="pencil-img"></Pencil>
            <button onClick={this.handleClickOpen} className="hidden-button">
              <PlusCircle alt="Plus Circle" className="plus-circle-img" />
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
              <Projectblock
                  nameProject={`${this.state.projectName} | ${this.state.roomCode}`}
                  persentProject={this.state.projectCompleteness}
                  onClick={() => this.handleClickSelected(0, this.state.projectName)}
                  className={this.state.selectedIndex === 0 ? 'selected' : ''}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectsSpace;
