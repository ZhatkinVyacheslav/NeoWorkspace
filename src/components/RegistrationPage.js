import React, { Component } from 'react';
import styles from './../css/RegistrationPage.module.css'
import {Link} from "react-router-dom";
import axios from 'axios';

class RegistrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      password: '',
      confirmpassword: '',
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
    const {login, password, confirmpassword} = this.state;
    if(password !== confirmpassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', {login, password});
      console.log(response.data);
    } catch (e) {
      console.error("Registration Error: ", e);
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
         <h1>Регистарция:</h1>
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
            Если у вас есть страница, то вы можете{" "}
            <Link to="/" style={{ color: "blue" }}>
              войти
            </Link>
            .
          </p>
        </div>
      </form>
    );
  }
}


export default RegistrationPage;