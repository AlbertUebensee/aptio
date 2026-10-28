// Aptio – Genauigkeitstest mit Test-Personen: node tests/personas.js [-v]
// Jede Persona beantwortet das Quiz so, wie es ein Mensch mit eindeutigem Wunsch tun würde.
// Gemessen wird, auf welchem Platz der passende Beruf landet (Ziel: unter den Vorschlägen, am besten Platz 1–3).
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', process.env.APTIO_DATEI || 'Aptio.html'), 'utf8');
const logik = html.slice(html.lastIndexOf('<script>') + 8, html.indexOf('/* =============================================================================\n   3. OBERFL'));
const A = new Function(logik + ';return {auswerten};')();

const PERSONAS = [
  { name: 'Tierpflege, eher draußen', erwartet: ['Tierpfleger/in', 'Tierwirt/in', 'Pferdewirt/in', 'Revierjäger/in', 'Fischwirt/in'],
    a: { 1: [3, 1], 2: 3, 3: 2, 4: [2], 5: 1, '5d': [5], '5d-natur': 1, 6: 1, 7: 4, 8: 1, '8a': 0, 9: 1, 10: 0, 11: 4, '11-draussen': [1], 12: 0, 13: 1, 14: 1, 15: 2, 16: 2, 17: [0, 1], 18: 2, wichtig: [5, 1], 19: 'Ich füttere Tiere und kümmere mich um sie', 20: '' } },
  { name: 'Programmieren, drinnen', erwartet: ['Fachinformatiker/in Anwendungsentwicklung', 'Mathematisch-technische/r Softwareentwickler/in'],
    a: { 1: [2], 2: 1, 3: 0, 4: [1, 4], 5: 2, '5i': [0], '5i-it': 0, 6: 4, 7: 0, 8: 1, '8a': 1, 9: 0, 10: 4, 11: 0, '11-drinnen': [0], 12: 0, 13: 3, 14: 2, 15: 3, 16: 0, 17: [3], 18: 4, wichtig: [5, 0], 19: '', 20: '' } },
  { name: 'Kochen', erwartet: ['Koch / Köchin', 'Fachkraft Küche', 'Fachkraft für Gastronomie'],
    a: { 1: [1, 0], 2: 2, 3: 3, 4: [0], 5: 3, '5m': [2], '5d': [6], '5m-gaeste': 0, '5d-essen': 0, 6: 0, 7: 1, 8: 4, '8a': 0, 9: 1, 10: 3, 11: 0, '11-drinnen': [4], 12: 1, 13: 0, 14: 1, 15: 4, 16: 1, 17: [1, 2], 18: 0, wichtig: [5, 0], 19: '', 20: '' } },
  { name: 'Kinder betreuen', erwartet: ['Erzieher/in'],
    a: { 1: [0, 4], 2: 2, 3: 2, 4: [3], 5: 0, '5m': [1], '5m-gesundheit': 3, 6: 3, 7: 4, 8: 3, 9: 1, 10: 1, 11: 2, 12: 3, 13: 0, 14: 0, 15: 1, 16: 1, 17: [0], 18: 2, wichtig: [0, 5], 19: '', 20: '' } },
  { name: 'Kranke pflegen', erwartet: ['Pflegefachmann/-frau', 'Notfallsanitäter/in', 'Physiotherapeut/in', 'Medizinische/r Fachangestellte/r'],
    a: { 1: [0], 2: 2, 3: 0, 4: [0], 5: 0, '5m': [0], '5m-gesundheit': 0, 6: 1, 7: 4, 8: 4, 9: 3, 10: 1, 11: 3, '11-drinnen': [6], 12: 0, 13: 1, 14: 0, 15: 2, 16: 1, 17: [0], 18: 1, wichtig: [0, 5], 19: '', 20: '' } },
  { name: 'Autos reparieren', erwartet: ['Kfz-Mechatroniker/in', 'Zweiradmechatroniker/in', 'Land- und Baumaschinenmechatroniker/in'],
    a: { 1: [1], 2: 3, 3: 3, 4: [2, 4], 5: 1, '5d': [3], '5d-fahrzeuge': 0, 6: 1, 7: 2, 8: 1, '8a': 0, 9: 1, 10: 0, 11: 3, '11-drinnen': [1], 12: 0, 13: 3, 14: 3, 15: 2, 16: 4, 17: [1], 18: 2, wichtig: [5], 19: '', 20: '' } },
  { name: 'Möbel aus Holz', erwartet: ['Tischler/in', 'Holzmechaniker/in'],
    a: { 1: [1], 2: 3, 3: 3, 4: [2], 5: 1, '5d': [0], '5d-holz': 0, 6: 4, 7: 1, 8: 4, '8a': 0, 9: 3, 10: 0, 11: 3, '11-drinnen': [1], 12: 0, 13: 0, 14: 1, 15: 2, 16: 4, 17: [1], 18: 4, wichtig: [5, 0], 19: '', 20: '' } },
  { name: 'Zahlen und Steuern', erwartet: ['Steuerfachangestellte/r', 'Bankkaufmann/-frau', 'Kaufmann/-frau für Büromanagement', 'Investmentfondskaufmann/-frau'],
    a: { 1: [2], 2: 0, 3: 0, 4: [1], 5: 2, '5i': [1], '5i-buero': 0, 6: 2, 7: 3, 8: 1, '8a': 1, 9: 0, 10: 4, 11: 0, '11-drinnen': [0], 12: 0, 13: 2, 14: 3, 15: 0, 16: 3, 17: [3], 18: 1, wichtig: [5, 2], 19: '', 20: '' } },
  { name: 'Videos und 3D gestalten', erwartet: ['Mediengestalter/in Bild und Ton', 'Gestalter/in für immersive Medien', 'Fotograf/in', 'Mediengestalter/in Digital und Print'],
    a: { 1: [2, 1], 2: 1, 3: 1, 4: [4], 5: 4, '5d': [9], '5i': [4], '5i-medien': 0, 6: 0, 7: 1, 8: 4, 9: 1, 10: 4, 11: 0, '11-drinnen': [7], 12: 3, 13: 0, 14: 2, 15: 1, 16: 0, 17: [1], 18: 0, wichtig: [5], 19: '', 20: '' } },
  { name: 'Dach und Höhe, draußen', erwartet: ['Dachdecker/in', 'Gerüstbauer/in', 'Zimmerer / Zimmerin'],
    a: { 1: [3, 1], 2: 3, 3: 3, 4: [2], 5: 1, '5d': [4], '5d-bau': 1, 6: 1, 7: 0, 8: 1, '8a': 0, 9: 1, 10: 0, 11: 1, '11-draussen': [2], 12: 0, 13: 1, 14: 1, 15: 2, 16: 4, 17: [1], 18: 0, wichtig: [1, 5], 19: '', 20: '' } },
  { name: 'Elektrik im Haus', erwartet: ['Elektroniker/in für Energie- und Gebäudetechnik', 'Elektroniker/in', 'Elektroniker/in für Gebäudesystemintegration'],
    a: { 1: [1], 2: 1, 3: 0, 4: [4], 5: 4, '5d': [2], '5i': [6], '5d-elektro': 0, 6: 4, 7: 3, 8: 4, 9: 3, 10: 0, 11: 2, 12: 0, 13: 3, 14: 1, 15: 3, 16: 4, 17: [1], 18: 4, wichtig: [5], 19: '', 20: '' } },
  { name: 'Verkaufen im Laden', erwartet: ['Kaufmann/-frau im Einzelhandel', 'Verkäufer/in', 'Drogist/in', 'Buchhändler/in'],
    a: { 1: [0], 2: 4, 3: 2, 4: [3], 5: 0, '5m': [3], '5m-verkauf': 0, 6: 0, 7: 2, 8: 0, 9: 3, 10: 1, 11: 0, '11-drinnen': [5], 12: 0, 13: 4, 14: 1, 15: 1, 16: 3, 17: [0], 18: 0, wichtig: [0, 5], 19: '', 20: '' } },
  { name: 'Haare und Styling', erwartet: ['Friseur/in', 'Kosmetiker/in', 'Maskenbildner/in'],
    a: { 1: [0, 1], 2: 2, 3: 2, 4: [0], 5: 3, '5m': [4], '5d': [9], 6: 0, 7: 1, 8: 3, 9: 1, 10: 3, 11: 0, '11-drinnen': [7], 12: 0, 13: 0, 14: 1, 15: 1, 16: 1, 17: [2], 18: 0, wichtig: [5], 19: '', 20: '' } },
  { name: 'Lkw fahren', erwartet: ['Berufskraftfahrer/in', 'Fachkraft im Fahrbetrieb', 'Eisenbahner/in im Betriebsdienst Lokführer/in und Transport', 'Binnenschiffer/in'],
    a: { 1: [3], 2: 3, 3: 1, 4: [2], 5: 1, '5d': [8, 3], '5d-fahrzeuge': 3, 6: 0, 7: 0, 8: 1, '8a': 1, 9: 2, 10: 0, 11: 4, '11-draussen': [3], 12: 1, 13: 1, 14: 2, 15: 1, 16: 4, 17: [1], 18: 0, wichtig: [5, 1], 19: '', 20: '' } },
  { name: 'Chemie im Labor', erwartet: ['Chemielaborant/in', 'Chemikant/in', 'Pharmakant/in', 'Lacklaborant/in'],
    a: { 1: [2], 2: 1, 3: 0, 4: [1], 5: 2, '5i': [3], '5i-labor': 0, 6: 2, 7: 3, 8: 1, '8a': 1, 9: 0, 10: 4, 11: 0, '11-drinnen': [3], 12: 0, 13: 3, 14: 2, 15: 0, 16: 0, 17: [3], 18: 4, wichtig: [5, 0], 19: '', 20: '' } },
  { name: 'Garten, draußen', erwartet: ['Gärtner/in'],
    a: { 1: [3], 2: 3, 3: 2, 4: [2], 5: 1, '5d': [5], '5d-natur': 0, 6: 1, 7: 1, 8: 1, '8a': 0, 9: 1, 10: 0, 11: 1, '11-draussen': [0], 12: 0, 13: 0, 14: 1, 15: 2, 16: 2, 17: [1], 18: 2, wichtig: [1, 5], 19: '', 20: '' } },
];

const ausfuehrlich = process.argv.includes('-v');
let platz1 = 0, top3 = 0, vorschlag = 0; const plaetze = [];
for (const p of PERSONAS) {
  const e = A.auswerten(p.a);
  const rang = e.rangliste.findIndex(r => p.erwartet.includes(r.beruf.name)) + 1;
  const imVorschlag = e.vorschlaege.some(v => p.erwartet.includes(v.beruf.name));
  if (rang === 1) platz1++; if (rang && rang <= 3) top3++; if (imVorschlag) vorschlag++;
  plaetze.push(rang || 999);
  const zeichen = rang === 1 ? '✓✓' : rang && rang <= 3 ? '✓ ' : imVorschlag ? '~ ' : '✗ ';
  console.log(`${zeichen} ${p.name.padEnd(26)} Platz ${String(rang || '–').padStart(3)}  →  ${e.vorschlaege.slice(0, ausfuehrlich ? 5 : 3).map(v => `${v.beruf.name} ${v.passung.toFixed(0)}`).join(' | ')}`);
}
const n = PERSONAS.length;
console.log(`\nPlatz 1: ${platz1}/${n} · Top 3: ${top3}/${n} · unter den Vorschlägen: ${vorschlag}/${n} · mittlerer Platz: ${(plaetze.reduce((a, b) => a + Math.min(b, 50), 0) / n).toFixed(1)}`);
process.exit(vorschlag === n ? 0 : 1);
