import React from "react";
import "./../css/style.css";
import { Statusg as GreenCircle, Statusr as RedCircle } from "./IconsComponent";

function StatusAndStageName({ stageName, iconType, onChange, showCheckbox }) {
  return (
      <div className="stage" style={{ display: 'flex', alignItems: 'center' }}>
        {iconType === "green" ? (
            <GreenCircle className="green-circle-img"></GreenCircle>
        ) : (
            <RedCircle className="red-circle-img"></RedCircle>
        )}
        <span className="stage-name">{stageName}</span>
        {showCheckbox && <input type="checkbox" onChange={onChange} />}
      </div>
  );
}

export default StatusAndStageName;