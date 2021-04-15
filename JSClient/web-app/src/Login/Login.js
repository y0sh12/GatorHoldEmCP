import React, { Component } from 'react'
import './Login.css';
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import Register from "../Register/Register";
import ForgotPasswordEmail from "../ForgotPasswordEmail/ForgotPasswordEmail";
import Home from "../Home/Home";
import Header from "../BasicComponents/Header"
import Alert from 'react-bootstrap/Alert'

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isLoggedIn:false,
            isError:null
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
                userData.verifiedOrNot(this.state.username)
                .then((response1) => {
                    console.log("Email verified: " + response1)
                    if(response1 == "1"){
                        this.setState({isLoggedIn: true});
                    }
                    else{
                        this.setState({isError:"Please activate your account!"});
                    }
                })
            }
        })
    }   

    render() {
        if(this.state.isLoggedIn){
            return(
                <Redirect
                to={{
                    pathname: "/Home",
                    state:{
                        username: this.state.username
                    }
                }}
                />
            )
        }
        else{
        return (
            <>
                <Header/>
                {/* <Alert dismissible onClose = {() => this.setState({isError:null})}show = {this.state.isError != null} variant = "danger"
                className = "error"
                >{this.state.isError}</Alert> */}
                <p className = "error">{this.state.isError}</p>
                <form onSubmit={this.handleLogin} >
                <label>
                    Username*:
                    <input required placeholder= "Username" type="username" name= "username" value={this.state.username} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Password*:
                    <input required placeholder= "Password" type="password" name= "password" value={this.state.password} onChange={this.handleChange} />
                    </label><br></br>
                    <Link className = "link"  to = "/ForgotPasswordEmail">Forgot Password?</Link><br></br>
                    <input type="submit" value="Login" />
                </form>
                <p>Don't have an account? <span><Link className = "link"  to = "/Register">Register Now!</Link></span></p>
            </>
        )
        }
    }
}
