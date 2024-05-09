import React, { useEffect} from "react";
import io from 'socket.io-client';

const Room = ({ roomID, userID }) => {
  useEffect(() => {
    const socket = io('http://localhost:3000');

    // Подключаемся к серверу
    socket.on('connect', () => {
      console.log('Connected to server');

      // Отправили запрос на подключение к комнате
      socket.send(JSON.stringify({type: 'join', roomID, userID}));
    });

    // Получаем сообщения от сервера
    socket.on('message', (message) => {
      console.log(message);
    });

    // При отключении от сервера
      socket.on('disconnect', (message) => {
          console.log('Disconnected from server');
      });
    return () => {
      socket.close();
    };
  }, [roomID, userID]);

  return (
    <div>
      <h1>Room: {roomID}</h1>
    </div>
  );
};

export default Room;