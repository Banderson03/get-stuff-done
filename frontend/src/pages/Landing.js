import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            <h1>Welcome to Get Stuff Done</h1>
            <button onClick={() => navigate("/signin")} data-testid="navigate-button">Sign In</button>
            <button onClick={() => navigate("/signup")} data-testid="navigate-button">Sign Up</button>
        </div>
    )
}

export default Landing