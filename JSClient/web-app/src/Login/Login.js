import React, { Component } from 'react'
import './Login.css';
import logo from '../images/LOGO.png';
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import Register from "../Register/Register";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import Home from "../Home/Home";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isLoggedIn:false,
            isError:''
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
      }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }


    handleLogin = (event) => {
        //Axios calls to API
        event.preventDefault();
        userData.loginUser(this.state)
        .then((response) => {
            console.log(response);
            if(response.loggedIn === false){
                this.setState({isError:response.errors});
            }
            else{
                this.setState({isLoggedIn: true});
            }
        })
    }   

    render() {
        let error = '';
        if(this.state.isError != ''){
            error = <p className = "error">{this.state.isError}</p>
        }
        if(this.state.isLoggedIn){
            return(
                <Redirect
                to={{
                    pathname: "/Home"
                }}
                />
            )
        }
        else{
        return (
            <div>
                <header>
                <img src={logo} alt="Logo" />
                </header>
                {error}
                <form onSubmit={this.handleLogin} >
                <label>
                    Username*:
                    <input required placeholder= "Username" type="username" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Password*:
                    <input required placeholder= "Password" type="password" name= "password" value={this.state.password} onChange={this.handleChange} />
                    </label><br></br>
                    <Link to = "/ForgotPassword">Forgot Password?</Link><br></br>
                    <input type="submit" value="Login" />
                </form>
                <p>Don't have an account? <span><Link to = "/Register">Register Now!</Link></span></p>
            </div>
        )
        }
    }
}
