import React from 'react';
import "../css/formDialog.css"
import "../css/style.css"

function UserInformation({user, onClose}) {
  return (
    <div id="modal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{user.name}</h2>
        <p>{user.details}</p>
      </div>
    </div>
  );
}

export default UserInformation;
