import React from "react";
import "../css/style.css";
import { Check } from "./IconsComponent";

class AddStage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stageName: "",
      stageImportance: "",
      isOpen: false,
    };
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.closeAddStage();
    }
  };

  handleImportanceChange = (event) => {
    this.setState({ stageImportance: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    // Здесь вы можете отправить данные на сервер или выполнить другие действия
    console.log("Название этапа:", this.state.stageName);
    console.log("Важность этапа:", this.state.stageImportance);
    // Очистка полей формы после отправки
    this.setState({ stageName: "", stageImportance: "" });
  };

  handleNameChange = (event) => {
    this.setState({ stageName: event.target.value });
  };

  handleSubmitNewStages = (event) => {
    event.preventDefault();
    this.props.SubmitNewStages(this.state.stageName, this.state.stageImportance);

    // Emit a socket event to the server with the new stage data
    this.props.socket.emit('add-stages', {
      roomCode: this.props.roomCode,
      stages: [{
        name: this.state.stageName,
        weight: this.state.stageImportance,
        completed: false
      }]
    });
  };

  handleFormSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    // The rest of your form submission logic
    this.props.handleFormSubmit(
      this.state.stageName,
      this.state.stageImportance
    );
    // Clear the form fields after submission
    this.setState({ stageName: "", stageImportance: "" });
  };
  render() {
    const { isOpen } = this.props;

    if (!isOpen) return null;

    return (
      <div className="addStage-container" ref={this.setWrapperRef}>
        <span className="Add-stage-text">
          Введите название нового этапа и укажите его важность
        </span>
        <div className="add-inputs">
          <input
            type="text"
            name="newStageName"
            value={this.state.newStageName}
            onChange={this.handleNameChange}
            placeholder="Stage Name"
            className="new-stage-name"           
          />
          <input
            type="number"
            className="importance"
            id="stageImportance"
            placeholder="Число"
            value={this.state.stageImportance}
            onChange={this.handleImportanceChange}
            required
          />
          <button className="hidden-button1" onClick={this.handleSubmitNewStages}>
            <Check className="check-img"></Check>
          </button>
        </div>
      </div>
    );
  }
}

export default AddStage;
