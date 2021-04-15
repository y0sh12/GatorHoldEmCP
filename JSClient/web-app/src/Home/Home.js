import React, { Component } from 'react'
import './Home.css';
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import Login from "../Login/Login";
import Lobby from "../Lobby/Lobby";
import Header from "../BasicComponents/Header"
import io from "socket.io-client";
import {socket, setSocket} from "../socket.js"

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: null,
            isLoggedIn:true,
            isError:'',
            roomID: '',
            in_room:false,
            is_vip: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleJoinCreate = this.handleJoinCreate.bind(this);
        this.handlers = this.handlers.bind(this);
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
        this.setState({isError: "The game has started or has reached the maximum players limit!"})
        socket.disconnect();
      });
}


    componentDidMount() {
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
        else{
           userData.getBalance(this.props.location.state.username)
           .then((response) => {
               console.log(response);
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
    setSocket(io("http://0.0.0.0:5001", {
    reconnection: false,
    transports: ['websocket']
    }));
    this.handlers();    
    socket.emit("goto_room", this.state.roomID);
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
        else{
        return (
            <>
            <Link className = "link" to = "/Login">Sign Out</Link>
                <Header/>
                <p className = "error">{this.state.isError}</p>
                <form onSubmit={this.handleJoinCreate} >
                <label>
                    Create or Join Existing Room*:
                    <input required placeholder= "Room ID" type="text" name= "roomID" value={this.state.roomID} onChange={this.handleChange} />
                    </label><br></br>
                    <input type="submit" value="Create/Join Lobby" />
                </form>
                <p>Your balance: <b>{this.state.balance}</b></p>
            </>
        )
       }
    }
}
