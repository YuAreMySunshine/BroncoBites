
import "../style/components/Navbar.css";

export default function Layout() {
  return (
    <div className="page-root">
      <footer className="site-footer">
        <small>© {new Date().getFullYear()} BroncoBites — CS4800 Project</small>
      </footer>
    </div>
  );
}
