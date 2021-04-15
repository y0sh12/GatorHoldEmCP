import React from 'react'
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
                <img src= '/images/LOGO.png'alt="Logo" />
                </header>
        </>
    )
    }
    else{
        return(
        <header>
            <img src='/images/LOGO.png' alt="Logo" />
        </header>
        )
    }
}
