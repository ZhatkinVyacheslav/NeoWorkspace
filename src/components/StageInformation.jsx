import React, { Component } from "react";
import UserFiles from "./UserFiles";
import "./../css/style.css";

class StageIformation extends Component {
  state = {};
  render() {
    const { selectedItem } = this.props;

    // if (!selectedItem) {
    //   return (
    //     <div className="project-informations-container">
    //       <div className="text-redactor"></div>
    //       <div className="attached-files-container">
    //         <span className="attached-files-text">Прикреплённые файлы</span>
    //       </div>
    //     </div>
    //   );
    // }
    return (
      <div className="project-informations-container">
        <div className="text-redactor">
          <h1> Тут какой-то текст</h1>
        </div>
        <div className="attached-files-container">
          <span className="attached-files-text">Прикреплённые файлы</span>
          <div className="files">
            <UserFiles fileName="Файл1" userName="Карагодин Андрей"></UserFiles>
            <UserFiles fileName="Файл2" userName="Карагодин Андрей"></UserFiles>
          </div>
        </div>
      </div>
    );
  }
}

export default StageIformation;
