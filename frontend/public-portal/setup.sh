#!/bin/bash

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  cp .env.example .env.local
  echo "✅ Created .env.local - please update with your config"
fi

# Install Tailwind CSS dependencies
echo "🎨 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm start"
echo ""
echo "📦 To build for production:"
echo "   npm run build"
