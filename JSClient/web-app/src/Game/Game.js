import React, { Component } from 'react'
import Header from "../BasicComponents/Header"
import Home from "../Home/Home";
import Login from "../Login/Login";
import {Link, Redirect} from "react-router-dom";
import userData from "../axiosCalls.js";
import io from "socket.io-client";
import {Alert, ListGroup, Button, ListGroupItem, Modal, Nav, Card, Badge, OverlayTrigger, Popover, ButtonGroup} from 'react-bootstrap'
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
            theMessage:'GAME HAS BEGUN',
            theMessage2:'',
            theCheckorCall:'CHECK',
            raiseAmount:50,
            option:'',
            modal:false

        };
        this.handleLeave = this.handleLeave.bind(this);
        this.renderPlayer = this.renderPlayer.bind(this)
        this.renderMyInfo = this.renderMyInfo.bind(this);
        this.chooseOption = this.chooseOption.bind(this);
        this.raiseSlider = this.raiseSlider.bind(this);
        this.renderCard = this.renderCard.bind(this);
        this.decodeCard = this.decodeCard.bind(this);      

    }

    componentWillMount(){
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }
    }


    componentDidMount(){
        if(typeof this.props.location.state === 'undefined'){
            this.setState({isLoggedIn: false});
        }

        //Socket handlers
        if(socket != null){
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
            this.setState({raiseAmount:50});
        });
        socket.on('emit_hand', (card1, card2) => {
            this.setState({hand:[card1, card2]});
            console.log("Your hand:" + this.state.hand[0] + ', ' + this.state.hand[1]);

        });
        socket.on('board_init_info', (board_info) => {
            this.setState({'dealer': this.state.theList.filter(player => player._client_number === board_info[0])[0]._name})
            this.setState({'small_blind': this.state.theList.filter(player => player._client_number === board_info[1])[0]._name})
            this.setState({'big_blind': this.state.theList.filter(player => player._client_number === board_info[2])[0]._name})
            this.setState({'minimum_bet': board_info[3]})
            this.setState({'round_num': board_info[4]})
        });
        socket.on('update_players', (list) => {
            this.setState({theList:list});
        })
        socket.on('which_players_turn', (data) => {
            console.log(this.state.theList);

            var who = this.state.theList.filter(function(player) {
                return player._client_number === data[0];
            });
            // console.log(me);
            this.setState({theMessage2:(who[0]._name + " has to go")});

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
            this.setState({theCheckorCall:checkOrCall.toUpperCase()});
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
            // this.setState({option:"2"});
            this.setState({myTurn:false});
        });
        socket.on('flop', (flop) => {
            let array = flop.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            this.setState({cards:[array[0], array[1], array[2], '', '']});
        });
        socket.on('turn', (turn) => {
            let array = turn.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,3}\b/g);
            this.setState({cards:[array[0], array[1], array[2], array[3], '']});
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
    }

    componentWillUnmount(){
        if(socket!= null){
        socket.off('left_room');
        socket.off('vip');
        socket.off('disconnect');
        socket.off('message');
        socket.off('new_hand');
        socket.off('emit_hand');
        socket.off('board_init_info');
        socket.off('update_players');
        socket.off('which_players_turn');
        socket.off('your_turn');
        socket.off('raise');
        socket.off('you_timed_out');
        socket.off('flop');
        socket.off('turn');
        socket.off('river');
        socket.off('game_ended');
        }
    
    }

    renderPlayer = (player) => {  
        if(player._name != this.props.location.state.username){
        return(
            <Card key = {player._client_id} text='black' style={{marginRight: "1vw", backgroundColor:"#C3770F", opacity: ((player._isFolded || player._bankrupt || !player._connected) ? "50%" : "100%")}}>
                <Card.Header><b>{player._name}</b></Card.Header>
                <Card.Body>
                    <Card.Text>
                         <i>Balance: </i><b>${player._balance}</b><br></br>
                        <i>Investment: </i><b>${player._investment}</b>
                    </Card.Text>

                </Card.Body>
            </Card>
            
        )
        }
    }

    renderMyInfo = (me) => {
        return (
            <Card key = {me._client_id} text='black' style={{backgroundColor:"#C3770F"}}>
                <Card.Body>
                <i>Your balance: </i><b>${this.state.balance}</b><br></br>
                <i>Your investment: </i><b>${me._investment}</b>
                </Card.Body>
            </Card>
        )
    }

    renderCard = (card, index) => {
        return(
                <img style = {{marginRight:"1vw", width:"6vw"}} key = {index} src = {this.decodeCard(card)}/>
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
    else{
        return "images/back.png";
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
        this.setState({option:"2"});
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
            <>
                <Modal variant = "warning" centered show={this.state.modal} onHide={() => {this.setState({modal:false})}} >
                    <Modal.Header closeButton><Modal.Title>Are you sure you want to leave the game?</Modal.Title></Modal.Header>
                    <Modal.Body>You will not be able to join back into the game!</Modal.Body>
                    <Modal.Footer> 
                    <Button variant="secondary" onClick={() => {this.setState({modal:false})}}>Close</Button>
                    <Button variant = "danger" onClick = {this.handleLeave}>LEAVE GAME</Button>
                    </Modal.Footer>
                </Modal>
            <body>
                <Nav style = {{marginTop:"1vh"}} className="justify-content-between">
                    <Nav.Item><Button variant = "danger" onClick = {() => {this.setState({modal:true})}}>LEAVE GAME</Button></Nav.Item>
                    <Badge style = {{fontSize:"1.5em"}} pill variant="light"><b>ROUND: </b>{this.state.round_num}</Badge>
                </Nav>
                <ListGroup style = {{marginBottom:"1vh"}} className = "justify-content-center" horizontal>
                    {this.state.theList.map((player)=> {return this.renderPlayer(player)})}
                </ListGroup>
                <Nav style = {{marginBottom:"1vh"}} className = "justify-content-around">
                <b style = {{fontSize:"1.5em"}}><Badge variant="light" pill>POT: </Badge> ${this.state.pot}</b>
                <b style = {{fontSize:"1.5em"}}><Badge  variant="light" pill>MINIMUM BET: </Badge> ${this.state.minimum_bet}</b></Nav>
                {this.state.cards.map((card, index)=> {return this.renderCard(card, index)})}
                <Nav style = {{margin:"1rem"}} className = "justify-content-center"><b style = {{fontSize:"1.5em"}}> <Badge variant="light" pill >{this.state.theMessage}, {this.state.theMessage2}</Badge></b></Nav>
                <Nav style = {{margin:"1rem"}} className = "justify-content-center">{this.state.theList.filter(player => player._name === this.props.location.state.username).map((me) => {return this.renderMyInfo(me)})}</Nav>
                {this.state.hand.map((card, index)=> {return this.renderCard(card, index)})}
                <Nav className = "justify-content-around" style = {{marginLeft:"5vw"}}>
               <OverlayTrigger
                trigger="click"
                placement='top-end'
                overlay={
                    <Popover>
                            <img style = {{width:"30vw"}} src = "images/Rankings.png"></img>
                    </Popover>}>
                <Button style = {{color:"blue"}} variant="warning">Poker Hierarchy</Button>
                </OverlayTrigger>
                <ListGroup horizontal>
                    <Button disabled = {!this.state.myTurn} name = 'CheckorCall' onClick = {this.chooseOption} style = {{color:"blue", marginRight:"1vw"}} variant="warning">{this.state.theCheckorCall}</Button>
                    <Button disabled = {!this.state.myTurn} name = 'Fold' onClick = {this.chooseOption} variant = "danger">FOLD</Button>
                    <Button disabled = {!this.state.myTurn} name = 'Raise' onClick = {this.chooseOption} style = {{color:"blue", marginLeft:"1vw"}} variant="warning">RAISE ${this.state.raiseAmount}</Button>
                    <input type = "range" disabled = {!this.state.myTurn} min = {this.state.minimum_bet} max = {this.state.balance} value = {this.state.raiseAmount} onChange = {this.raiseSlider.bind(this)}></input>
                </ListGroup>
                <ButtonGroup>
                    <img style = {{width:"3vw"}} src = "images/D.png"></img>{this.state.dealer}
                    <img style = {{width:"3vw"}} src = "images/SB.png"></img>{this.state.small_blind}
                    <img style = {{width:"3vw"}} src = "images/BB.png"></img>{this.state.big_blind}
                </ButtonGroup>
               </Nav>
            </body>
            </>
        )
    }
}
