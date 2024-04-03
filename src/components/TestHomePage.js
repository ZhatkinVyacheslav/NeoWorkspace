import React from "react";
import styles from "./../css/RegistrationPage.module.css";
import axios from 'axios';
import { Navigate } from 'react-router-dom';

class TestHomePage extends React.Component {
  state = {
    sessionStatus: null,
    redirectToLogin: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      field1Value: ''
    };
  }
  
  componentDidMount() {
    // Получаем значение user из localStorage при монтировании компонента
    const user = localStorage.getItem('user');
    if (user) {
      this.setState({ field1Value: user }); // Устанавливаем значение поля
    }
  }

  handleLogout = async (event) => {
    event.preventDefault();
    console.log('Submit logout request');
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const response = await axios.post('http://localhost:5000/api/logout');
      console.log(response.data);
      // Проверяем статус ответа сервера
      if (response.status === 200) {
        console.log('Successfully logged out');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } else {
        // Обрабатываем другие статусы ответа сервера
        console.error("Error on logout request: ", response.data);
        alert('Произошла ошибка при выходе. Попробуйте снова.');
      }
    } catch (error) {
      console.error("Error on logout request: ", error);
      // Проверяем статус ответа сервера
      if (error.response && error.response.status === 401) {
        // Если статус 401, выводим сообщение об ошибке
        alert('Неудачная попытка выхода. Token = null');
      } else {
        // Другие ошибки сервера
        alert('Произошла ошибка при выходе. Попробуйте снова.');
      }
    }
  }

  handleCheckSession = async () => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const response = await axios.get('http://localhost:5000/api/check-session');
      if (response.data.status === 'active') {
        this.setState({ sessionStatus: 'Активна' });
      } else {
        this.setState({ redirectToLogin: true });
      }
    } catch (error) {
      console.error("Error on session check request: ", error);
      this.setState({ redirectToLogin: true });
    }
  }
  render() {
    if (this.state.redirectToLogin) {
      return <Navigate to="/" replace />;
    }
    return (
      <div>
        <form className={styles.form} onSubmit={this.handleLogout}>
          <h1>Тестовая страничка</h1>
          <label>
            Поле1:
            <input type="text" name="field1" value={this.state.field1Value} className={styles.formControl} readOnly />
          </label>
          <label>
            Поле2:
            <input type="text" name="field2" className={styles.formControl} />
          </label>
          <button type="submit" className={styles.submitButton}>Выйти из сессии</button>
          <button type="button" className={styles.submitButton} onClick={this.handleCheckSession}>Проверить активность сессии</button>
          {this.state.sessionStatus && <p>{this.state.sessionStatus}</p>}
        </form>
      </div>
    );
  }
}

export default TestHomePage;
