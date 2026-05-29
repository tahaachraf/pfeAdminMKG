import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus } from "lucide-react";

export default function ProduitsList() {
  const { produits } = useData();
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filtered = produits.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.reference ?? "").toLowerCase().includes(q) ||
      p.nom.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground mt-2">Consultez le catalogue produits.</p>
        </div>
        <button
          onClick={() => setLocation("/produits/nouveau")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          data-testid="btn-nouveau-produit"
        >
          <Plus size={16} />
          Nouveau produit
        </button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Coût (DT)</TableHead>
              <TableHead className="text-right">Prix de vente (DT)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p._id} data-testid={`row-produit-${p._id}`}>
                  <TableCell className="font-mono text-sm font-medium">
                    <Link
                      href={`/produits/${p._id}`}
                      className="text-violet-700 hover:text-violet-900 hover:underline cursor-pointer"
                      data-testid={`link-produit-${p._id}`}
                    >
                      {p.reference ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/produits/${p._id}`}
                      className="text-violet-700 hover:text-violet-900 hover:underline cursor-pointer"
                    >
                      {p.nom}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.cout != null ? p.cout.toLocaleString("fr-TN") : "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{p.prix.toLocaleString("fr-TN")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
