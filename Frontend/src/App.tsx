import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [apiMessage, setApiMessage] = useState<string>("Loading...");

  // Fetch message from backend API
  useEffect(() => {
    fetch("http://localhost:3001/api/hello") // <-- proxy will handle localhost:3001
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((err) => {
        console.error("Error fetching API:", err);
        setApiMessage("Error connecting to backend");
      });

      fetch("http://localhost:3001/api/tim-lee") // <-- proxy will handle localhost:3001
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((err) => {
        console.error("Error fetching API:", err);
        setApiMessage("Error connecting to backend");
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Express</h1>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Message from backend: {apiMessage}</p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
