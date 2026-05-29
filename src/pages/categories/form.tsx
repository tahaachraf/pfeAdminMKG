import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useData, Categorie } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { ArrowLeft, Save, Trash2, ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function generateSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFullPath(catId: string, categories: Categorie[]): string {
  const cat = categories.find((c) => c._id === catId);
  if (!cat) return "";
  if (!cat.categorieParent) return cat.nom;
  const parentPath = getFullPath(cat.categorieParent, categories);
  return parentPath ? `${parentPath} / ${cat.nom}` : cat.nom;
}

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "nouvelle";
  const [, setLocation] = useLocation();
  const { categories, refreshCategories } = useData();
  const { toast } = useToast();

  const [parentOpen, setParentOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Categorie>>({
    nom: "",
    slug: "",
    description: "",
    metaDescription: "",
    metaKeywords: "",
    categorieParent: null,
  });

  useEffect(() => {
    if (!isNew) {
      const c = categories.find((c) => c._id === id);
      if (c) {
        setFormData({ ...c });
      } else if (categories.length > 0) {
        toast({ title: "Erreur", description: "Catégorie non trouvée", variant: "destructive" });
        setLocation("/categories");
      }
    }
  }, [id, isNew, categories, setLocation, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const payload = {
      ...formData,
      categorieParent: formData.categorieParent === "null" ? null : formData.categorieParent ?? null,
    };
    setSaving(true);
    try {
      if (isNew) {
        await api.post("/categories", payload);
        toast({ title: "Succès", description: "Catégorie créée avec succès" });
      } else {
        await api.put(`/categories/${id}`, payload);
        toast({ title: "Succès", description: "Catégorie mise à jour avec succès" });
      }
      await refreshCategories();
      setLocation("/categories");
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder la catégorie", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const hasChildren = categories.some((c) => c.categorieParent === id);
    if (hasChildren) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer une catégorie qui contient des sous-catégories.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await api.delete(`/categories/${id}`);
      toast({ title: "Succès", description: "Catégorie supprimée avec succès" });
      await refreshCategories();
      setLocation("/categories");
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la catégorie", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = useMemo(() => {
    return categories
      .filter((c) => c._id !== id)
      .map((c) => ({ _id: c._id, path: getFullPath(c._id, categories) }))
      .sort((a, b) => a.path.localeCompare(b.path, "fr"));
  }, [categories, id]);

  const currentPath = !isNew && id ? getFullPath(id, categories) : null;
  const selectedParentVal = formData.categorieParent;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/categories")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "Créer une catégorie" : formData.nom}
          </h1>
          {currentPath && (
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{currentPath}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">

          <div className="space-y-2">
            <Label>Catégorie parente</Label>
            <Popover open={parentOpen} onOpenChange={setParentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={parentOpen}
                  className="w-full justify-between font-normal text-left h-auto min-h-10 whitespace-normal"
                  data-testid="select-parent"
                >
                  <span className="truncate">
                    {selectedParentVal && selectedParentVal !== "null"
                      ? parentOptions.find((p) => p._id === selectedParentVal)?.path ?? "—"
                      : "-- Aucune (Catégorie Racine) --"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher une catégorie..." />
                  <CommandList className="max-h-64">
                    <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="aucune"
                        onSelect={() => {
                          setFormData((prev) => ({ ...prev, categorieParent: null }));
                          setParentOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${!selectedParentVal || selectedParentVal === "null" ? "opacity-100" : "opacity-0"}`} />
                        -- Aucune (Catégorie Racine) --
                      </CommandItem>
                      {parentOptions.map((p) => (
                        <CommandItem
                          key={p._id}
                          value={p.path}
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, categorieParent: p._id }));
                            setParentOpen(false);
                          }}
                        >
                          <Check className={`mr-2 h-4 w-4 shrink-0 ${selectedParentVal === p._id ? "opacity-100" : "opacity-0"}`} />
                          {p.path}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la catégorie *</Label>
            <Input id="nom" name="nom" value={formData.nom ?? ""} onChange={handleChange} required data-testid="input-nom" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL</Label>
            <p className="text-xs text-muted-foreground">Généré automatiquement à partir du nom.</p>
            <Input id="slug" name="slug" value={formData.slug ?? ""} readOnly className="bg-muted text-muted-foreground cursor-default" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description ?? ""} onChange={handleChange} rows={3} placeholder="Description de la catégorie" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea id="metaDescription" name="metaDescription" value={formData.metaDescription ?? ""} onChange={handleChange} rows={2} placeholder="Description pour les moteurs de recherche" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Mots-clés SEO</Label>
            <Textarea id="metaKeywords" name="metaKeywords" value={formData.metaKeywords ?? ""} onChange={handleChange} rows={2} placeholder="mot1, mot2, mot3" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          {!isNew ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="gap-2" disabled={saving}>
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    La catégorie "{formData.nom}" sera définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => setLocation("/categories")} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" className="gap-2" disabled={saving} data-testid="button-submit">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isNew ? "Créer la catégorie" : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
