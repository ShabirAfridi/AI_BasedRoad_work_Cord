export default function StatCard({
  title,
  value,
  color,
  icon: Icon,
}) {
  return (
 <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </h2>
        </div>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <Icon size={24} className="text-white" />
        </div>

      </div>

    </div>
  );
}