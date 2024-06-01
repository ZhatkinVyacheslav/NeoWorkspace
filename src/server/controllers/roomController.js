const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'TestingDB',
    user: 'neowflteam',
    password: 'Qa1Ol0Sx2Km8'
});

exports.createRoom = async (req, res) => {
    // Handle room creation
    const { userID, projectName } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO rooms (teacherID, projectName) VALUES ($1, $2) RETURNING *', [userID, projectName]
        );
        client.release();

        console.log('Successfully created room');
        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error('Room creation Error: ', e);
        res.status(500).json({ message: 'Room creation failed.' });
    }
};

exports.getRoomUsers = async (req, res) => {
    // Get the users in a room
    const { roomID } = req.params;
    try {
        const client = await pool.connect();
        const users = await client.query('SELECT * FROM room_users WHERE roomID = $1', [roomID]);
        client.release();

        if (!users.rows.length) {
            return res.status(404).json({ message: 'No users found in this room.' });
        }

        // Return the list of users
        res.json(users.rows);
    } catch (error) {
        console.error('Error on getting room users request: ', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getRoom = async (req, res) => {
    const { roomID } = req.params;
    try {
        const client = await pool.connect();
        const room = await client.query('SELECT * FROM rooms WHERE roomID = $1', [roomID]);
        client.release();

        if (!room.rows.length) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        res.json(room.rows[0]);
    } catch (error) {
        console.error('Error on getting room request: ', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { roomID } = req.params;
    try {
        const client = await pool.connect();
        await client.query('DELETE FROM rooms WHERE roomID = $1', [roomID]);
        client.release();

        res.status(200).json({ message: 'Room deleted successfully.' });
    } catch (error) {
        console.error('Error on deleting room request: ', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};