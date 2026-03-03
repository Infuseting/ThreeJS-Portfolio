/**
 * Extracts "owner/repo" from a GitHub URL or returns the string as-is
 * if it already looks like "owner/repo".
 *
 * Accepts:
 *   - "https://github.com/owner/repo"
 *   - "https://github.com/owner/repo.git"
 *   - "owner/repo"
 */
export function parseGitHubRepo(raw: string): string {
  const ghMatch = raw.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/)
  return ghMatch ? ghMatch[1] : raw
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                