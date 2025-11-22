import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Riders from "./pages/Riders";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/orders" component={() => <DashboardLayout><Orders /></DashboardLayout>} />
      <Route path="/users" component={() => <DashboardLayout><Users /></DashboardLayout>} />
      <Route path="/riders" component={() => <DashboardLayout><Riders /></DashboardLayout>} />
      <Route path="/products" component={() => <DashboardLayout><Products /></DashboardLayout>} />
      <Route path="/analytics" component={() => <DashboardLayout><Analytics /></DashboardLayout>} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

