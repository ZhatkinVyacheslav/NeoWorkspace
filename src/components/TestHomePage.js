import React from "react";
import styles from "./../css/RegistrationPage.module.css";

class TestHomePage extends React.Component {
  render() {
    return (
      <div>
        <form className={styles.form}>
          <h1>Тестовая страничка</h1>
          <label>
            Поле1:
            <input type="text" name="field1" className={styles.formControl} />
          </label>
          <label>
            Поле2:
            <input type="text" name="field2" className={styles.formControl} />
          </label>
          <button className={styles.submitButton}>Выйти из сессии</button>
          <button className={styles.submitButton}>Активность сессии</button>
        </form>
      </div>
    );
  }
}

export default TestHomePage;
