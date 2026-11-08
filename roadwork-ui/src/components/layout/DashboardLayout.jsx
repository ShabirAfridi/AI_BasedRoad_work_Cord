import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ children,conflictCount = 0 }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]" dark:bg-slate-900 transition-colors duration-200>
      <Sidebar  conflictCount = {conflictCount}/>
<div className="ml-[280px] flex min-h-screen flex-col"  >
        <TopNavbar />

        <main className="flex-1 bg-[#F8FAFC] px-8 py-8" dark:bg-slate-900 px-8 py-8 transition-colors duration-200>
          {children}
        </main>
      </div>
    </div>
  );
}