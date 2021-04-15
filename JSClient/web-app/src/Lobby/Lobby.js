import React, { Component } from 'react'
import Home from "../Home/Home";
import Game from "../Game/Game";
import './Lobby.css';
import Header from "../BasicComponents/Header"
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import {socket} from "../socket.js"
// import {Serializer} from 'jsonapi-serializer';

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
            theList: [],
            start:false
        };
        this.renderPlayer = this.renderPlayer.bind(this)
        this.handleLeave = this.handleLeave.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.startGame = this.startGame.bind(this);
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
            <li key ={player._client_number}>
                <br></br>
                {index === 0 && <b>HOST: </b>}
             <b>{player._name}</b>
             {(this.props.location.state.is_vip || this.state.is_vip) && index != 0 &&
             <button className = "remove" onClick = {() => this.handleRemove(index)}> REMOVE</button>}
            </li>
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
        if(this.state.theList.length <2 ){
            this.setState({isError: "Must have atleast two players in the lobby to start the game!"})
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
            <Header/>
            <button onClick = {this.handleLeave}>Back to Home</button>
            <br></br>
            {typeof(this.props.location.state) != 'undefined' &&
                <header><b>ROOM: {this.props.location.state.roomID}</b></header> }
                {(this.props.location.state.is_vip || this.state.is_vip) && <p className = "error">{this.state.isError}</p>}
                <ul>
                {this.state.theList.map((player, index)=> {return this.renderPlayer(player, index)})}
                </ul>
                <br></br>
                {(this.props.location.state.is_vip || this.state.is_vip) && <button className = "start" onClick = {this.startGame}>START GAME</button>} 
                <br></br>
                {(!this.props.location.state.is_vip && !this.state.is_vip) &&  <i>Waiting for host to start game...</i>}
                <p>Your balance: <b>{this.state.balance}</b></p>
            </>
        )
    }
    }
}

