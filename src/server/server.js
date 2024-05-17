const bcrypt = require('bcrypt')
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.json());
app.use(cors());

// Структура для хранения комнат и пользователей.
const rooms = new Map();

wss.on('connection', ((ws, req) => {
  // Пользователь подключается
  ws.on('message', (message) => {
    const {type, roomID, userID} = JSON.parse(message);
    if (type === 'join') {
      // Проверить комнату на существование
      if (!rooms.has(roomID)) {
        ws.send(JSON.stringify({type: 'error', message: 'Room not found'}));
        return;
      }
      // Добавим пользователя в комнату
      rooms.get(roomID).users.add(userID);
      ws.send(JSON.stringify({message: 'Successfully joined the room'}));
    }
  });
  ws.on('close', () => {
    // При отключении пользователя, удаляем его из всех комнат
    rooms.forEach((value, roomID) => {
      if (value.users.has(ws.userID)) {
        value.users.delete(ws.userID);
      }
    });
  });

  // Эндпоинт для создания комнаты
  app.post('/create-room', (req, res) => {
    const roomID = generateRoomId();
    rooms.set(roomID, {users: new Set()});
    res.json({roomID});
  });

  // Эндпоинт для добавления пользователя в комнату
  app.post('/add-user-to-room', (req, res) => {
    const {roomID, userID} = req.body;
    if (!rooms.has(roomID)) {
      res.status(404).json({message: 'Room not found'});
      return;
    }
    rooms.get(roomID).users.add(userID);
    res.json({message: 'Successfully added user to the room'});
  });

  function generateRoomId() {
    return Math.random().toString(36).substring(7);
  }
}));

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
          Password VARCHAR(100) NOT NULL,
          Permissions VARCHAR(1) UNIQUE NOT NULL
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
          Password VARCHAR(100) NOT NULL,
          Permissions VARCHAR(1) UNIQUE NOT NULL
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
  const { login, password, permissions } = req.body;
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
      'INSERT INTO users (Login, Password, Permissions) VALUES ($1, $2, $3) RETURNING *', [login, hashedPassword, permissions]
    );
    console.log(login);
    console.log(password);
    console.log(hashedPassword);
    console.log(permissions);
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
  let { login, password, rememberMe } = req.body;
  if(rememberMe == null) {
    rememberMe = false;
  }
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

    // Создаем токен и отправляем его в заголовке с response
    // Если checkbox "Remember me" выбран, то токен действителен 12 часов, иначе 1 час
    const token = jwt.sign({ id: existingUser.rows[0].id }, secretKey, {
      expiresIn: rememberMe ? '12h' : '4h'
    });
    res.status(200).json({ token });
  } catch (e) {
    console.error('Login Error: ', e);
    res.status(500).json({ message: 'Login failed.' });
  }
});

// Обработка logout запроса пользователя.
app.post('/api/logout', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Извлекаем токен из заголовка
  console.log('Start responding logout');
  try {
    // Проверяем, не является ли токен недействительным
    const client = await pool.connect();
    const invalidToken = await client.query('SELECT * FROM invalid_tokens WHERE Token = $1', [token]);
    client.release();

    if (invalidToken.rows.length > 0) {
      // Если токен недействительный, возвращаем ошибку
      return res.status(401).json({ message: 'Token is invalid.' });
    }

    // Добавляем токен в список недействительных токенов
    await client.query('INSERT INTO invalid_tokens (Token) VALUES ($1)', [token]);

    // Возвращаем успешный ответ
    return res.status(200).json({ message: 'Successfully logged out.' });
  } catch (error) {
    console.error('Error on logout request: ', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/rooms', (req, res) => {
  const userID = req.body.userID;

  // Generate a unique room ID
  const roomID = generateUniqueRoomID();

  // Store the room ID and user ID in your database

  // Respond with the room ID
  res.json({ roomID });
});

// Проверка JWT токена при запросах
app.use((req, res, next) => {
  const authHeader = req.headers['Authorization'];
  const token = req.headers.authorization.split(' ')[1]; // Извлекаем токен из заголовка

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

// Добавляем роут для проверки активности сессии
app.get('/api/check-session', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Извлекаем токен из заголовка

  try {
    // Проверяем, не является ли токен недействительным
    const client = await pool.connect();
    const invalidToken = await client.query('SELECT * FROM invalid_tokens WHERE Token = $1', [token]);
    client.release();

    if (invalidToken.rows.length > 0) {
      // Если токен недействительный, возвращаем статус "inactive"
      return res.status(401).json({ status: 'inactive' });
    }

    // Если токен валидный, возвращаем успешный ответ
    return res.status(200).json({ status: 'active' });
  } catch (error) {
    console.error('Error on session check request: ', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

function generateUniqueRoomID() {
  return crypto.randomBytes(16).toString('hex');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
