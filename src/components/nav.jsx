import Toggle from "./toggle";
import Links from "./links";

export default function Nav({ collapsed, toggleCollapsed }) {
  return (
    <div className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white p-4 transition-all duration-300`}>
      <Toggle collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
      {!collapsed && <Links />}
    </div>
  );
}
