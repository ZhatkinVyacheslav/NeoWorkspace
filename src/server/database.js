const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'TestingDB',
    user: 'neowflteam',
    password: 'Qa1Ol0Sx2Km8'
});

const createUsersTable = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.users (
                                                        ID SERIAL PRIMARY KEY,
                                                        Login VARCHAR(50) UNIQUE NOT NULL,
                Password VARCHAR(100) NOT NULL,
                Permissions VARCHAR(1) NOT NULL
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

async function createTables() {
    try {
        const client = await pool.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                                                 roomID VARCHAR(255) PRIMARY KEY,
                roomCode VARCHAR(6) NOT NULL,
                teacherID INTEGER REFERENCES users(id),
                projectName VARCHAR(255) NOT NULL
                );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS room_users (
                                                      roomID VARCHAR(255) REFERENCES rooms(roomID),
                userID INTEGER REFERENCES users(id),
                PRIMARY KEY (roomID, userID)
                );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS project_stages (
                                                          stageID SERIAL PRIMARY KEY,
                                                          projectID VARCHAR(255) REFERENCES rooms(roomID),
                stageName VARCHAR(255) NOT NULL,
                weight INTEGER NOT NULL,
                completed BOOLEAN DEFAULT FALSE
                );
        `);
        client.release();
    } catch (err) {
        console.error(err);
    }
}

module.exports = async function setupDatabase() {
    await createUsersTable().catch(err => {
        console.error('Error creating table:', err);
        process.exit(1);
    });

    await createSessionTable().catch(err => {
        console.error('Error creating table:', err);
        process.exit(1);
    });

    await createInvalidTokensTable().catch(err => {
        console.error('Error creating invalid tokens table:', err);
        process.exit(1);
    });

    await createTables().catch(err => {
        console.error('Error creating table:', err);
        process.exit(1);
    });
};
