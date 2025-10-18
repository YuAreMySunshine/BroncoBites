import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ManageRestaurants from './pages/ManageRestaurants';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/restaurants" element={<ManageRestaurants />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
