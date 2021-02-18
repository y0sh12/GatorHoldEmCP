import React, { Component } from 'react'
import Header from "../BasicComponents/Header"
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";

export default class JoinLobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomID: '',
            displayName: '',
            isLoggedIn:true,
            balance:null,
            isError:''
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleJoin = this.handleJoin.bind(this);
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

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
      }

    handleJoin = (event) =>{
        event.preventDefault();
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
        return (
            <div>
                <Header whereTo = '/Home' username = {theUsernameProp} backButton = {true}/>
                <form onSubmit={this.handleJoin} >
                <label>
                    Room ID*:
                    <input required placeholder= "ID" type="text" name= "roomID" value={this.state.roomID} onChange={this.handleChange} />
                    </label><br></br>
                    <label>
                    Display Name*:
                    <input required placeholder= "Name" type="text" name= "displayName" value={this.state.displayName} onChange={this.handleChange} />
                    </label><br></br>
                    <input type="submit" value="Join" />
                </form>
                <p>Your balance: {this.state.balance}</p>
            </div>
        )
    }
}
