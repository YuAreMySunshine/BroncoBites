
import "../style/components/Navbar.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <small>© {new Date().getFullYear()} BroncoBites — CS4800 Project</small>
    </footer>
  );
}
