import React, { Component } from 'react'
import './Register.css';
import logo from '../images/LOGO.png';
import {Link, Redirect} from "react-router-dom";
import Login from "../Login/Login";
import userData from "../axiosCalls.js";
import ConfirmPage from "../ConfirmPage/ConfirmPage";


export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            balance: 1000,
            isRegistered:false,
            isError:''
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.matchingPasswords = this.matchingPasswords.bind(this);
      }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }

    matchingPasswords() {
     return (this.state.password === this.state.confirmPassword);
    } 

    handleRegister = (event)  => {
        //Axios calls to API
        event.preventDefault();
        if(this.matchingPasswords()){
        userData.createUser(this.state)
        .then((response) => {
            console.log(response);
            if(response.created === false){
                this.setState({isError: response.errors});
            }
            else{
                this.setState({isRegistered: true});
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
            warning = <p className = "error">Passwords not matching!</p>
        }
        else{
            warning = '';
        }
        if (this.state.isRegistered){
            return (
                <Redirect
                to={{
                    pathname: "/ConfirmPage",
                    state: {confirmWhat: "Your account has been created!"}
                }}/>
            )
        }
        else{
        return (
            <div>
                <header><img src={logo} alt="Logo" /></header>
                {error}
                <form autoComplete = "off" onSubmit={this.handleRegister} >
                <label>
                    Email*: 
                    <input required placeholder= "Email" type="email" name= "email" value={this.state.email} onChange={this.handleChange} />
                    </label><br></br>
                <label>
                    Username*:
                    <input required placeholder= "Username" type="username" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Password*:
                    <input required placeholder= "Password" type="password" name= "password" value={this.state.password} onChange={this.handleChange} />
                    </label><br></br>
                    <label >
                    Confirm Password*:
                    <input  required placeholder= "Confirm Password" type="password" name= "confirmPassword" value={this.state.confirmPassword} onChange={this.handleChange} />
                    </label><br></br>
                    {warning}
                    <input type="submit" value = "Register"/>
                </form>
                <span>
                <p>Already have an account? <span><Link to = "/Login">Login!</Link></span></p>
                </span>
            </div>
        )
        }
    }
}


