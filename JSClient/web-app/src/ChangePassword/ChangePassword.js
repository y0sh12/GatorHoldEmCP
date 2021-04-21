import React, { Component } from 'react'
import userData from "../axiosCalls.js";
import { Redirect, Link } from 'react-router-dom';
import Header from "../BasicComponents/Header"
import {Alert, Form, Button, Spinner, Nav, InputGroup} from 'react-bootstrap'

export default class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            old_password:'',
            new_password: '',
            confirm_new_password: '',
            isLoggedIn:true,
            isChanged:false,
            isError:'',
            show:false,
            isLoading:false,
            stillIn:true
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleChangePass = this.handleChangePass.bind(this);
        this.matchingPasswords = this.matchingPasswords.bind(this);
      }

      componentWillMount(){
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
    }

    componentDidMount() {
        if(typeof this.props.location.state === 'undefined'){
            console.log("Here");
            this.setState({isLoggedIn: false});
        }
        this.setState({username:this.props.location.state.username});
    } 

      matchingPasswords() {
        return (this.state.new_password === this.state.confirm_new_password);
       } 


      handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }

      handleChangePass = (event) => {
          event.preventDefault();
          this.setState({isLoading: true});
          if(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(this.state.new_password) && /\d/.test(this.state.new_password) && this.state.new_password.length >= 8){
              userData.changePass(this.state)
              .then((response) => {
                  console.log(response);
                  if(response.isChanged === false){
                      this.setState({isError:response.errors});
                      this.setState({isChanged: false});
                      this.setState({isLoading: false});
                  }
                  else{
                      this.setState({isChanged: true});
                      this.setState({isError:''});
                      this.setState({isLoading: false});
                  }
              })
          }
          else{
              this.setState({isError: 'Your password must have at least 8 characters, a special character, and a number!'});
              this.setState({isLoading: false});
              this.setState({isChanged: false});
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
        if(!this.state.isLoggedIn){
            return(
                <Redirect
                to={{
                    pathname: "/Login"
                }}
                />
            )
        }
        return (
            <>
                <body>
                <Header />
                <h3>Change your Password</h3><br></br>
                <Form style = {{display:"inline-block", width:"25%"}} onSubmit={this.handleChangePass}>
                <Alert show = {this.state.isChanged} variant = "primary">Your password has been changed!</Alert>
                <Alert dismissible onClose = {() => this.setState({isError:''})} show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Username*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2rem", height:"1.2rem"}} src = "images/User.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control disabled defaultValue={this.state.username} onChange={this.handleChange} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>Old Password*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2rem", height:"1.2rem"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="Old Password" name= "old_password" value={this.state.old_password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>New Password*: </b><i style = {{fontSize:"0.6em"}}>(min 8 characters, a special character, and a number)</i></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2rem", height:"1.2rem"}} src = "images/Password.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control required type={this.state.show ? 'text':'password'} placeholder="New Password" name= "new_password" value={this.state.new_password} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label style = {{float:"left"}}><b>Confirm New Password*: </b></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2rem", height:"1.2rem"}} src = "images/Password.png"></img></InputGroup.Text>
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
                <p>Back to <span><Nav.Link style = {{display:"inline", padding:"0"}}>
                    <Link style = {{color: "blue", textDecoration:"none"}} to={{
                    pathname: "/Home",
                    state:{
                        username: this.props.location.state.username
                    }}}>Home</Link></Nav.Link></span></p>
                </body>
            </>
        )
    }
}
