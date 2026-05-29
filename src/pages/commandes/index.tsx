import { useState } from "react";
import { Link } from "wouter";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { generateNumeroCommande } from "@/lib/utils";

const statusConfig: Record<string, { label: string; cls: string }> = {
  "Confirmée":   { label: "Confirmée",   cls: "bg-blue-100 text-blue-700" },
  "Expédiée":    { label: "Expédiée",    cls: "bg-indigo-100 text-indigo-700" },
  "Livrée":      { label: "Livrée",      cls: "bg-emerald-100 text-emerald-700" },
  "Annulée":     { label: "Annulée",     cls: "bg-red-100 text-red-700" },
};

export default function CommandesList() {
  const { commandes } = useData();
  const [search, setSearch] = useState("");

  const filtered = commandes.filter((c) =>
    c.nomClient.toLowerCase().includes(search.toLowerCase()) ||
    c.statut.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <p className="text-muted-foreground mt-2">Commandes confirmées de vos clients.</p>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par N°, client ou statut..."
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
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Total (DT)</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune commande confirmée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const { label, cls } = statusConfig[c.statut] ?? { label: c.statut, cls: "bg-gray-100 text-gray-600" };
                return (
                  <TableRow key={c._id} data-testid={`row-commande-${c._id}`}>
                    <TableCell className="font-mono text-sm font-medium">
                      <Link href={`/commandes/${c._id}`} className="text-primary hover:underline">
                        {generateNumeroCommande(commandes, c._id)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{c.nomClient}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(c.total ?? 0).toLocaleString("fr-TN")}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.dateCommande}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
