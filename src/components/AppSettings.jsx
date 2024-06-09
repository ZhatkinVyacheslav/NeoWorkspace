import React, {Component} from 'react';


class AppSettings extends Component {
    state = {  } 
    render() { 
        return (
            <div className='app-settings-container'>
                <span className='white-logo-text settings-text'>Настройки</span>
                <div className='settings-container'>
                    <span className='settings-add-text'>Тут будут настройки</span>  
                </div>
            </div>
        );
    }
}
 
export default AppSettings;