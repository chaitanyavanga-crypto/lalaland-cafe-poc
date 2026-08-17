import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { validateResetPasswordForm } from '../../validations/authValidation';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateResetPasswordForm({ password, confirmPassword });
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      await authService.resetPassword(token, password);
      setStatus('done');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <Container style={{ maxWidth: 420 }}>
        <Alert variant="success">Password updated. Redirecting to login...</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: 420 }}>
      <Card className="lc-card shadow-sm p-4">
        <h1 className="h4 mb-3">Reset Password</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-100 rounded-pill">
            {status === 'loading' ? 'Updating...' : 'Reset Password'}
          </Button>
        </Form>
        <div className="text-center mt-3">
          <Link to="/login">Back to login</Link>
        </div>
      </Card>
    </Container>
  );
}
