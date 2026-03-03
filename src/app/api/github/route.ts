import { NextRequest, NextResponse } from 'next/server'

/* ═══════════════════════════════════════════════
 *  GitHub API proxy
 *
 *  GET /api/github?repo=owner/name&path=some/dir
 *
 *  Proxies to GitHub's Contents API so the client
 *  never needs a token and we avoid CORS issues.
 *  Also fetches repo metadata (created_at, pushed_at)
 *  when path is omitted.
 * ═══════════════════════════════════════════════ */

const GITHUB_API = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN // optional, raises rate limit

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  let repo = searchParams.get('repo')
  const path = searchParams.get('path') ?? ''

  if (!repo) {
    return NextResponse.json({ error: 'Missing ?repo=owner/name' }, { status: 400 })
  }

  // Accept full GitHub URLs like https://github.com/owner/name
  const ghMatch = repo.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/)
  if (ghMatch) repo = ghMatch[1]

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Infuseting-Portfolio',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  try {
    if (!path) {
      const res = await fetch(`${GITHUB_API}/repos/${repo}`, { headers, next: { revalidate: 300 } })
      if (!res.ok) throw new Error(`GitHub ${res.status}`)
      const data = await res.json()
      return NextResponse.json({
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        language: data.language,
        stargazers_count: data.stargazers_count,
        html_url: data.html_url,
      })
    }

    // Otherwise → contents listing
    const url = `${GITHUB_API}/repos/${repo}/contents/${encodeURI(path)}`
    const res = await fetch(url, { headers, next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`GitHub ${res.status}`)
    const data = await res.json()

    // Normalize: the API returns an object for files, array for dirs
    if (Array.isArray(data)) {
      const items = data.map((item: Record<string, unknown>) => ({
        name: item.name,
        type: item.type, // 'file' | 'dir'
        size: item.size,
        path: item.path,
      }))
      return NextResponse.json({ type: 'dir', items })
    }

    // Single file
    return NextResponse.json({
      type: 'file',
      name: data.name,
      size: data.size,
      path: data.path,
      download_url: data.download_url,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
