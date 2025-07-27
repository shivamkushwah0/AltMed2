import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import MedicationResults from "@/pages/medication-results";
import MedicationDetail from "@/pages/medication-detail";
import Comparison from "@/pages/comparison";
import PharmacyFinder from "@/pages/pharmacy-finder";
import Favorites from "@/pages/favorites";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // In development mode, always show the app as authenticated
  const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  const showApp = isDevelopment || isAuthenticated;

  return (
    <Switch>
      {isLoading && !isDevelopment ? (
        <Route path="*">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </Route>
      ) : !showApp ? (
        <Route path="*" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/results" component={MedicationResults} />
          <Route path="/medication/:id" component={MedicationDetail} />
          <Route path="/compare" component={Comparison} />
          <Route path="/pharmacies" component={PharmacyFinder} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
