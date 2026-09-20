import { Router } from 'express'
import * as cheerio from 'cheerio'

const router = Router()

/**
 * Checks if a hostname resolves to a private or loopback IP range (SSRF protection)
 */
function isPrivateHost(hostname) {
  const lower = hostname.toLowerCase()
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower === '169.254.169.254'
  ) {
    return true
  }

  // IPv4 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  const parts = lower.split('.').map(Number)
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true
    if (parts[0] === 127) return true
    if (parts[0] === 192 && parts[1] === 168) return true
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
    if (parts[0] === 169 && parts[1] === 254) return true
  }

  return false
}

/**
 * POST /api/scrape/job
 * Body: { url: string }
 * Fetches the URL, parses HTML using Cheerio, and extracts the job description text.
 */
router.post('/job', async (req, res) => {
  const { url } = req.body

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'A valid job URL is required.' })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    return res.status(400).json({ error: 'Please enter a valid URL (including http:// or https://).' })
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported.' })
  }

  if (isPrivateHost(parsedUrl.hostname)) {
    return res.status(400).json({ error: 'Access to internal or loopback addresses is restricted.' })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return res.status(400).json({
          error:
            'This website restricts automated access (HTTP 403/401). Some job boards (like LinkedIn or Workday) require signing in. Please copy and paste the job description text manually.',
        })
      }
      if (response.status === 404) {
        return res.status(404).json({ error: 'Job posting page not found (HTTP 404). Please verify the link.' })
      }
      return res.status(400).json({
        error: `Could not fetch job page (HTTP ${response.status}: ${response.statusText}).`,
      })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(400).json({
        error: 'The provided link does not return an HTML web page.',
      })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove irrelevant elements
    $(
      'script, style, noscript, nav, footer, header, svg, iframe, form, button, input, aside, [role="navigation"], [role="banner"], [role="contentinfo"]'
    ).remove()

    // Try to extract page title or job title
    const metaTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      ''
    const cleanTitle = metaTitle.replace(/\s+/g, ' ').trim()

    // Known job description containers across popular platforms (Lever, Greenhouse, Indeed, LinkedIn, etc.)
    const selectors = [
      '#jobDescriptionText', // Indeed
      '[data-testid="jobDescriptionText"]',
      '.show-more-less-html__markup', // LinkedIn public job postings
      '.description__text',
      '[data-automation-id="jobPostingDescription"]', // Workday
      '#content .section-page', // Greenhouse
      '.posting-requirements', // Lever
      '.section-wrapper',
      '[class*="job-description"]',
      '[class*="jobDescription"]',
      '[id*="job-description"]',
      '[id*="jobDescription"]',
      'article',
      'main',
      '[role="main"]',
    ]

    let extractedText = ''

    for (const selector of selectors) {
      const match = $(selector)
      if (match.length > 0) {
        const text = match.text().trim()
        if (text.length > 100) {
          extractedText = text
          break
        }
      }
    }

    // Fallback to body if no specific job container matched
    if (!extractedText || extractedText.length < 100) {
      extractedText = $('body').text().trim()
    }

    // Clean and normalize whitespace
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim()

    if (!cleanedText || cleanedText.length < 50) {
      return res.status(400).json({
        error:
          'Could not extract meaningful job description text from this link. The site may render content dynamically with JavaScript or require user login. Please copy and paste the text directly.',
      })
    }

    // Limit maximum text length to ~15,000 characters to keep AI prompt optimal
    const finalContent = cleanedText.length > 15000 ? cleanedText.slice(0, 15000) + '...' : cleanedText

    res.json({
      success: true,
      url: parsedUrl.href,
      title: cleanTitle,
      text: finalContent,
      charCount: finalContent.length,
      wordCount: finalContent.split(/\s+/).length,
    })
  } catch (fetchError) {
    clearTimeout(timeoutId)
    if (fetchError.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timed out while fetching the job page (exceeded 12 seconds). Please check the link or paste the text manually.',
      })
    }
    console.error('Scrape fetch error:', fetchError.message)
    res.status(500).json({
      error: `Failed to fetch URL: ${fetchError.message}`,
    })
  }
})

export default router
