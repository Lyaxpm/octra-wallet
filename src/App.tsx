
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WalletDashboard from "./components/WalletDashboard";
import SendTransaction from "./components/SendTransaction";
import MultiSend from "./components/MultiSend";
import ExportWallet from "./components/ExportWallet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <BrowserRouter>
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<WalletDashboard />} />
              <Route path="/send" element={<SendTransaction />} />
              <Route path="/multi-send" element={<MultiSend />} />
              <Route path="/export" element={<ExportWallet />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
