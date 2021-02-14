import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Login from "../Login/Login";

export default class ConfirmPage extends Component {
    render() {
        return (
            <div>
                <header>Your account has been created!</header>
                <Link to = "/Login">Login Now!</Link>
            </div>
        )
    }
}
