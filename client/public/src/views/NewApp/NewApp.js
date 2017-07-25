import React from 'react';
import { LeftSideBar, RightSideContent, LoadingScreenModal } from './Util';
import { ModalPopup } from '../../components/Popup.js'

/**
* NewApp
**/
export default class NewApp extends React.Component {
    constructor (props) {
        super(props);
        this.state = {"step": -1, "itemid": -1};
        this.updateStepQuery = this.updateStepQuery.bind(this);
    }
    changeSlide (step, itemid) {
        itemid = typeof itemid === 'undefined' ? -1 : itemid;
        step = step !== 0 && step >= 1 && step <= 5 ? step - 1 : -1;
        this.setState({"step": step, "itemid": itemid});
        this.updateStepQuery(step+1,true);
    }

    updateStepQuery(step,state){
        var location = this.props.location;
        location.query.step = step;
        if(!state){
            this.state.step = -1;
        }
        this.props.router.replace(location);

    }


    /**
    * render
    * @return {ReactElement} markup
    */
    render() {
        return (
            <div>
                <LeftSideBar changeSlide={this.changeSlide.bind(this)}/>
                <RightSideContent updateStepQuery={this.updateStepQuery} slideState={this.state}/>
                <LoadingScreenModal/>
                <ModalPopup title="Update Configuration" bodyDesc="" saveBtn="Save Changes" cancelBtn="Cancel" />
            </div>
        )
    }
}
