import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { validateEmail } from '../../validations/authValidation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | sent | error
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      await authService.forgotPassword(email);
      // Always show the same success state regardless of whether the email exists,
      // so this endpoint can't be used to enumerate registered accounts.
      setStatus('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Container style={{ maxWidth: 420 }}>
      <Card className="lc-card shadow-sm p-4">
        <h1 className="h4 mb-3">Forgot Password</h1>
        {status === 'sent' ? (
          <Alert variant="success">
            If an account exists for that email, we've sent password reset instructions.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="forgotEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={status === 'loading'} className="w-100 rounded-pill">
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form>
        )}
        <div className="text-center mt-3">
          <Link to="/login">Back to login</Link>
        </div>
      </Card>
    </Container>
  );
}
