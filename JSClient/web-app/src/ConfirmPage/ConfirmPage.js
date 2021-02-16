import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Login from "../Login/Login";
import logo from '../images/LOGO.png';
import './ConfirmPage.css';

export default class ConfirmPage extends Component {
    render() {
        return (
            <div>
                <header>
                <img src={logo} alt="Logo" />
                </header>
                <p>{this.props.location.state.confirmWhat}</p>
                <Link to = "/Login">Login Now!</Link>
            </div>
        )
    }
}
