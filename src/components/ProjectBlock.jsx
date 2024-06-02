import React from "react";
import "./../css/style.css";

function Projectblock(props) {
  return (
    <div class="project">
      <span className="project-name">{props.nameProject}</span>
      <span className="project-name">{props.persentProject}%</span>
    </div>
  );
}

export default Projectblock;
