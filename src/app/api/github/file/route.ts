import { NextRequest, NextResponse } from 'next/server'

/* ═══════════════════════════════════════════════
 *  GitHub raw file content proxy
 *
 *  GET /api/github/file?repo=owner/name&path=src/index.ts
 *
 *  Returns the raw text content of a single file.
 * ═══════════════════════════════════════════════ */

const GITHUB_API = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  let repo = searchParams.get('repo')
  const path = searchParams.get('path') ?? ''

  if (!repo || !path) {
    return NextResponse.json({ error: 'Missing ?repo=owner/name&path=...' }, { status: 400 })
  }

  // Accept full GitHub URLs
  const ghMatch = repo.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/)
  if (ghMatch) repo = ghMatch[1]

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
    'User-Agent': 'Infuseting-Portfolio',
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  try {
    const url = `${GITHUB_API}/repos/${repo}/contents/${encodeURI(path)}`
    const res = await fetch(url, { headers, next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`GitHub ${res.status}`)

    const text = await res.text()
    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
