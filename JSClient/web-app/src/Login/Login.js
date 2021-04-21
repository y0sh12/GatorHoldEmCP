import React, { Component } from 'react'
import './Login.css';
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import Register from "../Register/Register";
import ForgotPasswordEmail from "../ForgotPasswordEmail/ForgotPasswordEmail";
import Home from "../Home/Home";
import Header from "../BasicComponents/Header"
import {Alert, Form, Button, Spinner, Nav, InputGroup} from 'react-bootstrap'

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isLoggedIn:false,
            isError:'',
            isLoading:false
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
        this.setState({isLoading:true});
        userData.loginUser(this.state)
        .then((response) => {
            console.log(response);
            if(response.loggedIn === false){
                this.setState({isLoading:false});
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
                        this.setState({isLoading:false});
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
                <body>
                <Header/>
                <Form style = {{display:"inline-block", width:"25vw", marginBottom: "1vh"}} onSubmit={this.handleLogin}>
                <Alert dismissible onClose = {() => this.setState({isError:''})} show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Username*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/User.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control maxLength = "12" required type="username" placeholder="Username" name= "username" value={this.state.username} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Password*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type="password" placeholder="Password" name= "password" value={this.state.password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                        <Form.Label style = {{float:"right"}}><Nav.Link style = {{color: "blue", display:"inline", padding:"0"}} href = "/ForgotPasswordEmail">Forgot Password?</Nav.Link><br></br></Form.Label>
                    </Form.Group>
                    <br></br>
                    <Button disabled = {this.state.isLoading} style = {{color:"blue"}} variant="warning" type="submit"><b>LOGIN</b>
                    {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                    </Button>
                </Form>
               <Nav.Item> Don't have an account? <Nav.Link style = {{color: "blue", display:"inline", padding:"0"}} href = "/Register">Register Now!</Nav.Link></Nav.Item>
            </body>    
            </>
        )
        }
    }
}
