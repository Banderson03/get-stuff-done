import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";


function Home() {
    const navigate = useNavigate();
    const [message, setMessage] = useState(""); // State to hold the message fetched from the backend

    useEffect(() => {

        const fetchMessage = () => {
            fetch("/api/hello")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch data");
                    }
                    return response.text();
                })
                .then((data) => {
                    setMessage(data); // Update the state with the fetched message
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        };

        const intervalId = setInterval(fetchMessage, 250);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="home">
            <h1>Git Started With Git Stuff Done</h1>
            <p>{message}</p>
        </div>
    )
}

export default Home;


