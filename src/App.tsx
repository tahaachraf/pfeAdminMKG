import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProduitsList from "@/pages/produits/index";
import ProduitForm from "@/pages/produits/form";
import CategoriesList from "@/pages/categories/index";
import CategoryForm from "@/pages/categories/form";
import MarquesList from "@/pages/marques/index";
import MarqueForm from "@/pages/marques/form";
import ModelesList from "@/pages/modeles/index";
import ModeleForm from "@/pages/modeles/form";
import FournisseursList from "@/pages/fournisseurs/index";
import DevisList from "@/pages/devis/index";
import DevisDetail from "@/pages/devis/detail";
import CommandesList from "@/pages/commandes/index";
import CommandeDetail from "@/pages/commandes/detail";
import UtilisateursList from "@/pages/utilisateurs/index";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/produits/nouveau" component={ProduitForm} />
            <Route path="/produits/:id" component={ProduitForm} />
            <Route path="/produits" component={ProduitsList} />
            <Route path="/categories/nouvelle" component={CategoryForm} />
            <Route path="/categories/:id" component={CategoryForm} />
            <Route path="/categories" component={CategoriesList} />
            <Route path="/marques/nouvelle" component={MarqueForm} />
            <Route path="/marques/:id" component={MarqueForm} />
            <Route path="/marques" component={MarquesList} />
            <Route path="/modeles/nouveau" component={ModeleForm} />
            <Route path="/modeles/:id" component={ModeleForm} />
            <Route path="/modeles" component={ModelesList} />
            <Route path="/fournisseurs" component={FournisseursList} />
            <Route path="/devis/:id" component={DevisDetail} />
            <Route path="/devis" component={DevisList} />
            <Route path="/commandes/:id" component={CommandeDetail} />
            <Route path="/commandes" component={CommandesList} />
            <Route path="/utilisateurs" component={UtilisateursList} />

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
