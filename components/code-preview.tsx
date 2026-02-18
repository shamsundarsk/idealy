'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, FileCode, Edit, Save, X } from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  ),
})

interface CodeSnippet {
  filename: string
  code: string
  language: string
}

interface CodePreviewProps {
  snippets: CodeSnippet[]
  projectName: string
  dependencies: Record<string, string>
  schema: string
}

export default function CodePreview({
  snippets,
  projectName,
  dependencies,
  schema,
}: CodePreviewProps) {
  const [selectedSnippet, setSelectedSnippet] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSnippets, setEditedSnippets] = useState<CodeSnippet[]>(snippets)
  const [editedCode, setEditedCode] = useState('')

  const currentSnippet = editedSnippets[selectedSnippet]

  // If no snippets, show empty state
  if (!snippets || snippets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Code Generated</h3>
        <p className="text-muted-foreground">
          Code generation is in progress or failed. Please try again.
        </p>
      </Card>
    )
  }

  // If currentSnippet is undefined, reset to first snippet
  if (!currentSnippet && editedSnippets.length > 0) {
    setSelectedSnippet(0)
    return null
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(currentSnippet?.filename || 'file')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleEdit = () => {
    setEditedCode(currentSnippet?.code || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    const updatedSnippets = [...editedSnippets]
    updatedSnippets[selectedSnippet] = {
      ...currentSnippet,
      code: editedCode,
    }
    setEditedSnippets(updatedSnippets)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCode('')
    setIsEditing(false)
  }

  const handleDownloadProject = async () => {
    const allContent = {
      projectName,
      snippets: editedSnippets,
      dependencies,
      schema,
      timestamp: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(allContent, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName}-scaffold.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getLanguageForMonaco = (lang: string) => {
    const languageMap: Record<string, string> = {
      typescript: 'typescript',
      javascript: 'javascript',
      sql: 'sql',
      markdown: 'markdown',
      json: 'json',
      tsx: 'typescript',
      jsx: 'javascript',
    }
    return languageMap[lang] || 'plaintext'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Production-Ready Code</h2>
        </div>
        <Button onClick={handleDownloadProject} size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Project
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* File list */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Project Files</h3>
            <div className="space-y-2">
              {editedSnippets.map((snippet, idx) => (
                <button
                  key={snippet.filename}
                  onClick={() => {
                    setSelectedSnippet(idx)
                    setIsEditing(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    selectedSnippet === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {snippet.filename.split('/').pop()}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Code viewer/editor */}
        <div className="md:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentSnippet?.language || 'text'}</Badge>
                <span className="font-mono text-sm text-muted-foreground">
                  {currentSnippet?.filename || 'file'}
                </span>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(currentSnippet?.code || '')}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {copiedId === currentSnippet?.filename ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="border rounded-lg overflow-hidden">
                <MonacoEditor
                  height="500px"
                  language={getLanguageForMonaco(currentSnippet?.language || 'text')}
                  value={editedCode}
                  onChange={(value) => setEditedCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg overflow-x-auto max-h-[500px]">
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                  <code>{currentSnippet?.code || ''}</code>
                </pre>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Database schema section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Database Schema</h3>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto max-h-64">
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
            <code>{schema}</code>
          </pre>
        </div>
      </Card>

      {/* Dependencies section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Dependencies</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(dependencies).map(([name, version]) => (
            <div key={name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-mono text-sm">{name}</span>
              <Badge variant="outline">{version}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Setup instructions */}
      <Card className="p-6 bg-primary/5 border-primary">
        <h3 className="text-xl font-bold mb-4">Quick Start</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <span>Download the project scaffold</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <span>Run <code className="bg-muted px-2 py-1 rounded font-mono text-xs">npm install</code></span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <span>Configure your database (Supabase, Neon, etc.)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">4.</span>
            <span>Run <code className="bg-muted px-2 py-1 rounded font-mono text-xs">npm run dev</code></span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-primary">5.</span>
            <span>Start building your features</span>
          </li>
        </ol>
      </Card>
    </div>
  )
}
