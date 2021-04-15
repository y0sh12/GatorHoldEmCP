import React, { Component } from 'react'
import './ForgotPasswordEmail.css';
import Header from "../BasicComponents/Header"
import userData from "../axiosCalls.js";
import { Redirect, Link } from 'react-router-dom';
import ConfirmPage from "../ConfirmPage/ConfirmPage";

export default class ForgotPasswordEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            isError:'',
            isSent:false
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
      }

      handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }

      handleSend = (event) => {
        event.preventDefault();
        userData.resetPassEmail(this.state)
            .then((response) => {
                console.log(response)
                if(response.isSent){
                    this.setState({isSent: true});
                }
                else{
                    this.setState({isError:response.errors});
                }
            })
      }

    render() {
        if(this.state.isSent){
            return(
                <Redirect
                to={{
                    pathname: "/ConfirmPage",
                    state: {confirmWhat: "A password reset link has been sent to your email!"}
                }}
                />
            )
        }
        return (
            <>
                <Header whereTo = '/Login' username = {null} backButton = {true}/>
                <p>Reset your Password</p>
                <p className = "error">{this.state.isError}</p>
                <form autoComplete = "off" onSubmit={this.handleSend} >
                <label>
                    Email*:
                    <input required placeholder= "Email" type="email" name= "email" value={this.state.email} onChange={this.handleChange} />
                    </label><br></br>
                    <input type="submit" value="Submit" />
                </form>
            </>
        )
    }
}
