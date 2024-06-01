const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'TestingDB',
    user: 'neowflteam',
    password: 'Qa1Ol0Sx2Km8'
});

const secretKey = 'jeWebTokenQPzwmi';

exports.login = async (req, res) => {
    // Handle user login
    const { login, password } = req.body;
    try {
        const client = await pool.connect();
        const existingUser = await client.query('SELECT * FROM users WHERE Login = $1', [login]);
        client.release();

        if (!existingUser.rows.length) {
            return res.status(400).json({ message: 'Пользователь не найден.' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: existingUser.rows[0].id }, secretKey, {
            expiresIn: '12h'
        });
        res.status(200).json({ token });
    } catch (e) {
        console.error('Login Error: ', e);
        res.status(500).json({ message: 'Login failed.' });
    }
};

exports.register = async (req, res) => {
    // Handle user registration
    const { login, password, permissions } = req.body;
    try {
        const client = await pool.connect();
        const existingUser = await client.query('SELECT * FROM users WHERE Login = $1', [login]);
        client.release();

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newClient = await pool.connect();
        await newClient.query('BEGIN');
        const result = await newClient.query(
            'INSERT INTO users (Login, Password, Permissions) VALUES ($1, $2, $3) RETURNING *', [login, hashedPassword, permissions]
        );
        await newClient.query('COMMIT');
        newClient.release();

        console.log('Successfully registered');
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error('Registration Error: ', e);
        res.status(500).json({ message: 'Registration failed.' });
    }
};

exports.checkSession = async (req, res) => {
    // Check if user's session is active
    const token = req.headers.authorization.split(' ')[1];
    try {
        const client = await pool.connect();
        const invalidToken = await client.query('SELECT * FROM invalid_tokens WHERE Token = $1', [token]);
        client.release();

        if (invalidToken.rows.length > 0) {
            return res.status(401).json({ status: 'inactive' });
        }

        return res.status(200).json({ status: 'active' });
    } catch (error) {
        console.error('Error on session check request: ', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
