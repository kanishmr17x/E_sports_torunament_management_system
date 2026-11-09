/**
 * Indian Esports Ecosystem Metadata & Localization Constants
 * Reference cities, popular titles, and realistic regional esports presets.
 */

export const INDIAN_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi"
];

export const POPULAR_INDIAN_GAMES = [
  { id: "BGMI", name: "BGMI", fullName: "Battlegrounds Mobile India", icon: "🔫", tag: "Battle Royale" },
  { id: "Free Fire", name: "Free Fire", fullName: "Free Fire India", icon: "🔥", tag: "Survival Shooter" },
  { id: "Valorant", name: "Valorant", fullName: "Valorant India", icon: "🛡️", tag: "Tactical FPS" },
  { id: "CS2", name: "Counter-Strike 2", fullName: "Counter-Strike 2", icon: "💣", tag: "Competitive FPS" },
  { id: "COD", name: "COD: Mobile", fullName: "Call of Duty: Mobile", icon: "⚔️", tag: "Arena FPS" },
  { id: "Pokemon UNITE", name: "Pokemon UNITE", fullName: "Pokemon UNITE India", icon: "⚡", tag: "MOBA" },
];

export const REGIONAL_TOURNAMENT_PRESETS = [
  {
    name: "BGMI All-India Battlegrounds Invitational 2026",
    game: "BGMI",
    prizePool: 1000000, // ₹10,00,000 (10 Lakhs)
    entryFee: 500,
    city: "Mumbai",
  },
  {
    name: "Valorant South Asia Masters Cup 2026",
    game: "Valorant",
    prizePool: 500000, // ₹5,00,000 (5 Lakhs)
    entryFee: 250,
    city: "Bengaluru",
  },
  {
    name: "Free Fire India Clash Championship 2026",
    game: "Free Fire",
    prizePool: 300000, // ₹3,00,000 (3 Lakhs)
    entryFee: 0,
    city: "Chennai",
  },
  {
    name: "Delhi National CS2 Cyber Showdown",
    game: "CS2",
    prizePool: 250000, // ₹2,50,000 (2.5 Lakhs)
    entryFee: 200,
    city: "Delhi NCR",
  }
];

export const INDIAN_SAMPLE_TEAMS = [
  { name: "Bengaluru Titans", game: "Valorant", city: "Bengaluru" },
  { name: "Mumbai Cyber Strikers", game: "BGMI", city: "Mumbai" },
  { name: "Chennai Vipers", game: "Free Fire", city: "Chennai" },
  { name: "Delhi Immortals", game: "CS2", city: "Delhi NCR" },
  { name: "Hyderabad Falcons", game: "BGMI", city: "Hyderabad" },
  { name: "Pune Phoenix Esports", game: "Valorant", city: "Pune" },
  { name: "Kolkata Knights Arena", game: "BGMI", city: "Kolkata" }
];
