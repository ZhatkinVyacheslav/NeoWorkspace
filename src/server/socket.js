const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { Pool } = require('pg');

const secretKey = 'jeWebTokenQPzwmi';
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'TestingDB',
    user: 'neowflteam',
    password: 'Qa1Ol0Sx2Km8'
});

const rooms = new Map(); // Define rooms map

module.exports = function(server) {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.query.token;
        console.log('Token:', token); // Log the token
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.log('Token verification error:', err);
                return next(new Error('Authentication error'));
            }
            console.log('Token is valid, decoded data:', decoded);
            socket.decoded = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log('User ID from token:', socket.decoded.id); // You can access the decoded token data like this

        socket.emit('user-id', {userID: socket.decoded.id});
        socket.on('join', async (data) => {
            const {roomID, userID} = data;
            console.log('Join event received with roomID:', roomID, 'and userID:', userID);

            // Fetch the user's name from the database
            const client = await pool.connect();
            const user = await client.query('SELECT * FROM users WHERE id = $1', [userID]);

            // Add the user to the room_users table
            await client.query('INSERT INTO room_users (roomID, userID) VALUES ($1, $2)', [roomID, userID]);

            // Emit the 'user-joined' event to the user who just joined
            socket.emit('user-joined', {user: {id: userID, name: user.rows[0].login}});

            // Emit the 'user-joined' event to other users in the room
            socket.broadcast.emit('user-joined', {user: {id: userID, name: user.rows[0].login}});

            client.release();
        });

        socket.on('create-room', async (data) => {
            const {token, userID, projectName} = data;

            // Verify the token and get the user ID
            jwt.verify(token, secretKey, async (err, decoded) => {
                if (err) {
                    console.log('Token verification error:', err);
                    return;
                }

                // Check if the user ID from the token matches the user ID from the client
                if (decoded.id !== userID) {
                    console.log('User ID mismatch:', decoded.id, userID);
                    return;
                }
                // Generate a unique room ID
                const roomID = crypto.randomBytes(16).toString('hex');

                // Generate a room code
                const roomCode = crypto.randomBytes(3).toString('hex');

                // Store the room in the database
                const client = await pool.connect();
                await client.query('INSERT INTO rooms (roomID, roomCode, teacherID, projectName) VALUES ($1, $2, $3, $4)', [roomID, roomCode, userID, projectName]);

                // Add the room creator to the room_users table
                await client.query('INSERT INTO room_users (roomID, userID) VALUES ($1, $2)', [roomID, userID]);

                // Fetch all users in the room
                const roomUsers = await client.query('SELECT * FROM room_users WHERE roomID = $1', [roomID]);

                // Emit the 'user-joined' event for all users in the room
                for (let i = 0; i < roomUsers.rows.length; i++) {
                    const roomUserID = roomUsers.rows[i].userid;
                    const roomUser = await client.query('SELECT * FROM users WHERE id = $1', [roomUserID]);
                    socket.emit('user-joined', {user: {id: roomUserID, name: roomUser.rows[0].login}});
                }

                client.release();

                rooms.set(roomID, {users: new Set([userID]), projectName});

                // Emit a 'room-created' event back to the client with roomID and roomCode
                socket.emit('room-created', {roomID, roomCode});
            });
        });

        socket.on('join', async (data) => {
            const {roomID, userID} = data;
            console.log('Join event received with roomID:', roomID, 'and userID:', userID);

            // Fetch the user's name from the database
            const client = await pool.connect();
            const user = await client.query('SELECT * FROM users WHERE id = $1', [userID]);

            // Check if the user is already in the room
            const roomUser = await client.query('SELECT * FROM room_users WHERE roomID = $1 AND userID = $2', [roomID, userID]);

            // If the user is not already in the room, add them
            if (!roomUser.rows.length) {
                await client.query('INSERT INTO room_users (roomID, userID) VALUES ($1, $2)', [roomID, userID]);
            }

            // Fetch all users in the room
            const roomUsers = await client.query('SELECT * FROM room_users WHERE roomID = $1', [roomID]);

            // Emit the 'user-joined' event for all users in the room
            for (let i = 0; i < roomUsers.rows.length; i++) {
                const roomUserID = roomUsers.rows[i].userid;
                const roomUser = await client.query('SELECT * FROM users WHERE id = $1', [roomUserID]);
                socket.emit('user-joined', {user: {id: roomUserID, name: roomUser.rows[0].login}});
            }

            client.release();
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            // When a client disconnects, remove them from all rooms
            rooms.forEach((value, roomID) => {
                if (value.users.has(socket.userID)) {
                    value.users.delete(socket.userID);
                }
            });
        });
    });
};
