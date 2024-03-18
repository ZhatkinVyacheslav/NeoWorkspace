import React, { Component } from "react";
import styles from "./../css/RegistrationPage.module.css";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import RegistrationPage from "./RegistrationPage";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: "", 
      password: "",
    };
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
        <h1>Вход:</h1>
        <div className={styles.formGroup}>
          <label htmlFor="login">Логин:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={this.state.login}
            onChange={this.handleInputChange}
            required
            className={styles.formControl}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={this.state.password}
            onChange={this.handleInputChange}
            required
            className={styles.formControl}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Войти
        </button>
        <div>
          <p>
            Если у вас нет страницы, то вы можете{" "}
            <Link to="/registration" style={{ color: "blue" }}>
              зарегистрироваться
            </Link>
            .
          </p>
        </div>
      </form>
    );
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
