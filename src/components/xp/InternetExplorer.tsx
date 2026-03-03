'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useWM } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  Internet Explorer  (Windows XP style)
 *
 *  Multi-tab, but inactive tabs are unloaded.
 *  Each tab stores its URL; only the active tab
 *  renders an iframe.
 *  By default opens google.com for search.
 * ═══════════════════════════════════════════════ */

interface Tab {
  id: string
  title: string
  url: string
}

interface InternetExplorerProps {
  windowId: string
  initialUrl?: string
}

export function InternetExplorer({ windowId, initialUrl }: InternetExplorerProps) {
  const wm = useWM()

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Page d\'accueil',
      url: initialUrl || 'https://www.google.com/webhp?igu=1',
    },
  ])
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [addressValue, setAddressValue] = useState(initialUrl || 'https://www.google.com')
  const tabCounter = useRef(1)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  // Update window title based on active tab
  useEffect(() => {
    if (activeTab) {
      wm.updateTitle(windowId, `${activeTab.title} - Internet Explorer`)
    }
  }, [wm, windowId, activeTab?.title])

  // Update address bar when switching tabs
  useEffect(() => {
    if (activeTab) {
      setAddressValue(activeTab.url)
    }
  }, [activeTabId, activeTab?.url])

  const navigate = useCallback((url: string) => {
    let finalUrl = url.trim()
    if (!finalUrl) return

    // If it looks like a URL (has a dot or starts with http), treat as URL
    if (/^https?:\/\//i.test(finalUrl)) {
      // already valid
    } else if (/^[\w-]+\.\w/.test(finalUrl)) {
      // Looks like a domain (e.g. "google.com", "example.org/path")
      finalUrl = `https://${finalUrl}`
    } else {
      // Plain text → Google search
      finalUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(finalUrl)}`
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url: finalUrl, title: new URL(finalUrl).hostname } : t
      ),
    )
    setAddressValue(finalUrl)
  }, [activeTabId])

  const addTab = useCallback(() => {
    tabCounter.current++
    const id = `tab-${tabCounter.current}`
    const newTab: Tab = {
      id,
      title: 'Nouvelle page',
      url: 'https://www.google.com/webhp?igu=1',
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(id)
    setAddressValue('https://www.google.com')
  }, [])

  const closeTab = useCallback((id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (next.length === 0) {
        // Close the window if last tab closed
        wm.closeWindow(windowId)
        return prev
      }
      // If we closed the active tab, switch to the last one
      if (id === activeTabId) {
        setActiveTabId(next[next.length - 1].id)
      }
      return next
    })
  }, [activeTabId, wm, windowId])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        navigate(addressValue)
      }
    },
    [addressValue, navigate],
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'Tahoma, sans-serif',
        fontSize: 13,
        background: '#ECE9D8',
      }}
    >
      {/* ── Tabs bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          background: '#D6DFF7',
          padding: '3px 6px 0',
          gap: 2,
          borderBottom: '1px solid #ACA899',
          minHeight: 28,
          overflow: 'hidden',
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              background: tab.id === activeTabId ? '#fff' : '#D6DFF7',
              border: '1px solid #ACA899',
              borderBottom: tab.id === activeTabId ? '1px solid #fff' : '1px solid #ACA899',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              maxWidth: 160,
              fontSize: 12,
            }}
          >
            <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {tab.title}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              style={{ cursor: 'pointer', color: '#999', fontWeight: 'bold', fontSize: 11 }}
            >
              ✕
            </span>
          </div>
        ))}
        <button
          onClick={addTab}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: '#666',
            padding: '0 6px',
            lineHeight: '24px',
          }}
        >
          +
        </button>
      </div>

      {/* ── Address bar ── */}
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
        <span style={{ color: '#666', fontSize: 12 }}>Adresse :</span>
        <input
          value={addressValue}
          onChange={(e) => setAddressValue(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            flex: 1,
            border: '1px solid #7F9DB9',
            borderRadius: 2,
            padding: '2px 6px',
            fontSize: 13,
            fontFamily: 'Tahoma, sans-serif',
            outline: 'none',
            background: '#fff',
          }}
        />
        <button
          onClick={() => navigate(addressValue)}
          style={{
            background: 'linear-gradient(180deg,#fff,#E3DFD5)',
            border: '1px solid #ACA899',
            borderRadius: 3,
            padding: '2px 12px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          OK
        </button>
      </div>

      {/* ── Content — only active tab renders iframe ── */}
      <div style={{ flex: 1, position: 'relative', background: '#fff', overflow: 'hidden' }}>
        {activeTab && (
          <iframe
            key={activeTab.id}
            src={activeTab.url}
            title={activeTab.title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
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
        }}
      >
        {activeTab ? `🌐 ${activeTab.url}` : 'Prêt'}
      </div>
    </div>
  )
}
