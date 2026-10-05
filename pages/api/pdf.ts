import type { NextApiRequest, NextApiResponse } from 'next'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

// Real-text PDF of the CV (readable by ATS / job portals), printed by Chromium with the page's print styles.
// On Vercel it uses the bundled serverless Chromium; locally set CHROME_PATH (or it falls back to Chrome on Windows).
export const config = { maxDuration: 60 }

const LOCAL_CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host
  const proto = (req.headers['x-forwarded-proto'] as string) || (host?.startsWith('localhost') ? 'http' : 'https')
  const onVercel = !!process.env.VERCEL

  const browser = await puppeteer.launch({
    args: onVercel ? chromium.args : ['--no-sandbox'],
    executablePath: onVercel ? await chromium.executablePath() : LOCAL_CHROME,
    headless: true,
  })
  try {
    const page = await browser.newPage()
    await page.emulateMediaType('print')
    await page.goto(`${proto}://${host}/`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.evaluate(() => (document as any).fonts?.ready)
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="Doddy_Suryadharma_CV.pdf"')
    res.setHeader('Cache-Control', 'no-store')
    res.send(Buffer.from(pdf))
  } catch (e: any) {
    console.error('PDF failed', e)
    res.status(500).json({ error: 'PDF could not be generated' })
  } finally {
    await browser.close()
  }
}
