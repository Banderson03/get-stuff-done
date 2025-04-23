import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";


function Home() {
    const navigate = useNavigate();

    return (
        <div className="home">
            <h1>Get Started With Get Stuff Done</h1>
        </div>
    )
}

export default Home;


