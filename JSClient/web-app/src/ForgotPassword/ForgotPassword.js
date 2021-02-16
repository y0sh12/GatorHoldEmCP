import React, { Component } from 'react'
import './ForgotPassword.css';
import logo from '../images/LOGO.png';
import userData from "../axiosCalls.js";
import { Redirect } from 'react-router-dom';
import ConfirmPage from "../ConfirmPage/ConfirmPage";

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            old_password: '',
            new_password: '',
            confirm_new_password: '',
            isReset:false,
            isError:''
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.matchingPasswords = this.matchingPasswords.bind(this);
      }


      matchingPasswords() {
        return (this.state.new_password === this.state.confirm_new_password);
       } 


      handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }


      handleReset = (event)  => {
        //Axios calls to API
        event.preventDefault();
        if(this.matchingPasswords()){
            userData.resetPass(this.state)
            .then((response) => {
                console.log(response);
                if(response.isReset === false){
                    this.setState({isError:response.errors});
                }
                else{
                    this.setState({isReset: true});
                }
            })
        }
    } 

    render() {
        let error = '';
        if(this.state.isError != ''){
            error = <p className = "error">{this.state.isError}</p>
        }
        let warning = '';
        if (!this.matchingPasswords()){
            warning = <p className = "error">New passwords not matching!</p>
        }
        else{
            warning = '';
        }
        if(this.state.isReset){
            return(
                <Redirect
                to={{
                    pathname: "/ConfirmPage",
                    state: {confirmWhat: "Your password has been reset!"}
                }}
                />
            )
        }
        return (
            <div>
                <header>
                <img src={logo} alt="Logo" />
                </header>
                <p>Reset your Password</p>
                {error}
                <form autoComplete = "off" onSubmit={this.handleReset} >
                <label>
                    Username*:
                    <input required placeholder= "Username" type="username" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Old Password*:
                    <input required placeholder= "Password" type="password" name= "old_password" value={this.state.old_password} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    New Password*:
                    <input required placeholder= "Password" type="password" name= "new_password" value={this.state.new_password} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Confirm New Password*:
                    <input required placeholder= "Confirm Password" type="password" name= "confirm_new_password" value={this.state.confirm_new_password} onChange={this.handleChange} />
                    </label><br></br>
                    {warning}
                    <input type="submit" value="Reset" />
                </form>
            </div>
        )
    }
}
