import { useState, useEffect } from "react";
import BroncoBites from "../src/images/BroncoBites.png";
import "./App.css";

function App() {
  const [apiMessage, setApiMessage] = useState<string>("Loading...");
  const [selectedMember, setSelectedMember] = useState<string>("Tim Lee");

  const teamMembers = ["Tim Lee", "Eli Tolentino", "Jaron Lin", "Javi Wu"];

  // Fetch message from backend API whenever selectedMember changes
  useEffect(() => {
    fetch(
      `http://localhost:3001/api/${selectedMember
        .toLowerCase()
        .replace(" ", "-")}`
    )
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((err) => {
        console.error("Error fetching API:", err);
        setApiMessage("Error connecting to backend");
      });
  }, [selectedMember]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <a href="BroncoBotes" target="_blank">
          <img src={BroncoBites} className="logo" alt="bronco logo" />
        </a>

        {/* Dropdown menu */}
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          {teamMembers.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>
      </div>

      <h1>BroncoBites</h1>

      <div className="card">
        <p>Selected member: {selectedMember}</p>
        <p>Message from backend: {apiMessage}</p>
      </div>
    </>
  );
}

export default App;
