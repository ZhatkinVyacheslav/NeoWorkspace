import React, { Component } from "react";
import styles from "./../css/RegistrationPage.module.css";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import RegistrationPage from "./RegistrationPage";
import axios from 'axios';

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
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Submit login request');
    const { login, password } = this.state;
    try {
      localStorage.removeItem('token');
      const response = await axios.post('http://localhost:5000/api/login', { login, password });
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 200) {
        // Статус 201 - успешный запрос на авторизацию
        console.log('Successfull login request');
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      console.error("Error on login request: ", error);
      // Проверяем статус ответа сервера
      if (error.response && error.response.status === 409) {
        // Если статус 409, выводим сообщение об ошибке
        alert('Неудачная попытка входа. Проверьте логин и пароль.');
      } else {
        // Другие ошибки сервера
        alert('Произошла ошибка при входе. Попробуйте снова.');
      }
    }
  }


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
