import React from 'react';
import { Users, Union, Envelope } from './IconsComponent';
import "./../css/style.css";
import AvatarAndName from './AvatarAndName';

function Header() {
    return (           
    <div className="header-container">
    <div className="logo-container">
      <Users className="users-img"></Users>
      <div className="text-nearby-img">
        <span className="white-logo-text">Neo</span>
        <span className="blue-logo-text">W</span>
        <span className="white-logo-text">orkspace</span>
      </div>
    </div>
    <div className="avatar-and-icons-container">
      <button type='submit' className='hidden-button'>
        <AvatarAndName userName="Жаткин Вячеслав"></AvatarAndName>
      </button>
      <Union alt="union" className="union-img" />
      <Envelope className="envelope-img"></Envelope>
    </div>
  </div> );
}

export default Header;