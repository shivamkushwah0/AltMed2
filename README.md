# AltMed - Alternative Medication Finder

A modern web application that helps users find alternative medications based on their symptoms using AI-powered recommendations.

## Features

- 🔍 **AI-Powered Search**: Find medications based on symptoms using Google Gemini AI
- 🏥 **Pharmacy Finder**: Locate nearby pharmacies with real-time stock information
- ⭐ **Favorites**: Save medications for quick access
- 📊 **Medication Comparison**: Compare different medications side-by-side
- 📱 **Mobile-First Design**: Responsive design optimized for all devices

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Gemini API key

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd altmed
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/altmed

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Session Security
SESSION_SECRET=your_secure_random_string_32_chars_plus

# Development
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

Make sure PostgreSQL is running on your machine, then:

```bash
# Create database
createdb altmed

# Push schema to database
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## API Endpoints

- `GET /api/symptoms` - Get all symptoms
- `GET /api/medications` - Get all medications
- `POST /api/search/symptoms` - AI-powered symptom search
- `GET /api/pharmacies/nearby` - Find nearby pharmacies
- `GET /api/auth/user` - Get current user (development mode)

## Project Structure

```
├── client/          # React frontend
├── server/          # Express.js backend
├── shared/          # Shared schemas and types
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Update database schema

## Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### Session Secret
Generate a secure random string (32+ characters) for session encryption:
```bash
openssl rand -base64 32
```

## Production Deployment

For production deployment on Replit or other platforms:

1. Set `NODE_ENV=production`
2. Configure proper authentication (Replit Auth for Replit deployments)
3. Use a production PostgreSQL database
4. Set secure environment variables

## Troubleshooting

- **Database connection issues**: Make sure PostgreSQL is running and connection string is correct
- **AI not working**: Verify your Gemini API key is valid and has sufficient quota
- **Port already in use**: Change the PORT in your `.env` file

## License

MIT License