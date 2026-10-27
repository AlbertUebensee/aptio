// Aptio – Browser-Test (braucht Playwright: npm i -D playwright && npx playwright install chromium)
// node tests/browser.js [Variante] [Durchläufe]   Varianten: desktop, hell, handy, ruhig (ohne Angabe: alle, je 1)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.join(__dirname, '..', 'Aptio.html');
const VARIANTEN = {
  desktop: { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' },
  hell: { viewport: { width: 1280, height: 900 }, colorScheme: 'light' },
  handy: { viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true },
  ruhig: { viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' },
};
const TEXTE = ['Ich baue was mit Holz', 'Tiere pflegen', '', 'Tischlerin', 'Polizist', '<b>x</b> & "y"'];

(async () => {
  const nur = process.argv[2], runs = +process.argv[3] || 1;
  const b = await chromium.launch(); const befunde = [];
  for (const [name, opts] of Object.entries(VARIANTEN).filter(([n]) => !nur || n === nur)) {
    for (let run = 0; run < runs; run++) {
      const k = `${name}#${run + 1}`, add = t => befunde.push(`${k}: ${t}`);
      const ctx = await b.newContext({ ...opts, acceptDownloads: true }); const p = await ctx.newPage();
      p.on('pageerror', e => add('JS-Fehler ' + e.message));
      p.on('console', m => { if (['error', 'warning'].includes(m.type())) add('Konsole ' + m.text()); });
      const seite = async wo => {
        const r = await p.evaluate(() => ({ breit: document.documentElement.scrollWidth - innerWidth, kaputt: (document.body.innerText.match(/\b(undefined|NaN|\[object Object\])\b/g) || []).length }));
        if (r.breit > 1) add(`${wo}: seitlich scrollbar`); if (r.kaputt) add(`${wo}: kaputter Text`);
      };
      const klick = async loc => { try { await loc.click({ timeout: 2000 }); } catch (_) {} };
      await p.goto(URL); await p.waitForTimeout(300); await seite('Start');
      await p.click('#start'); let rechnen = false, schritte = 0;
      for (; schritte < 40; schritte++) {
        await p.waitForTimeout(60);
        if (await p.isVisible('#screen-rechnen')) rechnen = true;
        if (!(await p.isVisible('#screen-quiz'))) break;
        if (schritte === 3) await seite('Quiz');
        if (await p.locator('textarea').count()) { await p.locator('textarea').fill(TEXTE[Math.floor(Math.random() * TEXTE.length)]); await klick(p.locator('#next')); continue; }
        const n = await p.locator('.answer').count(), multi = await p.locator('.answers.multi').count(), vorher = await p.textContent('#question');
        await klick(p.locator('.answer').nth(Math.floor(Math.random() * n)));
        if (multi) {
          await p.waitForTimeout(80);
          if (Math.random() < .6 && (await p.textContent('#question')) === vorher) await klick(p.locator('.answer').nth(Math.floor(Math.random() * n)));
          await p.waitForTimeout(750);
          if (await p.isVisible('#screen-quiz') && (await p.textContent('#question')) === vorher && !(await p.isDisabled('#next'))) await klick(p.locator('#next'));
        } else await p.waitForTimeout(400);
      }
      if (name === 'ruhig' && rechnen) add('Auswertungs-Bildschirm trotz reduzierter Bewegung');
      await p.waitForSelector('#screen-result:not([hidden])', { timeout: 8000 }).catch(() => add('kein Ergebnis'));
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= H; y += 500) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(90); }
      await p.waitForTimeout(4300); await seite('Ergebnis');
      const r = await p.evaluate(() => {
        const fmt = z => (Math.round(z * 10) / 10).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
        return {
          karten: document.querySelectorAll('.job').length,
          unsichtbar: [...document.querySelectorAll('#result-content .reveal')].filter(e => !e.classList.contains('sichtbar') && getComputedStyle(e).opacity < .99).length,
          falsch: [...document.querySelectorAll('.job .fit-wert')].filter(e => e.dataset.ziel && e.textContent.trim() !== fmt(+e.dataset.ziel)).length,
          leer: [...document.querySelectorAll('.job .meter > span')].filter(e => e.style.width === '0%').length,
        };
      });
      if (r.karten < 3 || r.karten > 5) add(`${r.karten} Vorschläge`);
      if (r.unsichtbar) add(`${r.unsichtbar} Abschnitte unsichtbar`); if (r.falsch) add(`${r.falsch} falsche Prozentzahlen`); if (r.leer) add(`${r.leer} leere Balken`);
      await p.locator('details.more summary').click(); const zeile = p.locator('.more-list .more-row').nth(2);
      if (opts.hasTouch) await zeile.tap(); else await zeile.click(); await p.waitForTimeout(250);
      if (!(await p.locator('#job-tip').count())) add('Infofenster öffnet nicht');
      await p.keyboard.press('Escape');
      const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('#save-result')]);
      if (!dl) add('kein Download'); else { const f = path.join(require('os').tmpdir(), 'aptio-test.html'); await dl.saveAs(f); const t = fs.readFileSync(f, 'utf8'); if (/undefined|NaN/.test(t)) add('Datei kaputt'); if (/<b>x<\/b>/.test(t)) add('HTML nicht entschärft'); }
      await p.click('#edit'); await p.waitForTimeout(400); if (!(await p.isVisible('#screen-quiz'))) add('Ändern geht nicht');
      await klick(p.locator('#next')); await p.waitForSelector('#screen-result:not([hidden])', { timeout: 8000 }).catch(() => add('nach Ändern kein Ergebnis'));
      await p.click('#restart'); await p.waitForTimeout(300); await p.click('#start'); await p.waitForTimeout(300);
      if (await p.locator('.answer[aria-pressed="true"]').count()) add('Neustart: Antworten noch markiert');
      await ctx.close();
    }
  }
  await b.close();
  console.log(befunde.length ? befunde.join('\n') : 'KEINE FEHLER');
  process.exit(befunde.length ? 1 : 0);
})();
