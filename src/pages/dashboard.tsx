import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { api } from "@/lib/api";
import {
  Box,
  FileText,
  ShoppingCart,
  TrendingUp,
  Tag,
  Layers,
  FolderOpen,
  Truck,
  Users,
} from "lucide-react";

const ADMIN_ROLES = ["superAdmin", "adminMarketing", "adminAchat"];

interface UserCount {
  admins: number;
  clients: number;
  internautes: number;
}

export default function Dashboard() {
  const { produits, devis, commandes, categories, fournisseurs, marques, modeles } = useData();

  const [userCount, setUserCount] = useState<UserCount>({ admins: 0, clients: 0, internautes: 0 });

  useEffect(() => {
    api.get<{ role: string }[]>("/users")
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setUserCount({
          admins:      list.filter((u) => ADMIN_ROLES.includes(u.role)).length,
          clients:     list.filter((u) => u.role === "client").length,
          internautes: list.filter((u) => u.role === "internaute").length,
        });
      })
      .catch(() => {});
  }, []);

  const commandesConfirmees = commandes.filter((c) => c.statut === "Confirmée").length;

  const revenuTotal = commandes
    .filter((c) => c.statut === "Confirmée")
    .reduce((sum, c) => sum + (c.total ?? 0), 0);

  const valeurStock = produits.reduce(
    (sum, p) => sum + (p.prix ?? 0) * (p.quantiteStock ?? 0),
    0
  );

  const stats = [
    {
      title: "Total Produits",
      value: produits.length,
      icon: Box,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Total Devis",
      value: devis.length,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Commandes",
      value: commandes.length,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Revenu total (DT)",
      value: `${revenuTotal.toLocaleString("fr-TN")} DT`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Valeur stock (DT)",
      value: `${valeurStock.toLocaleString("fr-TN")} DT`,
      icon: Tag,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Total Modèles",
      value: modeles.length,
      icon: Layers,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Catégories",
      value: categories.length,
      icon: FolderOpen,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "Fournisseurs",
      value: fournisseurs.length,
      icon: Truck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">Vue d'ensemble des activités marketing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, color, bg }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}

        {/* Carte Utilisateurs — total + 3 sous-compteurs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <Users size={22} className="text-rose-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {userCount.admins + userCount.clients + userCount.internautes}
            </p>
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Admins</span>
                <span className="font-semibold text-gray-700">{userCount.admins}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Clients</span>
                <span className="font-semibold text-gray-700">{userCount.clients}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Internautes</span>
                <span className="font-semibold text-gray-700">{userCount.internautes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
