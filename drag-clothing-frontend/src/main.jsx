import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// 1. ALL GLOBAL IMPORTS GO HERE
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LikesProvider } from './context/LikesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Router must be the outermost wrapper so providers can use navigation */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <LikesProvider>
            <App />
          </LikesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);