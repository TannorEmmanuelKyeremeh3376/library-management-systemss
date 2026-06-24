import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Borrowing from "./pages/Borrowing";
import Analytics from "./pages/Analytics";
import HowItWasMade from "./pages/HowItWasMade";
import BookDetail from "./pages/BookDetail";
import MemberDetail from "./pages/MemberDetail";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/books">
        {() => (
          <DashboardLayout>
            <Books />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/books/:id">
        {() => (
          <DashboardLayout>
            <BookDetail />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/members">
        {() => (
          <DashboardLayout>
            <Members />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/members/:id">
        {() => (
          <DashboardLayout>
            <MemberDetail />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/borrowing">
        {() => (
          <DashboardLayout>
            <Borrowing />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/analytics">
        {() => (
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/how-it-was-made">
        {() => (
          <DashboardLayout>
            <HowItWasMade />
          </DashboardLayout>
        )}
      </Route>
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
