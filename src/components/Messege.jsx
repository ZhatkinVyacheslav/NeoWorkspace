import React from 'react';


function Messege(props) {
    return ( 
        <div className='messege-container'>
            <span className='sender'>{props.sender}</span>
            <span className='messege-text'>{props.messegeText}</span>
        </div>
     );
}

export default Messege;