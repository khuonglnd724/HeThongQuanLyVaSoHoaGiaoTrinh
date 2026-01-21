import React from 'react'

const AdminDashboard = ({ user, onLogout }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p className="mt-2 text-gray-700">Welcome, {user?.name || 'Admin'}</p>
    <button onClick={onLogout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Logout</button>
  </div>
)

export default AdminDashboard
