// Aptio – Logik-Test (ohne Browser, ohne Zusatzpakete): node tests/logik.js [Durchläufe]
// Prüft Daten, viele zufällige Wege durch den Fragebaum, Ausschlüsse und ob die Passung nachrechenbar ist.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'Aptio.html'), 'utf8');
const logik = html.slice(html.lastIndexOf('<script>') + 8, html.indexOf('/* =============================================================================\n   3. OBERFL'));
const A = new Function(logik + ';return {FRAGEN,BERUFE,REGELN,THEMEN,UNTERTHEMEN,auswerten,aktiveFragen,antwortenVon,datenPruefen,bereichAbstaende,maxPunkteBerechnen};')();

const N = +process.argv[2] || 5000;
let fehler = 0;
const melde = t => { fehler++; if (fehler <= 10) console.log('FEHLER:', t); };

const probleme = A.datenPruefen();
if (probleme.length) probleme.forEach(p => melde('Daten: ' + p));

function zufallsAntworten() {
  const a = {};
  for (const f of A.FRAGEN) {
    if (f.zeigeWenn && !f.zeigeWenn(a)) continue;
    if (f.typ === 'freitext') { a[f.nr] = ['', 'Tiere und Holz', 'Tischler', 'Polizist', 'Computer'][Math.floor(Math.random() * 5)]; continue; }
    const o = A.antwortenVon(f);
    if (f.mehrfach) {
      const s = new Set(), k = 1 + Math.floor(Math.random() * f.mehrfach);
      while (s.size < k) s.add(Math.floor(Math.random() * o.length));
      const ex = [...s].find(i => o[i].exklusiv);
      a[f.nr] = ex !== undefined ? [ex] : [...s];
    } else a[f.nr] = Math.floor(Math.random() * o.length);
  }
  return a;
}

const anzahl = {}; let minFragen = 99, maxFragen = 0, maxAbweichung = 0; const besten = [];
for (let n = 0; n < N; n++) {
  const ant = zufallsAntworten();
  const zahl = A.aktiveFragen(ant).length; minFragen = Math.min(minFragen, zahl); maxFragen = Math.max(maxFragen, zahl);
  let e;
  try { e = A.auswerten(ant); } catch (x) { melde('Absturz: ' + x.message); continue; }
  const k = e.vorschlaege.length; anzahl[k] = (anzahl[k] || 0) + 1;
  if (k < 3 || k > 5) melde(`${k} Vorschläge`);
  besten.push(e.vorschlaege[0].passung);
  // Ausschlüsse dürfen nie in der Rangliste auftauchen
  for (const r of e.regeln) for (const v of e.rangliste)
    if ((r.ab !== undefined && v.beruf.profil[r.feld] >= r.ab) || (r.bis !== undefined && v.beruf.profil[r.feld] <= r.bis)) { melde(`Ausgeschlossener Beruf ${v.beruf.name} in der Rangliste`); break; }
  // Nachrechnen: Passung = 70/30-Mischung aus Profil (gewichteter Durchschnitt) und Thema
  const g = A.REGELN.gewichte, summe = Object.values(g).reduce((x, y) => x + y, 0);
  const w = e.themen.length ? A.REGELN.themenGewicht / 100 : 0;
  for (const r of e.rangliste.slice(0, 20)) {
    const d = A.bereichAbstaende(r.beruf.profil, e.profil);
    const profil = Object.keys(g).reduce((s, key) => s + g[key] * (100 - d[key]), 0) / summe;
    maxAbweichung = Math.max(maxAbweichung, Math.abs((1 - w) * profil + w * r.themenWert - r.passung));
  }
  // „draußen“ ergibt keine reinen Drinnen-Berufe
  if (ant[11] === 1 && e.vorschlaege.some(v => v.beruf.profil.Drinnen >= 65)) melde('Draußen, aber Drinnen-Beruf vorgeschlagen');
}
if (maxAbweichung > 1e-9) melde(`Passung nicht nachrechenbar (Abweichung ${maxAbweichung})`);
besten.sort((a, b) => a - b);
console.log(`${N} Durchläufe · Fragen pro Weg ${minFragen}–${maxFragen} · Vorschläge ${JSON.stringify(anzahl)} · beste Passung ${besten[0].toFixed(0)}–${besten[besten.length - 1].toFixed(0)} %, typisch ${besten[besten.length >> 1].toFixed(0)} % · Nachrechnen ok: ${maxAbweichung < 1e-9}`);
console.log(fehler ? `${fehler} FEHLER` : 'KEINE FEHLER');
process.exit(fehler ? 1 : 0);
