// diag: does this Chromium refuse a fractional OffscreenCanvas size?
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
console.log(await page.evaluate(() => {
  const out = { hasOffscreen: typeof OffscreenCanvas, ua: navigator.userAgent };
  try { new OffscreenCanvas(10.5, 10); out.fractional = 'ok'; } catch (e) { out.fractional = e.message; }
  try { const c = document.createElement('canvas'); c.width = 10.5; out.domCanvas = c.width; } catch (e) { out.domCanvas = e.message; }
  try { new OffscreenCanvas(0, 10); out.zero = 'ok'; } catch (e) { out.zero = e.message; }
  return out;
}));
await browser.close();
