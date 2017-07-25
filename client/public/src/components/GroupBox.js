import React from 'react'

/**
* getClassName
*/
var getClassName = function(className){
  return typeof(className) ==="string" ?  className.trim() : "";
}

/**
* Group box header
*/
export class GBHeader extends React.Component {

  /**
    * render
    * @return {ReactElement} markup
    */
   render() {
      var clsName = "groupbox-header " + getClassName(this.props.className);
      return (
        <div className={clsName}>{this.props.children}</div>
      );
  }
}

/**
* Group box content
*/
export class GBContent extends React.Component {

  /**
    * render
    * @return {ReactElement} markup
    */
  render() {
    var clsName = "groupbox-content " + getClassName(this.props.className); 
      return (
        <div className={clsName.trim()}>{this.props.children}</div>
      );
  }
}

/**
* Group box footer
*/
export class GBFooter extends React.Component { 

  /**
    * render
    * @return {ReactElement} markup
    */
  render() {
      var clsName = "groupbox-footer " + getClassName(this.props.className);
      return (
        <div className={clsName.trim()}>{this.props.children}</div>
      );
  }
}

/**
* Group box component
*/
export default class GroupBox extends React.Component {

  /**
    * render
    * @return {ReactElement} markup
    */
  render() {
    var clsName = "groupbox " + getClassName(this.props.className);
      return (
        <div className={clsName.trim()}>
        	{this.props.children}
        </div>
      );
  }
}