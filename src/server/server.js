const bcrypt = require('bcrypt')
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'TestingDB',
  user: 'neowflteam',
  password: 'Qa1Ol0Sx2Km8'
});

// Таблица пользователей
const createUsersTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.users (
          ID SERIAL PRIMARY KEY,
          Login VARCHAR(50) UNIQUE NOT NULL,
          Password VARCHAR(100) NOT NULL
        )
      `);
    await client.query('COMMIT');
    console.log('Table created');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// Таблица сессий
const createSessionTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.session (
          ID SERIAL PRIMARY KEY,
          Login VARCHAR(50) UNIQUE NOT NULL,
          Password VARCHAR(100) NOT NULL
        )
      `);
    await client.query('COMMIT');
    console.log('Table created');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// Создаем таблицу при старте сервера
createUsersTable().catch(err => {
  console.error('Error creating table:', err);
  process.exit(1);
});

// Создаем таблицу сессий при старте сервера
createSessionTable().catch(err => {
  console.error('Error creating table:', err);
  process.exit(1);
});

// Обрабатываем запрос регистрации
app.post('/api/register', async (req, res) => {
  const { login, password } = req.body;
  try {
    // Проверяем, существует ли пользователь с таким именем
    const client = await pool.connect();
    const existingUser = await client.query('SELECT * FROM users WHERE Login = $1', [login]);
    client.release();

    if (existingUser.rows.length > 0) {
      // Если пользователь существует, возвращаем ошибку
      return res.status(409).json({ message: 'User already exists.' });
    }

    // Если пользователя не существует, хешируем пароль и добавляем нового пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = await pool.connect();
    await newClient.query('BEGIN');
    const result = await newClient.query(
      'INSERT INTO users (Login, Password) VALUES ($1, $2) RETURNING *', [login, hashedPassword]
    );
    console.log(login);
    console.log(password);
    console.log(hashedPassword);
    await newClient.query('COMMIT');
    newClient.release();

    console.log('Successfully registered');
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('Registration Error: ', e);
    res.status(500).json({ message: 'Registration failed.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  console.log('Start responding login');
  try {
    // Проверяем, существует ли пользователь с таким именем
    const client = await pool.connect();
    console.log('login connected');
  
    const existingUser = await client.query('SELECT * FROM users WHERE Login = $1', [login]);
    console.log(existingUser.rows.length);
    client.release();
    console.log('released');

    if (!existingUser.rows.length) {
      return res.status(400).json({ message: 'Пользователь не найден.' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, existingUser.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(201).json(existingUser.rows[0]);
  } catch (e) {
      console.error('Login Error: ', e);
      res.status(500).json({ message: 'Login failed.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
