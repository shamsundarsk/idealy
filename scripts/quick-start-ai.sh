#!/bin/bash

echo "🚀 Idealy AI Engine - Quick Start"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
fi

# Check for AI configuration
if ! grep -q "AI_PROVIDER=" .env.local 2>/dev/null; then
    echo "🤖 AI Provider Setup"
    echo "===================="
    echo ""
    echo "Choose your AI provider:"
    echo "1. Groq (Recommended for testing - fast & free)"
    echo "2. Ollama (Recommended for production - local & free)"
    echo "3. OpenAI (Best quality - paid)"
    echo ""
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "Setting up Groq..."
            echo "1. Sign up at https://console.groq.com"
            echo "2. Get API key from https://console.groq.com/keys"
            echo ""
            read -p "Enter your Groq API key: " groq_key
            echo "" >> .env.local
            echo "AI_PROVIDER=groq" >> .env.local
            echo "GROQ_API_KEY=$groq_key" >> .env.local
            echo "AI_MODEL=mixtral-8x7b-32768" >> .env.local
            echo "✅ Groq configured!"
            ;;
        2)
            echo ""
            echo "Setting up Ollama..."
            echo ""
            # Check if Ollama is installed
            if ! command -v ollama &> /dev/null; then
                echo "Ollama not found. Installing..."
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    brew install ollama
                else
                    curl -fsSL https://ollama.com/install.sh | sh
                fi
            fi
            
            echo "Pulling llama3 model (this may take a few minutes)..."
            ollama pull llama3
            
            echo "" >> .env.local
            echo "AI_PROVIDER=ollama" >> .env.local
            echo "AI_API_KEY=ollama" >> .env.local
            echo "AI_MODEL=llama3" >> .env.local
            echo "OLLAMA_URL=http://localhost:11434/v1/chat/completions" >> .env.local
            echo "✅ Ollama configured!"
            ;;
        3)
            echo ""
            echo "Setting up OpenAI..."
            echo "Get API key from: https://platform.openai.com/api-keys"
            echo ""
            read -p "Enter your OpenAI API key: " openai_key
            echo "" >> .env.local
            echo "AI_PROVIDER=openai" >> .env.local
            echo "OPENAI_API_KEY=$openai_key" >> .env.local
            echo "AI_MODEL=gpt-4o-mini" >> .env.local
            echo "✅ OpenAI configured!"
            ;;
    esac
fi

# Check for DATABASE_URL
if ! grep -q "DATABASE_URL=postgresql" .env.local 2>/dev/null; then
    echo ""
    echo "💾 Database Setup"
    echo "================="
    echo ""
    echo "Choose your database:"
    echo "1. Supabase (Recommended - free tier)"
    echo "2. Local PostgreSQL"
    echo ""
    read -p "Enter choice (1-2): " db_choice
    
    case $db_choice in
        1)
            echo ""
            echo "Setting up Supabase..."
            echo "1. Create project at https://supabase.com"
            echo "2. Go to Settings → Database"
            echo "3. Copy the connection string"
            echo ""
            read -p "Enter your DATABASE_URL: " db_url
            echo "" >> .env.local
            echo "DATABASE_URL=$db_url" >> .env.local
            echo "✅ Supabase configured!"
            ;;
        2)
            echo ""
            echo "Setting up local PostgreSQL..."
            if command -v createdb &> /dev/null; then
                createdb idealy 2>/dev/null || echo "Database 'idealy' may already exist"
                echo "" >> .env.local
                echo "DATABASE_URL=postgresql://localhost:5432/idealy" >> .env.local
                echo "✅ Local PostgreSQL configured!"
            else
                echo "PostgreSQL not found. Please install it first."
                echo "Mac: brew install postgresql"
                echo "Linux: sudo apt-get install postgresql"
            fi
            ;;
    esac
fi

echo ""
echo "📦 Setting up database..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "🧪 Test the AI engine:"
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Analyze a problem:"
echo "   curl -X POST http://localhost:3000/api/problems/analyze \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"content\": \"I spend hours managing API keys\"}'"
echo ""
echo "3. Scrape Hacker News:"
echo "   curl -X POST http://localhost:3000/api/problems/scrape \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"source\": \"hackernews\", \"limit\": 5}'"
echo ""
echo "📚 Documentation:"
echo "   - AI_PROVIDER_GUIDE.md - Switch between providers"
echo "   - AI_ENGINE_SETUP.md - Full setup guide"
echo ""
