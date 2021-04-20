import React, { Component } from 'react'
import Home from "../Home/Home";
import Game from "../Game/Game";
import './Lobby.css';
import Header from "../BasicComponents/Header"
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import {socket} from "../socket.js"
import {Alert, ListGroup, Button, ListGroupItem, Modal, Spinner, Nav} from 'react-bootstrap'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

export default class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: null,
            isLoggedIn:true,
            isError:'',
            is_vip:false,
            goBack:false,
            stillIn:true,
            isLoading:false,
            modal:false,
            theList: [],
            start:false
        };
        this.renderPlayer = this.renderPlayer.bind(this)
        this.handleLeave = this.handleLeave.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    componentWillMount(){
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
    }


    componentDidMount() {
        //Get Player Balance
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
        else{
            userData.getBalance(this.props.location.state.username)
            .then((response) => {
                this.setState({balance:response});
            })
        }
        //Socket Handlers
        if(socket != null){
        socket.on("left_room", (message) => {
            console.log(message)
            socket.emit('active_player_list', this.props.location.state.roomID, (pl_list) => {
                this.setState({theList:pl_list});
            });
        });
        socket.on("user_connection", (message) => {
            console.log(message)
           console.log((new Date()).getMilliseconds());
            socket.emit('active_player_list', this.props.location.state.roomID, (pl_list) => {
                this.setState({theList:pl_list});
            });
            console.log((new Date()).getMilliseconds());
        });
        socket.on("vip", () => {
            this.setState({is_vip: true})
            console.log("You are the VIP")
        });
        socket.on("disconnect", () => {
            console.log("Disconnected!!");
            this.setState({stillIn:false}); 
        });
        socket.on("message", (message) => {
            if(message === "Game Starting..."){
                    this.setState({start:true});
                    console.log(message);
            }
        })
        socket.emit('active_player_list', this.props.location.state.roomID, (pl_list) => {
            this.setState({theList:pl_list});
        });
    }
    }

    componentWillUnmount(){
        if(socket!= null){
        socket.off('get_list');
        socket.off('left_room');
        socket.off('user_connection');
        socket.off('vip');
        socket.off('disconnect');
        socket.off('message');
        }
    
    }


    renderPlayer = (player, index) => {  
        return(
            <ListGroupItem horizontal = "true" key ={player._client_number} variant="primary" style = {{marginBottom: "2vh"}}>
            {index === 0 && <b>HOST: </b>}
             <b>{player._name}</b>
             {(this.props.location.state.is_vip || this.state.is_vip) && index != 0 &&
             <Button style = {{color:"black"}} variant = "danger" onClick = {() => this.handleRemove(index)}> REMOVE</Button>}
            </ListGroupItem>
        )
    }

    handleRemove = (index) => {
        socket.emit('remove_player', [this.props.location.state.roomID, index]);
    }


    handleLeave = (event) => {
        event.preventDefault();
        socket.disconnect();
    }

    startGame = (event) => {
        event.preventDefault();
        this.setState({isLoading:true});
        if(this.state.theList.length <2 ){
            this.setState({isError: "Must have atleast two players in the lobby to start the game!"})
            this.setState({isLoading:false});
        }
        else{
        socket.emit('start_game', this.props.location.state.roomID);
        }
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
        else if(!this.state.stillIn){
            return(
                <Redirect
                to={{
                    pathname: "/Home",
                    state:{
                        username: this.props.location.state.username
                    }

                }}
                />
            )
        }
        else if(this.state.start){
            return(
                <Redirect
                to={{
                    pathname: "/Game",
                    state:{
                        username: this.props.location.state.username,
                        roomID:this.props.location.state.roomID,
                        is_vip:this.state.is_vip || this.props.location.state.is_vip,
                        theList:this.state.theList
                    }

                }}
                />
            )
        }
        else{
        return (
            <>
            <Modal variant = "warning" centered size="sm" show={this.state.modal} onHide={() => {this.setState({modal:false})}} >
                <Modal.Body>Are you sure you want to leave the lobby?</Modal.Body>
                <Modal.Footer> 
                <Button variant="secondary" onClick={() => {this.setState({modal:false})}}>Close</Button>
                <Button variant = "danger" onClick = {this.handleLeave}>Leave Lobby</Button>
                </Modal.Footer>
            </Modal>
            <body>
            <Nav style = {{margin:"1rem"}} className="justify-content-between">
                <Button variant = "danger" onClick = {() => {this.setState({modal:true})}}>Back to Home</Button>
                <b><img style = {{width:"1.5rem", height:"1.5rem"}} src = "images/User.png"></img>  Welcome {this.props.location.state.username} !</b>               
            </Nav>
            <img src= '/images/LOGO.png' alt="Logo" />
            <br></br>
            <h3>LOBBY: {this.props.location.state.roomID}</h3>
                <ListGroup style = {{display:"inline-block", width:"20%", marginTop: "2vh", marginBottom:"2vh"}} variant="flush">
                {(this.props.location.state.is_vip || this.state.is_vip) && <Alert dismissible onClose = {() => this.setState({isError:''})}show = {this.state.isError != ''} variant = "danger">{this.state.isError}</Alert>}
                {this.state.theList.map((player, index)=> {return this.renderPlayer(player, index)})}
                {(this.props.location.state.is_vip || this.state.is_vip) && <Button style = {{color:"blue"}} variant="warning" onClick = {this.startGame}><b>START GAME</b>
                {this.state.isLoading && <Spinner animation="border" color = "blue" size="sm"></Spinner>}
                </Button>} 
                </ListGroup>
                <br></br>
                {(!this.props.location.state.is_vip && !this.state.is_vip) &&  <i>Waiting for host to start game...</i>}
                <h5>Your balance: <b>${this.state.balance}</b></h5>
                </body>
            </>
        )
    }
    }
}

