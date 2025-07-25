# AltMed - Alternative Medication Finder

## Overview

AltMed is a modern web application designed to help users find alternative medications based on their symptoms. The app provides AI-powered medication recommendations, pharmacy location services, and detailed medication information to assist users in making informed healthcare decisions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Replit Auth integration

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend
├── shared/          # Shared schemas and types
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Frontend Architecture
- **React Router**: Uses `wouter` for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Mobile-First Design**: Responsive design optimized for mobile devices

### Backend Architecture
- **API Server**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth with session management
- **AI Integration**: Google Gemini API for medication recommendations
- **Middleware**: Request logging, error handling, and authentication middleware

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: User profiles and authentication data
- **Medications**: Comprehensive medication database with brand/generic names, descriptions, dosages, and side effects
- **Symptoms**: Symptom catalog with descriptions and severity levels
- **Pharmacies**: Pharmacy locations with geospatial data
- **Pharmacy Stock**: Real-time medication availability at pharmacies
- **User Favorites**: User's saved medications
- **Search History**: User's search activity tracking

## Data Flow

### Symptom Analysis & Recommendation Flow
1. User selects symptoms or enters free-text description
2. Frontend sends symptom data to `/api/search/symptoms` endpoint
3. Backend processes symptoms and queries Gemini AI for recommendations
4. AI analyzes symptoms against medication database
5. Results returned with effectiveness ratings and safety warnings
6. Frontend displays recommendations with detailed medication cards

### Pharmacy Location Flow
1. User location obtained via browser geolocation API
2. Backend queries pharmacy database with location coordinates
3. Returns nearby pharmacies sorted by distance
4. Includes real-time stock information for recommended medications

### Authentication Flow
1. Replit Auth handles OAuth authentication
2. User sessions stored in PostgreSQL with connect-pg-simple
3. Protected routes verify authentication middleware
4. User data synchronized between auth provider and local database

## External Dependencies

### AI Services
- **Google Gemini API**: Powers intelligent medication recommendations based on symptom analysis
- **Configuration**: Requires `GEMINI_API_KEY` environment variable

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Configuration**: Requires `DATABASE_URL` environment variable

### Authentication
- **Replit Authentication**: Integrated OAuth provider
- **Session Storage**: PostgreSQL-backed session management
- **Configuration**: Requires `SESSION_SECRET` and Replit-specific environment variables

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with HMR support
- **Database**: Development database with auto-migration
- **Environment**: NODE_ENV=development

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles server code to `dist/index.js`
- **Assets**: Static assets served from build directory
- **Database**: Production PostgreSQL with migration support

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google AI API key
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier (when deployed on Replit)

### Scalability Considerations
- Database connection pooling with Neon serverless
- Stateless server design for horizontal scaling
- Client-side caching with React Query
- Optimized bundle sizes with code splitting