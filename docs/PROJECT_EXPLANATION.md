# E-Sports Platform - Code Explanation & Keywords Guide

## 📋 Project Overview
This is a full-stack **MERN application** (MongoDB, Express, React, Node.js) designed as an e-sports tournament management platform. It enables users to organize tournaments, register teams, manage players, and handle registrations.

---

## 🏗️ Architecture Overview

### **Stack Breakdown**
- **Frontend**: React 19 + Vite (Next-gen build tool)
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose ODM
- **Build Tool**: Vite (faster than Webpack)
- **Deployment**: Vercel (Frontend), AWS S3 (Media storage)

### **Folder Structure**
```
esports platform/
├── client/              # React frontend (Vite)
├── server/              # Node.js/Express backend
├── docs/                # Documentation
└── deploy.sh            # Deployment script
```

---

## 🔑 Key Keywords & Concepts Used

### **Backend Keywords**

#### **1. Express.js**
- Lightweight web framework for Node.js
- Used for routing, middleware, and HTTP handling
- Example: `app.use("/api/auth", require("./routes/authRoutes"))`

#### **2. Middleware**
Functions that process requests before reaching route handlers

**Key Middleware in Project:**
- `morgan` - HTTP request logger
- `helmet` - Security headers
- `cors` - Cross-Origin Resource Sharing
- `compression` - Response compression
- `rateLimit` - Throttle requests
- `protect` - JWT verification
- `adminOnly` - Role-based access

#### **3. Mongoose** (ODM - Object Document Mapper)
- Bridges MongoDB and Node.js
- Provides schema validation
- Methods: `findById()`, `create()`, `findOne()`
- Example:
```javascript
const conn = await mongoose.connect(mongoURI, {
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
});
```

#### **4. JWT (JSON Web Token)**
- Authentication token format
- 3 parts: Header.Payload.Signature
- Generated on login, validated on protected routes
- Expires in 7 days in this project
- Example: `jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })`

#### **5. bcryptjs**
- Password hashing library
- Salt rounds: 10 (security level)
- Used in User model pre-save hook
- Compared during login: `bcrypt.compare(enteredPassword, hashedPassword)`

#### **6. Controllers**
Functions that handle business logic for routes
- `authController.js` - Login, register, authentication
- `teamController.js` - Team CRUD operations
- `tournamentController.js` - Tournament management
- `playerController.js` - Player profiles
- `registrationController.js` - Team/Tournament registrations

#### **7. Models** (Mongoose Schemas)
- `User` - Accounts with roles (player, organizer, admin)
- `Team` - Team information and members
- `Player` - Individual player profiles
- `Tournament` - Tournament details
- `Registration` - Team registrations
- `MatchSchedule` - Match scheduling
- `Contact` - Contact form submissions

#### **8. asyncHandler**
Wrapper for async route handlers to catch errors
```javascript
exports.registerUser = asyncHandler(async (req, res) => { ... })
```

#### **9. Environment Variables (.env)**
Secure configuration storage
- `MONGO_URI` - Database connection string
- `JWT_SECRET` - Token signing key
- `PORT` - Server port
- `NODE_ENV` - development/production
- `FRONTEND_URL` - CORS origin

---

### **Frontend Keywords**

#### **1. React Context API**
State management without Redux
- `AuthContext.js` - Stores user authentication state
- `AuthProvider.jsx` - Wraps app with context
- Usage: `useContext(AuthContext)`

#### **2. Axios**
HTTP client for API requests
```javascript
const response = await api.post("/auth/login", { emailOrUsername, password });
```
- Interceptors configured in `axiosConfig.js`
- Adds JWT token to request headers automatically

#### **3. React Router DOM**
Client-side routing
- `ProtectedRoute.jsx` - Routes requiring authentication
- Routes: Home, Auth, Teams, Players, Tournaments, Admin, etc.
- URL paths like `/teams`, `/tournaments/:id`

#### **4. useState Hook**
React state management
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

#### **5. useEffect Hook**
Lifecycle hook for side effects
```javascript
useEffect(() => {
  const storedToken = localStorage.getItem("token");
  // Restore user session
}, []);
```

#### **6. localStorage**
Browser storage for persistent data
- Stores JWT token
- Stores user information
- Persists across page refreshes

#### **7. Custom Hooks**
Reusable logic
- `useAuth.js` - Access authentication context

#### **8. Vite**
Modern build tool (faster than Webpack)
- Dev server with HMR (Hot Module Replacement)
- Lightning-fast bundling
- Tree-shaking for smaller bundles

---

## 🔐 Authentication Flow

### **User Registration**
```
1. User enters username, email, password
2. Server validates input (email format, password length)
3. Check if user already exists
4. Hash password using bcryptjs (10 salt rounds)
5. Create user document in MongoDB
6. Generate JWT token (7-day expiration)
7. Send token + user data to frontend
8. Frontend stores in localStorage
```

### **User Login**
```
1. User enters email/username + password
2. Server finds user by email or username
3. Compare entered password with hashed password
4. If valid: Generate JWT, return token + user
5. If invalid: Return 401 error
6. Frontend stores token in localStorage
7. Token sent in Authorization header for future requests
```

### **Protected Routes**
```
1. React ProtectedRoute checks localStorage for token
2. Axios interceptor adds token to request headers
3. Server's protect middleware verifies JWT
4. If valid: Attach user to req.user, proceed
5. If invalid/expired: Return 401 error
```

---

## 🛡️ Security Features

### **1. Password Security**
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Minimum 6 characters required

### **2. JWT Authentication**
- Tokens expire in 7 days
- Signed with SECRET_KEY
- Bearer token format in Authorization header

### **3. Role-Based Access Control (RBAC)**
- **Player**: Default role, can view tournaments
- **Organizer**: Can create tournaments and teams
- **Admin**: Full access to all data and features
- Middleware: `adminOnly`, `organizerOnly`

### **4. CORS Protection**
```javascript
const corsOptions = {
  origin: ['localhost:5173', 'yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### **5. Rate Limiting**
```javascript
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per window
});
```

### **6. Helmet.js**
- Adds security HTTP headers
- Prevents XSS attacks
- Disables X-Powered-By header

### **7. Data Validation**
- Email format validation with regex
- Username length (3-30 characters)
- Password minimum length
- Required field validation

---

## 📊 Database Schema Highlights

### **User Model**
```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, validated),
  password: String (hashed),
  role: Enum ["player", "organizer", "admin"],
  timestamps: true
}
```

### **Team Model**
```javascript
{
  name: String,
  description: String,
  members: [userId],
  wins: Number,
  losses: Number,
  createdBy: ObjectId (User)
}
```

### **Tournament Model**
```javascript
{
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  teams: [teamId],
  prizePool: Number,
  status: Enum ["upcoming", "live", "completed"]
}
```

---

## 🔄 API Routes & Endpoints

### **Authentication Routes** (`/api/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user (protected)

### **Teams Routes** (`/api/teams`)
- `GET /teams` - List all teams
- `GET /teams/:id` - Get team details
- `POST /teams` - Create team (protected)
- `PUT /teams/:id` - Update team (protected)
- `DELETE /teams/:id` - Delete team (protected)

### **Tournaments Routes** (`/api/tournaments`)
- `GET /tournaments` - List tournaments
- `POST /tournaments` - Create tournament (organizer only)
- `PUT /tournaments/:id` - Update tournament
- `DELETE /tournaments/:id` - Delete tournament

### **Players Routes** (`/api/players`)
- `GET /players` - List all players
- `GET /players/:id` - Get player details
- `POST /players` - Register player (protected)

### **Registrations Routes** (`/api/registrations`)
- `POST /registrations` - Register team for tournament
- `GET /registrations/:tournamentId` - Get tournament registrations

### **Contact Routes** (`/api/contact`)
- `POST /contact` - Submit contact form
- `GET /contact` - List submissions (admin only)

---

## 🚀 Deployment & Environment

### **Development**
```bash
# Frontend
npm run dev        # Vite dev server on localhost:5173

# Backend
npm run dev        # Nodemon watches for changes
```

### **Production**
```bash
# Frontend (Vercel)
npm run build      # Vite bundles React code
vercel deploy      # Deploy to Vercel

# Backend
npm start          # Run node server.js
# Deploy to server (AWS, Heroku, etc.)
```

### **Environment Variables** (`.env` file)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/esports
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173,http://localhost:3000
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
SENDGRID_API_KEY=xxx
```

---

## 📦 Key Dependencies

### **Backend**
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth tokens |
| `bcryptjs` | Password hashing |
| `cors` | Cross-origin requests |
| `helmet` | Security headers |
| `morgan` | Request logging |
| `dotenv` | Environment variables |
| `aws-sdk` | AWS S3 integration |
| `nodemailer` | Email sending |

### **Frontend**
| Package | Purpose |
|---------|---------|
| `react` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client |
| `vite` | Build tool |
| `eslint` | Code linting |

---

## 🔍 Common Code Patterns

### **1. Async Error Handling**
```javascript
exports.loginUser = asyncHandler(async (req, res) => {
  // Code here - errors automatically caught
});
```

### **2. Response Format**
```javascript
sendResponse(res, successResponse("Message", data, 200));
sendResponse(res, errorResponse("Error message", 400));
```

### **3. Validation Pattern**
```javascript
const validation = validateRequired(['username', 'email', 'password'], req.body);
if (!validation.isValid) return sendResponse(res, errorResponse(validation.message, 400));
```

### **4. Protected Route Pattern (React)**
```javascript
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>
```

### **5. Context Hook Pattern (React)**
```javascript
const { user, logout, login } = useContext(AuthContext);
```

---

## 🐛 Error Handling

### **HTTP Status Codes Used**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `500` - Server Error

### **Error Middleware**
Centralized error handler catches all errors and returns consistent format:
```javascript
{
  success: false,
  message: "Error description",
  timestamp: "2026-05-09T10:30:00.000Z"
}
```

---

## 🎯 Key Features Explained

### **1. Multi-Role System**
- Players can join teams and tournaments
- Organizers create tournaments and teams
- Admins manage everything

### **2. Tournament Management**
- Create tournaments with dates and prize pool
- Register teams for tournaments
- Track match schedules
- Manage results

### **3. Team Management**
- Teams have multiple players
- Track wins/losses
- Update team information

### **4. Contact System**
- Users submit contact forms
- Admin can view submissions
- Used for feedback/support

### **5. Admin Dashboard**
- View all users, teams, tournaments
- Manage registrations
- Create admin accounts
- View reports

---

## 📝 Development Workflow

### **Adding a New Feature**

1. **Create Model** (e.g., `server/models/Feature.js`)
   - Define schema with validation

2. **Create Controller** (e.g., `server/controllers/featureController.js`)
   - Implement business logic
   - Use asyncHandler for error handling

3. **Create Routes** (e.g., `server/routes/featureRoutes.js`)
   - Define HTTP endpoints
   - Apply middleware (protect, adminOnly)

4. **Create Frontend Components** (e.g., `client/src/pages/Feature/`)
   - Use React hooks
   - Call API via Axios
   - Use Context for state management

5. **Add Routing** (e.g., in `App.jsx`)
   - Import routes
   - Wrap with ProtectedRoute if needed

---

## 🔗 Data Flow Example: User Registration

```
1. User fills signup form → Client/Signup.jsx
2. User clicks "Register" button
3. Axios sends POST to /api/auth/register
4. Backend receives request → authController.registerUser
5. Validates input → Checks duplicates → Hashes password
6. Creates document in MongoDB (User collection)
7. Generates JWT token
8. Returns token + user data to frontend
9. Frontend stores in localStorage
10. React state updates → User logged in
11. Redirected to dashboard
```

---

## 💡 Best Practices Used

✅ **Security**
- Password hashing with bcryptjs
- JWT token-based auth
- CORS configuration
- Rate limiting
- Helmet.js security headers

✅ **Code Quality**
- Error handling middleware
- Input validation
- Separation of concerns (models, controllers, routes)
- Async/await instead of callbacks

✅ **Performance**
- Connection pooling (MongoDB)
- Response compression
- Request logging
- Vite for fast builds

✅ **Scalability**
- Modular architecture
- Reusable hooks
- Context API for state
- Environment-based configuration

---

## 🎓 Learning Resources Implicit in Code

This project teaches:
- ✅ Full-stack development
- ✅ Authentication & Authorization
- ✅ RESTful API design
- ✅ React hooks & Context
- ✅ MongoDB schema design
- ✅ Security best practices
- ✅ Error handling patterns
- ✅ Middleware architecture

---

**Last Updated**: May 2026
**Version**: 1.0.0
