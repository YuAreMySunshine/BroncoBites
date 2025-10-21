import React, { useEffect, useState } from "react";
import "../style/home/Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import eli from "../images/eli.png";
import jaron from "../images/jaron.png";
import timothy from "../images/timothy.png";
import javi from "../images/javi.png";

export default function Home() {
  return (
    <div className="bb">
      <Navbar />
      {/* ← scope wrapper to avoid CSS collisions */}
      {/* ====== Hero ====== */}
      <section className="hero bb-container" id="home">
        <div>
          <p className="kicker">Campus Nutrition • Fitness Goals</p>
          <h1>
            Eat with purpose. <span className="text-brand">Crush</span> your
            goals.
          </h1>
          <p className="lead">
            BroncoBites suggests affordable, nearby meals from campus dining and
            markets that match your calories, protein, and dietary needs — no
            car required.
          </p>

          <div
            style={{
              marginTop: "1.1rem",
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <span className="pill">⚡ Auto meal plans</span>
            <span className="pill">🥗 Vegetarian friendly</span>
            <span className="pill">📍 On-campus options</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="At-a-glance stats">
          <h3>Today’s Sample Targets</h3>
          <div className="hero-grid">
            <div className="card">
              <div className="kicker">Calories</div>
              <h2 style={{ margin: "0.2rem 0" }}>2,400 kcal</h2>
              <p className="meta">Based on height, weight &amp; activity</p>
            </div>
            <div className="card">
              <div className="kicker">Protein</div>
              <h2 style={{ margin: "0.2rem 0" }}>150 g</h2>
              <p className="meta">Muscle gain goal</p>
            </div>
            <div className="card">
              <div className="kicker">Budget</div>
              <h2 style={{ margin: "0.2rem 0" }}>$18 / day</h2>
              <p className="meta">Dining dollars aware</p>
            </div>
            <div className="card">
              <div className="kicker">Restrictions</div>
              <h2 style={{ margin: "0.2rem 0" }}>Vegetarian</h2>
              <p className="meta">Customizable</p>
            </div>
          </div>
        </aside>
      </section>

      {/* ====== Problem ====== */}
      <section id="problem">
        <div className="bb-container">
          <p className="kicker">The Problem</p>
          <h2 className="section-title">
            Fitness goals, limited campus choices
          </h2>
          <div className="card-grid">
            <article className="card">
              <h3>Goal-driven nutrition is hard</h3>
              <p>
                Students aiming to build muscle or lose fat need consistent
                calories and macros — which is tough without planning.
              </p>
            </article>
            <article className="card">
              <h3>Car-less = campus-bound</h3>
              <p>
                On-campus students often rely on dining halls or groceries
                nearby when travel is limited.
              </p>
            </article>
            <article className="card">
              <h3>Menus change, time is short</h3>
              <p>
                Hunting for options that meet goals is tedious. People give up
                and settle for whatever’s close.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Solution ====== */}
      <section id="solution">
        <div className="bb-container">
          <p className="kicker">Proposed Solution</p>
          <h2 className="section-title">
            Meet <span className="text-brand">BroncoBites</span>
          </h2>
          <div className="feature">
            <div className="demo">
              <h3>What it does</h3>
              <ul>
                <li>
                  Generates meal suggestions that fit your calorie &amp; protein
                  targets.
                </li>
                <li>
                  Supports dietary restrictions like vegetarian or gluten-free.
                </li>
                <li>
                  Lets you like or blacklist items to personalize future plans.
                </li>
                <li>
                  Focuses on campus dining halls &amp; markets you can actually
                  access.
                </li>
              </ul>
            </div>
            <div className="demo">
              <h3>Why it helps</h3>
              <p>
                We remove the guesswork by mapping campus menus to your goals,
                so you can fuel your day without leaving campus — or blowing
                your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Features ====== */}
      <section id="features">
        <div className="bb-container">
          <p className="kicker">Features</p>
          <h2 className="section-title">Built for real campus goals</h2>

          <div className="features-grid">
            <article className="card">
              <div className="feature-head">
                <span className="feature-icon" aria-hidden="true">
                  🤖
                </span>
                <h3>Auto meal suggestions</h3>
              </div>
              <p className="meta">
                Automatically generated plans that fit your calorie and protein
                targets. Perfect for cutting, bulking, or maintenance.
              </p>
            </article>

            <article className="card">
              <div className="feature-head">
                <span className="feature-icon" aria-hidden="true">
                  🥗
                </span>
                <h3>Dietary restrictions</h3>
              </div>
              <p className="meta">
                Filters for common needs like <strong>vegetarian</strong> (and
                more to come) so recommendations respect your preferences.
              </p>
            </article>

            <article className="card">
              <div className="feature-head">
                <span className="feature-icon" aria-hidden="true">
                  👎
                </span>
                <h3>Feedback / blacklist</h3>
              </div>
              <p className="meta">
                Don’t like a suggestion? Give it a thumbs-down to{" "}
                <em>blacklist</em> it. Future plans will avoid that item
                automatically.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Team (with API) ====== */}
      <section id="team">
        <div className="bb-container">
          <p className="kicker">Team</p>
          <h2 className="section-title">Meet the Team</h2>

          <div className="team-cards">
            <article className="team-card">
              <img className="team-avatar" src={eli} alt="Eli Tolentino" />
              <h3 className="team-name">Eli Tolentino</h3>
            </article>
            <article className="team-card">
              <img className="team-avatar" src={jaron} alt="Jaron Lin" />
              <h3 className="team-name">Jaron Lin</h3>
            </article>
            <article className="team-card">
              <img className="team-avatar" src={timothy} alt="Timothy Lee" />
              <h3 className="team-name">Timothy Lee</h3>
            </article>
            <article className="team-card">
              <img className="team-avatar" src={javi} alt="Javi Wu" />
              <h3 className="team-name">Javi Wu</h3>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Project ====== */}
      <section id="project">
        <div className="bb-container">
          <p className="kicker">Project</p>

          <article className="project-card">
            <div className="project-top">
              <div className="project-icon" aria-hidden="true">
                🍽️
              </div>
              <span className="status-badge">In Development</span>
            </div>
            <div className="project-body">
              <h2 className="project-title">BroncoBites</h2>
              <h3 className="project-subtitle">
                Campus Meal Planning Assistant
              </h3>
              <p className="project-desc">
                A web service that suggests on-campus meal plans tailored to
                your goals and constraints…
              </p>
              <ul className="project-features">
                <li>🤖 Auto-generated plans for calorie &amp; protein goals</li>
                <li>🥗 Dietary filters (Vegetarian, Vegan, Gluten-free)</li>
                <li>👎 Thumbs-down to blacklist items you don’t like</li>
                <li>📍 Campus-aware (Centerpointe, Vista Market, etc.)</li>
              </ul>
              <div className="project-stack">
                <span className="chip">MongoDB</span>
                <span className="chip">Express</span>
                <span className="chip">React</span>
                <span className="chip">Node.js</span>
              </div>
            </div>
          </article>
        </div>
      </section>
      <Footer />
    </div>
  );
}
