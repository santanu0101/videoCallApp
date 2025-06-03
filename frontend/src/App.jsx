// import { useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Auth from "./pages/auth/Auth";
import Dashboard from "./pages/dashboard/Dashboard";

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        <Route path="/login" element={<Auth type="login" />} />
      </Routes>
    </Router>
  );
}


export default App;
