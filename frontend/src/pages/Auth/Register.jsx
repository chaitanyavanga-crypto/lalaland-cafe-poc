import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { register, clearAuthError } from '../../redux/slices/authSlice';
import { validateRegisterForm } from '../../validations/authValidation';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateRegisterForm(form);
    if (form.password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Please sign in.');
      navigate('/login');
    }
  };

  return (
    <Container style={{ maxWidth: 420 }}>
      <Card className="lc-card shadow-sm p-4">
        <h1 className="h4 mb-3">Create an Account</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="registerFullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
              isInvalid={!!fieldErrors.fullName}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.fullName}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              isInvalid={!!fieldErrors.email}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerPhone">
            <Form.Label>Phone <span className="text-muted small">(optional)</span></Form.Label>
            <Form.Control
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={form.password}
              onChange={handleChange('password')}
              isInvalid={!!fieldErrors.password}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
            <Form.Text muted>At least 8 characters.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isInvalid={!!fieldErrors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-100 rounded-pill">
            {status === 'loading' ? 'Creating account...' : 'Sign Up'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </Card>
    </Container>
  );
}
