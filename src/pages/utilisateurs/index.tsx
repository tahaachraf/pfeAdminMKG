import { useEffect, useState, useMemo, useRef } from "react";
import { api } from "@/lib/api";
import { Search, Users, ChevronDown } from "lucide-react";

interface Utilisateur {
  _id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  role: string;
  statut: string;
  dateCreation: string;
}

const roleLabel: Record<string, string> = {
  superAdmin:     "Super Admin",
  adminMarketing: "Admin Marketing",
  adminAchat:     "Admin Achat",
  client:         "Client",
  internaute:     "Internaute",
};

const roleBadge: Record<string, string> = {
  superAdmin:     "bg-red-50 text-red-700",
  adminMarketing: "bg-purple-50 text-purple-700",
  adminAchat:     "bg-emerald-50 text-emerald-700",
  client:         "bg-blue-50 text-blue-700",
  internaute:     "bg-gray-100 text-gray-600",
};

const ADMIN_ROLES = ["superAdmin", "adminMarketing", "adminAchat"];

const ADMIN_SUB_FILTERS = [
  { key: "all",            label: "Tous les admins" },
  { key: "superAdmin",     label: "Super Admin" },
  { key: "adminMarketing", label: "Admin Marketing" },
  { key: "adminAchat",     label: "Admin Achat" },
] as const;

type AdminSubKey = "all" | "superAdmin" | "adminMarketing" | "adminAchat";
type FilterKey = "tout" | "admins" | "client" | "internaute";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-TN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildRef(u: Utilisateur, allUsers: Utilisateur[]) {
  const sorted = [...allUsers].sort((a, b) =>
    (a.dateCreation ?? "").localeCompare(b.dateCreation ?? "") || a._id.localeCompare(b._id)
  );
  const idx = sorted.findIndex((x) => x._id === u._id);
  const year = u.dateCreation ? new Date(u.dateCreation).getFullYear() : new Date().getFullYear();
  return `USR-${year}-${String(idx + 1).padStart(3, "0")}`;
}

export default function UtilisateursList() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tout");
  const [adminSub, setAdminSub] = useState<AdminSubKey>("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    api.get<Utilisateur[]>("/users")
      .then((data) => setUtilisateurs(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossible de charger les utilisateurs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return utilisateurs.filter((u) => {
      let matchRole = true;
      if (activeFilter === "admins") {
        matchRole = adminSub === "all" ? ADMIN_ROLES.includes(u.role) : u.role === adminSub;
      } else if (activeFilter === "client") {
        matchRole = u.role === "client";
      } else if (activeFilter === "internaute") {
        matchRole = u.role === "internaute";
      }
      const q = search.toLowerCase();
      const fullName = `${u.nom ?? ""} ${u.prenom ?? ""}`.toLowerCase();
      const matchSearch =
        !q ||
        fullName.includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (roleLabel[u.role] ?? u.role).toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [utilisateurs, search, activeFilter, adminSub]);

  const countTout       = utilisateurs.length;
  const countAdmins     = utilisateurs.filter((u) => ADMIN_ROLES.includes(u.role)).length;
  const countClient     = utilisateurs.filter((u) => u.role === "client").length;
  const countInternaute = utilisateurs.filter((u) => u.role === "internaute").length;

  const handleAdminsClick = () => {
    if (activeFilter !== "admins") {
      setActiveFilter("admins");
      setAdminSub("all");
      setShowDropdown(true);
    } else {
      setShowDropdown((v) => !v);
    }
  };

  const adminsButtonLabel =
    activeFilter === "admins" && adminSub !== "all"
      ? ADMIN_SUB_FILTERS.find((s) => s.key === adminSub)?.label ?? "Admins"
      : "Admins";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">Liste de tous les utilisateurs de la plateforme.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, rôle…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Tout */}
          <button
            onClick={() => { setActiveFilter("tout"); setShowDropdown(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === "tout"
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            Tout
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeFilter === "tout" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>{countTout}</span>
          </button>

          {/* Admins avec dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleAdminsClick}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeFilter === "admins"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {adminsButtonLabel}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                activeFilter === "admins" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>{countAdmins}</span>
              <ChevronDown size={12} className={`ml-0.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {ADMIN_SUB_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setAdminSub(key); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      adminSub === key
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clients */}
          <button
            onClick={() => { setActiveFilter("client"); setShowDropdown(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === "client"
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            Clients
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeFilter === "client" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>{countClient}</span>
          </button>

          {/* Internautes */}
          <button
            onClick={() => { setActiveFilter("internaute"); setShowDropdown(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === "internaute"
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700"
            }`}
          >
            Internautes
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activeFilter === "internaute" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>{countInternaute}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Chargement…</div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Users size={32} className="text-gray-300" />
            <p className="text-sm">Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Référence</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nom & Prénom</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Rôle</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date de création</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {buildRef(u, utilisateurs)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    {u.nom || u.prenom
                      ? `${u.nom ?? ""} ${u.prenom ?? ""}`.trim()
                      : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {u.email ?? <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatDate(u.dateCreation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-gray-400 text-right">
          {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
