import React, {useEffect, useRef, useState} from "react";
import io from 'socket.io-client';

const Room = () => {
  const [userID, setUserID] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [joinRoomCode, setJoinRoomCode] = useState(localStorage.getItem('roomCode') || '');
  const [projectName, setProjectName] = useState(null);
  const [currentProjectName, setCurrentProjectName] = useState(null);
  const socket = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    socket.current = io('http://localhost:5000', {
      query: { token }, // Pass the token as a query parameter
      withCredentials: true
    });

    socket.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      socket.current.emit('user-id');

      // If there is a room code and user ID in local storage, automatically join the room
      const storedRoomCode = localStorage.getItem('roomCode');
      const storedUserID = localStorage.getItem('userID');
      if (storedRoomCode && storedUserID) {
        console.log('Automatically joining room:', storedRoomCode);
        socket.current.emit('join', { userID: storedUserID, roomCode: storedRoomCode });
      }
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

      // Only add the user to the state if they are not already in it
      setUsers(prevUsers => {
        if (!prevUsers.find(u => u.id === user.id)) {
          return [...prevUsers, user];
        } else {
          return prevUsers;
        }
      });
    });

    socket.current.on('user-id', (data) => {
      console.log('Received user ID from server:', data.userID);
      setUserID(data.userID);
      // Store the user's permission level in the state
      setUserPermissions(data.permissions);
      console.log('User permissions:', data.permissions);
    });

    socket.current.on('room-users', (data) => {
      console.log('Received room users and room code from server:', data.users, data.roomCode);
      setUsers(data.users);
      setRoomCode(data.roomCode);
    });

    // Listen for the 'room-created' event and update the room code
    socket.current.on('room-created', (data) => {
      setRoomCode(data.roomCode);
    });

    socket.current.on('join', (data) => {
      console.log('Received join event from server:', data.roomCode, data.projectName);
      setRoomCode(data.roomCode);
      setCurrentProjectName(data.projectName);
    });

    socket.current.on('set-project', (data) => {
      console.log('Received set-project event from server:', data.projectName);
      setCurrentProjectName(data.projectName);
    });

    socket.current.on('disconnect', (message) => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      socket.current.close();
    };
  }, []);

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

      socket.current.on('error', (data) => {
        console.log('Received error from server:', data.message);
        // Display the error message to the user
        alert(data.message);
      });
    }
  };

  const setProject = () => {
    if (socket.current && projectName) {
      console.log('Socket connected, emitting set-project event');
      socket.current.emit('set-project', { roomCode, projectName });
    }
  };

  const joinRoom = () => {
    if (socket.current && joinRoomCode) {
      console.log('Socket connected, emitting join event');
      socket.current.emit('join', { userID, roomCode: joinRoomCode });

      // Store the room code in local storage
      localStorage.setItem('roomCode', joinRoomCode);
      // Update the room code and connection status
      setRoomCode(joinRoomCode);
      setIsConnected(true);
    }
  };

  return (
      <div>
        <h1>Welcome to the Room System Test Page</h1>
        <h2>Room: {roomCode}</h2>
        <input type="text" value={roomCode || ''} disabled/>
        <button onClick={createRoom} disabled={!isConnected || !userID || userPermissions > 1}>Create Room</button>
        <h2>Current Project: {currentProjectName || 'None'}</h2>
        <h2><input type="text" value={projectName || ''} onChange={e => setProjectName(e.target.value)}
                   placeholder="Enter project name"/>
          <button onClick={setProject} disabled={!isConnected || !roomCode}>Set Project</button>
        </h2>
        <h2>{isConnected ? `Connected to room ${roomCode}` : 'Not connected to room'}</h2>
        <input type="text" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value)}
               placeholder="Enter room code"/>
        <button onClick={joinRoom} disabled={!isConnected || !userID || !joinRoomCode}>Join Room</button>
        <h2>Users in Room:</h2>
        <ul>
          {users.map(user => <li key={user.id}>{user.name}</li>)} {/* Display the users */}
        </ul>
      </div>
  );
};

export default Room;