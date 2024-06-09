import React, {Component} from 'react';
import Messege from './Messege';
class MessegesSpace extends Component {
    state = {  } 
    render() { 
        return (
            <div className='messeges-container'>
                <span className='white-logo-text settings-text'>Сообщения</span>
                <div className='messeges-space'>
                    <Messege sender='Отправитель1' messegeText='Пример сообщения'></Messege>
                    <Messege sender='Отправитель2' messegeText='Пример очень длинного сообщения'></Messege>
                </div>
            </div>
        );
    }
}
 
export default MessegesSpace;
