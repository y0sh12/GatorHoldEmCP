import React, { Component } from 'react'
import './Register.css';
import {Link, Redirect} from "react-router-dom";
import Login from "../Login/Login";
import userData from "../axiosCalls.js";
import Header from "../BasicComponents/Header"
import {Alert, Form, Button, Spinner, Nav, InputGroup} from 'react-bootstrap'


export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            isRegistered:false,
            isError:'',
            show:false,
            isLoading:false
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
        if(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(this.state.password) && /\d/.test(this.state.password) && this.state.password.length >= 8){
        this.setState({isLoading:true});
        userData.createUser(this.state)
        .then((response) => {
            console.log(response);
            if(response.created === false){
                this.setState({isError: response.errors});
                this.setState({isLoading:false});
                this.setState({isRegistered: false});
            }
            else{
                this.setState({isRegistered: true});
                this.setState({isLoading:false});
                this.setState({isError: ''});
            }
        })
    }
    else{
        this.setState({isError: 'Your password must have at least 8 characters, a special character, and a number!'});
        this.setState({isLoading:false});
        this.setState({isRegistered: false});
    }
    } 
    

    render() {
        let warning = '';
        if (!this.matchingPasswords()){
            warning = 'Passwords not matching!'
        }
        return (
            <>
            <body>
                <Header/>
                <Form style = {{display:"inline-block", width:"25vw"}} onSubmit={this.handleRegister}>
                <Alert show = {this.state.isRegistered} variant = "primary">An activation link has been sent to your email!</Alert>
                <Alert dismissible onClose = {() => this.setState({isError:''})} show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Email*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Email.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type="email" placeholder="Email ID" name= "email" value={this.state.email} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Username*: </b><i style = {{fontSize:"0.6em"}}>(max of 12 characters)</i></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/User.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control maxLength = "12" required type="username" placeholder="Username" name= "username" value={this.state.username} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>Password*: </b> <i style = {{fontSize:"0.6em"}}>(at least 8 characters, a special character, and a number)</i></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="Password" name= "password" value={this.state.password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>Confirm Password*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="Confirm Password" name= "confirmPassword" value={this.state.confirmPassword} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                        <Form.Check style = {{float:"left"}} onChange = {() => {this.setState({show:!this.state.show})}} type="checkbox" label="Show Passwords" />
                    </Form.Group><br></br>
                   <Alert show = {warning != ''} variant = "warning">{warning}</Alert><br></br>
                    <Button disabled = {this.state.isLoading || warning != ''} style = {{color:"blue"}} variant="warning" type="submit"><b>REGISTER</b>
                    {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                    </Button>
                </Form>
                <Nav.Item> Already have an account? <Nav.Link style = {{color: "blue", display:"inline", padding:"0"}} href = "/Login">Login Now!</Nav.Link></Nav.Item>
            </body>
            </>
        )
        // }
    }
}


