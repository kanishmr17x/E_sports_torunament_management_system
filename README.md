# E-Sports Tournament Platform

A production-ready MERN stack application for managing e-sports tournaments, teams, and players.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## ✨ Features

### Core Features
- ✅ **User Authentication** - Register, login with email or username
- ✅ **Role-Based Access** - Player, Organizer, and Admin roles
- ✅ **Tournament Management** - Create and manage tournaments
- ✅ **Team Management** - Create and manage teams
- ✅ **Player Management** - Add players to teams
- ✅ **Tournament Registration** - Register teams in tournaments
- ✅ **Contact System** - Send messages/inquiries

### Advanced Features
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **File Uploads** - AWS S3 integration for images
- ✅ **Email Notifications** - Nodemailer integration for alerts
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Production Ready** - Optimized for deployment

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 7+** - Build tool
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **AWS SDK** - S3 file uploads

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ (v18+ recommended)
- MongoDB v4.4+ (or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd esports-platform
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

### Example Login Credentials
After registering, use your email/username and password to login.

---

## 📁 Project Structure

```
esports-platform/
├── server/
│   ├── config/              # Configuration files
│   │   ├── db.js           # MongoDB connection
│   │   └── awsConfig.js    # AWS S3 configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants
│   ├── server.js           # Entry point
│   └── .env.example        # Environment template
│
├── client/
│   ├── src/
│   │   ├── api/             # API integration
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   ├── public/              # Static assets
│   └── vite.config.js      # Vite configuration
│
├── docs/                    # Documentation
├── DEPLOYMENT.md           # Deployment guide
├── PRODUCTION_CHECKLIST.md # Pre-deployment checklist
├── REFACTORING_SUMMARY.md  # What was improved
└── README.md              # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (admin)
- `PUT /api/tournaments/:id` - Update tournament (admin)
- `DELETE /api/tournaments/:id` - Delete tournament (admin)

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team (admin)
- `DELETE /api/teams/:id` - Delete team (admin)

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `GET /api/players/team/:teamId` - Get players by team
- `POST /api/players/add` - Add player
- `DELETE /api/players/:id` - Delete player (admin)

### Registrations
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Register team
- `DELETE /api/registrations/:id` - Cancel registration

### Other
- `POST /api/contact` - Send contact message
- `GET /api/health` - Health check

---

## ⚙️ Configuration

### Environment Variables

Create `server/.env` file with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_super_secret_key_32_characters_minimum
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@esportsplatform.com

# AWS S3 (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
```

See `server/.env.example` for all available options.

---

## 📚 Documentation

### Getting Started
- **[Quick Start](#quick-start)** - Get up and running locally
- **[Configuration](#configuration)** - Environment setup

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-deployment verification

### Reference
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - What was improved and why

### API
- **[API Endpoints](#api-endpoints)** - All available endpoints

---

## 🔐 Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control
- ✅ Environment variable management
- ✅ Input validation on all endpoints
- ✅ CORS protection
- ✅ Mongoose schema validation

### Security Best Practices
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Keep dependencies updated
- Monitor error logs
- Use HTTPS in production
- Set proper CORS origins
- Validate all user inputs

---

## 📊 Available Scripts

### Backend
```bash
cd server
npm run dev          # Development with auto-reload
npm start           # Production start
npm run build       # Build (if applicable)
```

### Frontend
```bash
cd client
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Lint code
npm run lint:fix    # Fix linting issues
```

---

## 🧪 Testing

### Manual Testing
1. Register a new user
2. Login with email or username
3. Create a tournament (as admin)
4. Create a team
5. Add players to team
6. Register team in tournament

### API Testing
Use tools like Postman or cURL:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"test","password":"password123"}'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check `MONGO_URI` in `.env`
- Verify database is running
- Ensure network access allowed (if using Atlas)

### Port Already in Use
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Error
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend is accessing correct API URL
- Check browser console for specific error

### Authentication Issues
- Clear localStorage in browser
- Re-login with correct credentials
- Check token expiration (default 7 days)

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more solutions.

---

## 📈 Performance Optimization

### Backend
- Database query optimization
- Connection pooling
- Caching strategies
- Async/await error handling

### Frontend
- Code splitting
- Image optimization
- Bundle minification
- Efficient state management

---

## 🚀 Deployment

### Quick Deploy with PM2
```bash
npm install -g pm2

cd server
pm2 start server.js --name "esports-api"
pm2 save
pm2 startup
```

### Docker Deployment
```bash
docker build -t esports-platform .
docker run -p 5000:5000 --env-file .env esports-platform
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 📝 License

This project is proprietary and confidential.

---

## 👥 Team

- **Lead Developer**: [Your Name]
- **Database Admin**: [Team Member]
- **DevOps**: [Team Member]

---

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Review error logs
3. Contact development team

---

## ✅ Production Checklist

Before deploying to production, verify:
- [ ] All environment variables configured
- [ ] Database backed up
- [ ] Security review completed
- [ ] Performance tested
- [ ] Monitoring configured
- [ ] Rollback procedure ready

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for complete checklist.

---

## 📝 Version

- **Current Version**: 1.0.0
- **Last Updated**: May 2026
- **Status**: Production Ready

---

**Last Deploy**: Never (Ready for first deployment)
**Last Update**: [Current Date]