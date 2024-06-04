import React from "react";
import "../css/style.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import ProjectsSpace from "./ProjectsSpace";
import Header from "./Header";
import StageProjects from "./StageProjects";
import StageIformation from "./StageInformation";

class TestHomePage extends React.Component {
  state = {
    sessionStatus: null,
    redirectToLogin: false,
user = localStorage.getItem('user');
    selectedName: '',
    selectedItem: false,
  };

  componentDidMount() {
    const user = localStorage.getItem("user");
    if (user) {
      this.setState({ field1Value: user });
    }
  }
  handleSelectProject = (projectName) => {
    this.setState({ selectedName: projectName });
    this.setState({ selectedItem: true});
  };

  handleLogout = async (event) => {
    event.preventDefault();
    console.log("Submit logout request");
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const response = await axios.post("http://localhost:5000/api/logout");
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 200) {
        console.log("Successfully logged out");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } else {
        // Обрабатываем другие статусы ответа сервера
        console.error("Error on logout request: ", response.data);
        alert("Произошла ошибка при выходе. Попробуйте снова.");
      }
    } catch (error) {
      console.error("Error on logout request: ", error);
      // Проверяем статус ответа сервера
      if (error.response && error.response.status === 401) {
        // Если статус 401, выводим сообщение об ошибке
        alert("Неудачная попытка выхода. Token = null");
      } else {
        // Другие ошибки сервера
        alert("Произошла ошибка при выходе. Попробуйте снова.");
      }
    }
  };

  handleCheckSession = async () => {
    const token = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const response = await axios.get(
        "http://localhost:5000/api/check-session"
      );
      if (response.data.status === "active") {
        this.setState({ sessionStatus: "Активна" });
      } else {
        this.setState({ redirectToLogin: true });
      }
    } catch (error) {
      console.error("Error on session check request: ", error);
      this.setState({ redirectToLogin: true });
    }
  };

  render() {
    const { selectedName } = this.state;
    if (this.state.redirectToLogin) {
      return <Navigate to="/TestHomePage" replace />;
    }
    return (
      <div className="full-screen-container">
        <div className="home-container">
          <Header />
          <ProjectsSpace onSelect={this.handleSelectProject} />
          <StageIformation selectedItem={selectedName} />
          <StageProjects nameProject={selectedName} selected={this.state.selectedItem} projectCode="Новый код"/>
        </div>
      </div>
    );
  }
}

export default TestHomePage;
