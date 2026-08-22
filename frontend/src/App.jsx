import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizSetup from './pages/QuizSetup';
import QuizActive from './pages/QuizActive';
import ResultsHistory from './pages/ResultsHistory';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';

function AppLayout() {
  const location = useLocation();
  const isQuizActivePage = location.pathname === '/quiz/active';

  return (
    <div className="flex flex-col min-h-screen">
      {!isQuizActivePage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Candidate Routes */}
          <Route
            path="/quiz/setup"
            element={
              <ProtectedRoute>
                <QuizSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/active"
            element={
              <ProtectedRoute>
                <QuizActive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsHistory />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrative Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isQuizActivePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
