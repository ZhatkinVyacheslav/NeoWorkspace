import React from "react";
import styles from "./../css/RegistrationPage.module.css";
import axios from 'axios';
import {Navigate, useNavigate} from 'react-router-dom';

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
    const user = localStorage.getItem('user');
    if (user) {
      this.setState({ field1Value: user });
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

  handleRoomTest = () => {
    this.props.navigate('/room');
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
  if (redirectToLogin) {
    return <Navigate to="/" replace />;
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
              Логин пользователя:
              <input type="text" name="field1" value={this.state.field1Value} className={styles.formControl} readOnly />
            </label>
            <button type="submit" className={styles.submitButton}>Выйти из сессии</button>
            <button type="button" className={styles.submitButton} onClick={this.handleCheckSession}>Проверить активность сессии</button>
            <button type="button" className={styles.submitButton} onClick={this.handleRoomTest}>Тестирование комнат</button>
            {this.state.sessionStatus && <p>{this.state.sessionStatus}</p>}
          </form>
        </div>
    );
  }
}

export default function(props) {
  const navigate = useNavigate();

  return <TestHomePage {...props} navigate={navigate} />;
}