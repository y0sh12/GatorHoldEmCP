import React, { Component } from 'react'
import './Login.css';
import logo from '../images/LOGO.png';
import {BrowserRouter, Link, Switch, Route} from "react-router-dom";
import Register from "../Register/Register";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
      }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }


    handleLogin(event) {
        //Axios calls to API
    }   

    render() {
        return (
            <div>
                <header>
                <img src={logo} alt="Logo" />
                </header>
                {/* <body> */}
                <form onSubmit={this.handleLogin} >
                <label>
                    Username*:
                    <input required placeholder= "Username" type="text" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Password*:
                    <input required placeholder= "Password" type="password" name= "password" value={this.state.password} onChange={this.handleChange} />
                    </label><br></br>
                    <input type="submit" value="Login" />
                </form>
                <p>Don't have an account? <span><Link to = "/Register">Register Now!</Link></span></p>
                {/* </body> */}
            </div>
        )
    }
}
