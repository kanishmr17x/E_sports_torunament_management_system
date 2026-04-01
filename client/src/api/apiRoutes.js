import api from "./axiosConfig";

/* ================= AUTH ================= */

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const getProfile = () =>
  api.get("/auth/me");

/* ================= TOURNAMENTS ================= */

export const getTournaments = () =>
  api.get("/tournaments");

export const getTournamentById = (id) =>
  api.get(`/tournaments/${id}`);

export const createTournament = (data) =>
  api.post("/tournaments", data);

/* ================= TEAMS ================= */

export const getTeams = () =>
  api.get("/teams");

export const getTeamById = (id) =>
  api.get(`/teams/${id}`);

export const createTeam = (data) =>
  api.post("/teams", data);

/* ================= REGISTRATIONS ================= */

export const registerTeam = (data) =>
  api.post("/registrations/team", data);

/* ================= PLAYERS ================= */

export const getPlayers = () =>
  api.get("/players");

export const getPlayerById = (id) =>
  api.get(`/players/${id}`);

export const getPlayersByTeam = (teamId) =>
  api.get(`/players/team/${teamId}`);

export const addPlayer = (data) =>
  api.post("/players/add", data);

/* ================= CONTACT ================= */

export const sendContactMessage = (data) =>
  api.post("/contact", data);
