/**
 * The pages a stranger can reach.
 *
 * Nothing that interrupts — a rotate wall, release notes, an announcement, an
 * update nudge — belongs on any of them. These are the pages that have to sell
 * the product to someone who has never seen it, and every one of those things
 * was written for people who already have an account.
 *
 * A visitor arrived on a phone and got a full-screen "rotate your phone" wall
 * with the release notes behind it. He wrote in: "I can't scroll and I don't
 * see any buttons on this screen. Stuck." That is the signup funnel closed.
 *
 * One list, one place: a page that stops being public is removed here and every
 * banner agrees at once.
 */
const PUBLIC_PATHS = new Set([
  '/', '/about', '/fantasy', '/mock-draft', '/values', '/injury-report',
  '/articles', '/partners', '/contact', '/terms', '/privacy', '/eu-privacy',
  '/terms-condition', '/partner-terms', '/partner-privacy', '/partner-rules',
  '/login', '/signup', '/select-game', '/onboarding', '/forgot-password',
  '/verify-email', '/admin-login', '/tv',
])

const PUBLIC_PREFIXES = ['/products/', '/join/', '/hub/invite/', '/team/']

export const isPublicPath = (pathname) => {
  const p = String(pathname || '').replace(/\/+$/, '') || '/'
  return PUBLIC_PATHS.has(p) || PUBLIC_PREFIXES.some((pre) => p.startsWith(pre))
}

export default isPublicPath
