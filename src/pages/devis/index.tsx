import { useState } from "react";
import { Link } from "wouter";
import { useData } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { generateNumeroDevis } from "@/lib/utils";

export default function DevisList() {
  const { devis } = useData();
  const [search, setSearch] = useState("");

  const filtered = devis.filter((d) =>
    d.nomClient.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
        <p className="text-muted-foreground mt-2">Commandes en attente de confirmation.</p>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
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
              <TableHead>N° Devis</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Total (DT)</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun devis en attente.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d._id} data-testid={`row-devis-${d._id}`}>
                  <TableCell className="font-mono text-sm font-medium">
                    <Link href={`/devis/${d._id}`} className="text-primary hover:underline">
                      {generateNumeroDevis(devis, d._id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{d.nomClient}</p>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {d.total.toLocaleString("fr-TN")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.dateDevis}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
