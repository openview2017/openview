import React from 'react'

/**
* Modal popup component
*/
export class ModalPopup extends React.Component {
	closeModal() {
        this.refs.updateConfig.style.display = "none";
        if (typeof this.props.cancelChange === 'function') {
			this.props.cancelChange();
		}
    }

    saveChanges() {
        this.refs.updateConfig.style.display = "none";
		if (typeof this.props.saveChange === 'function') {
			this.props.saveChange($("#updatedConfigValue", "#update-config-modal").val());
		}
    }

    render() {
		let bodyDescription = this.props.bodyDesc === "" ? "" : <p>{this.props.bodyDesc}</p>;
		let _this = this;
		let key = "update-config-modal";
		if(this.props.eleId){
		    key = this.props.eleId;
        }
        return (
            <div id={key} ref="updateConfig" className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span className="close" onClick={this.closeModal.bind(this)}>×</span>
                        <strong style={{fontSize:"14px",fontWeight:"normal"}}>{this.props.title}</strong>
                    </div>
                    <div className="modal-body">
						{bodyDescription}
                        {
                            (function(){
                                if(!_this.props.hidInput){
                                    return (<input type="text" id="updatedConfigValue" style={{"width": "100%", "height": "30px"}} />);
                                }
                            }())
                        }

                    </div>
                    <div className="modal-footer">
                        <a href="javascript:void(0)" className="confirm btn-default" onClick={this.saveChanges.bind(this)}>{this.props.saveBtn}</a> &nbsp;
                        <a href="javascript:void(0)" className="cancel btn-default" onClick={this.closeModal.bind(this)}>{this.props.cancelBtn}</a>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* Fullscreen popup component
*/
export default class Popup extends React.Component {

	/**
    * render
    * @return {ReactElement} markup
    */
	render() {
		return (
			<div id='fullscreen-loader' className='lightbox'>
		        <div className='loader-holder'>
		            <strong className='loader-msg'>Loading...</strong>
		            <div className='loader'>
		                <span></span>
		            </div>
		        </div>
		    </div>
		)
	}
}
