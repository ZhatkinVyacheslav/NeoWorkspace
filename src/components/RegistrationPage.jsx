import React, { Component } from 'react';
import styles from './../css/RegistrationPage.module.css'
import { Link } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import axios from 'axios';

class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      password: '',
      confirmpassword: '',
      permissions: '2', // 2 == Студент
      redirectAfterRegistration: false,
    };
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Submit pressed');
    let { login, password, confirmpassword, permissions } = this.state;
    if (password !== confirmpassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      if (login === 'Admin' && password === '0e2ac54e46a0766355d9c6bd219c306123be1a66') {
        permissions = '0'; // Администратор
      } else if (password === '0e2ac54e46a0766355d9c6bd219c306123be1a66') {
        permissions = '1'; // Преподаватель
      } else {
        permissions = '2'; // Студент
      }
      const response = await axios.post('http://localhost:5000/api/register', { login, password, permissions });
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 201) {
        // Если статус 201, выводим сообщение об успешном регистрации
        alert('Пользователь успешно зарегистрирован.');
        this.SubmitAndLogin();
        this.setState({ redirectAfterRegistration: true });
      }
    } catch (error) {
      console.error("Registration Error: ", error);
      // Проверяем статус ответа сервера
      if (error.response && error.response.status === 409) {
        // Если статус 409, выводим сообщение об ошибке
        alert('Пользователь с таким именем уже существует.');
      } else {
        // Другие ошибки сервера
        alert('Произошла ошибка при регистрации.');
      }
    }
  }

  SubmitAndLogin = async () => {
    const { login, password } = this.state;
    try {
      const response = await axios.post('http://localhost:5000/api/login', { login, password });
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 200) {
        // Статус 201 - успешный запрос на авторизацию
        console.log('Successful login request');
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', login);
        sessionStorage.setItem('token', response.data.token);
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
    if (this.state.redirectAfterRegistration) {
      return <Navigate to="/TestHomePage" replace />;
    }
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
        <h1>Регистарция</h1>
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
        <div className={styles.formGroup}>
          <label htmlFor="confirmpassword">Повторите пароль:</label>
          <input
            type="password"
            id="confirmpassword"
            name="confirmpassword"
            value={this.state.confirmpassword}
            onChange={this.handleInputChange}
            required
            className={styles.formControl}
          />
        </div>
        <button type="submit" className={styles.submitButton}>Зарегистрироваться</button>
        <div>
          <p>
            Если вы ранее регистрировались, то используйте форму {" "}
            <Link to="/" className={styles.linkTitle}>
              авторизации
            </Link>
            .
          </p>
        </div>
      </form>
    );
  }
}

export default RegistrationPage;
