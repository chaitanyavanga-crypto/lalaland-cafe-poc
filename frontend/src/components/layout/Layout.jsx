import React from 'react';
import Navbar from '../common/Navbar';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';

/**
 * Shared page shell: Navbar + main content region + Footer.
 * Keeps App.jsx focused on providers/routing instead of layout markup.
 */
export default function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1" id="main-content">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
