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
  const [stages, setStages] = useState([]);
  const [currentProjectName, setCurrentProjectName] = useState(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageWeight, setNewStageWeight] = useState('');
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

        // Fetch the stages of the current project
        fetch(`/api/stages?roomID=${storedRoomCode}`)
            .then(response => response.json())
            .then(data => setStages(data))
            .catch(error => console.error('Error:', error));
      }
    });

    if (roomCode) {
      // Fetch the stages of the current project
      fetch(`/api/stages?roomID=${roomCode}`)
          .then(response => response.json())
          .then(data => setStages(data))
          .catch(error => console.error('Error:', error));
    }

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
    }, [roomCode]);

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

      // Emit the 'fetch-stages' event to fetch the stages of the current project
      socket.current.emit('fetch-stages', { roomCode: data.roomCode });
    });

    socket.current.on('join-response', (data) => {
      console.log('Received join-response event from server:', data.stages);
      setStages(data.stages.map(stage => ({
        name: stage.stagename,
        weight: stage.weight,
        completed: stage.completed || false // Treat null as false
      })));
    });

    socket.current.on('fetch-stages-response', (data) => {
      const stages = data.stages.map(stage => ({
        name: stage.stagename,
        weight: stage.weight,
        completed: stage.completed || false // Treat null as false
      }));
      setStages(stages);
    });

    socket.current.on('set-project', (data) => {
      console.log('Received set-project event from server:', data.projectName);
      setCurrentProjectName(data.projectName);
      setStages(data.stages || []);
    });

    socket.current.on('disconnect', (message) => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      if (socket.current) {
        socket.current.off('join-response');
      }
    };
  }, [roomCode]);

  const createRoom = () => {
    const token = localStorage.getItem('token');
    const projectName = 'None';

    if (socket.current) {
      console.log('Socket connected, emitting create-room event');
      socket.current.emit('create-room', { token, userID, projectName });

      socket.current.on('room-created', (data) => {
        console.log('Received room code from server:', data.roomCode);
        setRoomCode(data.roomCode);
      });

      socket.current.on('join-response', (data) => {
        console.log('Received join-response event from server:', data.stages);
        setStages(data.stages.map(stage => ({
          name: stage.stagename,
          weight: stage.weight,
          completed: stage.completed
        })));
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
      const confirmChange = window.confirm('Changing the project will delete the current one. Are you sure you want to proceed?');
      if (!confirmChange) {
        return;
      }

      console.log('Socket connected, emitting delete-stages event');
      socket.current.emit('delete-stages', { roomCode });

      console.log('Socket connected, emitting set-project event');
      const stagesToSend = stages || [];
      socket.current.emit('set-project', { roomCode, projectName, stages: stagesToSend });
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

  const submitStages = () => {
    if (socket.current) {
      console.log('Socket connected, emitting add-stages event');

      // Check for duplicate stage names
      const stageNames = stages.map(stage => stage.name);
      const hasDuplicates = stageNames.some((name, index) => stageNames.indexOf(name) !== index);

      if (hasDuplicates) {
        console.error('Cannot add stages: duplicate stage names detected');
        return;
      }

      socket.current.emit('add-stages', { roomCode, stages });

      // Listen for the response from the server
      socket.current.on('add-stages-response', (data) => {
        if (data.success) {
          console.log('Stages added successfully');
        } else {
          console.error('Failed to add stages:', data.message);
        }
      });
    }
  };

  const addStageField = () => {
    setStages(prevStages => [...prevStages, { name: '', weight: '' }]);
  };

  const handleStageChange = (index, field, value) => {
    setStages(prevStages => prevStages.map((stage, i) => i === index ? { ...stage, [field]: value } : stage));

    // If the 'completed' field changed, emit an event to the server
    if (field === 'completed' && socket.current) {
      socket.current.emit('stage-completed-changed', { roomCode, stageIndex: index, completed: value });
    }
  };

  const calculateProjectProgress = () => {
    const totalWeight = stages.reduce((total, stage) => total + Number(stage.weight), 0);
    const completedWeight = stages.reduce((total, stage) => total + (stage.completed ? Number(stage.weight) : 0), 0);

    return (completedWeight / totalWeight) * 100;
  };

  return (
      <div>
        <h1>Welcome to the Room System Test Page</h1>
        <h2>Room: {roomCode}</h2>
        <input type="text" value={roomCode || ''} disabled/>
        <button onClick={createRoom} disabled={!isConnected || !userID || userPermissions > 1}>Create Room</button>
        <h2>Current Project: {currentProjectName || 'None'}</h2>
        <p>Completed: {calculateProjectProgress()}%</p>
        {currentProjectName && (
            <div>
              <h3>Project Stages:</h3>
              <ul>
                {stages ? stages.map((stage, index) => (
                    <li key={index}>
                      {stage.name}: {stage.weight} {stage.completed ? "(Completed)" : "(Not Completed)"}
                    </li>
                )) : <li>No stages defined</li>}
              </ul>
            </div>
        )}
        <h2><input type="text" value={projectName || ''} onChange={e => setProjectName(e.target.value)}
                   placeholder="Enter project name"/>
          <button onClick={setProject} disabled={!isConnected || !roomCode}>Set Project</button>
          <h2>Add Stages:</h2>
          {stages.map((stage, index) => (
              <div key={index}>
                <input type="text" value={stage.name} onChange={e => handleStageChange(index, 'name', e.target.value)}
                       placeholder="Enter stage name"/>
                <input type="number" value={stage.weight}
                       onChange={e => handleStageChange(index, 'weight', e.target.value)}
                       placeholder="Enter stage weight"/>
                <input type="checkbox" checked={stage.completed}
                       onChange={e => handleStageChange(index, 'completed', e.target.checked)}/>
              </div>
          ))}
          <button onClick={addStageField}>+</button>
          <button onClick={submitStages}>Submit Stages</button>
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