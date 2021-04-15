import React, { Component } from 'react'
import Header from "../BasicComponents/Header"
import Home from "../Home/Home";
import Login from "../Login/Login";
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import io from "socket.io-client";
import {socket} from "../socket.js"


export default class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn:true,
            stillIn:true,
            is_vip:false,
            balance:null,
            theList:[],
            cards:['','','','',''],
            hand:[],
            dealer:'',
            small_blind:'',
            big_blind:'',
            minimum_bet:'',
            round_num:'0',
            pot:0,
            myTurn:false,
            theMessage:'',
            theCheckorCall:'Check',
            raiseAmount:0,
            option:'',
            theAck:null

        };
        this.handleLeave = this.handleLeave.bind(this);
        this.renderPlayer = this.renderPlayer.bind(this)
        this.renderMyInfo = this.renderMyInfo.bind(this);
        this.chooseOption = this.chooseOption.bind(this);
        this.raiseSlider = this.raiseSlider.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.decodeCard = this.decodeCard.bind(this);      

    }


    componentDidMount(){
        //Fetch player balance at start
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
        // else{
        //     userData.getBalance(this.props.location.state.username)
        //     .then((response) => {
        //         this.setState({balance:response});
        //     })
        // }

        //Socket handlers
        socket.on("left_room", (message) => {
            this.setState({theMessage:message});
            console.log(this.state.theMessage);
            socket.emit('active_player_list', this.props.location.state.roomID, (pl_list) => {
                this.setState({theList:pl_list});
            });
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
            this.setState({theMessage:message});
            console.log(this.state.theMessage);
        });
        socket.on("new_hand", () => {
            this.setState({cards:['','','','','']});
        });
        socket.on('emit_hand', (card1, card2) => {
            this.setState({hand:[card1, card2]});
            console.log("Your hand:" + this.state.hand[0] + ', ' + this.state.hand[1]);

        });
        socket.on('board_init_info', (board_info) => {
            this.setState({'dealer': board_info[0]})
            this.setState({'small_blind': board_info[1]})
            this.setState({'big_blind': board_info[2]})
            this.setState({'minimum_bet': board_info[3]})
            this.setState({'round_num': board_info[4]})
        });
        socket.on('update_players', (list) => {
            this.setState({theList:list});
        })
        socket.on('which_players_turn', (data) => {
            console.log(this.state.theList);

            // var me = this.state.theList.filter(function(player) {
            //     return player._client_number === data[0];
            // });
            // console.log(me);
            // this.setState({theMessage:(me[0]._name + " has to go")});

            // Update minimum bet
            this.setState({minimum_bet:data[1]});

            // Update the pot
            let thePot = 0
            for(let player of this.state.theList){
                thePot += player._investment;
            }
            this.setState({pot:thePot});
            console.log("Pot: " + this.state.pot);

            // Update the player balance
            userData.getBalance(this.props.location.state.username)
            .then((response) => {
                this.setState({balance:response});
            })
        });
        socket.on('your_turn', (balance, investment, minimum_bet, checkOrCall, ack) => {
            let choice = "";
            this.setState({myTurn:true});
            this.setState({theCheckorCall:checkOrCall});
            var myFunc = () => {
                if(this.state.option != ''){
                    this.setState({myTurn:false});
                    choice = this.state.option
                    this.setState({option:''});
                    ack(choice);
                }
                else {
                    setTimeout(() => {myFunc()}, 500)
                }
            }
            myFunc();
        });
        socket.on("raise", (ask, ack) => {
            ack(this.state.raiseAmount);
        });
        socket.on('you_timed_out', () => {
            this.setState({myTurn:false});
        });
        socket.on('flop', (flop) => {
            let array = flop.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            this.setState({cards:[array[0], array[1], array[2]]});
        });
        socket.on('turn', (turn) => {
            let array = turn.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            this.setState({cards:[array[0], array[1], array[2], array[3]]});
        });
        socket.on('river', (river) => {
            let array = river.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            this.setState({cards:[array[0], array[1], array[2], array[3], array[4]]});
        });
        socket.on('game_ended', (message) => {
            console.log(message);
            socket.disconnect();
        });
    }



    renderPlayer = (player) => {  
        if(player._name != this.props.location.state.username){
        return(
            <li key = {player._client_id}>
                <p><b>{player._name}</b></p>
                <p>Balance: {player._balance}</p>
                <p>Investment: {player._investment}</p>
            </li>
            
        )
        }
    }

    renderMyInfo = (me) => {
        return (
            <li key = {me._client_id}>
                <p>Your balance: <b>{me._balance}</b></p>
                <p>Your investment: {me._investment}</p>
            </li>
        )
    }

    renderCard = (card, index) => {
        return(
                <img style = {{width: "15%", height:"15%"}} key = {index} src = {this.decodeCard(card)}/>
        )
    }

    decodeCard = (card) => {
        if(card != '') {
        let array = card.split(" ");
        let suit = array[1].toLowerCase();
        let rank = array[3];
        switch(rank){
        case("11"):
            rank = "jack"
            break;
        case("12"):
            rank = "queen"
            break;
        case("13"):
            rank = "king"
            break;
        case("14"):
            rank = "ace"
            break;
        }
        return "images/" + rank + "_of_" + suit + "s.png";
    }
    }

    chooseOption = (event) => {
        event.preventDefault();
        console.log(event.target.name);
        switch(event.target.name){
            case "CheckorCall":
                this.setState({option:"1"});
                break;
            case "Fold":
                this.setState({option:"2"});
                break;
            case "Raise":
                this.setState({option:"3"});  
                break;     
        }
    }

    raiseSlider = (event) => {
        event.preventDefault();
        this.setState({raiseAmount:event.target.value});
    }
    
    //When Player exits to main menu
    handleLeave = (event) => {
        event.preventDefault();
        socket.disconnect();
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
        return (
            < >
                <button onClick = {this.handleLeave}>Back to Home</button>
                <header><b>GAME ROOM</b></header>
                <span>
                    {this.state.theList.map((player)=> {return this.renderPlayer(player)})}
                </span>
                <span>{this.state.cards.map((card, index)=> {return this.renderCard(card, index)})}</span>
                <p>{this.state.theMessage}</p>
                <p>Pot: {this.state.pot}</p>
                <p>Minimum Bet: {this.state.minimum_bet}</p>
                <p>Round Number: {this.state.round_num}</p>
                <ul>{this.state.theList.filter(player => player._name === this.props.location.state.username).map((me) => {return this.renderMyInfo(me)})}</ul>
                {/* <p>Your balance: <b>{this.state.balance}</b></p> */}
                <header>Your HAND:</header>
                <span>{this.state.hand.map((card, index)=> {return this.renderCard(card, index)})}</span>
                <div>
                <button disabled = {!this.state.myTurn} name = 'CheckorCall' onClick = {this.chooseOption}>{this.state.theCheckorCall}</button>
                <button disabled = {!this.state.myTurn} name = 'Fold' onClick = {this.chooseOption}>Fold</button>
                <button disabled = {!this.state.myTurn} name = 'Raise' onClick = {this.chooseOption}>Raise</button>
                <input disabled = {!this.state.myTurn} onChange = {this.raiseSlider.bind(this)} type="range" min={this.state.minimum_bet} max={this.state.balance} value={this.state.raiseAmount}></input>
                </div>
            </>
        )
    }
}
