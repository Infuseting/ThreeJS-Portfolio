import { NextRequest, NextResponse } from 'next/server'
import { parseGitHubRepo } from '@/utils/github/parseGitHubRepo'

/* ═══════════════════════════════════════════════
 *  GitHub API proxy
 *
 *  GET /api/github?repo=owner/name&path=some/dir
 *
 *  Proxies to GitHub's Contents API so the client
 *  never needs a token and we avoid CORS issues.
 * ═══════════════════════════════════════════════ */

const GITHUB_API = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Infuseting-Portfolio',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`
  return headers
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawRepo = searchParams.get('repo')
  const path = searchParams.get('path') ?? ''

  if (!rawRepo) {
    return NextResponse.json({ error: 'Missing ?repo=owner/name' }, { status: 400 })
  }

  const repo = parseGitHubRepo(rawRepo)
  const headers = buildHeaders()

  try {
    if (!path) {
      return await fetchRepoMetadata(repo, headers)
    }
    return await fetchContents(repo, path, headers)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

async function fetchRepoMetadata(repo: string, headers: Record<string, string>) {
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

async function fetchContents(repo: string, path: string, headers: Record<string, string>) {
  const url = `${GITHUB_API}/repos/${repo}/contents/${encodeURI(path)}`
  const res = await fetch(url, { headers, next: { revalidate: 120 } })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const data = await res.json()

  if (Array.isArray(data)) {
    const items = data.map((item: Record<string, unknown>) => ({
      name: item.name,
      type: item.type,
      size: item.size,
      path: item.path,
    }))
    return NextResponse.json({ type: 'dir', items })
  }

  return NextResponse.json({
    type: 'file',
    name: data.name,
    size: data.size,
    path: data.path,
    download_url: data.download_url,
  })
}
