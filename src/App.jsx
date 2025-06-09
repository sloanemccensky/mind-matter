// import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Journal from "./pages/journal";
// import Sidebar from "./components/Sidebar";

function App() {

  const currentUserId = "realUserId123"; // replace with real user id later

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Journal userId={currentUserId} />} />
      </Routes>
    </Router>
  );
}

export default App
