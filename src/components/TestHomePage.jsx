import React from "react";
import "../css/style.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Projectblock from "./ProjectBlock";
import ProjectsSpace from "./ProjectsSpace";
import Header from "./Header";
import StageProjects from "./StageProjects";
import StageIformation from "./StageInformation";

class TestHomePage extends React.Component {
  state = {
    sessionStatus: null,
    redirectToLogin: false,
    componentProjects: [],
    selectedItem: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      field1Value: "",
    };
  }

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

    const user = localStorage.getItem("user");
    if (user) {
      this.setState({ field1Value: user });
    }
  }

  handleItemSelect = (item) => {
    this.setState({ selectedItem: item });
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
    const { selectedItem } = this.state;
    if (this.state.redirectAfterLogin) {
      return <Navigate to="/TestHomePage" replace />;
    }
    return (
      <div className="full-screen-container">
        <div className="home-container">
          <Header />
          <ProjectsSpace onItemSelect={this.handleItemSelect} />
          <StageIformation selectedItem={selectedItem} />
          <StageProjects selectedItem={selectedItem} mainText="Пример1" projectCode="Новый код"/>
        </div>
      </div>
    );
  }
  defaults;
}

export default TestHomePage;
