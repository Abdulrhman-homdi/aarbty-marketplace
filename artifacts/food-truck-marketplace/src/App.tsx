import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProtectedRoute } from "@/components/protected-route";

import Home from "@/pages/home";
import TrucksList from "@/pages/trucks/index";
import TruckDetail from "@/pages/trucks/[id]";
import ListTruck from "@/pages/list-truck";
import Dashboard from "@/pages/dashboard/index";
import Wallet from "@/pages/wallet/index";
import ContractsList from "@/pages/contracts/index";
import ContractDetail from "@/pages/contracts/[id]";
import InquiryForm from "@/pages/inquiry/[id]";
import ProviderDashboard from "@/pages/provider/index";
import MyAccount from "@/pages/my-account/index";
import AdminDashboard from "@/pages/admin/index";
import EditTruck from "@/pages/edit-truck";
import ManufacturePage from "@/pages/manufacture/index";
import ManufacturingOrderDetail from "@/pages/manufacture/[id]";
import LoginPage from "@/pages/login";
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
          <Route path="/list-truck">
            <ProtectedRoute requiredRole="provider">
              <ListTruck />
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/wallet">
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          </Route>
          <Route path="/contracts">
            <ProtectedRoute>
              <ContractsList />
            </ProtectedRoute>
          </Route>
          <Route path="/contracts/:id">
            <ProtectedRoute>
              <ContractDetail />
            </ProtectedRoute>
          </Route>
          <Route path="/inquiry/:id" component={InquiryForm} />
          <Route path="/manufacture" component={ManufacturePage} />
          <Route path="/manufacture/:id" component={ManufacturingOrderDetail} />
          <Route path="/login" component={LoginPage} />
          <Route path="/edit-truck/:id">
            <ProtectedRoute requiredRole="provider">
              <EditTruck />
            </ProtectedRoute>
          </Route>
          <Route path="/provider">
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/my-account">
            <ProtectedRoute requiredRole="customer">
              <MyAccount />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
