'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Sparkles, ChevronRight } from 'lucide-react'
import ProblemCard from './problem-card'
import BlueprintGenerator from './blueprint-generator'

interface DiscoveryInterfaceProps {
  onBackToHome: () => void
}

export default function DiscoveryInterface({ onBackToHome }: DiscoveryInterfaceProps) {
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [customProblem, setCustomProblem] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [loadingProblems, setLoadingProblems] = useState(true)
  const [selectedSource, setSelectedSource] = useState<'all' | 'reddit' | 'hackernews' | 'database'>('all')
  const [isScraping, setIsScraping] = useState(false)

  // Fetch problems from multiple sources
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        console.log('[Idealy] Fetching problems from multiple sources...')
        
        const allProblems: any[] = []

        // Priority 1: Fetch from Database (scraped and analyzed problems)
        try {
          const dbResponse = await fetch('/api/problems?limit=50&sortBy=opportunity_score&sortOrder=desc')
          const dbData = await dbResponse.json()
          if (dbData.success && dbData.problems && dbData.problems.length > 0) {
            console.log('[Idealy] Database problems:', dbData.problems.length)
            allProblems.push(...dbData.problems.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              category: p.category,
              votes: p.opportunity_score || 0,
              platform: p.source || 'Analyzed',
              tags: p.existing_solutions?.map((s: any) => s.name).slice(0, 3) || [p.status],
              status: p.status,
              source: p.source,
            })))
          }
        } catch (error) {
          console.error('[Idealy] Database fetch failed:', error)
        }

        // Priority 2: Fetch from Reddit (if no DB problems)
        if (allProblems.length < 10) {
          try {
            const redditResponse = await fetch('/api/reddit/problems?limit=20')
            const redditData = await redditResponse.json()
            if (redditData.success && redditData.problems) {
              console.log('[Idealy] Reddit problems:', redditData.problems.length)
              allProblems.push(...redditData.problems.map((p: any) => ({
                ...p,
                source: 'Reddit',
              })))
            }
          } catch (error) {
            console.error('[Idealy] Reddit fetch failed:', error)
          }
        }

        if (allProblems.length > 0) {
          console.log('[Idealy] Total problems loaded:', allProblems.length)
          setProblems(allProblems)
        } else {
          console.log('[Idealy] No problems from APIs, using mock data')
          setProblems(getMockProblems())
        }
      } catch (error) {
        console.error('[Idealy] Failed to fetch problems:', error)
        setProblems(getMockProblems())
      } finally {
        setLoadingProblems(false)
      }
    }

    fetchProblems()
  }, [selectedSource])

  // Mock problems as fallback
  const getMockProblems = () => [
    {
      id: '1',
      title: 'I spend 2 hours every week updating a spreadsheet with customer feedback',
      category: 'Productivity',
      votes: 345,
      platform: 'Reddit',
      description:
        'Managing customer feedback is tedious. Need a centralized solution that integrates with email and Slack.',
      tags: ['SaaS', 'B2B', 'Workflow'],
    },
    {
      id: '2',
      title: 'Finding reliable freelancers is incredibly time consuming',
      category: 'Hiring',
      votes: 289,
      platform: 'Reddit',
      description:
        'Current platforms are full of scams and low-quality work. Need vetting system with portfolios.',
      tags: ['Marketplace', 'Hiring', 'Trust'],
    },
    {
      id: '3',
      title: 'My team spends hours tracking project deadlines across multiple tools',
      category: 'Project Management',
      votes: 267,
      platform: 'Reddit',
      description:
        'Need unified timeline view of all deadlines from Jira, Asana, Monday, Linear, etc.',
      tags: ['DevTools', 'Integrations', 'Productivity'],
    },
    {
      id: '4',
      title: 'Small restaurants struggle with inventory management',
      category: 'Restaurant Tech',
      votes: 198,
      platform: 'Reddit',
      description:
        'Current POS systems are expensive. Need affordable inventory tracking for small businesses.',
      tags: ['SMB', 'Inventory', 'Point-of-Sale'],
    },
    {
      id: '5',
      title: 'No good solution for managing multiple social media accounts',
      category: 'Social Media',
      votes: 156,
      platform: 'Reddit',
      description:
        'Existing tools are either too expensive or too complex. Need simple, affordable multi-account management.',
      tags: ['Social Media', 'Content', 'Marketing'],
    },
  ]

  const filteredProblems = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGenerateFromCustom = async () => {
    if (!customProblem.trim()) return

    setIsGenerating(true)
    try {
      // We'll create a temporary problem object for the blueprint generator
      const tempProblem = {
        id: `custom-${Date.now()}`,
        title: customProblem.substring(0, 100),
        category: 'Custom',
        votes: 0,
        platform: 'Direct Input',
        description: customProblem,
        tags: ['Custom'],
      }
      setSelectedProblem(tempProblem.id)
      // Store the custom problem for the blueprint generator
      ;(window as any).lastCustomProblem = tempProblem
    } catch (error) {
      console.error('[Idealy] Error generating blueprint:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScrapeNow = async () => {
    setIsScraping(true)
    try {
      console.log('[Idealy] Starting scraping from all sources...')
      
      const response = await fetch('/api/problems/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'all',
          limit: 40,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`✅ Scraped ${data.items_found} problems!\n\nAnalyzed: ${data.items_analyzed}\nSaved: ${data.items_saved}\n\nRefreshing page...`)
        window.location.reload()
      } else {
        alert(`❌ Scraping failed: ${data.error}`)
      }
    } catch (error: any) {
      console.error('[Idealy] Scraping failed:', error)
      alert(`❌ Scraping failed: ${error.message}`)
    } finally {
      setIsScraping(false)
    }
  }

  if (selectedProblem) {
    let problem = problems.find((p) => p.id === selectedProblem)
    
    // Check for custom problem
    if (!problem && (window as any).lastCustomProblem) {
      problem = (window as any).lastCustomProblem
    }

    if (problem) {
      return (
        <BlueprintGenerator
          problem={problem}
          onBack={() => {
            setSelectedProblem(null)
            setCustomProblem('')
          }}
        />
      )
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={onBackToHome}
        >
          ← Back to Home
        </Button>
        <h1 className="text-4xl font-bold mb-2">Discover Problems</h1>
        <p className="text-muted-foreground text-lg">
          Real problems from real people. Choose one to generate your blueprint.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="discover">Browse Reddit</TabsTrigger>
          <TabsTrigger value="custom">Paste Your Own</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          <div className="space-y-6">
            {/* Scrape Button */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">🚀 Scrape Real Problems</h3>
                  <p className="text-sm text-muted-foreground">
                    Fetch fresh problems from Hacker News, GitHub, Product Hunt & Indie Hackers
                  </p>
                </div>
                <Button
                  onClick={handleScrapeNow}
                  disabled={isScraping}
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isScraping ? 'Scraping...' : 'Scrape Now'}
                </Button>
              </div>
            </Card>

            {/* Source Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedSource === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource('all')}
              >
                All Sources
              </Button>
              <Button
                variant={selectedSource === 'reddit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource('reddit')}
              >
                Reddit
              </Button>
              <Button
                variant={selectedSource === 'hackernews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource('hackernews')}
              >
                Hacker News
              </Button>
              <Button
                variant={selectedSource === 'database' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource('database')}
              >
                Analyzed Problems
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search problems by title or category..."
                className="pl-10 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              {loadingProblems ? (
                <Card className="p-12 text-center">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Loading problems from Reddit...
                  </p>
                </Card>
              ) : filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    onSelect={() => setSelectedProblem(problem.id)}
                  />
                ))
              ) : searchQuery ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    No problems found matching "{searchQuery}". Try a different search.
                  </p>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No problems loaded. This might be a temporary issue.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Paste Your Problem</h2>
            <p className="text-muted-foreground mb-6">
              Describe a problem you want to solve. Be specific about the pain
              point, the target audience, and why existing solutions fall short.
            </p>
            <textarea
              className="w-full h-48 p-4 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              placeholder="Describe your problem here... Example: I spend 2 hours every week managing customer feedback across email, Slack, and spreadsheets. There's no good tool that consolidates everything in one place."
              value={customProblem}
              onChange={(e) => setCustomProblem(e.target.value)}
              disabled={isGenerating}
            />
            <Button
              className="mt-6"
              onClick={handleGenerateFromCustom}
              disabled={!customProblem.trim() || isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Blueprint'}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
