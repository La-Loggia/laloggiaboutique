import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/contexts/AdminContext";
import { ViewedProductsProvider } from "@/contexts/ViewedProductsContext";
import Index from "./pages/Index";
import LatestProducts from "./pages/LatestProducts";
import BrandPage from "./pages/BrandPage";
import Bolsos from "./pages/Bolsos";
import BolsosBrandPage from "./pages/BolsosBrandPage";
import Plumiferos from "./pages/Plumiferos";
import Camisetas from "./pages/Camisetas";
import EspacioJeans from "./pages/EspacioJeans";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <ViewedProductsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/novedades" element={<LatestProducts />} />
              <Route path="/marca/:brandSlug" element={<BrandPage />} />
              <Route path="/bolsos" element={<Bolsos />} />
              <Route path="/bolsos/:brandSlug" element={<BolsosBrandPage />} />
              <Route path="/plumiferos" element={<Plumiferos />} />
              <Route path="/camisetas" element={<Camisetas />} />
              <Route path="/espacio-jeans" element={<EspacioJeans />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ViewedProductsProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
