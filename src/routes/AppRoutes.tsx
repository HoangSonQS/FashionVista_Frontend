import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* TODO: add more routes like /login, /products, etc. */}
      </Routes>
    </BrowserRouter>
  );
};


