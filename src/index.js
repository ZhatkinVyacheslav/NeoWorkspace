import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './components/LoginPage';
import Room from './components/Room';

ReactDOM.render(<LoginPage />, document.getElementById('root'));

//Enable to access rooms debug page. MUST connect through localhost:3000/Room
//ReactDOM.render(<Room userID="testUser" />, document.getElementById('root'));