import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";

import Home from "@/pages/home";
import TrucksList from "@/pages/trucks/index";
import TruckDetail from "@/pages/trucks/[id]";
import ListTruck from "@/pages/list-truck";
import Dashboard from "@/pages/dashboard/index";
import Wallet from "@/pages/wallet/index";
import ContractsList from "@/pages/contracts/index";
import ContractDetail from "@/pages/contracts/[id]";
import InquiryForm from "@/pages/inquiry/[id]";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/trucks" component={TrucksList} />
          <Route path="/trucks/:id" component={TruckDetail} />
          <Route path="/list-truck" component={ListTruck} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/contracts" component={ContractsList} />
          <Route path="/contracts/:id" component={ContractDetail} />
          <Route path="/inquiry/:id" component={InquiryForm} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;