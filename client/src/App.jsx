import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import TournamentList from "./pages/Tournaments/TournamentList";
import TournamentDetails from "./pages/Tournaments/TournamentDetails";
import TeamList from "./pages/Teams/TeamList";
import TeamDetails from "./pages/Teams/TeamDetails";
import PlayerList from "./pages/Players/PlayerList";
import PlayerDetails from "./pages/Players/PlayerDetails";
import AuthProvider from "./context/AuthProvider";
import Contact from "./pages/Contact/Contact";
import RegisterTeam from "./pages/Registrations/RegisterTeam";
import Register from "./pages/Register/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTournaments from "./pages/Admin/AdminTournaments";
import AdminTeams from "./pages/Admin/AdminTeams";
import AdminMatches from "./pages/Admin/AdminMatches";
import Unauthorized from "./pages/Unauthorized";
import UserList from "./pages/Users/UserList";
import Reports from "./pages/Reports/Reports";

// Global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
});

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <div className="page-root">
          {/* Global page background video + overlay (fixed behind entire app) */}
          <video className="app-bg-video" autoPlay muted loop playsInline aria-hidden="true">
            <source src="/assets/videos/hero.mp4" type="video/mp4" />
          </video>
          <Navbar />
          <main className="page-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournaments/:id" element={<TournamentDetails />} />
              <Route path="/teams" element={<TeamList />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/players/:id" element={<PlayerDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/register-team" element={<RegisterTeam />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/tournaments" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminTournaments />
              </ProtectedRoute>
            } />
            <Route path="/admin/teams" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminTeams />
              </ProtectedRoute>
            } />
            <Route path="/admin/matches" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminMatches />
              </ProtectedRoute>
            } />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
