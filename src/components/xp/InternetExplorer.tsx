'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useWM } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  Internet Explorer  (Windows XP style)
 *
 *  Multi-tab browser with iframe content.
 *  Detection of iframe-blocked sites uses 3 layers:
 *    1) Hardcoded blocklist (github, twitter, etc.)
 *    2) localStorage cache from previous sessions
 *    3) Client-side neterror detection — when the browser
 *       shows its error page inside the iframe (body.neterror),
 *       we catch it in onIframeLoad and swap to a BlockedPage.
 * ═══════════════════════════════════════════════ */

/* ── Hardcoded blocklist of domains known to block iframes ── */
const KNOWN_BLOCKED_DOMAINS = new Set([

])

/* ── Domains known to work in iframes ── */
const KNOWN_ALLOWED_DOMAINS = new Set([

])

/* ── Blocked-domain cache (localStorage, infinite TTL) ── */

const LS_KEY = 'ie-blocked-domains'

function getBlockedCache(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setBlockedCache(domain: string, blocked: boolean) {
  try {
    const cache = getBlockedCache()
    cache[domain] = blocked
    localStorage.setItem(LS_KEY, JSON.stringify(cache))
  } catch { /* quota exceeded or SSR — ignore */ }
}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Match a domain against a set of base domains.
 *  e.g. "fr.wikipedia.org" matches "wikipedia.org"
 */
function matchesDomainSet(domain: string, domainSet: Set<string>): boolean {
  if (domainSet.has(domain)) return true
  // Check if it's a subdomain of a known domain
  for (const known of domainSet) {
    if (domain.endsWith('.' + known)) return true
  }
  return false
}

/** Check if a URL can be loaded in an iframe.
 *  1) Check hardcoded blocklist / allowlist
 *  2) Check localStorage cache
 *  3) Otherwise returns true — actual detection happens client-side
 *     in onIframeLoad by checking for the browser's neterror page.
 */
function checkIframeAllowed(url: string): boolean {
  const domain = getDomainFromUrl(url)
  if (!domain) return true

  // 1) Hardcoded lists — instant, 100% reliable
  if (matchesDomainSet(domain, KNOWN_BLOCKED_DOMAINS)) {
    setBlockedCache(domain, true)
    return false
  }
  if (matchesDomainSet(domain, KNOWN_ALLOWED_DOMAINS)) {
    setBlockedCache(domain, false)
    return true
  }

  // 2) localStorage cache (from previous neterror detections)
  const cache = getBlockedCache()
  if (domain in cache) return !cache[domain]

  // 3) Unknown domain → allow loading, detect failure in onIframeLoad
  return true
}

interface Tab {
  id: string
  title: string
  url: string
  /** null = not checked yet, true = blocked, false = allowed */
  blocked: boolean | null
}

interface InternetExplorerProps {
  windowId: string
  initialUrl?: string
}

export function InternetExplorer({ windowId, initialUrl }: InternetExplorerProps) {
  const wm = useWM()

  const startUrl = initialUrl || 'https://www.google.com/?igu=1'

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Page d\'accueil',
      url: startUrl,
      blocked: checkIframeAllowed(startUrl) ? false : true,
    },
  ])
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [addressValue, setAddressValue] = useState(initialUrl || 'https://www.google.com/')
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
      finalUrl = `https://www.google.com//search?igu=1&q=${encodeURIComponent(finalUrl)}`
    }

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTabId) return t
        const allowed = checkIframeAllowed(finalUrl)
        return { ...t, url: finalUrl, title: new URL(finalUrl).hostname, blocked: allowed ? false : true }
      }),
    )
    setAddressValue(finalUrl)
  }, [activeTabId])

  const addTab = useCallback(() => {
    tabCounter.current++
    const id = `tab-${tabCounter.current}`
    const googleUrl = 'https://www.google.com/?igu=1'
    const newTab: Tab = {
      id,
      title: 'Nouvelle page',
      url: googleUrl,
      blocked: checkIframeAllowed(googleUrl) ? false : true,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(id)
    setAddressValue('https://www.google.com/')
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

  /* ── Observe iframe URL changes ── */
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  /** Try reading iframe URL (only works for same-origin frames like Google igu=1) */
  const syncUrlFromIframe = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const href = iframe.contentWindow?.location.href
      if (href && href !== 'about:blank') {
        setAddressValue(href)
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== activeTabId) return t
            if (t.url === href) return t // no change
            let title = t.title
            try { title = iframe.contentDocument?.title || new URL(href).hostname } catch { /* keep */ }
            return { ...t, url: href, title }
          }),
        )
      }
    } catch {
      // Cross-origin: silently ignored — we can't read cross-origin URLs
    }
  }, [activeTabId])

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // ── Detect browser error pages (site blocked iframes / unreachable) ──
    try {
      const doc = iframe.contentDocument
      const body = doc?.body
      if (body) {
        // Chrome/Edge: body has class "neterror"
        // Firefox: body has id "errorPage" or class "neterror"
        // Also detect Chrome's chrome-error:// pages
        const isError =
          body.classList.contains('neterror') ||
          body.id === 'errorPage' ||
          (doc?.URL?.startsWith('chrome-error://'))
        if (isError) {
          // Cache this domain as blocked for future navigations
          const currentTab = tabs.find((t) => t.id === activeTabId)
          if (currentTab) {
            const domain = getDomainFromUrl(currentTab.url)
            if (domain) setBlockedCache(domain, true)
          }
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTabId ? { ...t, blocked: true } : t
            ),
          )
          return // don't sync URL for error pages
        }
      }
    } catch {
      // Cross-origin: can't read contentDocument — that's fine,
      // it means the site loaded (cross-origin pages don't show neterror)
    }

    // Sync URL on load (works for same-origin navigations like Google search)
    syncUrlFromIframe()
    // Also try to get the page title
    try {
      const title = iframe.contentDocument?.title
      if (title) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId ? { ...t, title } : t
          ),
        )
      }
    } catch { /* cross-origin */ }
  }, [syncUrlFromIframe, activeTabId, tabs])

  // Poll for same-origin SPA navigations (e.g. Google search results)
  useEffect(() => {
    if (!activeTab || activeTab.blocked !== false) return
    const id = setInterval(syncUrlFromIframe, 800)
    return () => clearInterval(id)
  }, [syncUrlFromIframe, activeTab?.blocked])

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
        {activeTab && activeTab.blocked === true ? (
          <BlockedPage url={activeTab.url} />
        ) : activeTab ? (
          <iframe
            ref={iframeRef}
            key={activeTab.id}
            src={activeTab.url}
            title={activeTab.title}
            onLoad={onIframeLoad}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : null}
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

/* ── Blocked site page ── */

function BlockedPage({ url }: { url: string }) {
  let hostname = ''
  try { hostname = new URL(url).hostname } catch { hostname = url }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: 24,
        background: 'linear-gradient(180deg, #F5F5F5 0%, #E8E8E8 100%)',
        textAlign: 'center', fontFamily: 'Tahoma, sans-serif',
      }}
    >
      <div style={{
        background: '#fff', border: '1px solid #ccc', borderRadius: 8,
        padding: '24px 32px', maxWidth: 420,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
        <h2 style={{ fontSize: 16, margin: '0 0 8px', color: '#333' }}>
          Impossible d&apos;afficher cette page
        </h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 16px', lineHeight: 1.5 }}>
          <strong>{hostname}</strong> refuse l&apos;affichage dans un cadre intégré
          (iframe). C&apos;est une restriction de sécurité du site.
        </p>
        <div style={{
          background: '#F0F0F0', border: '1px solid #DDD', borderRadius: 4,
          padding: '8px 12px', fontSize: 12, color: '#444',
          wordBreak: 'break-all', marginBottom: 16,
        }}>
          {url}
        </div>
        <p style={{ fontSize: 12, color: '#999', margin: 0 }}>
          Internet Explorer pour Windows XP ne peut pas contourner cette restriction.
        </p>
      </div>
    </div>
  )
}
