'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LandingHeroProps {
  onGetStarted: () => void
}

export default function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <Badge className="mb-6" variant="secondary">
            AI-Powered Problem Discovery Platform
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
            Turn Community Problems Into Products
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed text-pretty">
            Idealy discovers real, validated problems from online communities and generates complete product blueprints and build-ready code powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold"
              onClick={onGetStarted}
            >
              Start Discovering →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold bg-transparent"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
            <div className="py-4 border-b border-border">
              <div className="font-bold text-lg">1000+</div>
              <div className="text-muted-foreground">Problems Found</div>
            </div>
            <div className="py-4 border-b border-border">
              <div className="font-bold text-lg">500+</div>
              <div className="text-muted-foreground">Blueprints Generated</div>
            </div>
            <div className="py-4 border-b border-border">
              <div className="font-bold text-lg">250+</div>
              <div className="text-muted-foreground">Products Launched</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
