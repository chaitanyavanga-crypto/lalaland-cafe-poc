import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar as BSNavbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { logout } from '../../redux/slices/authSlice';
import { MANAGEMENT_ROLES, STAFF_ROLES } from '../../constants/roles';

export default function Navbar() {
  const { isAuthenticated, user, role } = useAuth();
  const cartCount = useSelector((state) => state.cart.lines.length);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { openCartDrawer } = useCartDrawer();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <BSNavbar variant="dark" expand="md" className="lc-navbar mb-3" aria-label="Main navigation">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="lc-brand-text">
          ☕ Lalaland Cafe
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-nav" />
        <BSNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Menu</Nav.Link>
            {STAFF_ROLES.includes(role) && <Nav.Link as={Link} to="/kitchen">Kitchen Queue</Nav.Link>}
            {MANAGEMENT_ROLES.includes(role) && (
              <>
                <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                <Nav.Link as={Link} to="/admin/menu">Menu Management</Nav.Link>
                <Nav.Link as={Link} to="/admin/inventory">Inventory</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-md-center">
            <Button
              variant="outline-light"
              size="sm"
              className="me-md-2 mb-2 mb-md-0"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              className="me-md-2 mb-2 mb-md-0 rounded-pill"
              onClick={openCartDrawer}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              🛒 Cart {cartCount > 0 && <Badge bg="warning" text="dark">{cartCount}</Badge>}
            </Button>
            {isAuthenticated ? (
              <Nav.Link onClick={handleLogout} role="button">Logout ({user.fullName})</Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
