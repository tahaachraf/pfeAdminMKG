import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

export interface Produit {
  _id: string;
  reference?: string;
  nom: string;
  slug?: string;
  cout?: number;
  prix: number;
  poids?: number;
  quantiteStock?: number;
  delaiLivraison?: number;
  titreSite?: string;
  description?: string;
  descriptionSupplementaire?: string;
  metaDescription?: string;
  motsClesMeta?: string;
  promotion?: boolean;
  afficherLaQuantiteDispo?: boolean;
  statutProduit?: string;
  categorie?: string;
  creePar?: string;
}

export interface Categorie {
  _id: string;
  nom: string;
  slug?: string;
  description?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categorieParent: string | null;
}

export interface Marque {
  _id: string;
  nom: string;
  slug?: string;
  dateCreation?: string;
}

export interface Modele {
  _id: string;
  nom: string;
  slug?: string;
  idMarque: string;
  dateCreation?: string;
}

export interface Fournisseur {
  _id: string;
  nom: string;
  email?: string;
  telephone?: string;
}

export interface Devis {
  _id: string;
  nomClient: string;
  total: number;
  dateDevis: string;
}

export interface Commande {
  _id: string;
  nomClient: string;
  statut: string;
  total: number;
  dateCommande: string;
}

function extractNom(clientId: any): string {
  if (!clientId) return "—";
  if (typeof clientId === "object") {
    const parts = [clientId.nom, clientId.prenom].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : clientId.email ?? "—";
  }
  return "—";
}

function normalizeCategorieParent(val: any): string | null {
  if (!val) return null;
  if (typeof val === "object") return val._id ?? null;
  return val;
}

function normalizeIdMarque(val: any): string {
  if (!val) return "";
  if (typeof val === "object") return val._id ?? "";
  return val;
}

interface DataContextType {
  produits: Produit[];
  categories: Categorie[];
  categoriesLoading: boolean;
  refreshCategories: () => Promise<void>;
  marques: Marque[];
  marquesLoading: boolean;
  refreshMarques: () => Promise<void>;
  modeles: Modele[];
  modelesLoading: boolean;
  refreshModeles: () => Promise<void>;
  fournisseurs: Fournisseur[];
  devis: Devis[];
  commandes: Commande[];
  loading: boolean;
  refresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [marquesLoading, setMarquesLoading] = useState(false);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [modelesLoading, setModelesLoading] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await api.get<any[]>("/categories");
      setCategories(
        (data ?? []).map((item) => ({
          ...item,
          categorieParent: normalizeCategorieParent(item.categorieParent),
        }))
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  const refreshMarques = async () => {
    setMarquesLoading(true);
    try {
      const data = await api.get<any[]>("/marques");
      setMarques(data ?? []);
    } finally {
      setMarquesLoading(false);
    }
  };

  const refreshModeles = async () => {
    setModelesLoading(true);
    try {
      const data = await api.get<any[]>("/models");
      setModeles(
        (data ?? []).map((item) => ({
          ...item,
          idMarque: normalizeIdMarque(item.marque ?? item.idMarque),
        }))
      );
    } finally {
      setModelesLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c, m, mo, f, cmd, cp] = await Promise.allSettled([
        api.get<any[]>("/produits"),
        api.get<any[]>("/categories"),
        api.get<any[]>("/marques"),
        api.get<any[]>("/models"),
        api.get<any[]>("/fournisseurs"),
        api.get<any[]>("/commandes"),
        api.get<any[]>("/commande-produits"),
      ]);
      if (p.status === "fulfilled") {
        setProduits(
          (p.value ?? []).map((item) => ({
            ...item,
            categorie:
              item.categorie && typeof item.categorie === "object"
                ? item.categorie._id ?? ""
                : item.categorie ?? "",
          }))
        );
      }
      if (c.status === "fulfilled") {
        setCategories(
          (c.value ?? []).map((item) => ({
            ...item,
            categorieParent: normalizeCategorieParent(item.categorieParent),
          }))
        );
      }
      if (m.status === "fulfilled") setMarques(m.value ?? []);
      if (mo.status === "fulfilled") {
        setModeles(
          (mo.value ?? []).map((item) => ({
            ...item,
            idMarque: normalizeIdMarque(item.marque ?? item.idMarque),
          }))
        );
      }
      if (f.status === "fulfilled") setFournisseurs(f.value ?? []);
      if (cmd.status === "fulfilled") {
        const all = cmd.value ?? [];
        const allLignes: any[] = cp.status === "fulfilled" ? (cp.value ?? []) : [];
        const commandesAvecProduits = new Set(
          allLignes.map((l) =>
            l.id_commande && typeof l.id_commande === "object"
              ? l.id_commande._id
              : l.id_commande
          )
        );
        setDevis(
          all
            .filter((item) => item.statut === "En attente" && commandesAvecProduits.has(item._id))
            .map((item) => ({
              _id: item._id,
              nomClient: extractNom(item.clientId),
              total: item.total ?? 0,
              dateDevis: item.dateCommande
                ? new Date(item.dateCommande).toLocaleDateString("fr-TN")
                : "—",
            }))
        );
        setCommandes(
          all
            .filter((item) => item.statut !== "En attente")
            .map((item) => ({
              _id: item._id,
              nomClient: extractNom(item.clientId),
              statut: item.statut ?? "—",
              total: item.total ?? 0,
              dateCommande: item.dateCommande
                ? new Date(item.dateCommande).toLocaleDateString("fr-TN")
                : "—",
            }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <DataContext.Provider value={{
      produits,
      categories, categoriesLoading, refreshCategories,
      marques, marquesLoading, refreshMarques,
      modeles, modelesLoading, refreshModeles,
      fournisseurs, devis, commandes, loading, refresh: fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
