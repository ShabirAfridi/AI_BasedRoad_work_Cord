import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      {theme === "dark" ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-slate-700" />}
    </button>
  );
}