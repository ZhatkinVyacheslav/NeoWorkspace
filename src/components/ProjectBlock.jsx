import React from "react";
import "./../css/style.css";

function Projectblock({ nameProject, persentProject, onClick, className }) {
  return (
    <div className={`project ${className}`} onClick={onClick}>
      <span className="project-name">{nameProject}</span>
      <span className="project-name">{persentProject}%</span>
    </div>
  );
}

export default Projectblock;