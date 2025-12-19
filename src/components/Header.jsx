import { Search, Bell } from "lucide-react";
import { MyUserContext } from "../contexts/UserContext";
import { useContext } from "react";
export default function Header() {
  const user = useContext(MyUserContext);
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-xl font-bold text-emerald-500">€</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">CloudBase</h2>
            <p className="text-xs text-slate-400">DB Service</p>
          </div>
        </div>
        {/* Search */}
        {/* <div className="relative w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search projects, databases..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div> */}

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <span className="text-slate-400">
            Xin chào, <b className="text-white">{user?.name}!</b>
          </span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
