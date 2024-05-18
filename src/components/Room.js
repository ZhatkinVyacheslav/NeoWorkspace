import React, { useEffect, useState } from "react";
import io from 'socket.io-client';

const Room = ({ userID }) => {
const  [ roomID, setRoomID ] = useState(null);
const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true
    });

    // Подключаемся к серверу
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    // Получаем сообщения от сервера
    socket.on('message', (message) => {
      console.log(message);
    });

    // При отключении от сервера
    socket.on('disconnect', (message) => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [userID]);

  const createRoom = async () => {
    const response = await fetch('http://localhost:5000/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userID }),
    });

    const data = await response.json();
    setRoomID(data.roomCode);
  };

  return (
      <div>
        <h1>Welcome to the Room System Test Page</h1>
        <h2>Room: {roomID}</h2>
        <input type="text" value={roomID || ''} disabled />
        <button onClick={createRoom} disabled={!isConnected}>Create Room</button>
      </div>
  );
};

export default Room;