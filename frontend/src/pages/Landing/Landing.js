import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-container">
        <h1>Welcome to Get Stuff Done</h1>
        <div className="landing__actions">
          <button className="btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
          <button className="btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Landing;
