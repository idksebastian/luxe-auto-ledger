import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import ProductRegistration from "./pages/ProductRegistration";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import DailySummary from "./pages/DailySummary";
import MonthlySummary from "./pages/MonthlySummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/productos" element={<ProductRegistration />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/gastos" element={<Expenses />} />
            <Route path="/inventario" element={<Inventory />} />
            <Route path="/resumen-diario" element={<DailySummary />} />
            <Route path="/resumen-mensual" element={<MonthlySummary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
