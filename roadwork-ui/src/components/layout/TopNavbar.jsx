import { FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle";

const DEPARTMENT_NAMES = {
  1: "WAPDA",
  2: "PTCL",
  3: "SNGPL",
};

export default function TopNavbar() {
  const { user } = useAuth();

  const departmentLabel = user?.departmentId
    ? DEPARTMENT_NAMES[user.departmentId] || "Department"
    : "Department";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 transition-colors duration-200">

      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Department Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Home / Dashboard
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        <ThemeToggle />

        <button
          className="relative rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Notifications — coming soon"
        >
          <FiBell size={21} className="text-slate-700 dark:text-slate-300" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <FiUser className="text-blue-600 dark:text-blue-400" size={20} />
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user?.fullName || "Department User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {departmentLabel}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}