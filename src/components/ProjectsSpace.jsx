import React from "react";
import { Search, Pencil, PlusCircle } from "./IconsComponent";
import "./../css/style.css";
import Projectblock from "./ProjectBlock";
import AddRoomFormDialog from "./AddRoomFormDalog";

class ProjectsSpace extends React.Component {
  state = {
    selectedItem: null,
    componentProjects: [],
    open: false,
  };

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

  componentDidMount() {
    const fetchedProjectName = ["Проект1", "Проект2"];
    const fetchedProjectPercent = [38, 66];
    let componentProjects = fetchedProjectName.map((ProjectsName1, index) => (
      <Projectblock
        key={index}
        nameProject={ProjectsName1}
        persentProject={fetchedProjectPercent[index]}
      />
    ));
    this.setState({ componentProjects });
  }

  handleItemSelect = (item) => {
    this.setState({ selectedItem: item });
  };

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
              onSubmit={this.handleSubmit}
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
              {this.state.componentProjects}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectsSpace;
