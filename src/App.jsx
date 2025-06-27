import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Journal from "./pages/journal";
import Nav from "./components/nav";
import Mood from "./pages/mood";
import Gratitude from "./pages/gratitude";

function App() {

  // State to manage sidebar collapse/expand
  // This could be replaced with a more complex state management solution if needed
  const [collapsed, setCollapsed] = useState(false);
  const currentUserId = "realUserId123"; // replace with real user id later

  return (
    <Router>
      <div className="flex w-screen h-screen">
        <Nav collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />
        <div className="flex-1 w-screen overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<div>Homepage TBD</div>} />
            <Route path="/journal" element={<Journal userId={currentUserId} />} />
            <Route path="/mood" element={<Mood userId={currentUserId} />} />
            <Route path="/gratitude" element={<Gratitude userId={currentUserId} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
