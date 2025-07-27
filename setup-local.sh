#!/bin/bash

echo "🚀 Setting up AltMed for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is required but not installed. Please install PostgreSQL first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your actual values:"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - GEMINI_API_KEY: Your Google Gemini API key"
    echo "   - SESSION_SECRET: A secure random string (run: openssl rand -base64 32)"
    echo ""
    echo "❗ Edit the .env file before continuing!"
    exit 0
fi

# Create database if it doesn't exist
echo "🗄️ Setting up database..."
createdb altmed 2>/dev/null || echo "Database already exists or could not be created"

# Push schema to database
echo "📊 Setting up database schema..."
npm run db:push

# Seed database with sample data
echo "🌱 Adding sample data..."
npx tsx scripts/seed.ts

echo "✅ Setup complete! You can now run:"
echo "   npm run dev        # Start on port 5000 (default)"
echo "   npm run dev:local  # Start on port 3000"
echo ""
echo "🌐 Your app will be available at:"
echo "   http://localhost:5000 (default)"
echo "   http://localhost:3000 (with dev:local)"