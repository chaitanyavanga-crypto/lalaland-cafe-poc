import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { login, clearAuthError } from '../../redux/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) navigate('/');
  };

  return (
    <Container style={{ maxWidth: 420 }}>
      <Card className="lc-card shadow-sm p-4">
        <h1 className="h4 mb-3">Staff / Customer Login</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-100 rounded-pill">
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <div className="text-center mt-2">
          Don&rsquo;t have an account? <Link to="/register">Sign up</Link>
        </div>
      </Card>
    </Container>
  );
}
