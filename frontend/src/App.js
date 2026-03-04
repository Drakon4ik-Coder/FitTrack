import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import CalorieTracker from "./CalorieTracker";
import FoodListManager from "./FoodListManager";
import { AuthProvider, useAuth } from "./AuthContext";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Pantry from "./Pantry";
import Settings from "./Settings";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isActive ? "text-white" : "text-text-muted hover:text-white"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-red to-accent-teal rounded-full" />
      )}
    </Link>
  );
}

function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-app/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold bg-gradient-to-r from-accent-red via-accent-yellow to-accent-teal bg-clip-text text-transparent">
            FitTrack
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/food-list">Foods</NavLink>
              <NavLink to="/pantry">Pantry</NavLink>
              <NavLink to="/settings">Settings</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-app">
          <Navigation />
          <main className="max-w-6xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <CalorieTracker />
                </ProtectedRoute>
              } />
              <Route path="/food-list" element={
                <ProtectedRoute>
                  <FoodListManager />
                </ProtectedRoute>
              } />
              <Route path="/pantry" element={
                <ProtectedRoute>
                  <Pantry />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
