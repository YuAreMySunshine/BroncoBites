import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ManageRestaurants from './pages/ManageRestaurants';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<Home />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/restaurants" element={<ManageRestaurants />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
