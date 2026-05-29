import { useState } from "react";
import { useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

export default function ModelesList() {
  const { modeles, modelesLoading, marques } = useData();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const getMarqueNom = (idMarque: string) =>
    marques.find((m) => m._id === idMarque)?.nom ?? "—";

  const filtered = modeles.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nom.toLowerCase().includes(q) ||
      (m.slug ?? "").toLowerCase().includes(q) ||
      getMarqueNom(m.idMarque).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modèles</h1>
          <p className="text-muted-foreground mt-2">Gérez les modèles de vos produits.</p>
        </div>
        <button
          onClick={() => setLocation("/modeles/nouveau")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          data-testid="button-create-model"
        >
          <Plus size={16} />
          Créer un modèle
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou marque..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          data-testid="input-search"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {modelesLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            Chargement des modèles…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date création</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun modèle trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => (
                  <TableRow
                    key={m._id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setLocation(`/modeles/${m._id}`)}
                    data-testid={`row-model-${m._id}`}
                  >
                    <TableCell className="font-medium text-violet-600 hover:underline">{m.nom}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700">
                        {getMarqueNom(m.idMarque)}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 font-mono text-xs">{m.slug}</TableCell>
                    <TableCell className="text-gray-500">
                      {m.dateCreation ? new Date(m.dateCreation).toLocaleDateString("fr-TN") : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
