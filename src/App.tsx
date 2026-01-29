import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Reservas from "./pages/Reservas";
import Hospedes from "./pages/Hospedes";
import NovoHospede from "./pages/NovoHospede";
import NovaReserva from "./pages/NovaReserva";
import Importar from "./pages/Importar";
import Documentos from "./pages/Documentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/reservas/:id" element={<Reservas />} />
            <Route path="/reservas/nova" element={<NovaReserva />} />
            <Route path="/hospedes" element={<Hospedes />} />
            <Route path="/hospedes/novo" element={<NovoHospede />} />
            <Route path="/importar" element={<Importar />} />
            <Route path="/documentos" element={<Documentos />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
