import { useData } from "@/contexts/DataContext";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Statistiques() {
  const { devis, commandes, produits } = useData();

  const caTotal = commandes
    .filter((c) => c.statut === "Livrée")
    .reduce((sum, c) => sum + (c.total ?? 0), 0);

  const caTous = commandes.reduce((sum, c) => sum + (c.total ?? 0), 0);

  const commandesParStatut = [
    { label: "En attente", value: commandes.filter((c) => c.statut === "En attente").length, cls: "bg-amber-100 text-amber-700" },
    { label: "Confirmée",  value: commandes.filter((c) => c.statut === "Confirmée").length,  cls: "bg-blue-100 text-blue-700" },
    { label: "Expédiée",   value: commandes.filter((c) => c.statut === "Expédiée").length,   cls: "bg-indigo-100 text-indigo-700" },
    { label: "Livrée",     value: commandes.filter((c) => c.statut === "Livrée").length,     cls: "bg-emerald-100 text-emerald-700" },
    { label: "Annulée",    value: commandes.filter((c) => c.statut === "Annulée").length,    cls: "bg-red-100 text-red-700" },
  ];

  const txLivraison = commandes.length > 0
    ? Math.round((commandes.filter((c) => c.statut === "Livrée").length / commandes.length) * 100)
    : 0;

  const moyenneCommande = commandes.length > 0
    ? Math.round(caTous / commandes.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground mt-2">Analyse des performances commerciales et marketing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Chiffre d'affaires livré</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{caTotal.toLocaleString("fr-TN")} DT</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Commandes livrées uniquement
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Taux de livraison</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{txLivraison}%</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            {txLivraison >= 50
              ? <TrendingUp size={12} className="text-emerald-600" />
              : <TrendingDown size={12} className="text-red-600" />}
            {commandes.filter((c) => c.statut === "Livrée").length} livrée(s) sur {commandes.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Panier moyen</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{moyenneCommande.toLocaleString("fr-TN")} DT</p>
          <p className="text-xs text-gray-400 mt-1">{commandes.length} commande(s) au total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Répartition des commandes</h2>
          <div className="space-y-3">
            {commandesParStatut.map(({ label, value, cls }) => {
              const pct = commandes.length > 0 ? Math.round((value / commandes.length) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                    <span className="text-sm font-semibold text-gray-700">{value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Vue d'ensemble catalogue</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
              <span className="text-sm font-medium text-violet-800">Produits actifs</span>
              <span className="text-xl font-bold text-violet-700">{produits.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-amber-800">Devis créés</span>
              <span className="text-xl font-bold text-amber-700">{devis.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-emerald-800">CA total toutes commandes</span>
              <span className="text-xl font-bold text-emerald-700">{caTous.toLocaleString("fr-TN")} DT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
