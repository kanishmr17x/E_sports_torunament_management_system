import api from "./axiosConfig";

/* ================= AUTH ================= */

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const getProfile = () =>
  api.get("/auth/me");

/* ================= TOURNAMENTS ================= */

export const getTournaments = (params = {}) =>
  api.get("/tournaments", { params });

export const getTournamentById = (id) =>
  api.get(`/tournaments/${id}`);

export const createTournament = (data) =>
  api.post("/tournaments", data);

export const updateTournament = (id, data) =>
  api.put(`/tournaments/${id}`, data);

export const deleteTournament = (id) =>
  api.delete(`/tournaments/${id}`);

export const getOpenRegistrations = () =>
  api.get("/tournaments/open-registrations");

/* ================= TEAMS ================= */

export const getTeams = () =>
  api.get("/teams");

export const getMyTeams = () =>
  api.get("/teams/my-teams");

export const getTeamById = (id) =>
  api.get(`/teams/${id}`);

export const createTeam = (data) =>
  api.post("/teams", data);

export const updateTeam = (id, data) =>
  api.put(`/teams/${id}`, data);

export const deleteTeam = (id) =>
  api.delete(`/teams/${id}`);

/* ================= REGISTRATIONS ================= */

export const registerTeam = (data) =>
  api.post("/registrations/team", data);

export const getMyRegistrations = () =>
  api.get("/registrations/my-registrations");

export const getRegistrationById = (id) =>
  api.get(`/registrations/my-registrations/${id}`);

export const cancelRegistration = (id) =>
  api.delete(`/registrations/my-registrations/${id}`);

/* ================= PLAYERS ================= */

export const getPlayers = () =>
  api.get("/players");

export const getPlayerById = (id) =>
  api.get(`/players/${id}`);

export const getPlayersByTeam = (teamId) =>
  api.get(`/players/team/${teamId}`);

export const addPlayer = (data) =>
  api.post("/players/add", data);

export const deletePlayer = (id) =>
  api.delete(`/players/${id}`);

/* ================= MATCHES ================= */

export const getMatches = (params = {}) =>
  api.get("/matches", { params });

export const getMatchById = (id) =>
  api.get(`/matches/${id}`);

export const createMatch = (data) =>
  api.post("/matches", data);

export const updateMatch = (id, data) =>
  api.put(`/matches/${id}`, data);

export const enterMatchResult = (id, data) =>
  api.put(`/matches/${id}/result`, data);

export const deleteMatch = (id) =>
  api.delete(`/matches/${id}`);

export const getMatchesByTournament = (tournamentId) =>
  api.get(`/matches/tournament/${tournamentId}`);

export const getUpcomingMatches = () =>
  api.get("/matches/upcoming");

export const getCompletedMatches = (params = {}) =>
  api.get("/matches/completed", { params });

/* ================= PAYMENTS ================= */

export const initiatePayment = (data) =>
  api.post("/payments/initiate", data);

export const processPayment = (paymentId, data) =>
  api.post(`/payments/${paymentId}/process`, data);

export const getPaymentById = (id) =>
  api.get(`/payments/${id}`);

export const getMyPayments = () =>
  api.get("/payments/my-payments");

export const getAllPayments = (params = {}) =>
  api.get("/payments", { params });

export const getPaymentStats = (params = {}) =>
  api.get("/payments/stats", { params });

export const refundPayment = (id, data) =>
  api.post(`/payments/${id}/refund`, data);

/* ================= NOTIFICATIONS ================= */

export const getNotifications = (params = {}) =>
  api.get("/notifications", { params });

export const getUnreadCount = () =>
  api.get("/notifications/unread-count");

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put("/notifications/read-all");

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

/* ================= LEADERBOARD ================= */

export const getLeaderboard = (tournamentId) =>
  api.get("/leaderboard", { params: { tournamentId } });

export const getAllLeaderboards = () =>
  api.get("/leaderboard/all");

/* ================= ADMIN ================= */

export const getAdminUsers = (params = {}) =>
  api.get("/admin/users", { params });

export const getAdminUserById = (id) =>
  api.get(`/admin/users/${id}`);

export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });

export const deactivateUser = (id) =>
  api.put(`/admin/users/${id}/deactivate`);

export const activateUser = (id) =>
  api.put(`/admin/users/${id}/activate`);

export const getUserStats = () =>
  api.get("/admin/users/stats");

export const getAdminRegistrations = (params = {}) =>
  api.get("/admin/registrations", { params });

export const getAdminRegistrationById = (id) =>
  api.get(`/admin/registrations/${id}`);

export const approveRegistration = (id) =>
  api.post(`/admin/registrations/${id}/approve`);

export const rejectRegistration = (id, reason) =>
  api.post(`/admin/registrations/${id}/reject`, { reason });

export const getRegistrationStats = (params = {}) =>
  api.get("/admin/registrations/stats", { params });

/* ================= CONTACT ================= */

export const sendContactMessage = (data) =>
  api.post("/contact", data);
