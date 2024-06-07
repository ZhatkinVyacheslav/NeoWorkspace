import React from "react";
import "./../css/style.css";
import { Statusg as GreenCircle, Statusr as RedCircle } from "./IconsComponent";

function StatusAndStageName({ stageName, iconType, onChange, showCheckbox, isChecked }) {
    return (
        <div className="stage" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="status-and-name">
            {iconType === "green" ? (
                <GreenCircle className="circle-img"></GreenCircle>
            ) : (
                <RedCircle className="circle-img"></RedCircle>
            )}
            <span className="stage-name">{stageName}</span>
            </div>
            {showCheckbox && <input type="checkbox" onChange={onChange} checked={isChecked} />}
        </div>
    );
}

export default StatusAndStageName;