import React from 'react'

/**
* Accordion links
*/
export default class AccordionLinks extends React.Component {

    /**
    * render
    * @return {ReactElement} markup
    */
   render() {
      return (
        <ul className="accordion-links">{this.props.children}</ul>
      )
  }
}

/**
* Slide
*/
export class Slide extends React.Component{

    /**
    * render
    * @return {ReactElement} markup
    */
    render(){
        var slide_cls = "slide" + (typeof this.props.className ==="string" ? (" " + this.props.className) : "") ;
        return (
            <div className={slide_cls}>{this.props.children}</div>
        )
    }
}

/**
* Acc link
*/
export class AccLink extends React.Component {
    constructor (props) {
        super(props);
        this.state = {step: this.props.step};
    }
    changeSlide (e) {
        e.preventDefault();
        if ($(e.target).parents('li').attr('class').indexOf('not-active') < 0) {
            this.props.changeSlide(this.state.step);
        }
    }
    /**
    * render
    * @return {ReactElement} markup
    */
   render() {
        return (
          <li className={this.props.className}>
              <a className="application opener" onClick={this.changeSlide.bind(this)} href="#">{this.props.link_name}</a>
              <div className="slides">{this.props.children}</div>
          </li>
        )
  }
}

export class APPList extends React.Component {
    constructor (props) {
        super(props);
    }
    changeSlide (step, e) {
        e.preventDefault();
        this.props.changeSlide(step);
    }
    /**
    * render
    * @return {ReactElement} markup
    */
   render() {
       return (
            <ul>
                {
                    this.props.data.map ( function (sv, idx) {
                        let rcs = sv.targets.map((target, iidx) => {
                            return (
                                <li key={iidx}>
                                    <a href="#" onClick={this.changeSlide.bind(this, 1)} className="rc-active sub-category">
                                        <div style={{display: "inline-block", width: "140px"}}>
                                            <span className="title-inner title-white">{this.props.configsById[target.reference_id].name}</span>
                                            <span className="title-inner">Replication Controller</span>
                                        </div>
                                    </a>
                                </li>
                            )
                        });
                        return (
                             <li key={idx}>
                                 <a href="#" onClick={this.changeSlide.bind(this, 1)} className="service-active category">
                                     <div style={{display:"inline-block", width:"170px"}}>
                                     <span className="title-inner title-white">{sv.name}</span>
                                     <span className="title-inner">Service</span>
                                     </div>
                                 </a>
                                 <ul>
                                    {rcs}
                                 </ul>
                             </li>
                        )
                    }, this)
                }
            </ul>
       )
    }
}

export class SLAList extends React.Component {
    constructor (props) {
        super(props);
    }
    changeSlide (step, e) {
        e.preventDefault();
        if ($(e.target).parents('li')[1].className !== 'not-active') {
            this.props.changeSlide(step);
        }
    }
    render () {
        let currencyType = this.props.currencyType && this.props.currencyType == "yuan" ? "¥" : "$";
        return (
             <ul>
                <li>
                <a href="#" onClick={this.changeSlide.bind(this, 2)} className="estimated-cost-active category">
                    <div style={{display:"inline-block", width:"170px"}}>
                        <span className="title-inner title-white">ESTIMATED COST</span>
                        <span className="title-inner title-white">Below {currencyType + this.props.sla.cost} / mo</span>
                    </div>
                </a>
                <a href="#" onClick={this.changeSlide.bind(this, 2)} className="target-latency-active category">
                    <div style={{display:"inline-block", width:"170px"}}>
                        <span className="title-inner title-white">TARGET LATENCY</span>
                        <span className="title-inner title-white">Below {this.props.sla.latency} ms</span>
                    </div>
                </a>
                <a href="#" onClick={this.changeSlide.bind(this, 2)} className="error-rate-active category">
                    <div style={{display:"inline-block", width:"170px"}}>
                        <span className="title-inner title-white">ERROR RATE</span>
                        <span className="title-inner title-white">Below {this.props.sla.error_rate} %</span>
                    </div>
                </a>
                </li>
             </ul>
        )
    }
}

export class DPList extends React.Component {
    constructor (props) {
        super(props);
    }
    changeSlide (step, id, e) {
        e.preventDefault();
        if ($(e.target).parents('li')[1].className !== 'not-active') {
            this.props.changeSlide(step, id);
        }                
    }
    render () {
        return (
            <ul>
                {
                    this.props.dp.map ( function (dp, idx) {
                        if (typeof dp.name !== 'undefined' && dp.name !== '') {
                            return (
                                <li key={idx}>
                                    <a href="#" onClick={this.changeSlide.bind(this, 3, dp.id)} className="demandprofile">
                                        <div style={{display:"inline-block", width:"200px"}}>
                                            <span className="title-inner title-white">{dp.name.toUpperCase()}</span>
                                            <span className="title-inner title-white">Dry run for {Number(dp.load_duration) / 60} mins.</span>
                                        </div>
                                    </a>
                                </li>
                            )
                        }
                    }, this)
                }
             </ul>
        )
    }
}
