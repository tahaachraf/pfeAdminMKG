import { useState, useMemo } from "react";
import { useData, Categorie } from "@/contexts/DataContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";

function getFullPath(catId: string, categories: Categorie[]): string {
  const cat = categories.find((c) => c._id === catId);
  if (!cat) return "";
  if (!cat.categorieParent) return cat.nom;
  const parentPath = getFullPath(cat.categorieParent, categories);
  return parentPath ? `${parentPath} / ${cat.nom}` : cat.nom;
}

export default function CategoriesList() {
  const { categories, categoriesLoading } = useData();
  const [search, setSearch] = useState("");

  const categoriesWithPaths = useMemo(() => {
    return categories
      .map((c) => ({ ...c, fullPath: getFullPath(c._id, categories) }))
      .sort((a, b) => a.fullPath.localeCompare(b.fullPath, "fr"));
  }, [categories]);

  const filtered = categoriesWithPaths.filter((c) =>
    c.fullPath.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-muted-foreground mt-2">Gérez l'arborescence des catégories.</p>
        </div>
        <Link href="/categories/nouvelle">
          <Button className="gap-2" data-testid="button-create-category">
            <Plus className="h-4 w-4" />
            Créer une catégorie
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 min-h-[120px]">
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={22} className="animate-spin mr-2" />
            Chargement des catégories…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune catégorie trouvée.
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="py-2 px-3 hover:bg-slate-50 rounded-md transition-colors"
                data-testid={`row-category-${c._id}`}
              >
                <Link
                  href={`/categories/${c._id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {c.fullPath}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
