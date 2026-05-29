import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useData, Marque } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { api } from "@/lib/api";

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";

export default function MarqueForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "nouvelle";
  const [, setLocation] = useLocation();
  const { marques, refreshMarques } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Marque>>({ nom: "", slug: "" });

  useEffect(() => {
    if (!isNew) {
      const b = marques.find((m) => m._id === id);
      if (b) {
        setFormData({ nom: b.nom, slug: b.slug });
      } else if (marques.length > 0) {
        toast({ title: "Erreur", description: "Marque non trouvée", variant: "destructive" });
        setLocation("/marques");
      }
    }
  }, [id, isNew, marques, setLocation, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "nom") updated.slug = generateSlug(value);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom?.trim()) {
      toast({ title: "Erreur", description: "Le nom est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await api.post("/marques", formData);
        toast({ title: "Succès", description: "Marque créée avec succès" });
      } else {
        await api.put(`/marques/${id}`, formData);
        toast({ title: "Succès", description: "Marque mise à jour avec succès" });
      }
      await refreshMarques();
      setLocation("/marques");
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder la marque", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/marques/${id}`);
      toast({ title: "Succès", description: "Marque supprimée avec succès" });
      await refreshMarques();
      setLocation("/marques");
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la marque", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setLocation("/marques")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          data-testid="button-back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isNew ? "Nouvelle marque" : formData.nom}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isNew ? "Créer une marque" : "Modifier la marque"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              name="nom"
              value={formData.nom ?? ""}
              onChange={handleChange}
              className={inp}
              required
              data-testid="input-nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              name="slug"
              value={formData.slug ?? ""}
              readOnly
              className={`${inp} bg-gray-50 text-gray-500 cursor-default`}
              data-testid="input-slug"
            />
            <p className="text-xs text-gray-400 mt-1">Généré automatiquement depuis le nom</p>
          </div>
        </div>

        <div className="flex items-center justify-between pb-6">
          {!isNew ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  data-testid="button-delete"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={15} />}
                  Supprimer
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La marque "{formData.nom}" sera définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : <div />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setLocation("/marques")}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              data-testid="button-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-submit"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isNew ? "Créer la marque" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
