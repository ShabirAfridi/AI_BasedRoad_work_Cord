import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiAlertTriangle,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

const buildMenuItems = (conflictCount) => [
  { title: "Dashboard",       icon: FiHome,          path: "/department/dashboard" },
  { title: "My Requests",     icon: FiFileText,      anchor: "requests-table" },
  { title: "Conflict Alerts", icon: FiAlertTriangle, anchor: "conflict-banner", badge: conflictCount },
  { title: "Reports",         icon: FiBarChart2,     disabled: true },
];

export default function Sidebar({ conflictCount = 0 }) {
  const menuItems = buildMenuItems(conflictCount);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const baseClasses =
    "group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200";

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[280px] flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-colors duration-200">

      {/* Logo */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white shadow-lg">
            RC
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">CivicPath</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Infrastructure Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.title}
                className={`${baseClasses} cursor-not-allowed text-slate-300 dark:text-slate-600`}
                title="Coming soon"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.title}</span>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Soon
                </span>
              </div>
            );
          }

          if (item.path) {
            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `${baseClasses} ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.title}</span>
                </div>
              </NavLink>
            );
          }

          return (
            <button
              key={item.title}
              onClick={() => scrollTo(item.anchor)}
              className={`${baseClasses} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium">{item.title}</span>
              </div>

              {item.badge > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-5">
        <div
          className={`${baseClasses} cursor-not-allowed text-slate-300 dark:text-slate-600`}
          title="Coming soon"
        >
          <div className="flex items-center gap-3">
            <FiSettings size={20} />
            <span className="font-medium">Settings</span>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            Soon
          </span>
        </div>
      </div>

    </aside>
  );
}