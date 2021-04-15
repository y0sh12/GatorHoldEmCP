import React, { Component } from 'react'
import './ForgotPassword.css';
import userData from "../axiosCalls.js";
import { Redirect, Link } from 'react-router-dom';
import ConfirmPage from "../ConfirmPage/ConfirmPage";
import Header from "../BasicComponents/Header"

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
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
                    state: {confirmWhat: "Your password has been successfully reset!"}
                }}
                />
            )
        }
        return (
            <>
                <Header />
                <p>Reset your Password</p>
                <p className = "error">{this.state.isError}</p>
                <form autoComplete = "off" onSubmit={this.handleReset} >
                <label>
                    Email*:
                    <input required placeholder= "Email" type="username" name= "email" value={this.state.email} onChange={this.handleChange} />
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
            </>
        )
    }
}
