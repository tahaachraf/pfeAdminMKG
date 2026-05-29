import { useParams, useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { ArrowLeft } from "lucide-react";
import { generateNumeroCommande } from "@/lib/utils";

const statusConfig: Record<string, { label: string; cls: string }> = {
  "En attente": { label: "En attente", cls: "bg-amber-100 text-amber-700" },
  "Confirmée":  { label: "Confirmée",  cls: "bg-blue-100 text-blue-700" },
  "Expédiée":   { label: "Expédiée",   cls: "bg-indigo-100 text-indigo-700" },
  "Livrée":     { label: "Livrée",     cls: "bg-emerald-100 text-emerald-700" },
  "Annulée":    { label: "Annulée",    cls: "bg-red-100 text-red-700" },
};

export default function CommandeDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { commandes } = useData();

  const c = commandes.find((c) => c._id === id);

  if (!c) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Commande introuvable.{" "}
        <button className="text-primary underline" onClick={() => setLocation("/commandes")}>
          Retour à la liste
        </button>
      </div>
    );
  }

  const numero = generateNumeroCommande(commandes, id!);
  const { label, cls } = statusConfig[c.statut] ?? { label: c.statut, cls: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setLocation("/commandes")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          data-testid="button-back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{numero}</h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Détail de la commande client</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</dt>
            <dd className="mt-1 text-sm font-semibold">{c.nomClient}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</dt>
            <dd className="mt-1 text-sm">{c.dateCommande}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</dt>
            <dd className="mt-1">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Montant total</dt>
          <dd className="text-2xl font-bold text-gray-900">{(c.total ?? 0).toLocaleString("fr-TN")} DT</dd>
        </div>
      </div>
    </div>
  );
}
