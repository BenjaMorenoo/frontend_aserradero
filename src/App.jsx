import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { pb } from './lib/pocketbase'


function PrivateRoute({ children }) {
  // pb.authStore.isValid es un check local (véase docs) — también puedes validar con pb.collection('users').authRefresh()
  if (!pb.authStore.isValid) return <Navigate to="/login" />
  return children
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    </Routes>
  )
}