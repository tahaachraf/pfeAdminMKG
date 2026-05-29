import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Home, Box, FolderTree, Tag, Layers, Truck, FileText, ShoppingCart, Users, LogOut, Megaphone } from "lucide-react";

const navItems = [
  { href: "/", label: "Tableau de bord", icon: Home },
  { href: "/produits", label: "Produits", icon: Box },
  { href: "/categories", label: "Catégories", icon: FolderTree },
  { href: "/marques", label: "Marques", icon: Tag },
  { href: "/modeles", label: "Modèles", icon: Layers },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/utilisateurs", label: "Utilisateurs", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar text-sidebar-foreground shrink-0">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Megaphone size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-white">AdminMarketing</p>
            <p className="text-xs text-white/60 mt-0.5">Gestion marketing</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-sidebar-accent text-white"
                : "text-white/75 hover:bg-sidebar-accent/60 hover:text-white"
            }`}
            data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-sidebar-accent/60 hover:text-white transition-colors"
          data-testid="button-logout"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
