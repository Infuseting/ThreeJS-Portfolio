'use client'

import { useState, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import { useWM } from '@/components/xp/core/WindowManager'
import { formatSize } from '@/utils/format/formatSize'
import { unlockAchievement } from '@/components/stores/AchievementStore'

/* ═══════════════════════════════════════════════
 *  File Explorer  (Windows XP style)
 *
 *  - Reads /computer_storage via a static manifest
 *    (/computer_storage/manifest.json) at the root,
 *    then fetches sub-dirs lazily from GitHub API
 *    when a .gitlink.json is encountered.
 *  - .gitlink.json  → opens as a folder showing the
 *    GitHub repo contents navigable in the explorer.
 *  - .weblink.json  → double-click opens Internet Explorer
 * ═══════════════════════════════════════════════ */

/* ── Types ── */

interface FSEntry {
  name: string
  type: 'file' | 'dir' | 'gitlink' | 'weblink'
  /** For gitlink: the parsed JSON */
  meta?: Record<string, unknown>
  /** For dir: sub-path under computer_storage */
  path?: string
  /** Size in bytes (files) */
  size?: number
  /** Extension */
  ext?: string
}

interface BreadCrumb {
  label: string
  /** 'local' | 'github' */
  source: 'local' | 'github'
  /** For local: relative path under /computer_storage */
  localPath?: string
  /** For github: repo + path */
  repo?: string
  repoPath?: string
}

/* ── Icons by extension ── */
function getIcon(entry: FSEntry): string {
  if (entry.type === 'dir') return '📁'
  if (entry.type === 'gitlink') return '📦'
  if (entry.type === 'weblink') return '🌐'
  const ext = entry.ext?.toLowerCase()
  if (!ext) return '📄'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return '🖼️'
  if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) return '📜'
  if (['json'].includes(ext)) return '📋'
  if (['md', 'txt'].includes(ext)) return '📝'
  if (['css', 'scss'].includes(ext)) return '🎨'
  if (['html'].includes(ext)) return '🌐'
  return '📄'
}

function getExt(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1) : ''
}

/* ── Component ── */

interface FileExplorerProps {
  windowId: string
  initialPath?: string
}

export function FileExplorer({ windowId, initialPath = '' }: FileExplorerProps) {
  const wm = useWM()

  const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumb[]>([
    { label: 'Poste de travail', source: 'local', localPath: initialPath || '' },
  ])
  const [entries, setEntries] = useState<FSEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const current = breadcrumbs[breadcrumbs.length - 1]

  /* ── Load entries for current breadcrumb ── */
  const loadEntries = useCallback(async (crumb: BreadCrumb) => {
    setLoading(true)
    setError(null)
    setEntries([])

    try {
      if (crumb.source === 'local') {
        if (!crumb.localPath) {
          unlockAchievement('curieux')
        }

        // Fetch the manifest for this local path
        const manifestUrl = crumb.localPath
          ? `/computer_storage/${crumb.localPath}/manifest.json`
          : '/computer_storage/manifest.json'

        const res = await fetch(manifestUrl)
        if (!res.ok) throw new Error(`Impossible de charger le dossier`)
        const manifest: string[] = await res.json()

        // Parse each entry
        const parsed: FSEntry[] = []
        for (const name of manifest) {
          const fullPath = crumb.localPath ? `${crumb.localPath}/${name}` : name

          if (name.endsWith('.gitlink.json')) {
            // Fetch the gitlink json
            try {
              const r = await fetch(`/computer_storage/${fullPath}`)
              const meta = await r.json()
              parsed.push({
                name: name.replace('.gitlink.json', ''),
                type: 'gitlink',
                meta,
                path: fullPath,
              })
            } catch {
              parsed.push({ name, type: 'file', ext: 'json', path: fullPath })
            }
          } else if (name.endsWith('.weblink.json')) {
            try {
              const r = await fetch(`/computer_storage/${fullPath}`)
              const meta = await r.json()
              parsed.push({
                name: (meta.name as string) || name.replace('.weblink.json', ''),
                type: 'weblink',
                meta,
                path: fullPath,
              })
            } catch {
              parsed.push({ name, type: 'file', ext: 'json', path: fullPath })
            }
          } else if (!name.includes('.')) {
            // No extension = assume directory
            parsed.push({ name, type: 'dir', path: fullPath })
          } else {
            parsed.push({ name, type: 'file', ext: getExt(name), path: fullPath })
          }
        }

        setEntries(parsed)
      } else if (crumb.source === 'github') {
        // GitHub API
        const url = `/api/github?repo=${encodeURIComponent(crumb.repo!)}&path=${encodeURIComponent(crumb.repoPath || '/')}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error('Impossible de contacter GitHub. Réessayez plus tard.')
        }
        const data = await res.json()

        if (data.error) throw new Error(data.error)

        if (data.type === 'dir') {
          const items: FSEntry[] = (data.items as Array<{ name: string; type: string; size?: number; path: string }>).map((item) => ({
            name: item.name,
            type: item.type === 'dir' ? 'dir' : 'file',
            size: item.size,
            ext: getExt(item.name),
            path: item.path,
          }))
          // Sort: dirs first, then files
          items.sort((a, b) => {
            if (a.type === 'dir' && b.type !== 'dir') return -1
            if (a.type !== 'dir' && b.type === 'dir') return 1
            return a.name.localeCompare(b.name)
          })
          setEntries(items)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on breadcrumb change
  useEffect(() => {
    loadEntries(current)
  }, [current, loadEntries])

  // Update window title
  useEffect(() => {
    wm.updateTitle(windowId, current.label)
  }, [wm, windowId, current.label])

  /* ── Navigation ── */
  const navigateTo = useCallback((crumb: BreadCrumb) => {
    setBreadcrumbs((prev) => [...prev, crumb])
  }, [])

  const navigateBack = useCallback(() => {
    setBreadcrumbs((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const navigateToBreadcrumb = useCallback((idx: number) => {
    setBreadcrumbs((prev) => prev.slice(0, idx + 1))
  }, [])

  /* ── Open file/workspace in VS Code ── */
  const openInVSCode = useCallback((repo: string, filePath?: string) => {
    wm.openWindow('vscode', {
      title: filePath ? `${filePath.split('/').pop()} - VS Code` : `${repo} - VS Code`,
      icon: '💻',
      w: 950,
      h: 700,
      payload: { repo, filePath: filePath || '' },
    })
  }, [wm])

  /* ── Context menu state ── */
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; entry: FSEntry } | null>(null)

  const onContextMenu = useCallback((e: ReactMouseEvent, entry?: FSEntry) => {
    e.preventDefault()
    e.stopPropagation()
    // Position relative to the file explorer content area
    const rect = (e.currentTarget as HTMLElement).closest('table')?.parentElement?.getBoundingClientRect()
    const x = rect ? e.clientX - rect.left : e.clientX
    const y = rect ? e.clientY - rect.top : e.clientY
    // Fallback to empty entry for general context menu
    setCtxMenu({ x, y, entry: entry || { name: '', type: 'dir' } })
  }, [])

  // Close context menu on any click
  const closeCtxMenu = useCallback(() => setCtxMenu(null), [])

  /* ── Double-click handler ── */
  const onDoubleClick = useCallback(
    async (entry: FSEntry) => {
      if (entry.type === 'dir') {
        if (current.source === 'local') {
          navigateTo({
            label: entry.name,
            source: 'local',
            localPath: entry.path,
          })
        } else if (current.source === 'github') {
          navigateTo({
            label: entry.name,
            source: 'github',
            repo: current.repo,
            repoPath: entry.path,
          })
        }
      } else if (entry.type === 'gitlink') {
        const meta = entry.meta as { git_url?: string; image?: string } | undefined
        if (!meta?.git_url) return

        // Fetch repo metadata for the name
        try {
          const res = await fetch(`/api/github?repo=${encodeURIComponent(meta.git_url)}`)
          const repoData = await res.json()
          navigateTo({
            label: repoData.name || meta.git_url,
            source: 'github',
            repo: meta.git_url,
            repoPath: '',
          })
        } catch {
          navigateTo({
            label: meta.git_url,
            source: 'github',
            repo: meta.git_url,
            repoPath: '',
          })
        }
      } else if (entry.type === 'weblink') {
        const meta = entry.meta as { url?: string; name?: string } | undefined
        if (!meta?.url) return
        wm.openWindow('internet-explorer', {
          title: meta.name || 'Internet Explorer',
          icon: '🌐',
          w: 900,
          h: 650,
          payload: { url: meta.url },
        })
      } else if (entry.type === 'file' && current.source === 'github' && current.repo) {
        // Double-click a file in a GitHub repo → open in VS Code
        openInVSCode(current.repo, entry.path)
      }
    },
    [current, navigateTo, wm, openInVSCode],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Tahoma, sans-serif', fontSize: 13, color: '#000' }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          background: '#ECE9D8',
          borderBottom: '1px solid #ACA899',
        }}
      >
        <button
          onClick={navigateBack}
          disabled={breadcrumbs.length <= 1}
          style={{
            background: breadcrumbs.length > 1 ? 'linear-gradient(180deg,#fff,#E3DFD5)' : '#ECE9D8',
            border: '1px solid #ACA899',
            borderRadius: 3,
            padding: '2px 10px',
            fontSize: 13,
            cursor: breadcrumbs.length > 1 ? 'pointer' : 'default',
            color: breadcrumbs.length > 1 ? '#000' : '#999',
          }}
        >
          ← Précédent
        </button>
        <button
          onClick={() => loadEntries(current)}
          style={{
            background: 'linear-gradient(180deg,#fff,#E3DFD5)',
            border: '1px solid #ACA899',
            borderRadius: 3,
            padding: '2px 10px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🔄
        </button>
      </div>

      {/* ── Address bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 8px',
          background: '#fff',
          borderBottom: '1px solid #ACA899',
          fontSize: 13,
        }}
      >
        <span style={{ color: '#666', flexShrink: 0 }}>Adresse :</span>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            overflowX: 'auto',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
          }}
          ref={(el) => {
            if (el) el.scrollLeft = el.scrollWidth
          }}
        >
          {breadcrumbs.map((bc, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {i > 0 && <span style={{ margin: '0 2px', color: '#888' }}>{' ▸ '}</span>}
              <span
                onClick={() => navigateToBreadcrumb(i)}
                style={{
                  cursor: 'pointer',
                  color: '#0054E3',
                  textDecoration: i < breadcrumbs.length - 1 ? 'underline' : 'none',
                  fontWeight: i === breadcrumbs.length - 1 ? 'bold' : 'normal',
                }}
              >
                {bc.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div onContextMenu={(e) => onContextMenu(e)} onClick={closeCtxMenu} style={{ flex: 1, overflow: 'auto', background: '#fff', padding: 4, position: 'relative' }}>
        {loading && (
          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
            Chargement...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              color: '#C00',
              background: '#FFF0F0',
              border: '1px solid #FAA',
              margin: 8,
              borderRadius: 4,
            }}
          >
            ⚠️ {error}
            <br />
            <button
              onClick={() => loadEntries(current)}
              style={{
                marginTop: 8,
                padding: '4px 16px',
                background: '#ECE9D8',
                border: '1px solid #ACA899',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
            Ce dossier est vide.
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#ECE9D8', borderBottom: '1px solid #ACA899' }}>
                <th style={{ textAlign: 'left', padding: '3px 8px', fontWeight: 'normal' }}>Nom</th>
                <th style={{ textAlign: 'right', padding: '3px 8px', fontWeight: 'normal', width: 90 }}>Taille</th>
                <th style={{ textAlign: 'left', padding: '3px 8px', fontWeight: 'normal', width: 80 }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <FileRow
                  key={`${entry.name}-${i}`}
                  entry={entry}
                  isSelected={selectedEntry === entry.name}
                  onSelect={() => setSelectedEntry(entry.name)}
                  onDoubleClick={() => onDoubleClick(entry)}
                  onContextMenu={(e) => onContextMenu(e as ReactMouseEvent, entry)}
                />
              ))}
            </tbody>
          </table>
        )}

        {/* ── Context menu ── */}
        {ctxMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: ctxMenu.y,
              left: ctxMenu.x,
              background: '#fff',
              border: '1px solid #ACA899',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.25)',
              minWidth: 180,
              padding: '3px 0',
              zIndex: 9999,
              fontSize: 13,
            }}
          >
            {/* Context Menu for empty space vs files */}
            {!ctxMenu.entry.name ? (
              <CtxMenuItem
                label="Afficher les fichiers cachés"
                icon="👁️"
                onClick={() => {
                  unlockAchievement('cachotier')
                  closeCtxMenu()
                }}
              />
            ) : (
              <>
                {/* File → "Ouvrir avec VS Code" */}
                {ctxMenu.entry.type === 'file' && current.source === 'github' && current.repo && (
                  <CtxMenuItem
                    label="Ouvrir avec VS Code"
                    icon="💻"
                    onClick={() => {
                      openInVSCode(current.repo!, ctxMenu.entry.path)
                      closeCtxMenu()
                    }}
                  />
                )}

                {/* File → "Ouvrir" (double-click behavior) */}
                {ctxMenu.entry.type === 'file' && (
                  <CtxMenuItem
                    label="Ouvrir"
                    icon="📄"
                    onClick={() => {
                      onDoubleClick(ctxMenu.entry)
                      closeCtxMenu()
                    }}
                  />
                )}

                {/* Directory → "Ouvrir" */}
                {ctxMenu.entry.type === 'dir' && (
                  <CtxMenuItem
                    label="Ouvrir"
                    icon="📂"
                    onClick={() => {
                      onDoubleClick(ctxMenu.entry)
                      closeCtxMenu()
                    }}
                  />
                )}

                {/* Directory in GitHub → "Ouvrir en workspace dans VS Code" */}
                {ctxMenu.entry.type === 'dir' && current.source === 'github' && current.repo && (
                  <CtxMenuItem
                    label="Ouvrir en workspace dans VS Code"
                    icon="💻"
                    onClick={() => {
                      openInVSCode(current.repo!)
                      closeCtxMenu()
                    }}
                  />
                )}

                {/* Gitlink → "Ouvrir" */}
                {ctxMenu.entry.type === 'gitlink' && (
                  <CtxMenuItem
                    label="Ouvrir"
                    icon="📂"
                    onClick={() => {
                      onDoubleClick(ctxMenu.entry)
                      closeCtxMenu()
                    }}
                  />
                )}

                {/* Gitlink → "Ouvrir en workspace dans VS Code" */}
                {ctxMenu.entry.type === 'gitlink' && (() => {
                  const meta = ctxMenu.entry.meta as { git_url?: string } | undefined
                  return meta?.git_url ? (
                    <CtxMenuItem
                      label="Ouvrir en workspace dans VS Code"
                      icon="💻"
                      onClick={() => {
                        openInVSCode(meta.git_url!)
                        closeCtxMenu()
                      }}
                    />
                  ) : null
                })()}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div
        style={{
          padding: '3px 10px',
          background: '#ECE9D8',
          borderTop: '1px solid #ACA899',
          fontSize: 12,
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{entries.length} élément(s)</span>
        <span>{current.source === 'github' ? `GitHub: ${current.repo}` : 'Local'}</span>
      </div>
    </div>
  )
}

/* ── File row ── */

function FileRow({
  entry,
  isSelected,
  onSelect,
  onDoubleClick,
  onContextMenu,
}: {
  entry: FSEntry
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}) {
  return (
    <tr
      onPointerDown={onSelect}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={(e) => {
        onSelect()
        // Set the drag payload to be the file name and type so Clippy knows what was dropped
        e.dataTransfer.setData('text/plain', JSON.stringify({ name: entry.name, type: entry.type }))
        e.dataTransfer.effectAllowed = 'copyMove'
      }}
      style={{
        background: isSelected ? '#316AC5' : 'transparent',
        color: isSelected ? '#fff' : '#000',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <td style={{ padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 18 }}>{getIcon(entry)}</span>
        <span>{entry.name}</span>
      </td>
      <td style={{ padding: '2px 8px', textAlign: 'right' }}>
        {entry.type === 'file' ? formatSize(entry.size) : ''}
      </td>
      <td style={{ padding: '2px 8px' }}>
        {entry.type === 'dir' ? 'Dossier' : entry.type === 'gitlink' ? 'Dépôt Git' : entry.type === 'weblink' ? 'Lien Web' : (entry.ext?.toUpperCase() || 'Fichier')}
      </td>
    </tr>
  )
}

/* ── Context menu item ── */

function CtxMenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: hover ? '#316AC5' : 'transparent',
        color: hover ? '#fff' : '#000',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}
