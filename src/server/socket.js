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
const connectedUsers = new Map();

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

        socket.on('user-id', async () => {
            console.log('User ID event received');
            const client = await pool.connect();
            const user = await client.query('SELECT * FROM users WHERE id = $1', [socket.decoded.id]);
            const permissions = user.rows[0].permissions;
            socket.emit('user-id', {userID: socket.decoded.id, permissions});
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

                // Fetch the user's permission level from the database
                const client = await pool.connect();
                const user = await client.query('SELECT * FROM users WHERE id = $1', [userID]);
                const permissions = user.rows[0].permissions;
                // Check the user's permission level
                if (permissions > 1) {
                    console.log('User does not have permission to create a room');
                    socket.emit('error', {message: 'Students are not allowed to create rooms'});
                    client.release();
                    return;
                }

                // Generate a unique room ID
                const roomID = crypto.randomBytes(16).toString('hex');

                // Generate a room code with capital letters
                const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                // Store the room in the database
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

        socket.on('set-project', async (data) => {
            const {roomCode, projectName} = data;

            // Fetch the room's ID from the database using the room code
            const client = await pool.connect();
            const room = await client.query('SELECT * FROM rooms WHERE roomCode = $1', [roomCode]);

            if (room.rows.length > 0) {
                const roomID = room.rows[0].roomid;

                // Update the room's project name in the database
                await client.query('UPDATE rooms SET projectName = $1 WHERE roomID = $2', [projectName, roomID]);
                // Emit the 'set-project' event with the updated project name
                socket.emit('set-project', { projectName: data.projectName });
            } else {
                console.log(`No room found with code: ${roomCode}`);
            }
            client.release();
        });

        socket.on('add-stages', async (data) => {
            if (!data) {
                console.log('Data is undefined');
                return;
            }

            const { roomCode, stages } = data;

            // Fetch the room's ID from the database using the room code
            const client = await pool.connect();
            const room = await client.query('SELECT * FROM rooms WHERE roomCode = $1', [roomCode]);

            if (room.rows.length > 0) {
                const roomID = room.rows[0].roomid;

                // Process each stage
                for (let i = 0; i < stages.length; i++) {
                    const stage = stages[i];
                    // Check if the stage already exists in the database
                    const existingStage = await client.query(`
        SELECT * FROM project_stages
        WHERE projectid = $1 AND stagename = $2
      `, [roomID, stage.name]);

                    if (existingStage.rows.length > 0) {
                        // If the stage exists, update its 'completed' state
                        await client.query(`
          UPDATE project_stages
          SET completed = $1
          WHERE projectid = $2 AND stagename = $3
        `, [stage.completed, roomID, stage.name]);
                    } else {
                        // If the stage doesn't exist, insert it as a new stage
                        await client.query(`
          INSERT INTO project_stages (projectid, stagename, weight, completed)
          VALUES ($1, $2, $3, $4)
        `, [roomID, stage.name, stage.weight, stage.completed]);
                    }
                }
                // After updating the stages in the database, fetch the updated stages
                const updatedStages = await getStages(roomID);

                // Emit the 'stages-updated' event with the updated stages
                socket.emit('stages-updated', { stages: updatedStages });
            } else {
                console.log(`No room found with code: ${roomCode}`);
            }
            client.release();
        });

        socket.on('stages-updated', (data) => {
            const { roomCode, stages } = data;
            // Broadcast the 'stages-updated' event to all clients in the room
            socket.to(roomCode).emit('stages-updated', { stages });
        });

        socket.on('fetch-user-projects', async (data) => {
            const { userID } = data;
            console.log('Received fetch-user-projects event with userID:', userID);

            // Fetch all the projects that the user has access to from the 'room_users' table
            const client = await pool.connect();
            const userProjects = await client.query('SELECT * FROM room_users WHERE userid = $1', [userID]);

            const projects = [];

            if (userProjects.rows.length > 0) {
                for (let i = 0; i < userProjects.rows.length; i++) {
                    const roomID = userProjects.rows[i].roomid;
                    // Fetch the project details from the 'rooms' table using the room ID
                    const project = await client.query('SELECT * FROM rooms WHERE roomid = $1', [roomID]);
                    if (project.rows.length > 0) {
                        // Add the project details to the 'projects' array
                        projects.push({
                            name: project.rows[0].projectname,
                            roomCode: project.rows[0].roomcode,
                            completeness: await calculateProjectProgress(roomID)
                        });
                    }
                }
                console.log("Successful fetch projects");
                console.log(projects);
                socket.emit('fetch-user-projects-response', { success: true, projects });
            } else {
                projects.push({
                    name: 'None',
                    roomCode: 'None',
                    completeness: 0
                });
                console.log(projects);
                socket.emit('fetch-user-projects-response', { success: false, projects });
            }

            client.release();
        });

        socket.on('fetch-stages', async (data) => {
            const { roomCode } = data;

            // Fetch the room's ID from the database using the room code
            const client = await pool.connect();
            const room = await client.query('SELECT * FROM rooms WHERE roomCode = $1', [roomCode]);

            if (room.rows.length > 0) {
                const roomID = room.rows[0].roomid;

                // Fetch the stages from the database
                const stages = await getStages(roomID);

                // Emit the 'fetch-stages-response' event with the stages
                socket.emit('fetch-stages-response', { stages });
            } else {
                console.log(`No room found with code: ${roomCode}`);
            }
            client.release();
        });

        socket.on('delete-stages', async (data) => {
            const { roomCode } = data;

            // Fetch the room's ID from the database using the room code
            const client = await pool.connect();
            const room = await client.query('SELECT * FROM rooms WHERE roomCode = $1', [roomCode]);

            if (room.rows.length > 0) {
                const roomID = room.rows[0].roomid;

                // Delete the stages from the database
                await client.query('DELETE FROM project_stages WHERE projectid = $1', [roomID]);
            } else {
                console.log(`No room found with code: ${roomCode}`);
            }
            client.release();
        });

        socket.on('join', async (data) => {
            const {roomCode, userID} = data;
            console.log('Join event received with roomCode:', roomCode, 'and userID:', userID);

            // Fetch the room's ID and project name from the database using the room code
            const client = await pool.connect();
            const room = await client.query('SELECT * FROM rooms WHERE roomCode = $1', [roomCode]);

            if (room.rows.length > 0) {
                const roomID = room.rows[0].roomid;
                const projectName = room.rows[0].projectname; // Fetch the project name from the room

                // Fetch the user's name from the database
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
                    socket.emit('user-joined', {
                        user: {
                            id: roomUserID,
                            name: roomUser.rows[0].login,
                            permissions: roomUser.rows[0].permissions
                        }
                    });
                }

                // Fetch the current state of all stages from the database using the getStages function
                const stages = await getStages(roomID);

                // Emit the 'join' event with the room code, project name and stages
                socket.emit('join', { roomCode, projectName, stages });
            } else {
                console.log(`No room found with code: ${roomCode}`);
            }
            client.release();
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            // When a client disconnects, remove them from all rooms
            // When a client disconnects, remove them from all connected users
            connectedUsers.forEach((users, roomID) => {
                users.delete(socket.userID);
            });
            rooms.forEach((value, roomID) => {
                if (value.users.has(socket.userID)) {
                    value.users.delete(socket.userID);
                }
            });
        });
    });
};

const calculateProjectProgress = async (roomID) => {
    const client = await pool.connect();
    const stages = await client.query('SELECT * FROM project_stages WHERE projectid = $1', [roomID]);
    const totalWeight = stages.rows.reduce((total, stage) => total + Number(stage.weight), 0);
    const completedWeight = stages.rows.reduce((total, stage) => total + (stage.completed ? Number(stage.weight) : 0), 0);
    return (completedWeight / totalWeight) * 100;
};

const getStages = async (roomID) => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT stageName, weight, completed
      FROM project_stages
      WHERE projectid = $1
    `, [roomID]);
        return res.rows;
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
};
