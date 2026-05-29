import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useData, Categorie } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";
const ta  = `${inp} resize-y min-h-[80px]`;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getFullPath(catId: string, categories: Categorie[]): string {
  const cat = categories.find((c) => c._id === catId);
  if (!cat) return "";
  if (!cat.categorieParent) return cat.nom;
  const parentPath = getFullPath(cat.categorieParent, categories);
  return parentPath ? `${parentPath} / ${cat.nom}` : cat.nom;
}

interface Chip { linkId?: string; _id: string; nom: string; }
interface FournisseurChip extends Chip { prix_achat: number; reference_fournisseur: string; }

interface AutocompleteProps<T extends { _id: string; nom: string }> {
  items: T[];
  excluded: string[];
  placeholder: string;
  onSelect: (item: T) => void;
  testId?: string;
}

function Autocomplete<T extends { _id: string; nom: string }>({
  items, excluded, placeholder, onSelect, testId,
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = items.filter(
    (i) => !excluded.includes(i._id) && i.nom.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={inp}
        data-testid={testId}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 10).map((item) => (
            <li
              key={item._id}
              onMouseDown={() => { onSelect(item); setQuery(""); setOpen(false); }}
              className="px-3 py-2 text-sm hover:bg-violet-50 cursor-pointer"
            >
              {item.nom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChipList({ chips, onRemove }: { chips: Chip[]; onRemove: (id: string) => void }) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c) => (
        <span key={c._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-800 text-xs rounded-full font-medium">
          {c.nom}
          <button type="button" onClick={() => onRemove(c._id)} className="hover:text-violet-600 ml-0.5">
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

const STATUTS = ["actif", "inactif", "archivé"];

export default function ProduitForm() {
  const { id } = useParams<{ id: string }>();
  const isCreating = !id || id === "nouveau";
  const [, setLocation] = useLocation();
  const { produits, categories, marques, modeles, fournisseurs, refresh } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const categoriesWithPaths = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, nom: getFullPath(c._id, categories) }))
        .sort((a, b) => a.nom.localeCompare(b.nom, "fr")),
    [categories]
  );

  const [saving, setSaving] = useState(false);
  const [loadingRelations, setLoadingRelations] = useState(!isCreating);

  const [form, setForm] = useState({
    nom: "", reference: "", cout: 0, prix: 0, poids: 0,
    quantiteStock: 0, delaiLivraison: 3, slug: "",
    titreSite: "", description: "", descriptionSupplementaire: "",
    metaDescription: "", motsClesMeta: "",
    promotion: false, afficherLaQuantiteDispo: true,
    statutProduit: "actif",
  });
  const [slugEdited, setSlugEdited] = useState(false);

  const [categorie, setCategorie] = useState<Chip | null>(null);
  const [selMarques, setSelMarques] = useState<Chip[]>([]);
  const [selModeles, setSelModeles] = useState<Chip[]>([]);
  const [selComplements, setSelComplements] = useState<Chip[]>([]);
  const [selFournisseurs, setSelFournisseurs] = useState<FournisseurChip[]>([]);
  const [newFournisseur, setNewFournisseur] = useState<{ item: Chip | null; prix_achat: number; reference_fournisseur: string }>({
    item: null, prix_achat: 0, reference_fournisseur: "",
  });

  const [images, setImages] = useState<{ _id?: string; image: string; texte_alternatif: string; ordreAffichage: number }[]>([]);
  const [newImage, setNewImage] = useState({ image: "", texte_alternatif: "", ordreAffichage: 0 });
  const [piecesJointes, setPiecesJointes] = useState<{ _id?: string; nomFichier: string; url: string; type: string; taille: number }[]>([]);
  const [newPiece, setNewPiece] = useState({ nomFichier: "", url: "", type: "", taille: 0 });

  const loadRelations = useCallback(async (produitId: string) => {
    setLoadingRelations(true);
    try {
      const [mq, mo, cp, fo, im, pj] = await Promise.allSettled([
        api.get<any[]>(`/produits/${produitId}/produit-marque`),
        api.get<any[]>(`/produits/${produitId}/produit-modele`),
        api.get<any[]>(`/produits/${produitId}/produits-complementaires`),
        api.get<any[]>(`/produits/${produitId}/produits-fournisseurs`),
        api.get<any[]>(`/produits/${produitId}/images-produits`),
        api.get<any[]>(`/produits/${produitId}/pieces-jointes`),
      ]);
      if (mq.status === "fulfilled") setSelMarques((mq.value ?? []).map((r: any) => ({ linkId: r._id, _id: r.marque?._id ?? r.marque, nom: r.marque?.nom ?? "—" })));
      if (mo.status === "fulfilled") setSelModeles((mo.value ?? []).map((r: any) => ({ linkId: r._id, _id: r.modele?._id ?? r.modele, nom: r.modele?.nom ?? "—" })));
      if (cp.status === "fulfilled") setSelComplements((cp.value ?? []).map((r: any) => ({ linkId: r._id, _id: r.produitComplementaireId?._id ?? r.produitComplementaireId, nom: r.produitComplementaireId?.nom ?? "—" })));
      if (fo.status === "fulfilled") setSelFournisseurs((fo.value ?? []).map((r: any) => ({ linkId: r._id, _id: r.fournisseur?._id ?? r.fournisseur, nom: r.fournisseur?.nom ?? "—", prix_achat: r.prix_achat ?? 0, reference_fournisseur: r.reference_fournisseur ?? "" })));
      if (im.status === "fulfilled") setImages((im.value ?? []).map((r: any) => ({ _id: r._id, image: r.image, texte_alternatif: r.texte_alternatif ?? "", ordreAffichage: r.ordreAffichage ?? 0 })));
      if (pj.status === "fulfilled") setPiecesJointes((pj.value ?? []).map((r: any) => ({ _id: r._id, nomFichier: r.nomFichier, url: r.url, type: r.type ?? "", taille: r.taille ?? 0 })));
    } finally {
      setLoadingRelations(false);
    }
  }, []);

  useEffect(() => {
    if (!isCreating && id) {
      const p = produits.find((p) => p._id === id);
      if (p) {
        setForm({
          nom: p.nom, reference: p.reference ?? "", cout: p.cout ?? 0, prix: p.prix,
          poids: p.poids ?? 0, quantiteStock: p.quantiteStock ?? 0, delaiLivraison: p.delaiLivraison ?? 3,
          slug: p.slug ?? "", titreSite: p.titreSite ?? "", description: p.description ?? "",
          descriptionSupplementaire: p.descriptionSupplementaire ?? "",
          metaDescription: p.metaDescription ?? "", motsClesMeta: p.motsClesMeta ?? "",
          promotion: p.promotion ?? false, afficherLaQuantiteDispo: p.afficherLaQuantiteDispo ?? true,
          statutProduit: p.statutProduit ?? "actif",
        });
        setSlugEdited(true);
        const cat = categories.find((c) => c._id === p.categorie);
        if (cat) setCategorie({ _id: cat._id, nom: getFullPath(cat._id, categories) });
        loadRelations(id);
      } else if (produits.length > 0) {
        toast({ title: "Erreur", description: "Produit non trouvé", variant: "destructive" });
        setLocation("/produits");
      }
    }
  }, [id, produits, categories, isCreating, loadRelations, setLocation, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : (["cout","prix","poids","quantiteStock","delaiLivraison"].includes(name) ? Number(value) : value) };
      if (name === "nom" && !slugEdited) next.slug = slugify(value);
      return next;
    });
  };

  const syncRelations = async (produitId: string, isNew: boolean) => {
    const tasks: Promise<any>[] = [];
    const post = (url: string, body: any) => api.post(url, body).catch(() => {});
    const del  = (url: string) => api.delete(url).catch(() => {});

    if (isNew) {
      if (categorie) { /* categorie is part of product body */ }
      selMarques.forEach((m) => tasks.push(post("/produit-marque", { produit: produitId, marque: m._id })));
      selModeles.forEach((m) => tasks.push(post("/produit-modele", { produit: produitId, modele: m._id })));
      selComplements.forEach((c) => tasks.push(post("/produits-complementaires", { produitId, produitComplementaireId: c._id })));
      selFournisseurs.forEach((f) => tasks.push(post("/produits-fournisseurs", { produit: produitId, fournisseur: f._id, prix_achat: f.prix_achat, reference_fournisseur: f.reference_fournisseur })));
      images.forEach((img) => tasks.push(post("/images-produits", { id_produit: produitId, image: img.image, texte_alternatif: img.texte_alternatif, ordreAffichage: img.ordreAffichage })));
      piecesJointes.forEach((pj) => tasks.push(post("/pieces-jointes", { id_produit: produitId, nomFichier: pj.nomFichier, url: pj.url, type: pj.type, taille: pj.taille })));
    }
    await Promise.all(tasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { toast({ title: "Erreur", description: "Le nom est obligatoire", variant: "destructive" }); return; }
    if (!form.reference.trim()) { toast({ title: "Erreur", description: "La référence est obligatoire", variant: "destructive" }); return; }
    if (!categorie) { toast({ title: "Erreur", description: "La catégorie est obligatoire", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const body = { ...form, categorie: categorie._id, creePar: user?._id };
      if (isCreating) {
        const res = await api.post<any>("/produits", body);
        const newId = res?.data?._id ?? res?._id;
        if (newId) await syncRelations(newId, true);
        await refresh();
        toast({ title: "Succès", description: "Produit créé" });
        setLocation("/produits");
      } else {
        await api.put(`/produits/${id}`, body);
        await refresh();
        toast({ title: "Succès", description: "Produit mis à jour" });
        setLocation("/produits");
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err?.message ?? "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingRelations) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 size={22} className="animate-spin mr-2" /> Chargement…
      </div>
    );
  }

  const FS = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <fieldset className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <legend className="text-sm font-semibold text-violet-700 uppercase tracking-wide px-1 -mt-8 mb-2 bg-white">{title}</legend>
      {children}
    </fieldset>
  );

  const Row = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => setLocation("/produits")} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600" data-testid="button-back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{isCreating ? "Nouveau produit" : (form.nom || "Modifier le produit")}</h1>
          {!isCreating && form.reference && <p className="text-sm text-gray-500 mt-0.5">Réf. {form.reference}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── INFOS GÉNÉRALES ─── */}
        <FS title="Infos générales">
          <Row>
            <Field label="Nom" required>
              <input name="nom" value={form.nom} onChange={handleChange} className={inp} required data-testid="input-nom" />
            </Field>
            <Field label="Référence" required>
              <input name="reference" value={form.reference} onChange={handleChange} className={inp} required data-testid="input-reference" />
            </Field>
          </Row>
          <Row>
            <Field label="Prix de vente (DT)" required>
              <input type="number" name="prix" value={form.prix} onChange={handleChange} min={0} step="0.01" className={inp} data-testid="input-prix" />
            </Field>
            <Field label="Coût (DT)">
              <input type="number" name="cout" value={form.cout} onChange={handleChange} min={0} step="0.01" className={inp} data-testid="input-cout" />
            </Field>
          </Row>
          <Row>
            <Field label="Poids (kg)">
              <input type="number" name="poids" value={form.poids} onChange={handleChange} min={0} step="0.01" className={inp} />
            </Field>
            <Field label="Quantité en stock">
              <input type="number" name="quantiteStock" value={form.quantiteStock} onChange={handleChange} min={0} className={inp} />
            </Field>
          </Row>
          <Row>
            <Field label="Délai de livraison (jours)">
              <input type="number" name="delaiLivraison" value={form.delaiLivraison} onChange={handleChange} min={0} className={inp} />
            </Field>
            <Field label="Slug">
              <input name="slug" value={form.slug} onChange={(e) => { setSlugEdited(true); handleChange(e); }} className={inp} data-testid="input-slug" />
            </Field>
          </Row>
          <Row>
            <Field label="Statut">
              <select name="statutProduit" value={form.statutProduit} onChange={handleChange} className={inp}>
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Options">
              <div className="flex flex-col gap-2 pt-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="promotion" checked={form.promotion} onChange={handleChange} className="accent-violet-600" />
                  En promotion
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="afficherLaQuantiteDispo" checked={form.afficherLaQuantiteDispo} onChange={handleChange} className="accent-violet-600" />
                  Afficher la quantité disponible
                </label>
              </div>
            </Field>
          </Row>
          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} className={ta} />
          </Field>
          <Field label="Description supplémentaire">
            <textarea name="descriptionSupplementaire" value={form.descriptionSupplementaire} onChange={handleChange} className={ta} />
          </Field>

          {/* Catégorie autocomplete */}
          <Field label="Catégorie" required>
            {categorie ? (
              <div className="flex items-center gap-2">
                <span
                  title={categorie.nom}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-800 text-sm rounded-full font-medium max-w-full"
                >
                  <span className="truncate max-w-xs">{categorie.nom}</span>
                  <button type="button" onClick={() => setCategorie(null)}><X size={13} /></button>
                </span>
              </div>
            ) : (
              <Autocomplete
                items={categoriesWithPaths}
                excluded={[]}
                placeholder="Rechercher une catégorie…"
                onSelect={(c) => setCategorie({ _id: c._id, nom: c.nom })}
                testId="input-categorie"
              />
            )}
          </Field>

          {/* Marques autocomplete */}
          <Field label="Marques">
            <Autocomplete
              items={marques}
              excluded={selMarques.map((m) => m._id)}
              placeholder="Rechercher une marque…"
              onSelect={(m) => setSelMarques((prev) => [...prev, { _id: m._id, nom: m.nom }])}
              testId="input-marque"
            />
            <ChipList chips={selMarques} onRemove={(id) => setSelMarques((p) => p.filter((m) => m._id !== id))} />
          </Field>

          {/* Modèles autocomplete */}
          <Field label="Modèles">
            <Autocomplete
              items={modeles}
              excluded={selModeles.map((m) => m._id)}
              placeholder="Rechercher un modèle…"
              onSelect={(m) => setSelModeles((prev) => [...prev, { _id: m._id, nom: m.nom }])}
              testId="input-modele"
            />
            <ChipList chips={selModeles} onRemove={(id) => setSelModeles((p) => p.filter((m) => m._id !== id))} />
          </Field>

          {/* Produits complémentaires autocomplete */}
          <Field label="Produits complémentaires">
            <Autocomplete
              items={produits.filter((p) => p._id !== id)}
              excluded={selComplements.map((c) => c._id)}
              placeholder="Rechercher un produit complémentaire…"
              onSelect={(p) => setSelComplements((prev) => [...prev, { _id: p._id, nom: p.nom }])}
              testId="input-complementaire"
            />
            <ChipList chips={selComplements} onRemove={(id) => setSelComplements((p) => p.filter((c) => c._id !== id))} />
          </Field>
        </FS>

        {/* ─── SEO ─── */}
        <FS title="SEO & Contenu">
          <Field label="Titre du site">
            <input name="titreSite" value={form.titreSite} onChange={handleChange} className={inp} />
          </Field>
          <Field label="Meta description">
            <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} className={ta} />
          </Field>
          <Field label="Mots clés méta (séparés par des virgules)">
            <input name="motsClesMeta" value={form.motsClesMeta} onChange={handleChange} placeholder="ordinateur, portable, dell…" className={inp} />
          </Field>
        </FS>

        {/* ─── MÉDIA ─── */}
        <FS title="Média">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
            {images.length > 0 && (
              <ul className="space-y-1 mb-3">
                {images.map((img, i) => (
                  <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800 truncate max-w-xs">{img.image}</span>
                    <span className="text-gray-400 mx-2 text-xs">Alt: {img.texte_alternatif || "—"}</span>
                    <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={newImage.image} onChange={(e) => setNewImage((p) => ({ ...p, image: e.target.value }))} placeholder="Nom de fichier (ex: photo.jpg)" className={inp} data-testid="input-image" />
              <input value={newImage.texte_alternatif} onChange={(e) => setNewImage((p) => ({ ...p, texte_alternatif: e.target.value }))} placeholder="Texte alternatif" className={inp} />
              <div className="flex gap-2">
                <input type="number" value={newImage.ordreAffichage} onChange={(e) => setNewImage((p) => ({ ...p, ordreAffichage: Number(e.target.value) }))} placeholder="Ordre" min={0} className={inp} />
                <button type="button" onClick={() => { if (newImage.image.trim()) { setImages((p) => [...p, newImage]); setNewImage({ image: "", texte_alternatif: "", ordreAffichage: 0 }); } }} className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shrink-0" data-testid="btn-add-image">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Pièces jointes</p>
            {piecesJointes.length > 0 && (
              <ul className="space-y-1 mb-3">
                {piecesJointes.map((pj, i) => (
                  <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800 truncate max-w-xs">{pj.nomFichier}</span>
                    <span className="text-gray-400 mx-2 text-xs">{pj.type || "—"}</span>
                    <button type="button" onClick={() => setPiecesJointes((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input value={newPiece.nomFichier} onChange={(e) => setNewPiece((p) => ({ ...p, nomFichier: e.target.value }))} placeholder="Nom du fichier" className={inp} />
              <input value={newPiece.url} onChange={(e) => setNewPiece((p) => ({ ...p, url: e.target.value }))} placeholder="URL / chemin" className={inp} />
              <input value={newPiece.type} onChange={(e) => setNewPiece((p) => ({ ...p, type: e.target.value }))} placeholder="Type (pdf, doc…)" className={inp} />
              <div className="flex gap-2">
                <input type="number" value={newPiece.taille} onChange={(e) => setNewPiece((p) => ({ ...p, taille: Number(e.target.value) }))} placeholder="Taille (ko)" min={0} className={inp} />
                <button type="button" onClick={() => { if (newPiece.nomFichier.trim()) { setPiecesJointes((p) => [...p, newPiece]); setNewPiece({ nomFichier: "", url: "", type: "", taille: 0 }); } }} className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shrink-0" data-testid="btn-add-piece">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </FS>

        {/* ─── ACHAT ─── */}
        <FS title="Achat — Fournisseurs">
          {selFournisseurs.length > 0 && (
            <ul className="space-y-2 mb-2">
              {selFournisseurs.map((f, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                  <span className="font-semibold text-gray-800 w-40 truncate">{f.nom}</span>
                  <span className="text-gray-500 text-xs">Réf: <strong>{f.reference_fournisseur || "—"}</strong></span>
                  <span className="text-gray-500 text-xs">Prix achat: <strong>{f.prix_achat.toLocaleString("fr-TN")} DT</strong></span>
                  <button type="button" onClick={() => setSelFournisseurs((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 ml-2">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fournisseur</label>
              {newFournisseur.item ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-violet-100 text-violet-800 text-sm rounded-full">
                    {newFournisseur.item.nom}
                    <button type="button" onClick={() => setNewFournisseur((p) => ({ ...p, item: null }))}><X size={11} /></button>
                  </span>
                </div>
              ) : (
                <Autocomplete
                  items={fournisseurs}
                  excluded={selFournisseurs.map((f) => f._id)}
                  placeholder="Rechercher un fournisseur…"
                  onSelect={(f) => setNewFournisseur((p) => ({ ...p, item: { _id: f._id, nom: f.nom } }))}
                  testId="input-fournisseur"
                />
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Réf. fournisseur</label>
              <input value={newFournisseur.reference_fournisseur} onChange={(e) => setNewFournisseur((p) => ({ ...p, reference_fournisseur: e.target.value }))} placeholder="Référence chez le fournisseur" className={inp} data-testid="input-ref-fournisseur" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prix d'achat (DT)</label>
              <div className="flex gap-2">
                <input type="number" value={newFournisseur.prix_achat} onChange={(e) => setNewFournisseur((p) => ({ ...p, prix_achat: Number(e.target.value) }))} min={0} step="0.01" className={inp} data-testid="input-prix-achat" />
                <button
                  type="button"
                  disabled={!newFournisseur.item}
                  onClick={() => {
                    if (!newFournisseur.item) return;
                    setSelFournisseurs((p) => [...p, { ...newFournisseur.item!, prix_achat: newFournisseur.prix_achat, reference_fournisseur: newFournisseur.reference_fournisseur }]);
                    setNewFournisseur({ item: null, prix_achat: 0, reference_fournisseur: "" });
                  }}
                  className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 shrink-0"
                  data-testid="btn-add-fournisseur"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </FS>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => setLocation("/produits")} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" data-testid="button-cancel">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-lg transition-colors" data-testid="button-submit">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Enregistrement…" : isCreating ? "Créer le produit" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  );
}
