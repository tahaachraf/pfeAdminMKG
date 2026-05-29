import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
            <User size={13} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.nom}</span>
          <span className="text-xs text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
