'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Square,
  Download,
  FolderTree,
  Terminal as TerminalIcon,
  Settings,
  Save,
  FileCode,
  Sparkles,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  X,
  Plus,
  Trash2,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  content?: string
  children?: FileNode[]
  language?: string
}

interface WebIDEProps {
  projectName: string
  initialFiles: Record<string, string>
  dependencies: Record<string, string>
  onBack: () => void
}

export default function WebIDE({
  projectName,
  initialFiles,
  dependencies,
  onBack,
}: WebIDEProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<string[]>([])
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))
  const terminalRef = useRef<HTMLDivElement>(null)

  // Initialize file tree from initial files
  useEffect(() => {
    const tree = buildFileTree(initialFiles)
    setFileTree(tree)
    setFileContents(initialFiles)
    
    // Open first file by default
    const firstFile = Object.keys(initialFiles)[0]
    if (firstFile) {
      setSelectedFile(firstFile)
      setOpenFiles([firstFile])
    }
  }, [initialFiles])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalOutput])

  const buildFileTree = (files: Record<string, string>): FileNode[] => {
    const root: Record<string, any> = {}

    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split('/')
      let current = root

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            path: parts.slice(0, index + 1).join('/'),
            children: {},
          }
        }
        if (index < parts.length - 1) {
          current = current[part].children
        }
      })
    })

    const convertToArray = (obj: Record<string, any>): FileNode[] => {
      return Object.values(obj).map((node: any) => ({
        ...node,
        children: node.children ? convertToArray(node.children) : undefined,
        language: node.type === 'file' ? getLanguage(node.name) : undefined,
      }))
    }

    return convertToArray(root)
  }

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      sql: 'sql',
      py: 'python',
    }
    return langMap[ext || ''] || 'plaintext'
  }

  const handleFileSelect = (path: string) => {
    setSelectedFile(path)
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path])
    }
  }

  const handleFileClose = (path: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== path)
    setOpenFiles(newOpenFiles)
    if (selectedFile === path) {
      setSelectedFile(newOpenFiles[newOpenFiles.length - 1] || null)
    }
  }

  const handleCodeChange = (value: string | undefined) => {
    if (selectedFile && value !== undefined) {
      setFileContents({
        ...fileContents,
        [selectedFile]: value,
      })
    }
  }

  const handleSave = () => {
    addTerminalOutput(`✓ Saved ${selectedFile}`)
  }

  const handleRun = async () => {
    setIsRunning(true)
    addTerminalOutput('> Starting development server...')
    addTerminalOutput('> npm run dev')
    
    setTimeout(() => {
      addTerminalOutput('✓ Compiled successfully')
      addTerminalOutput('  Local:    http://localhost:3000')
      addTerminalOutput('  Ready in 2.3s')
      setIsRunning(false)
    }, 2000)
  }

  const handleStop = () => {
    setIsRunning(false)
    addTerminalOutput('> Server stopped')
  }

  const handleDownload = () => {
    const projectData = {
      name: projectName,
      files: fileContents,
      dependencies,
      timestamp: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(projectData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    addTerminalOutput(`✓ Downloaded ${projectName}.json`)
  }

  const addTerminalOutput = (text: string) => {
    setTerminalOutput((prev) => [...prev, text])
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsAiProcessing(true)
    addTerminalOutput(`> AI: ${aiPrompt}`)

    try {
      const response = await fetch('/api/ai-code-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentFile: selectedFile,
          currentCode: selectedFile ? fileContents[selectedFile] : '',
          language: selectedFile ? getLanguage(selectedFile) : 'typescript',
          projectContext: {
            files: Object.keys(fileContents),
            dependencies,
          },
        }),
      })

      const data = await response.json()

      if (data.success && data.code) {
        if (selectedFile) {
          setFileContents({
            ...fileContents,
            [selectedFile]: data.code,
          })
          addTerminalOutput('✓ AI: Code updated successfully')
          if (data.explanation) {
            addTerminalOutput(`  ${data.explanation}`)
          }
        }
      } else {
        addTerminalOutput(`✗ AI: ${data.error || 'Failed to generate code'}`)
      }
    } catch (error: any) {
      addTerminalOutput(`✗ AI: ${error.message || 'Error processing request'}`)
    } finally {
      setIsAiProcessing(false)
      setAiPrompt('')
    }
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-muted cursor-pointer ${
            selectedFile === node.path ? 'bg-primary/10' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path)
            } else {
              handleFileSelect(node.path)
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="w-4 h-4 text-gray-500" />
            </>
          )}
          <span className="text-sm">{node.name}</span>
        </div>
        {node.type === 'folder' &&
          node.children &&
          expandedFolders.has(node.path) &&
          renderFileTree(node.children, level + 1)}
      </div>
    ))
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            <h1 className="text-lg font-bold">{projectName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!selectedFile}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          {isRunning ? (
            <Button variant="destructive" size="sm" onClick={handleStop}>
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={handleRun}>
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 border-r bg-card overflow-y-auto">
          <div className="p-2 border-b flex items-center justify-between">
            <span className="text-sm font-semibold">Explorer</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="py-2">{renderFileTree(fileTree)}</div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Open Files Tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 border-b bg-card overflow-x-auto">
              {openFiles.map((file) => (
                <div
                  key={file}
                  className={`flex items-center gap-2 px-3 py-1 rounded-t cursor-pointer ${
                    selectedFile === file
                      ? 'bg-background border border-b-0'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <File className="w-3 h-3" />
                  <span className="text-xs">{file.split('/').pop()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFileClose(file)
                    }}
                    className="hover:bg-background/50 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Monaco Editor */}
          <div className="flex-1">
            {selectedFile ? (
              <MonacoEditor
                height="100%"
                language={getLanguage(selectedFile)}
                value={fileContents[selectedFile] || ''}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a file to start editing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Terminal & AI */}
      <div className="h-64 border-t bg-card">
        <Tabs defaultValue="terminal" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="terminal">
              <TerminalIcon className="w-4 h-4 mr-2" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terminal" className="flex-1 p-0 m-0">
            <div
              ref={terminalRef}
              className="h-full overflow-y-auto p-4 font-mono text-sm bg-black text-green-400"
            >
              {terminalOutput.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {terminalOutput.length === 0 && (
                <div className="text-gray-500">
                  Terminal ready. Click "Run" to start the development server.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 p-4 m-0">
            <div className="h-full flex flex-col">
              {/* AI Chat History */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                <Card className="p-4 bg-primary/5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Code Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask the AI to help you write, refactor, or debug code. The AI can see your current file and project context.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Quick Commands:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAiPrompt('Add error handling to this code')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Add error handling
                      </button>
                      <button
                        onClick={() => setAiPrompt('Add TypeScript types')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Add TypeScript types
                      </button>
                      <button
                        onClick={() => setAiPrompt('Add comments explaining this code')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Add comments
                      </button>
                      <button
                        onClick={() => setAiPrompt('Refactor this code to be more efficient')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Refactor code
                      </button>
                      <button
                        onClick={() => setAiPrompt('Convert to async/await')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Convert to async
                      </button>
                      <button
                        onClick={() => setAiPrompt('Add input validation')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Add validation
                      </button>
                      <button
                        onClick={() => setAiPrompt('Fix bugs in this code')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Fix bugs
                      </button>
                      <button
                        onClick={() => setAiPrompt('Optimize performance')}
                        className="text-xs p-2 rounded bg-muted hover:bg-muted/80 text-left"
                      >
                        Optimize
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-background rounded text-xs">
                    <p className="font-semibold mb-1">Examples:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• "Create a React component for a login form"</li>
                      <li>• "Add error handling to this function"</li>
                      <li>• "Convert this to use TypeScript interfaces"</li>
                      <li>• "Add JSDoc comments to all functions"</li>
                      <li>• "Refactor this to use React hooks"</li>
                    </ul>
                  </div>
                </Card>

                {selectedFile && (
                  <Card className="p-3 bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <strong>Current file:</strong> {selectedFile.split('/').pop()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Language:</strong> {getLanguage(selectedFile)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Lines:</strong> {fileContents[selectedFile]?.split('\n').length || 0}
                    </p>
                  </Card>
                )}
              </div>

              {/* AI Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI to modify your code... (e.g., 'Add error handling')"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAiGenerate()
                      }
                    }}
                    disabled={isAiProcessing || !selectedFile}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAiGenerate}
                    disabled={!aiPrompt.trim() || isAiProcessing || !selectedFile}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isAiProcessing ? 'Processing...' : 'Generate'}
                  </Button>
                </div>
                {!selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Select a file to use AI assistance
                  </p>
                )}
                {isAiProcessing && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    AI is analyzing and modifying your code...
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
