import "../style/home/Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import eli from "../images/eli.png";
import jaron from "../images/jaron.png";
import timothy from "../images/timothy.png";
import javi from "../images/javi.png";

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />

      {/* ====== Hero ====== */}
      <section className="home-hero" id="home">
        <div className="container">
          <div className="home-hero__inner">
            <div>
              <p className="home-hero__kicker">Campus Nutrition &bull; Fitness Goals</p>
              <h1 className="home-hero__title">
                Eat with purpose.{" "}
                <span className="home-hero__title--accent">Crush</span> your goals.
              </h1>
              <p className="home-hero__lead">
                BroncoBites suggests affordable, nearby meals from campus dining and
                markets that match your calories, protein, and dietary needs — no
                car required.
              </p>

              <div className="home-hero__pills">
                <span className="pill">Auto meal plans</span>
                <span className="pill">Vegetarian friendly</span>
                <span className="pill">On-campus options</span>
              </div>
            </div>

            <aside className="hero-stats" aria-label="At-a-glance stats">
              <h3 className="hero-stats__title">Today's Sample Targets</h3>
              <div className="hero-stats__grid">
                <div className="stat-item">
                  <div className="stat-item__kicker">Calories</div>
                  <div className="stat-item__value">2,400 kcal</div>
                  <p className="stat-item__meta">Based on height, weight &amp; activity</p>
                </div>
                <div className="stat-item">
                  <div className="stat-item__kicker">Protein</div>
                  <div className="stat-item__value">150 g</div>
                  <p className="stat-item__meta">Muscle gain goal</p>
                </div>
                <div className="stat-item">
                  <div className="stat-item__kicker">Budget</div>
                  <div className="stat-item__value">$18 / day</div>
                  <p className="stat-item__meta">Dining dollars aware</p>
                </div>
                <div className="stat-item">
                  <div className="stat-item__kicker">Restrictions</div>
                  <div className="stat-item__value">Vegetarian</div>
                  <p className="stat-item__meta">Customizable</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ====== Problem ====== */}
      <section className="home-section" id="problem">
        <div className="container">
          <p className="home-section__kicker">The Problem</p>
          <h2 className="home-section__title">
            Fitness goals, limited campus choices
          </h2>
          <div className="problem-grid">
            <article className="problem-card">
              <h3 className="problem-card__title">Goal-driven nutrition is hard</h3>
              <p className="problem-card__text">
                Students aiming to build muscle or lose fat need consistent
                calories and macros — which is tough without planning.
              </p>
            </article>
            <article className="problem-card">
              <h3 className="problem-card__title">Car-less = campus-bound</h3>
              <p className="problem-card__text">
                On-campus students often rely on dining halls or groceries
                nearby when travel is limited.
              </p>
            </article>
            <article className="problem-card">
              <h3 className="problem-card__title">Menus change, time is short</h3>
              <p className="problem-card__text">
                Hunting for options that meet goals is tedious. People give up
                and settle for whatever's close.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Solution ====== */}
      <section className="home-section home-section--alt" id="solution">
        <div className="container">
          <p className="home-section__kicker">Proposed Solution</p>
          <h2 className="home-section__title">
            Meet <span className="home-section__title--accent">BroncoBites</span>
          </h2>
          <div className="solution-grid">
            <div className="solution-box">
              <h3 className="solution-box__title">What it does</h3>
              <ul className="solution-box__list">
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
            <div className="solution-box">
              <h3 className="solution-box__title">Why it helps</h3>
              <p className="solution-box__text">
                We remove the guesswork by mapping campus menus to your goals,
                so you can fuel your day without leaving campus — or blowing
                your budget. No more scrolling through confusing dining hall
                websites or guessing at nutrition info.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Features ====== */}
      <section className="home-section" id="features">
        <div className="container">
          <p className="home-section__kicker">Features</p>
          <h2 className="home-section__title">Built for real campus goals</h2>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-card__header">
                <span className="feature-card__icon" aria-hidden="true">
                  ⚡
                </span>
                <h3 className="feature-card__title">Auto meal suggestions</h3>
              </div>
              <p className="feature-card__text">
                Automatically generated plans that fit your calorie and protein
                targets. Perfect for cutting, bulking, or maintenance.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__header">
                <span className="feature-card__icon" aria-hidden="true">
                  🥗
                </span>
                <h3 className="feature-card__title">Dietary restrictions</h3>
              </div>
              <p className="feature-card__text">
                Filters for common needs like <strong>vegetarian</strong> (and
                more to come) so recommendations respect your preferences.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__header">
                <span className="feature-card__icon" aria-hidden="true">
                  👎
                </span>
                <h3 className="feature-card__title">Feedback / blacklist</h3>
              </div>
              <p className="feature-card__text">
                Don't like a suggestion? Give it a thumbs-down to{" "}
                <em>blacklist</em> it. Future plans will avoid that item
                automatically.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Team ====== */}
      <section className="home-section home-section--alt" id="team">
        <div className="container">
          <p className="home-section__kicker">Team</p>
          <h2 className="home-section__title">Meet the Team</h2>

          <div className="team-grid">
            <article className="team-card">
              <img className="team-card__avatar" src={eli} alt="Eli Tolentino" />
              <h3 className="team-card__name">Eli Tolentino</h3>
            </article>
            <article className="team-card">
              <img className="team-card__avatar" src={jaron} alt="Jaron Lin" />
              <h3 className="team-card__name">Jaron Lin</h3>
            </article>
            <article className="team-card">
              <img className="team-card__avatar" src={timothy} alt="Timothy Lee" />
              <h3 className="team-card__name">Timothy Lee</h3>
            </article>
            <article className="team-card">
              <img className="team-card__avatar" src={javi} alt="Javi Wu" />
              <h3 className="team-card__name">Javi Wu</h3>
            </article>
          </div>
        </div>
      </section>

      {/* ====== Project ====== */}
      <section className="home-section" id="project">
        <div className="container">
          <p className="home-section__kicker">Project</p>

          <article className="project-card">
            <div className="project-card__header">
              <div className="project-card__icon" aria-hidden="true">
                🍽️
              </div>
              <span className="project-card__badge">In Development</span>
            </div>
            <div className="project-card__body">
              <h2 className="project-card__title">BroncoBites</h2>
              <h3 className="project-card__subtitle">
                Campus Meal Planning Assistant
              </h3>
              <p className="project-card__desc">
                A web service that suggests on-campus meal plans tailored to
                your goals and constraints. Built by students, for students.
              </p>
              <ul className="project-features">
                <li>Auto-generated plans for calorie &amp; protein goals</li>
                <li>Dietary filters (Vegetarian, Vegan, Gluten-free)</li>
                <li>Thumbs-down to blacklist items you don't like</li>
                <li>Campus-aware (Centerpointe, Vista Market, etc.)</li>
              </ul>
              <div className="project-stack">
                <span className="tech-chip">MongoDB</span>
                <span className="tech-chip">Express</span>
                <span className="tech-chip">React</span>
                <span className="tech-chip">Node.js</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
