import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Services from './pages/Services';
import SystemSettings from './pages/SystemSettings';
import Publishing from './pages/Publishing';
import Monitoring from './pages/Monitoring';
import AuditLogs from './pages/AuditLogs';
import AdminSyllabusManagement from './components/AdminSyllabusManagement.tsx';
import './index.css';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/roles"
                    element={
                        <ProtectedRoute>
                            <Roles />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/services"
                    element={
                        <ProtectedRoute>
                            <Services />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/system-settings"
                    element={
                        <ProtectedRoute>
                            <SystemSettings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/publishing"
                    element={
                        <ProtectedRoute>
                            <Publishing />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/monitoring"
                    element={
                        <ProtectedRoute>
                            <Monitoring />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/audit-logs"
                    element={
                        <ProtectedRoute>
                            <AuditLogs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/syllabus-management"
                    element={
                        <ProtectedRoute>
                            <AdminSyllabusManagement />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

