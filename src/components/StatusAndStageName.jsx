import React, { Component } from "react";
import { Statusg } from "./IconsComponent";
import { Statusy } from "./IconsComponent";
import { Statusr } from "./IconsComponent";
import "./../css/style.css";

function StatusAndStageName(props) {
  let iconToRender;

  switch (props.iconType) {
    case "green":
      iconToRender = <Statusg className="statusg-img"/>;
      break;
    case "red":
      iconToRender = <Statusr className="statusr-img"/>;
      break;
    case "yellow":
      iconToRender = <Statusy className="statusy-img"/>;
      break;
    default:
      iconToRender = <Statusy className="statusy-img"/>;
      break;
  }

  return (
    <div className="stages-component">
      {iconToRender}
      <span className="stage-text color-grey">{props.stageName}</span>
    </div>
  );
}

export default StatusAndStageName;
