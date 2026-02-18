# Idealy - AI-Powered Product Development Platform

> From Problem Discovery to Production-Ready Code with AI

Idealy is a complete platform that discovers real problems from Reddit, generates AI-powered product blueprints, and provides a full web-based IDE with AI code generation capabilities.

## ✨ Key Features

### 🔍 Problem Discovery
- **Reddit Integration**: Discover real, validated problems from online communities
- **Interactive Voting**: Like and vote on problems
- **Smart Search**: Filter by category and keywords
- **Custom Input**: Add your own problem descriptions

### 🤖 AI Blueprint Generation
- **Product Planning**: AI generates product names, taglines, and features
- **Tech Stack**: Recommended technologies for your product
- **Business Model**: Revenue strategy and market analysis
- **Launch Roadmap**: 4-phase plan from foundation to launch

### 💻 Full Web-Based IDE
- **Monaco Editor**: VS Code's editor engine in the browser
- **File Tree**: Visual project structure with folder navigation
- **Multi-file Tabs**: Work on multiple files simultaneously
- **Integrated Terminal**: See output and logs in real-time
- **Run/Debug**: Start and stop development servers
- **Download Projects**: Export your entire codebase

### 🧠 AI Code Assistant
- **Natural Language**: Describe what you want in plain English
- **Code Generation**: Write new code from scratch
- **Code Refactoring**: Improve existing code
- **Error Handling**: Add try-catch blocks automatically
- **TypeScript Types**: Generate proper type definitions
- **Quick Commands**: Pre-built commands for common tasks
- **Multiple AI Providers**: Groq (fast), Ollama (local), OpenAI (best quality)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure AI (choose one):
# Option 1: Ollama (Free, Local)
ollama pull codellama
echo "AI_API_URL=http://localhost:11434/v1/chat/completions" >> .env.local
echo "AI_API_KEY=ollama" >> .env.local
echo "AI_MODEL=codellama" >> .env.local

# Option 2: OpenAI (Best Quality)
echo "OPENAI_API_KEY=sk-your-key" >> .env.local
echo "AI_MODEL=gpt-4" >> .env.local

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 📖 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes
- **[Features](./FEATURES.md)** - Complete feature list
- **[AI Code Writer Guide](./AI_CODE_WRITER.md)** - AI assistant documentation
- **[AI Provider Setup](./AI_PROVIDER_GUIDE.md)** - Configure AI providers
- **[Multi-Key Fallback](./MULTI_KEY_FALLBACK.md)** - High availability setup
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment

## 🎯 How It Works

```
1. Discover Problem → 2. Generate Blueprint → 3. Generate Code → 4. Edit in IDE → 5. Deploy
```

### Step 1: Discover Problems
Browse real problems from Reddit or input your own. Vote on problems you find interesting.

### Step 2: AI Blueprint
AI analyzes the problem and generates:
- Product name and tagline
- Core features list
- Recommended tech stack
- Business model
- Target market analysis
- Launch roadmap

### Step 3: Generate Code
Click "Generate Code" to create production-ready scaffolding:
- Next.js project structure
- TypeScript components
- API routes
- Database schema
- Dependencies

### Step 4: Edit in IDE
Click "Edit Here" to open the full IDE:
- Edit code with Monaco editor
- Navigate file tree
- Use AI assistant to write/modify code
- Try quick commands or custom prompts
- Run development server
- See terminal output

### Step 5: Download & Deploy
Download your project and deploy to:
- Vercel
- Netlify
- Railway
- Your own server

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Editor**: Monaco Editor (VS Code engine)
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: OpenAI, Ollama, Together AI, Groq
- **APIs**: Reddit API for problem discovery

## 🔧 Configuration

### AI Providers

#### Ollama (Free, Local, Open Source)
```env
AI_API_URL=http://localhost:11434/v1/chat/completions
AI_API_KEY=ollama
AI_MODEL=codellama
```

#### OpenAI (Best Quality)
```env
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
```

#### Together AI (Open Source Models)
```env
AI_API_URL=https://api.together.xyz/v1/chat/completions
AI_API_KEY=your_key
AI_MODEL=codellama/CodeLlama-34b-Instruct-hf
```

#### Groq (Fast & Free Tier)
```env
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_API_KEY=your_key
AI_MODEL=mixtral-8x7b-32768
```

### Multi-Key Fallback (Recommended for Testing)

Add backup API keys for automatic failover:

```env
# Primary key
GROQ_API_KEY=your_primary_key

# Backup keys (optional)
GROQ_API_KEY_BACKUP_1=your_backup_key_1
GROQ_API_KEY_BACKUP_2=your_backup_key_2
GROQ_API_KEY_BACKUP_3=your_backup_key_3
```

If primary key fails or hits rate limits, system automatically tries backup keys. See [MULTI_KEY_FALLBACK.md](./MULTI_KEY_FALLBACK.md) for details.

### Reddit API (Optional)
```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=idealy-app
```

## 📦 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t idealy .
docker run -p 3000:3000 idealy
```

### Manual
```bash
npm run build
npm start
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please read our Contributing Guide.

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Monaco Editor by Microsoft
- shadcn/ui components
- Next.js team
- Open source AI community

---

Built with ❤️ for developers and entrepreneurs
