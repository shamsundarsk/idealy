#!/bin/bash

echo "🚀 Idealy Setup Script"
echo "======================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your API keys"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check for AI configuration
echo "🤖 AI Provider Setup"
echo "===================="
echo ""
echo "Choose your AI provider:"
echo "1. OpenAI (GPT-4) - Best quality, paid"
echo "2. Ollama - Free, local, open source"
echo "3. Together AI - Open source models, paid"
echo "4. Groq - Fast, free tier available"
echo "5. Skip for now"
echo ""
read -p "Enter choice (1-5): " AI_CHOICE

case $AI_CHOICE in
    1)
        echo ""
        echo "OpenAI Setup:"
        echo "1. Go to https://platform.openai.com/api-keys"
        echo "2. Create an API key"
        echo "3. Add to .env.local: OPENAI_API_KEY=sk-..."
        ;;
    2)
        echo ""
        echo "Ollama Setup:"
        echo "1. Install Ollama: https://ollama.ai"
        echo "2. Run: ollama pull codellama"
        echo "3. Add to .env.local:"
        echo "   AI_API_URL=http://localhost:11434/v1/chat/completions"
        echo "   AI_API_KEY=ollama"
        echo "   AI_MODEL=codellama"
        ;;
    3)
        echo ""
        echo "Together AI Setup:"
        echo "1. Sign up at https://together.ai"
        echo "2. Get API key"
        echo "3. Add to .env.local:"
        echo "   AI_API_URL=https://api.together.xyz/v1/chat/completions"
        echo "   AI_API_KEY=your_key"
        echo "   AI_MODEL=codellama/CodeLlama-34b-Instruct-hf"
        ;;
    4)
        echo ""
        echo "Groq Setup:"
        echo "1. Sign up at https://groq.com"
        echo "2. Get API key"
        echo "3. Add to .env.local:"
        echo "   AI_API_URL=https://api.groq.com/openai/v1/chat/completions"
        echo "   AI_API_KEY=your_key"
        echo "   AI_MODEL=mixtral-8x7b-32768"
        ;;
    5)
        echo ""
        echo "⚠️  Skipping AI setup. You can configure it later in .env.local"
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Read DEPLOYMENT_GUIDE.md for more information"
echo ""
