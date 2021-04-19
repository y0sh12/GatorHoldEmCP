import React, { Component } from 'react'
import './ForgotPasswordEmail.css';
import Header from "../BasicComponents/Header"
import userData from "../axiosCalls.js";
import { Redirect, Link } from 'react-router-dom';
import {Alert, Form, Button, Spinner, Nav, InputGroup} from 'react-bootstrap'

export default class ForgotPasswordEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            isError:'',
            isSent:false,
            isLoading:false
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
      }

      handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }

      handleSend = (event) => {
        event.preventDefault();
        this.setState({isLoading:true});
        userData.resetPassEmail(this.state)
            .then((response) => {
                console.log(response)
                if(response.isSent){
                    this.setState({isError:''})
                    this.setState({isSent: true});
                    this.setState({isLoading:false});
                }
                else{
                    this.setState({isError:response.errors});
                    this.setState({isLoading:false});
                    this.setState({isSent: false});
                }
            })
      }

    render() {
        return (
            <>
                <body>
                    <Header/>
                <Form style = {{display:"inline-block", width:"25vw", marginBottom: "1vh"}} onSubmit={this.handleSend}>
                 <Alert show = {this.state.isSent} variant = "primary">A password reset link has been sent to your email!</Alert>
                <Alert dismissible onClose = {() => this.setState({isError:''})}show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Email*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/Email.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type="email" placeholder="Email ID" name= "email" value={this.state.email} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Button disabled = {this.state.isLoading} style = {{color:"blue"}} variant="warning" type="submit"><b>SUBMIT</b>
                    {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                    </Button>
                </Form>
                <p>Back to <span><Nav.Link style = {{color: "blue", display:"inline", padding:"0"}} href = "/Login">Login</Nav.Link></span></p>
                </body>
            </>
        )
    }
}
