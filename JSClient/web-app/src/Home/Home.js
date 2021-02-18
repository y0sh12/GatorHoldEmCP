import React, { Component } from 'react'
import logo from '../images/LOGO.png';
import './Home.css';
import {Link, Redirect} from "react-router-dom";
import JoinLobby from "../JoinLobby/JoinLobby";
import CreateLobby from "../CreateLobby/CreateLobby";
import userData from "../axiosCalls.js";
import Login from "../Login/Login";
import Header from "../BasicComponents/Header"

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: null,
            isLoggedIn:true
        };

    }


    componentDidMount() {
     if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
     }
     else{
         console.log(this.props.location);
        userData.getBalance(this.props.location.state.username)
        .then((response) => {
            this.setState({balance:response});
        })
    }
    }


    render() {
        let theUsernameProp = (typeof this.props.location.state === 'undefined') ? null : this.props.location.state.username;
        if(!this.state.isLoggedIn){
            return(
                <Redirect
                to={{
                    pathname: "/Login"
                }}
                />
            )
        }
        else{
        return (
            <>
            <Link className = "link" to = "/Login">Sign Out</Link>
                <Header/>
                <li>
                   <ul> <Link to={{
                            pathname: '/CreateLobby',
                            state: {
                                username: theUsernameProp
                            }
                        }}className = "link">Create Lobby</Link></ul>
                    <ul><Link to={{
                            pathname: '/JoinLobby',
                            state: {
                                username: theUsernameProp
                            }
                        }}className = "link">Join Lobby</Link></ul>
                </li>
                <p>Your balance: {this.state.balance}</p>
            </>
        )
        }
    }
}
