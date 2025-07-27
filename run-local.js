#!/usr/bin/env node

// Simple script to run the app locally on port 3000
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';

// Set default session secret if not provided
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'local-dev-secret-key-change-in-production';
}

console.log('🚀 Starting AltMed in local development mode...');
console.log('📡 Port: 3000');
console.log('🗄️ Database:', process.env.DATABASE_URL ? 'PostgreSQL' : 'Memory Storage');
console.log('🔑 Gemini API:', process.env.GEMINI_API_KEY ? 'Configured' : 'Missing (add to .env)');
console.log('');

// Import and run the server
import('./server/index.ts');