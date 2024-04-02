const bcrypt = require('bcrypt')
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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

// Секретный ключ для токенов.
const secretKey = 'jeWebTokenQPzwmi';

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
const createInvalidTokensTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.invalid_tokens (
          ID SERIAL PRIMARY KEY,
          Token VARCHAR(255) UNIQUE NOT NULL
        )
      `);
    await client.query('COMMIT');
    console.log('Invalid tokens table created');
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

// Создаем таблицу пользователей при старте сервера
createUsersTable().catch(err => {
  console.error('Error creating table:', err);
  process.exit(1);
});

// Создаем таблицу сессий при старте сервера
createSessionTable().catch(err => {
  console.error('Error creating table:', err);
  process.exit(1);
});

// Создаем таблицу недействительных токенов при старте сервера
createInvalidTokensTable().catch(err => {
  console.error('Error creating invalid tokens table:', err);
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

    // Создаем токен и отправляем его в заголовке с response.
    const token = jwt.sign({ id: existingUser.rows[0].id }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (e) {
      console.error('Login Error: ', e);
      res.status(500).json({ message: 'Login failed.' });
    }
});

// Проверка JWT токена при запросах
app.use((req, res, next) => {
  const authHeader = req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  // Проверяем токен на наличие в таблице недействительных токенов
  pool.query('SELECT * FROM invalid_tokens WHERE Token = $1', [token], (error, results) => {
    if (error) {
      return res.sendStatus(403);
    }

    if (results.rows.length > 0) {
      return res.sendStatus(403);
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  });
});


// Обработка logout запроса пользователя.
app.post('/api/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    await client.query('INSERT INTO invalid_tokens (Token) VALUES ($1)', [token]);
    await client.query('COMMIT');
    client.release();

    res.sendStatus(200);
  } catch (e) {
    console.error('Logout Error: ', e);
    res.status(500).json({ message: 'Logout failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
