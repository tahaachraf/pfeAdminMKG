export interface Produit {
  _id: string;
  reference: string;
  nom: string;
  slug: string;
  cout: number;
  prix: number;
  stock: number;
  idCategorie: string;
  description: string;
  dateCreation: string;
}

export interface Categorie {
  _id: string;
  nom: string;
  slug: string;
  description: string;
  parentId?: string;
  dateCreation: string;
}

export interface LigneProduit {
  idProduit: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Devis {
  _id: string;
  idClient: string;
  nomClient: string;
  statut: "en_attente" | "accepte" | "refuse";
  total: number;
  lignes: LigneProduit[];
  dateCreation: string;
}

export interface Commande {
  _id: string;
  idClient: string;
  nomClient: string;
  statut: "en_cours" | "livree" | "annulee";
  total: number;
  lignes: LigneProduit[];
  dateCreation: string;
}

export const initialProduits: Produit[] = [
  { _id: "pro001", reference: "PRD-0001", nom: "Dell XPS 13",           slug: "dell-xps-13",           cout: 2600, prix: 3200, stock: 12, idCategorie: "cat-ht-ord",  description: "Ultrabook 13 pouces Intel Core i7", dateCreation: "2026-02-01" },
  { _id: "pro002", reference: "PRD-0002", nom: "HP 250 G10",            slug: "hp-250-g10",            cout: 1500, prix: 1850, stock: 25, idCategorie: "cat-ht-ord",  description: "PC portable 15 pouces Intel Core i5", dateCreation: "2026-02-01" },
  { _id: "pro003", reference: "PRD-0003", nom: "Logitech MX Master 3",  slug: "logitech-mx-master-3",  cout: 200,  prix: 280,  stock: 50, idCategorie: "cat-ht-acc",  description: "Souris sans fil premium", dateCreation: "2026-02-05" },
  { _id: "pro004", reference: "PRD-0004", nom: "Logitech M185",         slug: "logitech-m185",         cout: 30,   prix: 45,   stock: 120, idCategorie: "cat-ht-acc", description: "Souris sans fil compacte", dateCreation: "2026-02-05" },
  { _id: "pro005", reference: "PRD-0005", nom: "Samsung Galaxy S24",    slug: "samsung-galaxy-s24",    cout: 2300, prix: 2900, stock: 18, idCategorie: "cat-ht-smar", description: "Smartphone Android haut de gamme", dateCreation: "2026-02-10" },
  { _id: "pro006", reference: "PRD-0006", nom: "Samsung Galaxy A24",    slug: "samsung-galaxy-a24",    cout: 650,  prix: 850,  stock: 35, idCategorie: "cat-ht-smar", description: "Smartphone Android milieu de gamme", dateCreation: "2026-02-10" },
  { _id: "pro007", reference: "PRD-0007", nom: "Clavier Logitech K380", slug: "clavier-logitech-k380", cout: 85,   prix: 120,  stock: 60, idCategorie: "cat-ht-acc",  description: "Clavier bluetooth multi-appareils", dateCreation: "2026-02-15" },
  { _id: "pro008", reference: "PRD-0008", nom: "Routeur TP-Link Archer",slug: "routeur-tp-link-archer",cout: 130,  prix: 180,  stock: 40, idCategorie: "cat-ht",      description: "Routeur Wi-Fi 6 AX1500", dateCreation: "2026-02-15" },
];

export const initialDevis: Devis[] = [
  {
    _id: "dev001", idClient: "cli001", nomClient: "Ahmed Ben Ali", statut: "accepte", total: 5050, dateCreation: "2026-03-01",
    lignes: [
      { idProduit: "pro001", quantite: 1, prixUnitaire: 3200 },
      { idProduit: "pro002", quantite: 1, prixUnitaire: 1850 },
    ],
  },
  {
    _id: "dev002", idClient: "cli002", nomClient: "Sonia Trabelsi", statut: "en_attente", total: 1250, dateCreation: "2026-03-05",
    lignes: [
      { idProduit: "pro006", quantite: 1, prixUnitaire: 850 },
      { idProduit: "pro003", quantite: 1, prixUnitaire: 280 },
      { idProduit: "pro007", quantite: 1, prixUnitaire: 120 },
    ],
  },
  {
    _id: "dev003", idClient: "cli003", nomClient: "Mohamed Karray", statut: "refuse", total: 555, dateCreation: "2026-03-08",
    lignes: [
      { idProduit: "pro007", quantite: 2, prixUnitaire: 120 },
      { idProduit: "pro008", quantite: 1, prixUnitaire: 180 },
      { idProduit: "pro004", quantite: 3, prixUnitaire: 45 },
    ],
  },
  {
    _id: "dev004", idClient: "cli004", nomClient: "Fatma Jomaa", statut: "en_attente", total: 3230, dateCreation: "2026-03-10",
    lignes: [
      { idProduit: "pro005", quantite: 1, prixUnitaire: 2900 },
      { idProduit: "pro007", quantite: 2, prixUnitaire: 120 },
      { idProduit: "pro004", quantite: 2, prixUnitaire: 45 },
    ],
  },
  {
    _id: "dev005", idClient: "cli001", nomClient: "Ahmed Ben Ali", statut: "accepte", total: 955, dateCreation: "2026-03-15",
    lignes: [
      { idProduit: "pro008", quantite: 3, prixUnitaire: 180 },
      { idProduit: "pro003", quantite: 1, prixUnitaire: 280 },
      { idProduit: "pro004", quantite: 3, prixUnitaire: 45 },
    ],
  },
];

export const initialCommandes: Commande[] = [
  {
    _id: "cmd001", idClient: "cli001", nomClient: "Ahmed Ben Ali", statut: "livree", total: 5050, dateCreation: "2026-03-02",
    lignes: [
      { idProduit: "pro001", quantite: 1, prixUnitaire: 3200 },
      { idProduit: "pro002", quantite: 1, prixUnitaire: 1850 },
    ],
  },
  {
    _id: "cmd002", idClient: "cli005", nomClient: "Walid Chaari", statut: "en_cours", total: 2950, dateCreation: "2026-03-07",
    lignes: [
      { idProduit: "pro002", quantite: 1, prixUnitaire: 1850 },
      { idProduit: "pro008", quantite: 3, prixUnitaire: 180 },
      { idProduit: "pro003", quantite: 2, prixUnitaire: 280 },
    ],
  },
  {
    _id: "cmd003", idClient: "cli002", nomClient: "Sonia Trabelsi", statut: "livree", total: 890, dateCreation: "2026-03-10",
    lignes: [
      { idProduit: "pro003", quantite: 2, prixUnitaire: 280 },
      { idProduit: "pro007", quantite: 2, prixUnitaire: 120 },
      { idProduit: "pro004", quantite: 2, prixUnitaire: 45 },
    ],
  },
  {
    _id: "cmd004", idClient: "cli006", nomClient: "Rania Meddeb", statut: "annulee", total: 300, dateCreation: "2026-03-12",
    lignes: [
      { idProduit: "pro007", quantite: 1, prixUnitaire: 120 },
      { idProduit: "pro004", quantite: 4, prixUnitaire: 45 },
    ],
  },
  {
    _id: "cmd005", idClient: "cli003", nomClient: "Mohamed Karray", statut: "en_cours", total: 1850, dateCreation: "2026-03-18",
    lignes: [
      { idProduit: "pro002", quantite: 1, prixUnitaire: 1850 },
    ],
  },
  {
    _id: "cmd006", idClient: "cli004", nomClient: "Fatma Jomaa", statut: "livree", total: 3480, dateCreation: "2026-03-20",
    lignes: [
      { idProduit: "pro005", quantite: 1, prixUnitaire: 2900 },
      { idProduit: "pro003", quantite: 1, prixUnitaire: 280 },
      { idProduit: "pro007", quantite: 1, prixUnitaire: 120 },
      { idProduit: "pro004", quantite: 4, prixUnitaire: 45 },
    ],
  },
];
