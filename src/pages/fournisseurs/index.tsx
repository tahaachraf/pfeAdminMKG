import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Fournisseur {
  _id: string;
  nom: string;
  email?: string;
  tel?: string;
  siteWeb?: string;
  dateCreation?: string;
}

export default function FournisseursList() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<Fournisseur[]>("/fournisseurs")
      .then((res) => setFournisseurs(res ?? []))
      .catch(() => setFournisseurs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return fournisseurs;
    return fournisseurs.filter(
      (f) =>
        f.nom.toLowerCase().includes(q) ||
        (f.email ?? "").toLowerCase().includes(q) ||
        (f.tel ?? "").toLowerCase().includes(q)
    );
  }, [fournisseurs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
        <p className="text-muted-foreground mt-2">Liste des fournisseurs référencés.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Site web</TableHead>
              <TableHead>Date création</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 size={20} className="animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun fournisseur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((f) => (
                <TableRow key={f._id} data-testid={`row-fournisseur-${f._id}`}>
                  <TableCell className="font-medium text-gray-900">{f.nom}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{f.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{f.tel ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {f.siteWeb ? (
                      <a
                        href={f.siteWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                      >
                        {f.siteWeb} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {f.dateCreation ? new Date(f.dateCreation).toLocaleDateString("fr-TN") : "—"}
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
