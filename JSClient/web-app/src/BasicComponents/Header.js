import React from 'react'
import logo from '../images/LOGO.png';
import {Link} from "react-router-dom";

export default function Header(props) {
    if(props.backButton){
    return (
        <>
        <Link to={{
            pathname: props.whereTo,
            state: {
                username: props.username,
            }
        }}className = "link">Back</Link>
            <header>
                <img src={logo} alt="Logo" />
                </header>
        </>
    )
    }
    else{
        return(
        <header>
            <img src={logo} alt="Logo" />
        </header>
        )
    }
}
