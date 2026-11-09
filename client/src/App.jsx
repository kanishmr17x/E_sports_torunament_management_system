import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminRegistrations from "./pages/Admin/AdminRegistrations";
import AdminPayments from "./pages/Admin/AdminPayments";
import Unauthorized from "./pages/Unauthorized";
import UserList from "./pages/Users/UserList";
import Reports from "./pages/Reports/Reports";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import TeamManagement from "./pages/TeamManagement/TeamManagement";
import TournamentRegistration from "./pages/TournamentRegistration/TournamentRegistration";
import Payment from "./pages/Payment/Payment";
import Matches from "./pages/Matches/Matches";
import Results from "./pages/Results/Results";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Bracket from "./pages/Bracket/Bracket";
import CustomCursor from "./components/CustomCursor";
import "./styles/components.css";

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
          <CustomCursor />
          {/* Global animated cyber background */}
          <div className="app-bg-cyber" aria-hidden="true">
            <div className="cyber-glow cyber-glow-1"></div>
            <div className="cyber-glow cyber-glow-2"></div>
            <div className="cyber-grid-overlay"></div>
          </div>
          <Navbar />
          <main className="page-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournaments/:id" element={<TournamentDetails />} />
              <Route path="/tournaments/:id/register" element={<TournamentRegistration />} />
              <Route path="/tournaments/:id/bracket" element={<Bracket />} />
              <Route path="/bracket" element={<Bracket />} />
              <Route path="/teams" element={<TeamList />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/players/:id" element={<PlayerDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/register-team" element={<RegisterTeam />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
              <Route path="/dashboard/teams/:id/manage" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
              <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/results" element={<Results />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
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
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/registrations" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                <AdminPayments />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
