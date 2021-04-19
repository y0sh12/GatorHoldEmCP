import React, { Component } from 'react'
import './ForgotPassword.css';
import userData from "../axiosCalls.js";
import { Redirect, Link } from 'react-router-dom';
import Header from "../BasicComponents/Header"
import {Alert, Form, Button, Spinner, Nav, InputGroup} from 'react-bootstrap'

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            new_password: '',
            confirm_new_password: '',
            isReset:false,
            isError:'',
            show:false,
            isLoading:false
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
        this.setState({isLoading: true});
        if(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(this.state.new_password) && /\d/.test(this.state.new_password) && this.state.new_password.length >= 8){
            userData.resetPass(this.state)
            .then((response) => {
                console.log(response);
                if(response.isReset === false){
                    this.setState({isError:response.errors});
                    this.setState({isReset: false});
                    this.setState({isLoading: false});
                }
                else{
                    this.setState({isReset: true});
                    this.setState({isError:''});
                    this.setState({isLoading: false});
                }
            })
        }
        else{
            this.setState({isError: 'Your password must have at least 8 characters, a special character, and a number!'});
            this.setState({isLoading: false});
            this.setState({isReset: false});
        }
    } 

    render() {
        let warning = '';
        if (!this.matchingPasswords()){
            warning = 'New passwords not matching!'
        }
        else{
            warning = '';
        }
        return (
            <>
                <body>
                <Header />
                <h3>Reset your Password</h3><br></br>
                <Form style = {{display:"inline-block", width:"25vw"}} onSubmit={this.handleReset}>
                <Alert show = {this.state.isReset} variant = "primary">Your password has been reset!<Nav.Link style = {{color: "blue", display:"inline", padding:"0"}} href = "/Login"> Login</Nav.Link> now!</Alert>
                <Alert dismissible onClose = {() => this.setState({isError:''})} show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Email*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Email.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type="email" placeholder="Email ID" name= "email" value={this.state.email} onChange={this.handleChange} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>New Password*: </b><i style = {{fontSize:"0.6em"}}>(min 8 characters, a special character, and a number)</i></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="New Password" name= "new_password" value={this.state.new_password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>Confirm New Password*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="Confirm New Password" name= "confirm_new_password" value={this.state.confirm_new_password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                        <Form.Check style = {{float:"left"}} onChange = {() => {this.setState({show:!this.state.show})}} type="checkbox" label="Show Passwords" />
                    </Form.Group><br></br>
                   <Alert show = {warning != ''} variant = "warning">{warning}</Alert><br></br>
                    <Button disabled = {this.state.isLoading || warning != ''} style = {{color:"blue"}} variant="warning" type="submit"><b>RESET</b>
                    {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                    </Button>
                </Form>
                </body>
            </>
        )
    }
}
