'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ChevronRight } from 'lucide-react'

interface Problem {
  id: string
  title: string
  category: string
  votes: number
  platform: string
  description: string
  tags: string[]
}

interface ProblemCardProps {
  problem: Problem
  onSelect: () => void
}

export default function ProblemCard({ problem, onSelect }: ProblemCardProps) {
  const [votes, setVotes] = useState(problem.votes)
  const [liked, setLiked] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (liked) {
      setVotes(votes - 1)
      setLiked(false)
    } else {
      setVotes(votes + 1)
      setLiked(true)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{problem.category}</Badge>
            <Badge variant="secondary">{problem.platform}</Badge>
          </div>
          <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 whitespace-nowrap ml-4 px-3 py-1 rounded-lg transition-colors ${
            liked
              ? 'bg-primary text-primary-foreground'
              : 'text-primary hover:bg-primary/10'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span className="font-semibold">{votes}</span>
        </button>
      </div>

      <p className="text-muted-foreground mb-4">{problem.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {problem.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Button
          size="sm"
          className="ml-2"
          onClick={onSelect}
        >
          Generate <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
