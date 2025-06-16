export default function Toggle({ collapsed, toggleCollapsed }) {
  return (
    <button
      onClick={toggleCollapsed}
      className="text-sm mb-4 bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
    >
      {collapsed ? '>' : '<'}
    </button>
  );
}
