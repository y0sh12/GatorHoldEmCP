import React, { Component } from 'react'
import './Home.css';
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import Login from "../Login/Login";
import Lobby from "../Lobby/Lobby";
import ChangePassword from "../ChangePassword/ChangePassword"
import Header from "../BasicComponents/Header"
import io from "socket.io-client";
import {Alert, Form, Button, Spinner, Modal, Nav, InputGroup} from 'react-bootstrap'
import {socket, setSocket} from "../socket.js"

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: null,
            isLoggedIn:true,
            stillIn:true,
            isError:'',
            isReset:false,
            isLoading:false,
            roomID: '',
            in_room:false,
            isLoading:false,
            modal:false,
            is_vip: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleJoinCreate = this.handleJoinCreate.bind(this);
        this.handlers = this.handlers.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }


handlers() {

    socket.on("connect", () => {
    console.log("Welcome!")
    console.log("You have successfully connected to the Gator Hold \'em server!")
    });

    socket.on("joined_room", (message, room) => {
        console.log(message)
        socket.emit('my_name', this.props.location.state.username, this.state.roomID);
        this.setState({in_room: true})
      });

      socket.on("user_connection", (message) => {
        console.log(message)
      });

      socket.on("vip", () => {
        this.setState({is_vip: true})
        console.log("You are the VIP")
      });

      socket.on("disconnect", () => {
          console.log("Disconnected!!");
      });

      socket.on("connection_error", (error) => {
        switch(error){
            case "Unauthorized":
                this.setState({isError: "The game has started or has reached the maximum players limit!"})
                this.setState({isLoading:false});
                this.setState({isReset:false});
                break;
            case "Error: Balance under 50":
                this.setState({isError: "Your balance is under $50!"})
                this.setState({isLoading:false});
                break;
            case "Error: Account server unreachable":
                this.setState({isError: "Account server unreachable"})
                this.setState({isLoading:false});
                break;
        }
        socket.disconnect();
      });
}

    componentWillMount(){
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
    }

    componentDidMount() {
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
        else{
           userData.getBalance(this.props.location.state.username)
           .then((response) => {
               this.setState({balance:response});
           })
        }
    } 

componentWillUnmount(){
    if(socket!= null){
    socket.off('connect');
    socket.off('joined_room');
    socket.off('user_connection');
    socket.off('vip');
    socket.off('disconnect');
    socket.off('connection_error');
    }

}


handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

handleJoinCreate = (event) =>{
    event.preventDefault();
    if(this.state.balance > 50){
    this.setState({isLoading:true});
    setSocket(io("http://0.0.0.0:5001", {
    reconnection: false,
    transports: ['websocket']
    }));
    this.handlers();    
    socket.emit("goto_room", this.state.roomID);
    }
    else{
        this.setState({isError: "Your balance is under $50!"});
    }

}

handleReset = (event) => {
    event.preventDefault();
    userData.getID(this.props.location.state.username)
    .then((response) => {
        console.log(response)
        userData.resetBalance({id:response})
            .then((response2) => {
                console.log(response2);
                if(response2.isReset == true){
                    this.setState({isReset:true});
                    userData.getBalance(this.props.location.state.username)
                    .then((response3) => {
                        this.setState({balance:response3});
                    });
                    this.setState({isError:''});
                }
            })
        });
}


    render() {
        if(!this.state.isLoggedIn){
            return(
                <Redirect
                to={{
                    pathname: "/Login"
                }}
                />
            )
        }
        else if(this.state.in_room){
            return(
                <Redirect
                to={{
                    pathname: "/Lobby",
                    state:{
                        username: this.props.location.state.username,
                        is_vip:this.state.is_vip,
                        roomID:this.state.roomID
                    }
                }}
                />
            )
        }
        else if(!this.state.stillIn){
            console.log("Herrrrrrrr");
            return(
                <Redirect
                to={{
                    pathname: "/ChangePassword",
                    state:{
                        username: this.props.location.state.username,
                    }
                }}
                />
            )
        }
        else{
        return (
            <>
            <Modal centered size="sm" show={this.state.modal} onHide={() => {this.setState({modal:false})}} >
                <Modal.Body>Are you sure you want to sign out?</Modal.Body>
                <Modal.Footer> 
                <Button variant="secondary" onClick={() => {this.setState({modal:false})}}>Close</Button>
                <Button variant = "danger" onClick = {() => {this.setState({isLoggedIn:false})}}>SIGN OUT</Button>
                </Modal.Footer>
            </Modal>
            <body>
                <Nav style = {{margin:"1vw"}} className="justify-content-between"> 
                <Button onClick = {() => {this.setState({modal:true})}} variant = "danger">SIGN OUT</Button>
                <b><img style = {{width:"1.5rem", height:"1.5rem"}} src = "images/User.png"></img>  Welcome {this.props.location.state.username} !</b>
                </Nav>
                <img src= '/images/LOGO.png' alt="Logo" />
                <h3>HOME</h3><br></br>
                <Form style = {{display:"inline-block", width:"25vw", marginBottom: "3vh"}} onSubmit={this.handleJoinCreate}>
                <Alert dismissible onClose = {() => this.setState({isReset:false})}  show = {this.state.isReset === true} variant = "primary">Balance has been reset to $1000!</Alert>                    
                <Alert dismissible onClose = {() => this.setState({isError:''})}show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>
                    <Form.Group >
                        <Form.Label style = {{float:"left"}}><b>Lobby ID*: </b><i style = {{fontSize:"0.7em"}}>(max of 8 characters)</i></Form.Label>
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text><img style = {{width:"1.2em", height:"1.2em"}} src = "images/ID.png"></img></InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control maxLength = "8" required type="text" placeholder="Enter New/Existing Lobby ID" name= "roomID" value={this.state.roomID} onChange={this.handleChange.bind(this)} />
                        </InputGroup>
                    </Form.Group>
                    <br></br>
                    <Button disabled = {this.state.isLoading} style = {{color:"blue"}} variant="warning" type="submit"><b>JOIN LOBBY</b>
                    {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                    </Button>
                </Form>
            <h5>Your balance: <b>${this.state.balance}</b></h5>
            <Nav style = {{margin:"2rem"}} className = "justify-content-around">
                <Button disabled = {this.state.balance === 1000} variant = "danger" onClick = {this.handleReset}>RESET BALANCE!</Button>
                <Button style = {{color:"blue"}} variant="warning" onClick = {() => {this.setState({stillIn:false})}}><b>CHANGE PASSWORD</b></Button>
            </Nav>
                </body>
            </>
        )
       }
    }
}
