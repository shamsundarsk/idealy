#!/bin/bash

# AI Code Writer Setup Script
# This script helps you configure the AI provider for the code writer

echo "🚀 Idealy - AI Code Writer Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

echo "Choose your AI provider:"
echo ""
echo "1. Groq (Recommended for Testing)"
echo "   - Fast inference"
echo "   - Generous free tier"
echo "   - Requires API key"
echo ""
echo "2. Ollama (Recommended for Production)"
echo "   - Local, free, private"
echo "   - No API costs"
echo "   - Requires installation"
echo ""
echo "3. OpenAI"
echo "   - Best quality"
echo "   - Costs money"
echo "   - Requires API key"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Setting up Groq..."
        echo ""
        echo "1. Sign up at: https://console.groq.com"
        echo "2. Get API key from: https://console.groq.com/keys"
        echo ""
        read -p "Enter your Groq API key: " api_key
        
        if [ -z "$api_key" ]; then
            echo "❌ API key cannot be empty"
            exit 1
        fi
        
        # Update .env.local
        grep -v "^AI_PROVIDER=" .env.local > .env.local.tmp 2>/dev/null || true
        grep -v "^GROQ_API_KEY=" .env.local.tmp > .env.local.tmp2 2>/dev/null || true
        grep -v "^AI_MODEL=" .env.local.tmp2 > .env.local.tmp3 2>/dev/null || true
        mv .env.local.tmp3 .env.local 2>/dev/null || true
        rm -f .env.local.tmp .env.local.tmp2 2>/dev/null || true
        
        echo "" >> .env.local
        echo "# AI Code Writer - Groq Configuration" >> .env.local
        echo "AI_PROVIDER=groq" >> .env.local
        echo "GROQ_API_KEY=$api_key" >> .env.local
        echo "AI_MODEL=mixtral-8x7b-32768" >> .env.local
        
        echo ""
        echo "✅ Groq configured successfully!"
        echo ""
        echo "Available models:"
        echo "  - mixtral-8x7b-32768 (default, balanced)"
        echo "  - llama-3.1-70b-versatile (more capable)"
        echo "  - llama-3.1-8b-instant (fastest)"
        ;;
        
    2)
        echo ""
        echo "📝 Setting up Ollama..."
        echo ""
        
        # Check if Ollama is installed
        if ! command -v ollama &> /dev/null; then
            echo "❌ Ollama is not installed"
            echo ""
            echo "Install Ollama:"
            echo "  Mac: brew install ollama"
            echo "  Linux: curl -fsSL https://ollama.com/install.sh | sh"
            echo "  Or visit: https://ollama.ai"
            echo ""
            exit 1
        fi
        
        echo "✅ Ollama is installed"
        echo ""
        
        # Check if Ollama is running
        if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
            echo "⚠️  Ollama is not running"
            echo "Starting Ollama..."
            ollama serve &
            sleep 2
        fi
        
        echo "Choose a model:"
        echo "  1. llama3 (8B, fast, good quality)"
        echo "  2. llama3:70b (70B, slower, best quality)"
        echo "  3. codellama (specialized for code)"
        echo "  4. mixtral (47B, excellent quality)"
        echo ""
        read -p "Enter your choice (1-4): " model_choice
        
        case $model_choice in
            1) model="llama3" ;;
            2) model="llama3:70b" ;;
            3) model="codellama" ;;
            4) model="mixtral" ;;
            *) model="llama3" ;;
        esac
        
        echo ""
        echo "Pulling model: $model"
        echo "This may take a few minutes..."
        ollama pull $model
        
        # Update .env.local
        grep -v "^AI_PROVIDER=" .env.local > .env.local.tmp 2>/dev/null || true
        grep -v "^AI_API_KEY=" .env.local.tmp > .env.local.tmp2 2>/dev/null || true
        grep -v "^AI_MODEL=" .env.local.tmp2 > .env.local.tmp3 2>/dev/null || true
        grep -v "^OLLAMA_URL=" .env.local.tmp3 > .env.local.tmp4 2>/dev/null || true
        mv .env.local.tmp4 .env.local 2>/dev/null || true
        rm -f .env.local.tmp .env.local.tmp2 .env.local.tmp3 2>/dev/null || true
        
        echo "" >> .env.local
        echo "# AI Code Writer - Ollama Configuration" >> .env.local
        echo "AI_PROVIDER=ollama" >> .env.local
        echo "AI_API_KEY=ollama" >> .env.local
        echo "AI_MODEL=$model" >> .env.local
        echo "OLLAMA_URL=http://localhost:11434/v1/chat/completions" >> .env.local
        
        echo ""
        echo "✅ Ollama configured successfully!"
        echo ""
        echo "Model: $model"
        echo "To list models: ollama list"
        echo "To pull more models: ollama pull <model-name>"
        ;;
        
    3)
        echo ""
        echo "📝 Setting up OpenAI..."
        echo ""
        echo "Get API key from: https://platform.openai.com/api-keys"
        echo ""
        read -p "Enter your OpenAI API key: " api_key
        
        if [ -z "$api_key" ]; then
            echo "❌ API key cannot be empty"
            exit 1
        fi
        
        # Update .env.local
        grep -v "^AI_PROVIDER=" .env.local > .env.local.tmp 2>/dev/null || true
        grep -v "^OPENAI_API_KEY=" .env.local.tmp > .env.local.tmp2 2>/dev/null || true
        grep -v "^AI_MODEL=" .env.local.tmp2 > .env.local.tmp3 2>/dev/null || true
        mv .env.local.tmp3 .env.local 2>/dev/null || true
        rm -f .env.local.tmp .env.local.tmp2 2>/dev/null || true
        
        echo "" >> .env.local
        echo "# AI Code Writer - OpenAI Configuration" >> .env.local
        echo "AI_PROVIDER=openai" >> .env.local
        echo "OPENAI_API_KEY=$api_key" >> .env.local
        echo "AI_MODEL=gpt-4o-mini" >> .env.local
        
        echo ""
        echo "✅ OpenAI configured successfully!"
        echo ""
        echo "Available models:"
        echo "  - gpt-4o-mini (default, fast, cheap)"
        echo "  - gpt-4o (best quality)"
        echo "  - gpt-4-turbo (balanced)"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Test the AI: npx ts-node scripts/test-ai-code-writer.ts"
echo "3. Open the Web IDE and try the AI Assistant"
echo ""
echo "Documentation: AI_CODE_WRITER.md"
