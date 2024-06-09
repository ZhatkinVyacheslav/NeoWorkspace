import React from "react";
import "./../css/style.css";
import { Statusg as GreenCircle, Statusr as RedCircle } from "./IconsComponent";

function StatusAndStageName({ index, stageName, iconType, onChange, showCheckbox, isChecked }) {
    return (
        <div className="stage" style={{display: 'flex', alignItems: 'center'}} key={isChecked}>
            <div className="status-and-name">
                {iconType === "green" ? (
                    <GreenCircle className="circle-img"></GreenCircle>
                ) : (
                    <RedCircle className="circle-img"></RedCircle>
                )}
                <span className="stage-name">{stageName}</span>
            </div>
            <input type="checkbox" onChange={() => onChange(index, stageName, !isChecked)} checked={isChecked}/>
        </div>
    );
}

export default StatusAndStageName;