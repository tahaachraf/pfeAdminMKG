import { useParams, useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { generateNumeroDevis } from "@/lib/utils";
import { api } from "@/lib/api";

interface CommandeRaw {
  _id: string;
  clientId: { _id: string; nom: string; prenom: string; email: string } | string;
  statut: string;
  total: number;
  dateCommande: string;
}

interface CommandeProduitLigne {
  _id: string;
  id_commande: { _id: string } | string;
  id_produit: {
    _id: string;
    nom: string;
    reference?: string;
    prix?: number;
    categorie?: { _id: string; nom: string } | string;
  };
  quantite: number;
  prixUnitaire: number;
}

function clientNom(raw: CommandeRaw): string {
  const c = raw.clientId;
  if (c && typeof c === "object") return `${c.nom ?? ""} ${c.prenom ?? ""}`.trim() || "—";
  return "—";
}

function clientEmail(raw: CommandeRaw): string {
  const c = raw.clientId;
  if (c && typeof c === "object") return c.email ?? "—";
  return "—";
}

function categorieName(prod: CommandeProduitLigne["id_produit"]): string {
  if (!prod?.categorie) return "—";
  if (typeof prod.categorie === "object") return prod.categorie.nom ?? "—";
  return "—";
}

export default function DevisDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { devis } = useData();
  const { toast } = useToast();

  const [commande, setCommande] = useState<CommandeRaw | null>(null);
  const [lignes, setLignes] = useState<CommandeProduitLigne[]>([]);
  const [loading, setLoading] = useState(true);

  const numero = id ? generateNumeroDevis(devis, id) : "…";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawCommande, allLignes] = await Promise.all([
        api.get<CommandeRaw>(`/commandes/${id}`),
        api.get<CommandeProduitLigne[]>("/commande-produits"),
      ]);
      setCommande(rawCommande);
      setLignes(
        allLignes.filter((l) => {
          const cid = l.id_commande;
          return typeof cid === "object" ? cid._id === id : cid === id;
        })
      );
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger le devis.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Chargement…
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="space-y-4">
        <button onClick={() => setLocation("/devis")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour aux devis
        </button>
        <p className="text-red-500">Devis introuvable.</p>
      </div>
    );
  }

  const totalCalcule = lignes.length > 0
    ? lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0)
    : commande.total ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/devis")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          data-testid="button-back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{numero}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Commande en attente de confirmation</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Informations du devis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">N° Devis</p>
            <p className="font-semibold text-violet-600">{numero}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Client</p>
            <p className="font-medium text-gray-900">{clientNom(commande)}</p>
            <p className="text-xs text-gray-400">{clientEmail(commande)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Total (DT)</p>
            <p className="font-semibold text-gray-900">{totalCalcule.toLocaleString("fr-TN")}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date</p>
            <p className="font-medium text-gray-900">{commande.dateCommande?.substring(0, 10) ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Produits ({lignes.length})</h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-center">Qté</TableHead>
              <TableHead className="text-right">Prix unitaire (DT)</TableHead>
              <TableHead className="text-right">Sous-total (DT)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun produit dans ce devis.
                </TableCell>
              </TableRow>
            ) : (
              lignes.map((ligne) => {
                const prod = ligne.id_produit;
                return (
                  <TableRow key={ligne._id}>
                    <TableCell className="font-mono text-xs text-gray-500">{prod?.reference ?? "—"}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {prod?.nom ?? <span className="text-red-400 italic">Introuvable</span>}
                    </TableCell>
                    <TableCell className="text-gray-600">{categorieName(prod)}</TableCell>
                    <TableCell className="text-center font-medium">{ligne.quantite}</TableCell>
                    <TableCell className="text-right">{ligne.prixUnitaire.toLocaleString("fr-TN")}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {(ligne.quantite * ligne.prixUnitaire).toLocaleString("fr-TN")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {lignes.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{totalCalcule.toLocaleString("fr-TN")} DT</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
