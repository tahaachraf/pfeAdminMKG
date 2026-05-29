import { useState } from "react";
import { useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

export default function MarquesList() {
  const { marques, marquesLoading } = useData();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const filtered = marques.filter(
    (m) =>
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      (m.slug ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marques</h1>
          <p className="text-muted-foreground mt-2">Gérez les marques de vos produits.</p>
        </div>
        <button
          onClick={() => setLocation("/marques/nouvelle")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          data-testid="button-create-brand"
        >
          <Plus size={16} />
          Créer une marque
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une marque..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          data-testid="input-search"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Date création</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marquesLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Loader2 size={20} className="animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Aucune marque trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow
                  key={m._id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setLocation(`/marques/${m._id}`)}
                  data-testid={`row-brand-${m._id}`}
                >
                  <TableCell className="font-medium text-violet-600 hover:underline">{m.nom}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{m.slug}</TableCell>
                  <TableCell className="text-gray-500">
                    {m.dateCreation ? new Date(m.dateCreation).toLocaleDateString("fr-TN") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
