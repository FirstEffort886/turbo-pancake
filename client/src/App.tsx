import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Games from "@/pages/games";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTransactions from "@/pages/admin/transactions";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import { User } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        // User is not logged in or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex flex-col min-h-screen">
          <Header user={user} setUser={setUser} />
          <main className="container mx-auto px-4 pt-20 pb-24 flex-grow">
            {!loading && (
              <Switch>
                <Route path="/" component={() => <Home user={user} />} />
                <Route path="/games" component={() => <Games user={user} />} />
                <Route path="/leaderboard" component={Leaderboard} />
                <Route path="/profile" component={() => (
                  user ? <Profile user={user} setUser={setUser} /> : <NotFound />
                )} />
                <Route path="/admin" component={() => (
                  user && user.isAdmin ? <AdminDashboard user={user} /> : <NotFound />
                )} />
                <Route path="/admin/users" component={() => (
                  user && user.isAdmin ? <AdminUsers user={user} /> : <NotFound />
                )} />
                <Route path="/admin/transactions" component={() => (
                  user && user.isAdmin ? <AdminTransactions user={user} /> : <NotFound />
                )} />
                <Route component={NotFound} />
              </Switch>
            )}
          </main>
          <MobileNav user={user} />
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
