'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWM } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  VS Code  (custom code viewer — no iframe)
 *
 *  Modes:
 *    • file      → opens a single file from a repo
 *    • workspace → opens the repo tree with sidebar
 *    • empty     → welcome screen
 *
 *  Fetches content via /api/github and /api/github/file
 * ═══════════════════════════════════════════════ */

/* ── Types ── */

interface TreeEntry {
  name: string
  type: 'file' | 'dir'
  path: string
  size?: number
}

interface OpenTab {
  id: string
  name: string
  path: string
  content: string | null
  loading: boolean
  error?: string
  language: string
}

interface VSCodeAppProps {
  windowId: string
  repo?: string
  filePath?: string
}

/* ── Language detection ── */

function detectLang(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', rs: 'rust', java: 'java', c: 'c', cpp: 'cpp', h: 'c',
    cs: 'csharp', go: 'go', rb: 'ruby', php: 'php', swift: 'swift',
    kt: 'kotlin', dart: 'dart', lua: 'lua', sh: 'shell', bash: 'shell',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    xml: 'xml', html: 'html', css: 'css', scss: 'scss', less: 'less',
    md: 'markdown', sql: 'sql', graphql: 'graphql',
    gradle: 'gradle',
  }
  const lower = filename.toLowerCase()
  if (lower === 'dockerfile') return 'docker'
  if (lower === 'makefile') return 'makefile'
  if (lower.endsWith('.gradle') || lower.endsWith('.gradle.kts')) return 'gradle'
  return map[ext] || 'text'
}

/* ── Minimal syntax coloring ── */

const KW_COLOR = '#569CD6'
const STR_COLOR = '#CE9178'
const CMT_COLOR = '#6A9955'
const NUM_COLOR = '#B5CEA8'
const TYPE_COLOR = '#4EC9B0'
const PUNCT_COLOR = '#D4D4D4'
const DEF_COLOR = '#D4D4D4'

function tokenizeLine(line: string, lang: string): { text: string; color: string }[] {
  const tokens: { text: string; color: string }[] = []

  if (lang === 'json') {
    const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|([{}[\],:])|(\s+)|([^\s"{}[\],:]+)/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(line)) !== null) {
      if (m[1]) tokens.push({ text: m[1], color: '#9CDCFE' })
      else if (m[2]) tokens.push({ text: m[2], color: STR_COLOR })
      else if (m[3]) tokens.push({ text: m[3], color: KW_COLOR })
      else if (m[4]) tokens.push({ text: m[4], color: NUM_COLOR })
      else if (m[5]) tokens.push({ text: m[5], color: PUNCT_COLOR })
      else tokens.push({ text: m[0], color: DEF_COLOR })
    }
    return tokens.length ? tokens : [{ text: line, color: DEF_COLOR }]
  }

  if (lang === 'markdown') {
    if (line.startsWith('#')) return [{ text: line, color: KW_COLOR }]
    if (line.startsWith('- ') || line.startsWith('* ')) return [{ text: line, color: DEF_COLOR }]
    if (line.startsWith('```')) return [{ text: line, color: STR_COLOR }]
    if (line.startsWith('>')) return [{ text: line, color: CMT_COLOR }]
    return [{ text: line, color: DEF_COLOR }]
  }

  // Generic code highlighting
  const keywords = new Set([
    'import','export','from','const','let','var','function','return',
    'if','else','for','while','do','switch','case','break','continue',
    'class','extends','implements','interface','type','enum','struct',
    'new','this','super','null','undefined','true','false','void',
    'async','await','try','catch','finally','throw','typeof','instanceof',
    'in','of','as','is','def','self','fn','pub','use','mod','crate',
    'impl','trait','where','mut','ref','match','loop','move',
    'static','final','abstract','override','private','protected','public',
    'package','default','yield','with','lambda','raise','except','pass',
    'print','println','printf',
  ])

  const types = new Set([
    'string','number','boolean','any','never','unknown','object',
    'int','float','double','char','byte','long','short',
    'i8','i16','i32','i64','u8','u16','u32','u64','f32','f64',
    'bool','str','usize','isize',
    'Array','Map','Set','Promise','Record','String','Vec','Option','Result',
    'None','Some','Ok','Err',
  ])

  const trimmed = line.trimStart()
  if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--')) {
    return [{ text: line, color: CMT_COLOR }]
  }

  const regex = /(\/\/.*$|\/\*.*?\*\/|#.*$)|(["'`](?:[^"'`\\]|\\.)*["'`])|(\b\d+\.?\d*\b)|(\b[A-Za-z_]\w*\b)|([^\w\s]+)|(\s+)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(line)) !== null) {
    if (m[1]) tokens.push({ text: m[1], color: CMT_COLOR })
    else if (m[2]) tokens.push({ text: m[2], color: STR_COLOR })
    else if (m[3]) tokens.push({ text: m[3], color: NUM_COLOR })
    else if (m[4]) {
      const w = m[4]
      if (keywords.has(w)) tokens.push({ text: w, color: KW_COLOR })
      else if (types.has(w)) tokens.push({ text: w, color: TYPE_COLOR })
      else if (/^[A-Z]/.test(w)) tokens.push({ text: w, color: TYPE_COLOR })
      else tokens.push({ text: w, color: DEF_COLOR })
    }
    else if (m[5]) tokens.push({ text: m[5], color: PUNCT_COLOR })
    else tokens.push({ text: m[0], color: DEF_COLOR })
  }

  return tokens.length ? tokens : [{ text: line, color: DEF_COLOR }]
}

/* ── File icon for sidebar ── */

function fileIcon(name: string, type: 'file' | 'dir'): string {
  if (type === 'dir') return '📁'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const icons: Record<string, string> = {
    ts: '🟦', tsx: '⚛️', js: '🟨', jsx: '⚛️',
    py: '🐍', rs: '🦀', java: '☕', c: '🔧', cpp: '🔧', h: '📐',
    json: '📋', yaml: '📋', yml: '📋', toml: '📋',
    md: '📝', txt: '📝', html: '🌐', css: '🎨', scss: '🎨',
    png: '🖼️', jpg: '🖼️', svg: '🖼️', gif: '🖼️', ico: '🖼️',
    sh: '🐚',
  }
  return icons[ext] || '📄'
}

/* ═══════════════════════════════════════════════ */

export function VSCodeApp({ windowId, repo, filePath }: VSCodeAppProps) {
  const wm = useWM()

  // ── Sidebar tree ──
  const [tree, setTree] = useState<TreeEntry[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Record<string, TreeEntry[]>>({})
  const [loadingDirs, setLoadingDirs] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── Tabs ──
  const [tabs, setTabs] = useState<OpenTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null

  // ── Scroll ref ──
  const codeRef = useRef<HTMLDivElement>(null)

  // Update window title
  useEffect(() => {
    const title = activeTab
      ? `${activeTab.name} - VS Code`
      : repo
        ? `${repo.split('/').pop()} - VS Code`
        : 'VS Code'
    wm.updateTitle(windowId, title)
  }, [wm, windowId, activeTab, repo])

  // ── Load root tree ──
  useEffect(() => {
    if (!repo) return
    fetchTree(repo, '').then(setTree).catch(() => {})
  }, [repo])

  // ── Open initial file if provided ──
  const initialFileOpened = useRef(false)
  useEffect(() => {
    if (repo && filePath && !initialFileOpened.current) {
      initialFileOpened.current = true
      openFile(filePath)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, filePath])

  async function fetchTree(r: string, path: string): Promise<TreeEntry[]> {
    // Accept full URLs too
    let repoClean = r
    const ghMatch = r.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/)
    if (ghMatch) repoClean = ghMatch[1]

    const url = `/api/github?repo=${encodeURIComponent(repoClean)}&path=${encodeURIComponent(path) || '/'   }`
    const res = await fetch(url)
    const data = await res.json()
    if (data.type === 'dir' && Array.isArray(data.items)) {
      return (data.items as TreeEntry[]).sort((a: TreeEntry, b: TreeEntry) => {
        if (a.type === b.type) return a.name.localeCompare(b.name)
        return a.type === 'dir' ? -1 : 1
      })
    }
    return []
  }

  const toggleDir = useCallback(async (path: string) => {
    if (expandedDirs[path]) {
      setExpandedDirs((prev) => {
        const next = { ...prev }
        delete next[path]
        return next
      })
      return
    }
    if (!repo) return
    setLoadingDirs((prev) => new Set(prev).add(path))
    try {
      const entries = await fetchTree(repo, path)
      setExpandedDirs((prev) => ({ ...prev, [path]: entries }))
    } catch { /* ignore */ }
    setLoadingDirs((prev) => {
      const next = new Set(prev)
      next.delete(path)
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, expandedDirs])

  const openFile = useCallback(async (path: string) => {
    // Check if already open
    const existing = tabs.find((t) => t.id === path)
    if (existing) {
      setActiveTabId(path)
      return
    }

    const name = path.split('/').pop() || path
    const lang = detectLang(name)

    const newTab: OpenTab = {
      id: path,
      name,
      path,
      content: null,
      loading: true,
      language: lang,
    }

    setTabs((prev) => [...prev, newTab])
    setActiveTabId(path)

    if (!repo) return
    try {
      const res = await fetch(`/api/github/file?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path) || '/'}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const text = await res.text()
      setTabs((prev) =>
        prev.map((t) => (t.id === path ? { ...t, content: text, loading: false } : t)),
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur'
      setTabs((prev) =>
        prev.map((t) => (t.id === path ? { ...t, error: msg, loading: false } : t)),
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, tabs])

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(next.length > 0 ? next[next.length - 1].id : null)
      }
      return next
    })
  }, [activeTabId])

  // ── Render tree recursively ──
  function renderTree(entries: TreeEntry[], depth: number) {
    return entries.map((entry) => {
      const isExpanded = !!expandedDirs[entry.path]
      const isLoading = loadingDirs.has(entry.path)
      const isActive = activeTabId === entry.path

      return (
        <div key={entry.path}>
          <div
            onClick={() => {
              if (entry.type === 'dir') toggleDir(entry.path)
              else openFile(entry.path)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              paddingLeft: depth * 16 + 6,
              cursor: 'pointer',
              background: isActive ? '#37373D' : 'transparent',
              color: '#CCC',
              fontSize: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.background = '#2A2D2E'
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            {entry.type === 'dir' && (
              <span style={{ fontSize: 10, width: 10, textAlign: 'center', color: '#888', flexShrink: 0 }}>
                {isLoading ? '⏳' : isExpanded ? '▼' : '▶'}
              </span>
            )}
            {entry.type === 'file' && <span style={{ width: 10, flexShrink: 0 }} />}
            <span style={{ fontSize: 13, flexShrink: 0 }}>{fileIcon(entry.name, entry.type)}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</span>
          </div>
          {isExpanded && expandedDirs[entry.path] && renderTree(expandedDirs[entry.path], depth + 1)}
        </div>
      )
    })
  }

  // ── Welcome screen ──
  function renderWelcome() {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        color: '#666', fontFamily: 'Consolas, monospace',
      }}>
        <span style={{ fontSize: 40 }}>📝</span>
        <span style={{ fontSize: 16, color: '#888' }}>
          {repo ? `${repo.split('/').pop()}` : 'VS Code'}
        </span>
        <span style={{ fontSize: 12, color: '#555' }}>
          {repo ? 'Cliquez sur un fichier dans l\'explorateur' : 'Aucun dossier ouvert'}
        </span>
      </div>
    )
  }

  // ── Code view ──
  function renderCode() {
    if (!activeTab) return renderWelcome()

    if (activeTab.loading) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
          Chargement...
        </div>
      )
    }

    if (activeTab.error) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F44' }}>
          Erreur : {activeTab.error}
        </div>
      )
    }

    // Image files
    const ext = activeTab.name.split('.').pop()?.toLowerCase() ?? ''
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext) && repo) {
      const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${activeTab.path}`
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e', overflow: 'auto' }}>
          <img src={rawUrl} alt={activeTab.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )
    }

    const lines = (activeTab.content || '').split('\n')
    const gutterW = Math.max(String(lines.length).length * 9 + 16, 40)

    return (
      <div ref={codeRef} style={{ flex: 1, overflow: 'auto', background: '#1e1e1e', position: 'relative' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, lineHeight: '18px' }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td style={{
                  width: gutterW, minWidth: gutterW,
                  textAlign: 'right', paddingRight: 12, paddingLeft: 8,
                  color: '#858585', userSelect: 'none',
                  borderRight: '1px solid #333',
                  verticalAlign: 'top', background: '#1e1e1e',
                  position: 'sticky', left: 0,
                }}>
                  {i + 1}
                </td>
                <td style={{ paddingLeft: 12, whiteSpace: 'pre', color: '#D4D4D4' }}>
                  {tokenizeLine(line, activeTab.language).map((tok, j) => (
                    <span key={j} style={{ color: tok.color }}>{tok.text}</span>
                  ))}
                  {line.length === 0 && '\u00A0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', color: '#CCC', fontFamily: '"Segoe UI", Tahoma, sans-serif', fontSize: 13 }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        background: '#252526', borderBottom: '1px solid #1e1e1e',
        padding: '0 8px', height: 30, flexShrink: 0,
      }}>
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          style={{
            background: sidebarOpen ? '#37373D' : 'transparent',
            border: 'none', color: '#CCC', fontSize: 14,
            padding: '2px 6px', borderRadius: 3, cursor: 'pointer',
          }}
          title="Explorateur"
        >
          📁
        </button>

        <div style={{ flex: 1, display: 'flex', gap: 1, overflow: 'hidden', marginLeft: 8 }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px',
                background: tab.id === activeTabId ? '#1e1e1e' : '#2D2D2D',
                borderTop: tab.id === activeTabId ? '1px solid #0078D4' : '1px solid transparent',
                cursor: 'pointer', fontSize: 12, maxWidth: 140,
                color: tab.id === activeTabId ? '#fff' : '#999',
                whiteSpace: 'nowrap', overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 11 }}>{fileIcon(tab.name, 'file')}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.name}</span>
              <span
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                style={{ color: '#888', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#fff')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#888')}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main area: sidebar + code ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarOpen && repo && (
          <div style={{
            width: 200, minWidth: 200, background: '#252526',
            borderRight: '1px solid #1e1e1e',
            overflow: 'auto', flexShrink: 0,
          }}>
            <div style={{
              padding: '6px 8px', fontSize: 11, fontWeight: 700,
              color: '#BBB', textTransform: 'uppercase', letterSpacing: 0.5,
              background: '#252526', position: 'sticky', top: 0,
            }}>
              Explorateur
            </div>
            <div style={{
              padding: '2px 0 2px 0', fontSize: 12, fontWeight: 600,
              color: '#CCC', paddingLeft: 8, background: '#2D2D30',
              borderBottom: '1px solid #1e1e1e',
            }}>
              {repo.split('/').pop()?.toUpperCase()}
            </div>
            {tree.length === 0 ? (
              <div style={{ padding: 8, color: '#666', fontSize: 12 }}>Chargement...</div>
            ) : (
              renderTree(tree, 0)
            )}
          </div>
        )}

        {renderCode()}
      </div>

      {/* ── Status bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#007ACC', padding: '0 10px', height: 22, flexShrink: 0,
        fontSize: 11, color: '#fff',
      }}>
        <span>{repo || 'Aucun dossier'}</span>
        <span>
          {activeTab ? `${activeTab.language.toUpperCase()} • ${activeTab.path}` : 'Bienvenue'}
        </span>
      </div>
    </div>
  )
}
