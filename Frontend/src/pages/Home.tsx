import { useState, useEffect } from "react";

export default function Home() {
  const [apiMessage, setApiMessage] = useState<string>("Loading...");
  const [selectedMember, setSelectedMember] = useState<string>("Tim Lee");

  const teamMembers = ["Tim Lee", "Eli Tolentino", "Jaron Lin", "Javi Wu"];

  const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://54.193.99.243:3001";

  // Fetch message from backend API whenever selectedMember changes
  useEffect(() => {
    const slug = selectedMember.toLowerCase().replace(/\s+/g, "-");
    fetch(`${API_BASE}/api/${slug}`)
      .then((res) => res.json())
      .then((data) => setApiMessage(data?.message ?? "No message"))
      .catch((err) => {
        console.error("Error fetching API:", err);
        setApiMessage("Error connecting to backend");
      });
  }, [selectedMember, API_BASE]);

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <h2>Find the best campus eats — fast.</h2>
          <p>
            BroncoBites helps students discover, rate, and order from the
            best nearby restaurants. Built for speed and simplicity.
          </p>
          <div className="hero-ctas">
            <a className="btn primary" href="/Frontend/index.html">
              Explore Restaurants
            </a>
            <a className="btn" href="#features">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h3>Features</h3>
        <div className="feature-grid">
          <div className="feature">
            <h4>Fast Search</h4>
            <p>Find places nearby in seconds with smart filters.</p>
          </div>
          <div className="feature">
            <h4>User Reviews</h4>
            <p>See honest ratings from other students.</p>
          </div>
          <div className="feature">
            <h4>Team-powered</h4>
            <p>Created by a small CS team as a campus project.</p>
          </div>
        </div>
      </section>

      <section id="team" className="team">
        <h3>Team</h3>
        <p>Select a member to fetch their status from the backend API.</p>

        <div className="team-controls">
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

          <div className="card">
            <p>
              <strong>Selected:</strong> {selectedMember}
            </p>
            <p>
              <strong>Backend:</strong> {apiMessage}
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h3>Contact</h3>
        <p>
          Questions or feedback? Email the team at
          <a href="mailto:feedback@bronco-bites.example"> feedback@bronco-bites.example</a>.
        </p>
      </section>
    </main>
  );
}
