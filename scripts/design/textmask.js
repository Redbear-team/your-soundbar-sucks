// Usage: node textmask.js <url> <outDir>
// Renders the page with and without text at 2x the PDF canvas, for a text mask.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [url, outDir] = process.argv.slice(2);
  const browser = await chromium.launch();
  for (const [name, w] of [['mobile', 652], ['desktop', 1206]]) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    // hide photos so lazy-loading can't make the two renders differ
    await page.addStyleTag({ content: '.art, .cones { visibility: hidden !important }' });
    await page.screenshot({ path: path.join(outDir, `tm_${name}_on.png`), fullPage: true });
    await page.addStyleTag({ content: '.t, .faq, .f-abs, .f-legal, .f-copyright { visibility: hidden !important }' });
    await page.screenshot({ path: path.join(outDir, `tm_${name}_off.png`), fullPage: true });
    await page.close();
  }
  await browser.close();
})();
