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
        const r = await p.evaluate(() => ({ breit: document.documentElement.scrollWidth - innerWidth, kaputt: (document.body.innerText.match(/\b(undefined|NaN)\b|\[object Object\]/g) || []).length }));
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
      // Übersicht vor der Auswertung
      if (!(await p.isVisible('#screen-uebersicht'))) add('keine Übersicht vor der Auswertung');
      else {
        await seite('Übersicht');
        const zeilen = await p.locator('#uebersicht-liste li').count();
        if (zeilen < 21 || zeilen > 28) add(`Übersicht hat ${zeilen} Zeilen`);
        if (await p.locator('#uebersicht-liste .ue-antwort.leer', { hasText: 'noch offen' }).count()) add('Übersicht: Frage noch offen');
        // eine Antwort über „Ändern“ korrigieren → zurück zur Übersicht
        await p.locator('.ue-aendern').nth(2).click(); await p.waitForTimeout(400);
        if (!(await p.isVisible('#screen-quiz'))) add('„Ändern“ öffnet die Frage nicht');
        const multi = await p.locator('.answers.multi').count();
        await klick(p.locator('.answer').nth(0)); await p.waitForTimeout(multi ? 300 : 700);
        if (multi && await p.isVisible('#screen-quiz')) await klick(p.locator('#next'));
        for (let i = 0; i < 6 && await p.isVisible('#screen-quiz'); i++) { // evtl. neue Nachfragen
          if (await p.locator('textarea').count()) { await klick(p.locator('#next')); continue; }
          const m = await p.locator('.answers.multi').count(); await klick(p.locator('.answer').nth(0)); await p.waitForTimeout(m ? 300 : 700); if (m) await klick(p.locator('#next'));
        }
        if (!(await p.isVisible('#screen-uebersicht'))) add('nach „Ändern“ nicht zurück in der Übersicht');
        // Neu laden → „Weitermachen“ wird angeboten und stellt die Übersicht wieder her
        await p.reload(); await p.waitForTimeout(400);
        if (!(await p.isVisible('#resume'))) add('nach Neuladen kein „Weitermachen“');
        else { await p.click('#resume-yes'); await p.waitForTimeout(400); if (!(await p.isVisible('#screen-uebersicht'))) add('„Weitermachen“ stellt die Übersicht nicht her'); }
        await p.click('#auswerten');
        await p.waitForTimeout(200);
        if (await p.isVisible('#screen-rechnen')) rechnen = true;
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
      // Suche
      // Suchbegriff aus einem Beruf nehmen, der wirklich in der Liste steht (je nach Antworten sind andere ausgeschlossen)
      const begriff = (await p.locator('.more-list .more-row .more-name').nth(5).textContent()).replace(/[^A-Za-zÄÖÜäöüß]/g, ' ').trim().split(/\s+/)[0].slice(0, 5).toLowerCase();
      await p.fill('.suche', begriff); await p.waitForTimeout(150);
      const sichtbar = await p.locator('.more-list .more-row:not([hidden])').count();
      if (!sichtbar) add(`Suche „${begriff}“ findet nichts`);
      if (await p.locator('.more-list .more-row:not([hidden]) .more-name').evaluateAll((els, b) => els.some(e => !e.textContent.toLowerCase().replace(/[^a-zäöüß]/g, '').includes(b)), begriff)) add('Suche zeigt falsche Treffer');
      await p.fill('.suche', 'xyzq'); await p.waitForTimeout(100); if (!(await p.textContent('.suche-info')).includes('Keinen Beruf')) add('Suche ohne Treffer ohne Hinweis');
      await p.fill('.suche', ''); await p.waitForTimeout(100);
      // Hinweise-Dialog
      await p.click('#open-info'); await p.waitForTimeout(200); if (!(await p.isVisible('#info'))) add('Hinweise öffnen nicht'); else await seite('Hinweise'); await p.click('#done-info');
      if (!(await p.locator('details.more').evaluate(d => d.open))) await p.locator('details.more summary').click();
      const zeile = p.locator('.more-list .more-row').nth(2);
      if (opts.hasTouch) await zeile.tap(); else await zeile.click(); await p.waitForTimeout(250);
      if (!(await p.locator('#job-tip').count())) add('Infofenster öffnet nicht');
      await p.keyboard.press('Escape');
      const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('#save-result')]);
      if (!dl) add('kein Download'); else { const f = path.join(require('os').tmpdir(), 'aptio-test.html'); await dl.saveAs(f); const t = fs.readFileSync(f, 'utf8'); if (/undefined|NaN/.test(t)) add('Datei kaputt'); if (/<b>x<\/b>/.test(t)) add('HTML nicht entschärft'); }
      // Bewerbungshilfe
      await p.locator('.bewerbung-einstieg .btn').click(); await p.waitForTimeout(400);
      if (!(await p.isVisible('#screen-bewerbung'))) add('Bewerbungshilfe öffnet nicht');
      else {
        await p.fill('[name="vorname"]', 'Testa'); await p.fill('[name="nachname"]', 'Person'); await p.fill('[name="kontakt"]', 'Herr Meier');
        await p.click('text=Entwurf erstellen'); await p.waitForTimeout(400);
        const brief = await p.inputValue('.bw-anschreiben');
        if (!/Sehr geehrter Herr Meier,/.test(brief)) add('Anschreiben: Anrede falsch');
        if (/undefined|NaN|null|\[object Object\]/.test(brief)) add('Anschreiben: kaputter Text');
        if (/\[object Object\]|undefined/.test(await p.locator('#bewerbung-inhalt').innerText())) add('Bewerbungshilfe: kaputter Text');
        if (/(den|die|das) (Erster|Mittlerer)/.test(brief)) add('Anschreiben: Grammatik beim Abschluss');
        await seite('Bewerbung');
        const ss = await p.evaluate(() => sessionStorage.getItem('aptio-sitzung') || '');
        if (/Testa|Meier/.test(ss)) add('persönliche Daten im sessionStorage');
        await p.click('#bewerbung-zurueck'); await p.waitForTimeout(300);
        if (!(await p.isVisible('#screen-result'))) add('Bewerbung: zurück geht nicht');
      }
      await p.click('#edit'); await p.waitForTimeout(400); if (!(await p.isVisible('#screen-uebersicht'))) add('„Antworten ändern“ öffnet nicht die Übersicht');
      await klick(p.locator('#auswerten')); await p.waitForSelector('#screen-result:not([hidden])', { timeout: 8000 }).catch(() => add('nach Ändern kein Ergebnis'));
      await p.click('#restart'); await p.waitForTimeout(300);
      await p.reload(); await p.waitForTimeout(300); if (await p.isVisible('#resume')) add('nach „Nochmal von vorn“ noch Sitzung gespeichert');
      await p.click('#start'); await p.waitForTimeout(300);
      if (await p.locator('.answer[aria-pressed="true"]').count()) add('Neustart: Antworten noch markiert');
      await ctx.close();
    }
  }
  await b.close();
  console.log(befunde.length ? befunde.join('\n') : 'KEINE FEHLER');
  process.exit(befunde.length ? 1 : 0);
})();
