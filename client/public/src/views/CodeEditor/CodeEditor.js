import React from 'react'

class YAMLCode extends React.Component {
    constructor(props) {
        super(props);
        this.editor;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.uploadFileContent !== "") {
            this.editor.getSession().setValue(nextProps.uploadFileContent);
        }
        if ('' + nextProps.uploadFileErrorLine !== '0') {
            this.editor.setHighlightActiveLine(true);
            this.editor.gotoLine(Number(nextProps.uploadFileErrorLine));
        } else {
            this.editor.setHighlightActiveLine(false);
        }
    }
    getContent() {
        return this.editor.getSession().getValue();
    }
    render() {
        return (
            <div id="yaml-editor"></div>
        )
    }
    componentDidMount() {
        this.editor = ace.edit("yaml-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/yaml");
        this.editor.setHighlightActiveLine(false);
        this.editor.$blockScrolling = Infinity;
    }
}

export class EditCodeModal extends React.Component {
    constructor(props) {
        super(props);
    }
    closeModal(event) {
        var _self = this;
        event.stopPropagation();
        this.refs.editCodeModal.style.display = "none";
        setTimeout(() => {
            _self.props.slickGoTo(4);
        }, 1000);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.uploadFile.uploadFileFailed) {
            this.refs.editCodeModal.style.display = "block";
        } else {
            this.refs.editCodeModal.style.display = "none";
        }
    }
    saveChanges(e) {
        e.preventDefault();
        var _that = this;
        let content = this.refs.yamlEditor.getContent();
        this.props.uploadYAML('yaml', content);
    }
    render() {
        return (
            <div id="edit-code-modal" ref="editCodeModal" className="modal">
                <div className="modal-content fullscreen">
                    <div className="modal-header" style={{textAlign: "center"}}>
                        <span className="close" id="closeEditor" onClick={this.closeModal.bind(this)}>×</span>
                        <strong className="code-mode" style={{fontSize:"12px",fontWeight:"normal"}}>YAML</strong>
                        <strong className="title" style={{float:"left",fontSize:"12px",fontWeight:"normal"}}>{this.props.uploadFile.appName}</strong>
                    </div>
                    <div className="modal-body yaml-editor-container">
                        <YAMLCode ref="yamlEditor" uploadFileContent={this.props.uploadFile.content} uploadFileErrorLine={this.props.uploadFile.errorLine} />
                    </div>
                    <div className="modal-footer">
                        <a href="javascript:void(0)" className="confirm btn-default" onClick={this.saveChanges.bind(this)}>Save Changes</a> &nbsp;
                        <a href="javascript:void(0)" id="closeEditorBtn" className="cancel btn-default" onClick={this.closeModal.bind(this)}>Cancel</a>
                        <span className="error-msg">{this.props.uploadFile.errorMsg ? this.props.uploadFile.errorMsg : ""}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditCodeModal;
