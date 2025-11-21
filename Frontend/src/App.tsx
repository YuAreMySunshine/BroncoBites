import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ManageRestaurants from './pages/ManageRestaurants';
import RestaurantMenus from './pages/RestaurantMenus';
import Settings from './pages/Settings';
import DevToken from './pages/DevToken';  
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menus" element={<RestaurantMenus />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/admin"
            element={
              <>
                <Navbar />
                <ManageRestaurants />
                <Footer />
              </>
            }
          />
          {/* TEMP: always include DevToken route */}
            <Route path="/dev-token" element={<DevToken />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
