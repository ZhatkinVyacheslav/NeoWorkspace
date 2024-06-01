import React, {useEffect, useRef, useState} from "react";
import io from 'socket.io-client';

const Room = () => {
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const socket = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    socket.current = io('http://localhost:5000', {
      query: { token }, // Pass the token as a query parameter
      withCredentials: true
    });

    socket.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.current.on('message', (message) => {
      console.log(message);
    });

    socket.current.on('user-joined', (data) => {
      let parsedData;

      // Check if data is already an object
      if (typeof data === 'object' && data !== null) {
        parsedData = data;
      } else {
        // If data is a string, try to parse it as JSON
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return;
        }
      }

      const user = parsedData.user;
      setUsers(prevUsers => [...prevUsers, user]);
    });

    socket.current.on('user-id', (data) => {
      console.log('Received user ID from server:', data.userID);
      setUserID(data.userID);
    });

    socket.current.on('room-users', (data) => {
      console.log('Received room users and room code from server:', data.users, data.roomCode);
      setUsers(data.users);
      setRoomCode(data.roomCode);
    });

    socket.current.on('disconnect', (message) => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      socket.current.close();
    };
  }, [userID]);

  const createRoom = () => {
    const token = localStorage.getItem('token');
    const projectName = 'yourProjectName';

    if (socket.current) {
      console.log('Socket connected, emitting create-room event');
      socket.current.emit('create-room', { token, userID, projectName });

      socket.current.on('room-created', (data) => {
        console.log('Received room code from server:', data.roomCode);
        setRoomCode(data.roomCode);
      });
    }
  };


  return (
      <div>
        <h1>Welcome to the Room System Test Page</h1>
        <h2>Room: {roomCode}</h2>
        <input type="text" value={roomCode || ''} disabled/>
        <button onClick={createRoom} disabled={!isConnected || !userID}>Create Room</button>
        <h2>{isConnected ? `Connected to room ${roomCode}` : 'Not connected to room'}</h2>
        <h2>Users in Room:</h2>
        <ul>
          {users.map(user => <li key={user.id}>{user.name}</li>)} {/* Display the users */}
        </ul>
      </div>
  );
};

export default Room;