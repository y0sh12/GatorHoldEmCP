import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Login from "../Login/Login";
import './ConfirmPage.css';
import Header from "../BasicComponents/Header"

export default class ConfirmPage extends Component {
    render() {
        return (
            <>
               <Header/>
                <p>{this.props.location.state.confirmWhat}</p>
                <Link to = "/Login">Login Now!</Link>
            </>
        )
    }
}
