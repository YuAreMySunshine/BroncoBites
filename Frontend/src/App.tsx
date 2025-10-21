import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ManageRestaurants from './pages/ManageRestaurants';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<><Navbar /><Admin /><Footer /></>} />
          <Route path="/admin/restaurants" element={<><Navbar /><ManageRestaurants /><Footer /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
