import { Link } from "react-router-dom";
import { SignUpButton } from "@clerk/clerk-react";
import {
  Sparkles,
  Zap,
  Leaf,
  ThumbsDown,
  Target,
  Clock,
  MapPin,
  Flame,
  Beef,
  AlertTriangle,
  Car,
  CalendarDays,
  Utensils,
  CheckCircle2,
  ArrowRight,
  Github,
  Database,
  Server,
  Code2,
  Layout,
} from "lucide-react";
import { GiHorseHead } from "react-icons/gi";
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
            <div className="home-hero__content">
              <p className="home-hero__kicker">
                <GiHorseHead size={14} />
                Bronco Bites, Better Gains
              </p>
              <h1 className="home-hero__title">
                Fuel Your{" "}
                <span className="home-hero__title--accent">Bronco</span>{" "}
                Build
              </h1>
              <p className="home-hero__lead">
                Smart meal planning for Cal Poly Pomona students. Get personalized
                suggestions from campus dining halls and markets that match your
                fitness goals — all within walking distance.
              </p>

              <div className="home-hero__pills">
                <span className="pill pill--cpp-green">
                  <MapPin size={14} />
                  CPP Campus Only
                </span>
                <span className="pill pill--cpp-gold">
                  <Flame size={14} />
                  BRIC-Ready Nutrition
                </span>
                <span className="pill pill--accent">
                  <Sparkles size={14} />
                  Auto Meal Plans
                </span>
              </div>

              <div className="home-hero__cta">
                <SignUpButton>
                  <button className="cta-btn cta-btn--primary">
                    Get Started
                    <ArrowRight size={18} />
                  </button>
                </SignUpButton>
                <Link to="/menus" className="cta-btn cta-btn--secondary">
                  Browse Menus
                </Link>
              </div>

              <aside className="hero-stats" aria-label="At-a-glance stats">
              <h3 className="hero-stats__title">
                <Target size={20} />
                Today's Sample Targets
              </h3>

              <div className="hero-stats__grid">
                <div className="stat-item stat-item--date">
                  <div className="stat-item__icon">
                    <CalendarDays size={20} />
                  </div>
                  <div className="stat-item__content">
                    <div className="stat-item__kicker">Today</div>
                    <div className="stat-item__value">Monday, November 24</div>
                    <p className="stat-item__meta">Change targets daily</p>
                  </div>
                </div>
                <div className="stat-item stat-item--calories">
                  <div className="stat-item__icon">
                    <Flame size={20} />
                  </div>
                  <div className="stat-item__content">
                    <div className="stat-item__kicker">Calories</div>
                    <div className="stat-item__value">2,400 kcal</div>
                    <p className="stat-item__meta">
                      Based on height, weight &amp; activity
                    </p>
                  </div>
                </div>
                <div className="stat-item stat-item--protein">
                  <div className="stat-item__icon">
                    <Beef size={20} />
                  </div>
                  <div className="stat-item__content">
                    <div className="stat-item__kicker">Protein</div>
                    <div className="stat-item__value">150 g</div>
                    <p className="stat-item__meta">Muscle gain goal</p>
                  </div>
                </div>
                <div className="stat-item stat-item--diet">
                  <div className="stat-item__icon">
                    <Leaf size={20} />
                  </div>
                  <div className="stat-item__content">
                    <div className="stat-item__kicker">Restrictions</div>
                    <div className="stat-item__value">Vegetarian</div>
                    <p className="stat-item__meta">Customizable</p>
                  </div>
                </div>
              </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Problem ====== */}
      <section className="home-section" id="problem">
        <div className="container">
          <p className="home-section__kicker">The Challenge</p>
          <h2 className="home-section__title">
            CPP student life meets fitness goals
          </h2>
          <div className="problem-grid">
            <article className="problem-card">
              <div className="problem-card__icon">
                <Target size={24} />
              </div>
              <h3 className="problem-card__title">
                BRIC gains need proper fuel
              </h3>
              <p className="problem-card__text">
                CPP students hitting the BRIC need consistent calories and protein,
                but navigating Centerpointe's rotating menu is time-consuming.
              </p>
            </article>
            <article className="problem-card">
              <div className="problem-card__icon">
                <Car size={24} />
              </div>
              <h3 className="problem-card__title">Walking campus, limited options</h3>
              <p className="problem-card__text">
                Most students rely on on-campus dining. Without a car, you're
                limited to what's within walking distance between classes.
              </p>
            </article>
            <article className="problem-card">
              <div className="problem-card__icon">
                <Clock size={24} />
              </div>
              <h3 className="problem-card__title">
                Busy schedule, quick decisions
              </h3>
              <p className="problem-card__text">
                Between lectures, labs, and studying, CPP students don't have time
                to calculate macros or hunt for the right meal options.
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
            Meet{" "}
            <span className="home-section__title--accent">BroncoBites</span>
          </h2>
          <div className="solution-grid">
            <div className="solution-box">
              <div className="solution-box__header">
                <Zap size={24} className="solution-box__icon" />
                <h3 className="solution-box__title">What it does</h3>
              </div>
              <ul className="solution-box__list">
                <li>
                  <CheckCircle2 size={16} />
                  Auto-generates meal plans from Centerpointe, Vista Market, and
                  other CPP dining locations.
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  Matches your daily calorie &amp; protein targets for muscle gain,
                  cutting, or maintenance.
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  Respects dietary restrictions (vegetarian, vegan, gluten-free).
                </li>
                <li>
                  <CheckCircle2 size={16} />
                  Personalized blacklist so you never see foods you dislike.
                </li>
              </ul>
            </div>
            <div className="solution-box solution-box--highlight">
              <div className="solution-box__header">
                <AlertTriangle size={24} className="solution-box__icon" />
                <h3 className="solution-box__title">Built for CPP Students</h3>
              </div>
              <p className="solution-box__text">
                BroncoBites knows your schedule is packed. We map CPP's dining menus
                to your fitness goals, so you can grab the right meal between classes
                without the guesswork. Focus on your studies and gains — we'll handle
                the nutrition planning.
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
              <div className="feature-card__icon-wrap feature-card__icon-wrap--pink">
                <Sparkles size={24} />
              </div>
              <h3 className="feature-card__title">Auto meal suggestions</h3>
              <p className="feature-card__text">
                Automatically generated plans that fit your calorie and protein
                targets. Perfect for cutting, bulking, or maintenance.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--green">
                <Leaf size={24} />
              </div>
              <h3 className="feature-card__title">Dietary restrictions</h3>
              <p className="feature-card__text">
                Filters for common needs like <strong>vegetarian</strong> (and
                more to come) so recommendations respect your preferences.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--red">
                <ThumbsDown size={24} />
              </div>
              <h3 className="feature-card__title">Feedback / blacklist</h3>
              <p className="feature-card__text">
                Don't like a suggestion? Give it a thumbs-down to{" "}
                <em>blacklist</em> it. Future plans will avoid that item
                automatically.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--blue">
                <CalendarDays size={24} />
              </div>
              <h3 className="feature-card__title">Weekly planning</h3>
              <p className="feature-card__text">
                Plan your meals day by day with our interactive calendar.
                Navigate easily between dates and track your nutrition.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--orange">
                <Utensils size={24} />
              </div>
              <h3 className="feature-card__title">Campus menus</h3>
              <p className="feature-card__text">
                Browse real menus from campus dining locations with full
                nutrition info, allergens, and dietary labels.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-card__icon-wrap feature-card__icon-wrap--purple">
                <Target size={24} />
              </div>
              <h3 className="feature-card__title">Goal tracking</h3>
              <p className="feature-card__text">
                Set your daily calorie and macro goals. Track progress with
                visual indicators that show how close you are.
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
              <div className="team-card__avatar-wrap">
                <img
                  className="team-card__avatar"
                  src={eli}
                  alt="Eli Tolentino"
                />
              </div>
              <h3 className="team-card__name">Eli Tolentino</h3>
              <p className="team-card__role">Developer</p>
            </article>
            <article className="team-card">
              <div className="team-card__avatar-wrap">
                <img
                  className="team-card__avatar"
                  src={jaron}
                  alt="Jaron Lin"
                />
              </div>
              <h3 className="team-card__name">Jaron Lin</h3>
              <p className="team-card__role">Developer</p>
            </article>
            <article className="team-card">
              <div className="team-card__avatar-wrap">
                <img
                  className="team-card__avatar"
                  src={timothy}
                  alt="Timothy Lee"
                />
              </div>
              <h3 className="team-card__name">Timothy Lee</h3>
              <p className="team-card__role">Developer</p>
            </article>
            <article className="team-card">
              <div className="team-card__avatar-wrap">
                <img className="team-card__avatar" src={javi} alt="Javi Wu" />
              </div>
              <h3 className="team-card__name">Javi Wu</h3>
              <p className="team-card__role">Developer</p>
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
              <div className="project-card__icon">
                <Utensils size={32} />
              </div>
              <span className="project-card__badge">
                <span className="badge-dot"></span>
                In Development
              </span>
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
                <li>
                  <CheckCircle2 size={18} className="project-features__icon" />
                  <span>
                    Auto-generated plans for calorie &amp; protein goals
                  </span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="project-features__icon" />
                  <span>Dietary filters (Vegetarian, Vegan, Gluten-free)</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="project-features__icon" />
                  <span>Thumbs-down to blacklist items you don't like</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="project-features__icon" />
                  <span>Campus-aware (Centerpointe, Vista Market, etc.)</span>
                </li>
              </ul>
              <div className="project-stack">
                <span className="tech-chip">
                  <Database size={14} />
                  MongoDB
                </span>
                <span className="tech-chip">
                  <Server size={14} />
                  Express
                </span>
                <span className="tech-chip">
                  <Layout size={14} />
                  React
                </span>
                <span className="tech-chip">
                  <Code2 size={14} />
                  Node.js
                </span>
              </div>
              <a
                href="https://github.com/YuAreMySunshine/BroncoBites"
                target="_blank"
                rel="noopener noreferrer"
                className="project-github"
              >
                <Github size={18} />
                View on GitHub
              </a>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
