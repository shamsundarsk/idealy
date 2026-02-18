'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Download, Code2, Zap, Edit } from 'lucide-react'
import CodePreview from './code-preview'
import WebIDE from './web-ide'

interface Problem {
  id: string
  title: string
  category: string
  votes: number
  platform: string
  description: string
  tags: string[]
}

interface BlueprintGeneratorProps {
  problem: Problem
  onBack: () => void
}

interface Blueprint {
  productName: string
  tagline: string
  features: string[]
  techStack: string[]
  businessModel: string
  targetMarket: string
  estimatedTAM: string
}

export default function BlueprintGenerator({
  problem,
  onBack,
}: BlueprintGeneratorProps) {
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('blueprint')
  const [codeScaffold, setCodeScaffold] = useState<any>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [showIDE, setShowIDE] = useState(false)

  useEffect(() => {
    const generateBlueprint = async () => {
      try {
        const response = await fetch('/api/blueprints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            problemDescription: problem.description,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate blueprint')
        }

        const data = await response.json()
        setBlueprint(data)
      } catch (error) {
        console.error('[Idealy] Blueprint generation failed:', error)
        // Show error state or fallback UI
      } finally {
        setLoading(false)
      }
    }

    generateBlueprint()
  }, [problem])

  const handleGenerateCode = async () => {
    if (!blueprint) return

    setCodeLoading(true)
    try {
      console.log('[Idealy] Generating code for:', blueprint.productName)
      
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: blueprint.productName,
          blueprint,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Idealy] Code generation API error:', errorData)
        throw new Error(errorData.error || 'Failed to generate code')
      }

      const data = await response.json()
      console.log('[Idealy] Code scaffold received:', data)
      
      if (!data || !data.codeSnippets) {
        console.error('[Idealy] Invalid code scaffold data:', data)
        throw new Error('Invalid code scaffold data')
      }
      
      setCodeScaffold(data)
      setActiveTab('code')
    } catch (error: any) {
      console.error('[Idealy] Code generation failed:', error)
      alert(`Code generation failed: ${error.message}. Please try again.`)
    } finally {
      setCodeLoading(false)
    }
  }

  // Show IDE if user clicks "Edit Here"
  if (showIDE && codeScaffold && codeScaffold.codeSnippets) {
    return (
      <WebIDE
        projectName={codeScaffold.projectName || 'Project'}
        initialFiles={codeScaffold.codeSnippets || {}}
        dependencies={codeScaffold.dependencies || {}}
        onBack={() => setShowIDE(false)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Button variant="ghost" className="mb-6" onClick={onBack}>
        ← Back to Discovery
      </Button>

      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          {problem.category}
        </Badge>
        <h1 className="text-4xl font-bold mb-2">{problem.title}</h1>
        <p className="text-muted-foreground text-lg">{problem.description}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Generating Blueprint...</p>
            <p className="text-muted-foreground">
              Our AI is analyzing the problem and creating your product blueprint
            </p>
          </div>
        </div>
      ) : blueprint ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
            <TabsTrigger value="code">Code Template</TabsTrigger>
            <TabsTrigger value="launch">Launch Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="blueprint">
            <div className="space-y-6">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <h2 className="text-3xl font-bold mb-2">{blueprint.productName}</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {blueprint.tagline}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Core Features</h3>
                    <ul className="space-y-2">
                      {blueprint.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="text-primary mt-1">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      Recommended Tech Stack
                    </h3>
                    <div className="space-y-2">
                      {blueprint.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="mr-2 mb-2">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Business Model</h3>
                  <p className="text-muted-foreground">{blueprint.businessModel}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Target Market</h3>
                  <p className="text-muted-foreground">{blueprint.targetMarket}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Estimated TAM</h3>
                  <p className="text-muted-foreground">{blueprint.estimatedTAM}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Next Steps</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Validate with target users</li>
                    <li>2. Build MVP with core features</li>
                    <li>3. Launch beta program</li>
                    <li>4. Iterate based on feedback</li>
                  </ul>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code">
            {codeLoading ? (
              <Card className="p-12 text-center">
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">
                      Generating Code...
                    </p>
                    <p className="text-muted-foreground">
                      Building your production-ready project scaffold
                    </p>
                  </div>
                </div>
              </Card>
            ) : codeScaffold ? (
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Your Code is Ready!</h3>
                      <p className="text-muted-foreground">
                        Download the project or start editing directly in the browser
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          const dataStr = JSON.stringify(
                            {
                              name: codeScaffold.projectName,
                              files: codeScaffold.codeSnippets,
                              dependencies: codeScaffold.dependencies,
                              schema: codeScaffold.databaseSchema,
                            },
                            null,
                            2
                          )
                          const dataBlob = new Blob([dataStr], { type: 'application/json' })
                          const url = URL.createObjectURL(dataBlob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `${codeScaffold.projectName}.json`
                          link.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Project
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => setShowIDE(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Here
                      </Button>
                    </div>
                  </div>
                </Card>
                <CodePreview
                  snippets={codeScaffold?.codeSnippets ? Object.entries(codeScaffold.codeSnippets).map(
                    ([filename, code]: [string, any]) => ({
                      filename,
                      code,
                      language: filename.endsWith('.tsx')
                        ? 'typescript'
                        : filename.endsWith('.sql')
                          ? 'sql'
                          : filename.endsWith('.md')
                            ? 'markdown'
                            : 'json',
                    }),
                  ) : []}
                  projectName={codeScaffold?.projectName || 'Project'}
                  dependencies={codeScaffold?.dependencies || {}}
                  schema={codeScaffold?.databaseSchema || ''}
                />
              </div>
            ) : (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Code2 className="w-6 h-6" />
                  Generate Production-Ready Code
                </h2>
                <p className="text-muted-foreground mb-6">
                  Click the button below to generate a complete Next.js project
                  scaffold with authentication, database schema, and all
                  necessary files to get started.
                </p>
                <Button size="lg" onClick={handleGenerateCode}>
                  <Code2 className="w-4 h-4 mr-2" />
                  Generate Code Scaffold
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="launch">
            <div className="space-y-6">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Launch Roadmap</h2>

                <div className="space-y-6">
                  <LaunchPhase
                    phase="Phase 1: Foundation"
                    duration="Weeks 1-2"
                    tasks={[
                      'Set up development environment',
                      'Design database schema',
                      'Build authentication system',
                      'Create basic UI components',
                    ]}
                  />

                  <LaunchPhase
                    phase="Phase 2: MVP Development"
                    duration="Weeks 3-4"
                    tasks={[
                      'Implement feedback inbox',
                      'Add email integration',
                      'Build team collaboration features',
                      'Create user dashboard',
                    ]}
                  />

                  <LaunchPhase
                    phase="Phase 3: Polish & Testing"
                    duration="Weeks 5-6"
                    tasks={[
                      'Add AI sentiment analysis',
                      'Implement search and filtering',
                      'Security audit',
                      'Performance optimization',
                    ]}
                  />

                  <LaunchPhase
                    phase="Phase 4: Beta Launch"
                    duration="Week 7"
                    tasks={[
                      'Launch beta to 100 users',
                      'Gather feedback',
                      'Fix critical bugs',
                      'Prepare for public launch',
                    ]}
                  />
                </div>
              </Card>

              <Card className="p-8 bg-primary/5 border-primary">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Ready to Build?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Download the code scaffold and start building your product
                  today. Get all the infrastructure you need to launch in weeks
                  instead of months.
                </p>
                <Button size="lg" className="bg-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Download Code Scaffold
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}

function LaunchPhase({
  phase,
  duration,
  tasks,
}: {
  phase: string
  duration: string
  tasks: string[]
}) {
  return (
    <div className="border-l-4 border-primary pl-6 py-4">
      <h3 className="font-semibold text-lg mb-1">{phase}</h3>
      <p className="text-sm text-muted-foreground mb-3">{duration}</p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task} className="text-sm flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
