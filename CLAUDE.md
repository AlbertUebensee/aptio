# CLAUDE.md – Hinweise für Claude Code

Aptio ist ein Berufsorientierungs-Quiz für Jugendliche („Welcher Job passt zu dir?“).
Aktueller Stand: **Prototyp v0.9**. Ausführliche Beschreibung, Rechenweg und offene Punkte stehen in `LIESMICH.md` – vor größeren Änderungen lesen.

## Sprache und Ton

- Mit dem Projektinhaber auf **Deutsch** kommunizieren, einfach und ohne Fachjargon.
- Texte in der App sprechen die Nutzer mit **Du** an.
- Commit-Nachrichten auf Deutsch, kurz und verständlich (z. B. „Frage 12 bekommt Ergebnissatz“).

## Dateien

| Datei | Inhalt |
|---|---|
| `Aptio.html` | Die komplette App: HTML, CSS und JavaScript in einer Datei |
| `index.html` | Leitet nur auf `Aptio.html` weiter (für Hosting, z. B. GitHub Pages) |
| `LIESMICH.md` | Doku für Menschen: Bedienung, Rechenweg, Berufsprofile, offene Punkte |
| `.gitattributes` | Zeilenenden LF |

## Grundregeln

- **Alles bleibt in einer Datei.** Keine Build-Tools, kein npm, keine externen Skripte, Schriften oder Bilder. Die App muss per Doppelklick offline im Browser laufen.
- **Antworten werden nicht gespeichert.** Nur die Einstellungen liegen im Browser (`localStorage`, Schlüssel `aptio-einstellungen`, immer in try/catch). Speichern/Mitnehmen der Ergebnisse ist für Version 1 geplant – vorher mit dem Projektinhaber klären, wie.
- **Fragetexte und Originalantworten nicht umformulieren.** Sie stammen 1:1 aus `TiP_Quizfragen_Entwurf_2026-08-28`. Nur typografische Apostrophe (’). Seit v0.6 hat jede Antwortfrage 5 Antworten: die Originale vorn, die neuen dahinter (Tabelle in `LIESMICH.md`).
- Hell und dunkel: Farben nur über die CSS-Variablen in `:root` ändern, und zwar in allen drei Blöcken (dunkel, `[data-theme="light"]`, `prefers-color-scheme: light`).
- Bei jeder inhaltlichen Änderung **`LIESMICH.md` mitpflegen** (Rechenweg, Tabellen, Offene Punkte abhaken) und im Footer von `Aptio.html` Version/Datum anpassen („Aptio · Prototyp v0.5 · Stand …“).

## Aufbau von `Aptio.html` (im `<script>`-Teil)

1. **DATEN** – `EIGENSCHAFTEN`, `DIMENSIONEN`, `REGELN`, `FRAGEN`, `BERUFE_GEPRUEFT`, `BERUFE_VORLAEUFIG`, `BERUFE`.
   Inhalte (Fragen, Punkte, Berufe, Profile) werden **nur hier** geändert.
2. **AUSWERTUNG** – Punkte zählen, Prozente, Top-Eigenschaften, Nutzerprofil, Passung (`passungBerechnen`), Rangliste, Vorschläge, `datenPruefen()`.
3. **OBERFLÄCHE** – Startbildschirm, Quiz, Ergebnis (`starteApp()`).

Alle Stellschrauben stehen in `REGELN` (Mindestprozent, Vorsprung, Gewichte, Anzahl Vorschläge, Zufall bei Gleichstand …). Schwellenwerte dort ändern, nicht im Code verstreut.

## Datenformat der Berufe

```js
{ name: 'Tischler/in', bereich: 'Handwerk', beschreibung: '…',
  profil: { Menschen: 10, Dinge: 80, Infos: 10, Drinnen: 70, Struktur: 70, Verantwortung: 30, Vorne: 20 } }
```

- `Menschen + Dinge + Infos` = **100**.
- `Drinnen`, `Struktur`, `Vorne`: je eine Seite (0–100), die Gegenseite ergibt sich als 100 minus Wert.
- `Verantwortung`: 0–100.
- Werte ab 60 (`REGELN.profilDeutlich`) gelten als Merkmal („Passt zu dir“).
- Ausführliche Beschreibung (Kartenrückseite, Infofenster): `BESCHREIBUNGEN_AUSFUEHRLICH`, Schlüssel = Berufsname, 2–3 Sätze in Du-Form. Fehlt ein Eintrag, wird die Kurzbeschreibung gezeigt.
- Jeder Beruf braucht mindestens ein Thema in `BERUF_THEMEN` (Schlüssel aus `THEMEN`); `datenPruefen()` meldet fehlende.

## Fragebaum, Mehrfachauswahl, Ausschlüsse (seit v0.8)

- `zeigeWenn: a => …` macht eine Frage zum Abzweig. Immer über `aktiveFragen(antworten)` arbeiten, nie direkt über `FRAGEN` mit Index. Nach jeder Antwort räumt `inaktiveLoeschen()` Antworten von Abzweigen weg, die nicht mehr dran sind.
- 2. Ebene: `zeigeWenn: a => hatThema(a, '5d', 'bau')`. Nummern mit Bindestrich (`5d-bau`) gelten als „genau“ und haben bei Unterthemen Vorrang (`themenAuswahl`).
- Antworten können `thema` und `unterthema` tragen (String oder Liste). Schlüssel aus `THEMEN` / `UNTERTHEMEN`; `datenPruefen()` meldet unbekannte und Unterthemen ohne Beruf.
- `mehrfach: n` erlaubt bis zu n Antworten (Array von Indizes); Punkte werden gemittelt. `exklusiv: true` („Weiß ich noch nicht“) steht allein.
- `ausschluss: { feld, ab | bis, grund }` an einer Antwort nimmt Berufe komplett aus der Rangliste (auch direkt an Frage 11).
- Abzweige vergeben keine Punkte, sonst verschieben sich die Höchstpunkte.

- Startseite: Dauer („ca. 10 Min.“) und Fragenzahl („21–28“) stehen fest im HTML. Bei neuen oder entfernten Abzweigen per Simulation neu ermitteln und anpassen.

## Prüfen nach Änderungen

- `datenPruefen()` läuft beim Öffnen und meldet Profilfehler in der **Browser-Konsole** – nach Datenänderungen kontrollieren.
- Logikänderungen mit vielen zufälligen Antwort-Kombinationen gegenprüfen (wie in `LIESMICH.md` unter „Gegenprobe“: keine Fehler, immer 3–5 Vorschläge, Anzahl erreichbarer Berufe, Spanne der besten Passung) und die Zahlen dort aktualisieren.
- Das Quiz einmal komplett durchklicken, auch auf schmalem Bildschirm (Handy), in hell und dunkel. Die Seite darf nie seitlich scrollen.

## Offene Punkte (Kurzfassung, Details in `LIESMICH.md`)

- 309 vorläufige Berufsprofile prüfen
- Beschreibungen der BIBB-Berufe fachlich prüfen
- Die 33 neuen Antworten aus v0.6 gegenlesen
- Themen- und Unterthemen-Zuordnung (`BERUF_THEMEN`, `BERUF_UNTERTHEMEN`) und die Abzweig-Fragen aus v0.8 prüfen
- Speichern/Mitnehmen (PDF, Link oder Screenshot) – Pflicht für Version 1
- Begründung (1–2 Sätze) pro Berufsvorschlag
- Frage 12 (Kritik): Ergebnissatz oder streichen
- Frage 20: offizielle Entscheidung zur Behandlung
- Bereichsnamen vereinheitlichen (geprüfte vs. BIBB-Berufe)
