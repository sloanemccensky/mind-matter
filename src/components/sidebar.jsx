// src/components/Sidebar.jsx
import { Link } from "react-router-dom";

export default function Sidebar({ collapsed, toggleCollapsed }) {
    return (
        <div className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white p-4 transition-all duration-300`}>
            <button
                onClick={toggleCollapsed}
                className="text-sm mb-4 bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
                {collapsed ? '>' : '<'}
            </button>

            {!collapsed && (
                <div className="space-y-4">
                    <a href="/" className="block hover:underline">Homepage</a>
                    <a href="/journal" className="block hover:underline">Journal</a>
                    <a href="/mood" className="block hover:underline">Mood Meter</a>
                </div>
            )}
        </div>
    );
}


