import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/layout/Layout';
import CartDrawer from './components/common/CartDrawer';
import { ThemeProvider } from './context/ThemeContext';
import { CartDrawerProvider } from './context/CartDrawerContext';
import AppRoutes from './routes/AppRoutes';
import './styles/theme.css';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <CartDrawerProvider>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
          <CartDrawer />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </CartDrawerProvider>
    </ThemeProvider>
  );
}

export default App;
