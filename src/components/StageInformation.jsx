import React, { Component } from "react";
import UserFiles from "./UserFiles";
import { Editor } from "@tinymce/tinymce-react";
import "./../css/style.css";

class StageIformation extends Component {
  state = {};

  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
  }

  handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateEditorSize);
    this.updateEditorSize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateEditorSize);
  }

  updateEditorSize = () => {
    if (this.editorRef.current && this.editorRef.current.editor) {
      this.editorRef.current.editor.resize();
    }
  };

  render() {
    // const { selectedStage } = this.props;

    // if (!selectedStage) {
    //   return (
    //     <div className="project-informations-container">
    //       <div className="text-redactor">
    //         <h1>Выберите этап для просмотра информации о нём</h1>
    //       </div>
    //       <div className="attached-files-container">
    //         <span className="attached-files-text">Прикреплённые файлы</span>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className="project-informations-container">
        <div className="text-redactor">
          <Editor
            apiKey="iuiddqhzxfh6cwnpvyc54kpws0y2posvwxriytiizdwcns6c"
            onInit={(evt, editor) => (this.editorRef.current = editor)}
            initialValue="<Strong>Тут вы сможете писать отчёт для стадии проекта .</Strong>"
            init={{
              selector: "textarea",
              extended_valid_elements: "iframe[*]",
              height: "100%",
              menubar: true,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
                "fontselect",
                "code",
                "fontsize",
              ],
              toolbar:
                "undo redo | formatselect | fontsizeselect fontsize | " +
                "bold italic underline | forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | code | removeformat ",
              font_formats:
                "Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Arial Black=arial black,avant garde;Georgia=georgia,palatino",
              content_css: [
                "//fonts.googleapis.com/css?family=Times+New+Roman",
                "body { color: black; }",
                "//www.tiny.cloud/css/codepen.min.css",
              ],
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              body: {
                font_family: "Times New Roman, Times, serif",
              },
              resize: false,
            }}
          />
        </div>
        <div className="attached-files-container">
          <span className="attached-files-text">Прикреплённые файлы</span>
          <div className="files">
            <UserFiles fileName="Файл1" userName="Карагодин Андрей"></UserFiles>
            <UserFiles fileName="Файл2" userName="Карагодин Андрей"></UserFiles>
          </div>
        </div>
      </div>
    );
  }
}

export default StageIformation;
