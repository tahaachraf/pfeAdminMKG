import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Génère un numéro de commande stable basé sur l'_id (ObjectID MongoDB = trié chronologiquement).
 * Exemple : CMD-2026-001
 */
export function generateNumeroCommande(
  orders: { _id: string }[],
  orderId: string
): string {
  const sorted = [...orders].sort((a, b) => a._id.localeCompare(b._id));
  const index = sorted.findIndex((o) => o._id === orderId);
  if (index === -1) return `CMD-${orderId.slice(-6).toUpperCase()}`;
  const year = new Date().getFullYear();
  const seq = String(index + 1).padStart(3, "0");
  return `CMD-${year}-${seq}`;
}

/**
 * Génère un numéro de devis stable basé sur l'_id (ObjectID MongoDB = trié chronologiquement).
 * Exemple : DEV-2026-001
 */
export function generateNumeroDevis(
  devis: { _id: string }[],
  devisId: string
): string {
  const sorted = [...devis].sort((a, b) => a._id.localeCompare(b._id));
  const index = sorted.findIndex((d) => d._id === devisId);
  if (index === -1) return `DEV-${devisId.slice(-6).toUpperCase()}`;
  const year = new Date().getFullYear();
  const seq = String(index + 1).padStart(3, "0");
  return `DEV-${year}-${seq}`;
}
