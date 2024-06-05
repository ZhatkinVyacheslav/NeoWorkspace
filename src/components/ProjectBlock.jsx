import React from "react";
import "./../css/style.css";

function Projectblock({ nameProject, persentProject, onClick, className }) {
    let displayProjectCompleteness = isNaN(persentProject) ? 0 : persentProject;
    return (
        <div className={`project ${className}`} onClick={onClick}>
            <span className="project-name">{nameProject}</span>
            <span className="project-name">{displayProjectCompleteness}%</span>
        </div>
    );
}

export default Projectblock;