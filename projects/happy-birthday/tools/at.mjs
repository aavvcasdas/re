// diag: render one time in the page and print the full error stack (which scene line fails)
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const TS = process.argv.slice(2).map(Number);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, protocolTimeout: 0,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[PAGEERROR]', e.message));
page.on('console', m => { const t = m.text(); if (!/INVALID_OPERATION/.test(t)) console.log('[page]', t.slice(0, 400)); });
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'domcontentloaded', timeout: 240000 });
await page.waitForFunction('window.ready === true', { timeout: 240000 });
console.log(await page.evaluate(async (TS) => {
  const out = [];
  for (const T of TS) {
    try { const url = await window.renderAt(T); out.push(T + ': ok ' + url.length); }
    catch (e) { out.push(T + ': ' + e.message); }
  }
  return out;
}, TS));
await browser.close();
