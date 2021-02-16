import React, { Component } from 'react'
import logo from '../images/LOGO.png';
import './Home.css';
import {Link, Redirect} from "react-router-dom";

export default class Home extends Component {
    render() {
        return (
            <div>
                <header>
                    <img src={logo} alt="Logo" />
                </header>
                <p>You logged In!</p>
                <Link to = "/Login">Back</Link>
            </div>
        )
    }
}
