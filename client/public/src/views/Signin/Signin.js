import React from 'react'
import { Link } from 'react-router'
import GroupBox, { GBHeader, GBContent, GBFooter } from '../../components/GroupBox'
import { Content } from '../../components/Layouts'

/**
* LoginFooter
**/
class LoginFooter extends React.Component{

	/**
	* render
	* @return {ReactElement} markup
	*/
	render(){
		return (
			<div className="sign_up">Don't have an account yet? <Link to="/">Sign Up</Link></div>
		)
	}
}

/**
* LoginForm
**/
class LoginForm extends React.Component{

	/**
	* render
	* @return {ReactElement} markup
	*/
	render(){
		return (	
			<div className="form_container">
				<div className="header_logo"></div>
				<form className="form-login" >
		            <div className="field">
    					<input name="email" type="text" tabIndex="1" placeholder="Email Address"/>
		            </div>
		            <div className="field">
    					<input name="password" type="password" tabIndex="2" placeholder="Password"/>
		            </div>
		            <div className="field remember_forgot">
			            <div className="cbox_remember_me left">
			             	<input type="checkbox" name="remember_me"/>
			            </div>
		             	<div className="remember_me_txt left">Remember Me</div>
		             	<div className="forgot_pass right"><a href="#">Forgot password?</a></div>
		             	<div className="clear"></div>
		            </div>
					<Link to="/home" className="login_btn btn-default">Log In</Link>
    			</form>
			</div> 
		);
	}
}

/**
* Signin
**/
export default class Signin extends React.Component {  

	/**
	* render
	* @return {ReactElement} markup
	*/
	render() {
		return( 
			<Content>
				<div id="signin">
					<GroupBox>
						<GBContent>
							<LoginForm/>
						</GBContent>
						<GBFooter>
							<LoginFooter/>
						</GBFooter>
					</GroupBox>
				</div>
			</Content>
		)			
	}
}
