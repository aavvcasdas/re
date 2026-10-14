import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, protocolTimeout: 0,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('console', m => console.log('[console]', m.type(), m.text()));
page.on('pageerror', e => console.log('[PAGEERROR]', e.message, '|', (e.stack || '').split(String.fromCharCode(10)).slice(0, 5).join(' <- ')));
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'domcontentloaded', timeout: 120000 });
await new Promise(r => setTimeout(r, 25000));
console.log(await page.evaluate(() => ({
  ready: !!window.ready,
  PROJECT: typeof PROJECT !== 'undefined' ? PROJECT : 'MISSING',
  FLAT: typeof FLAT !== 'undefined' ? FLAT : 'MISSING',
  shots: typeof SHOTS !== 'undefined' ? SHOTS.length : 'MISSING',
  fonts: (window.EXTRA_FONTS || []).length,
  dur: typeof DUR,
})));
await browser.close();
