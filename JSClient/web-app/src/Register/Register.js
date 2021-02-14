import React, { Component } from 'react'
import './Register.css';
import logo from '../images/LOGO.png';
import {Link} from "react-router-dom";
import Login from "../Login/Login";
import userData from "../axiosCalls.js";

export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            balance: 1000
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
        userData.createUser(this.state)
        .then((response) => {
            console.log(response);
            if(response.created === false){
                alert(response.errors);
            }
            else{
                alert("Your account has been created!");
            }
        })
    } 
    

    render() {
        let error = '';
        if (!this.matchingPasswords()){
            error = <p className = "error">Passwords not matching!</p>
        }
        else{
            error = '';
        }
        return (
            <div>
                <header>
                <img src={logo} alt="Logo" />
                </header>
                {/* <body> */}
                <form autoComplete = "off" onSubmit={this.handleRegister} >
                <label>
                    Email*: 
                    <input required placeholder= "Email" type="text" name= "email" value={this.state.email} onChange={this.handleChange} />
                    </label><br></br>
                <label>
                    Username*:
                    <input required placeholder= "Username" type="text" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Password*:
                    <input required placeholder= "Password" type="password" name= "password" value={this.state.password} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Confirm Password*:
                    <input required placeholder= "Confirm Password" type="password" name= "confirmPassword" value={this.state.confirmPassword} onChange={this.handleChange} />
                    </label><br></br>
                    {error}
                    <input type="submit" value="Register" />
                </form>
                <span>
                <p>Already have an account? <span><Link to = "/Login">Login!</Link></span></p>
                </span>
                {/* </body> */}
            </div>
        )
    }
}


