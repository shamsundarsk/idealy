'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import LandingHero from '@/components/landing-hero'
import DiscoveryInterface from '@/components/discovery-interface'

export default function Home() {
  const [showDiscovery, setShowDiscovery] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {!showDiscovery ? (
        <>
          <LandingHero onGetStarted={() => setShowDiscovery(true)} />
          <FeatureSection />
        </>
      ) : (
        <DiscoveryInterface onBackToHome={() => setShowDiscovery(false)} />
      )}
    </main>
  )
}

function FeatureSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How Idealy Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three powerful steps to turn community problems into shipped products
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            step="1"
            title="Discover"
            description="Find real, validated problems from Reddit and online communities"
            icon="🔍"
          />
          <FeatureCard
            step="2"
            title="Blueprint"
            description="AI generates product blueprints with features, tech stack, and business model"
            icon="📋"
          />
          <FeatureCard
            step="3"
            title="Build"
            description="Get production-ready code and scaffolding to launch your product"
            icon="⚡"
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  step,
  title,
  description,
  icon,
}: {
  step: string
  title: string
  description: string
  icon: string
}) {
  return (
    <Card className="p-8 border-2 hover:border-primary transition-colors">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <Badge className="mb-3" variant="outline">
            Step {step}
          </Badge>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  )
}
