# Aptio – Prototyp v0.7

Erster Testlauf des Kernflows: Quiz → Auswertung → Berufsvorschläge.

## Öffnen

Doppelklick auf **`Aptio.html`**. Die App läuft in jedem Browser, ohne Internet, ohne Installation.
Antworten werden nicht gespeichert: Wenn du die Seite neu lädst, fängt das Quiz von vorn an. Nur die Einstellungen (Zahnrad oben rechts) merkt sich der Browser.

## Was drin ist

- Alle 20 Fragen (18 Multiple-Choice, 2 Freitext), per Du. **Jede Antwortfrage hat jetzt 5 Antworten** (siehe „Neue Antworten in v0.6“). Antwort antippen springt automatisch weiter (abschaltbar).
- Punkte für 16 Fragen (alle außer 7, 12, 19 und 20)
- **Abzweige (Nachfragen):** Je nach Antwort kommen bis zu drei Nachfragen dazu:
  - nach Frage 5 *„Und womit genau?“* – Themen zur Auswahl, passend zur Antwort (Dinge → Holz, Metall, Strom …; Menschen → Gesundheit, Gäste, Verkauf …; Infos → IT, Büro, Labor …), bis zu 3
  - nach Frage 8, wenn „Hintergrund“: Wäre täglicher Kundenkontakt okay?
  - nach Frage 11, wenn „drinnen“: Wäre regelmäßig raus okay? / wenn „draußen“: Wäre fast nur drinnen okay?
- **Mehrfachauswahl:** Bei Frage 1, 4 und 17 bis zu 2 Antworten, bei den Themen bis zu 3. Die Punkte werden gemittelt – mehr Kreuze geben nicht mehr Punkte.
- **Ausschlüsse:** Wer bei einer Nachfrage „lieber nicht“ oder „auf keinen Fall“ sagt, bekommt die betreffenden Berufe gar nicht vorgeschlagen (z. B. „auf keinen Fall raus“ → die 51 Berufe mit viel Draußen-Anteil fallen weg). Das Ergebnis sagt, wie viele Berufe deshalb fehlen.
- **329 Berufe**: 20 geprüfte aus der eigenen Berufsliste und 309 aus dem BIBB-Verzeichnis 2026, jeder mit eigenem Profil und einer Kurzbeschreibung „Was man dort tut“
- Ergebnis: stärkste Eigenschaften, 3–5 Berufe mit Passung in Prozent (eine Nachkommastelle), ein Satz aus Frage 7, Zitate aus Frage 19 und 20
- Unter den Vorschlägen: **„Alle weiteren Berufe mit Prozentzahl“** zum Aufklappen – die komplette Rangliste aller 329 Berufe
- **Berufskarten:** Fährt man mit der Maus über einen vorgeschlagenen Beruf, wischt der Inhalt nach oben weg und von unten erscheint, was man in dem Beruf macht (am Handy: antippen). In der Liste „Alle weiteren Berufe“ öffnet sich stattdessen ein kleines Fenster mit Beschreibung und Vergleich in den fünf Bereichen (passt / teils / anders).
- **Einstellungen** (Zahnrad oben rechts): Aussehen (wie Gerät / hell / dunkel), Schriftgröße, automatisch weiter an/aus, Bewegungen reduzieren, Berufsdetails an/aus. Wird im Browser gespeichert (`localStorage`, Schlüssel `aptio-einstellungen`).
- Ganz unten: **„So wurde gerechnet“** zum Aufklappen, mit deinem Profil, allen Punkten und den besten 25 Berufen

Nicht drin (kommt später): Bewerbungshilfe, echte Stellenangebote, Login. Speichern fehlt noch, gehört aber zu Version 1 (siehe Offene Punkte).

## Berufsprofile

Jeder Beruf hat ein Profil in Prozent, im Code zum Beispiel so:

```
{ name: 'Tischler/in', …, profil: { Menschen: 10, Dinge: 80, Infos: 10, Drinnen: 70, Struktur: 70, Verantwortung: 30, Vorne: 20 } }
```

- **Menschen + Dinge + Infos** ergeben zusammen 100.
- **Drinnen, Struktur, Vorne** sind jeweils die eine Seite; die andere ergibt sich von selbst (Drinnen 70 = Draußen 30, Struktur 70 = Spontan 30, Vorne 20 = Hintergrund 80).
- **Verantwortung** von 0 (eher nicht) bis 100 (sehr viel).
- Werte ab 60 gelten als Merkmal des Berufs und erscheinen im Ergebnis bei „Passt zu dir“.

**Die 20 geprüften Berufe:** Ihre Profile sind so gewählt, dass daraus genau die Merkmale aus deiner Berufsliste entstehen. Die feinen Zahlen darin sind aber meine Einschätzung.

**Die 309 BIBB-Berufe:** Profil und Kurzbeschreibung sind eine erste Einschätzung pro Beruf, noch nicht fachlich geprüft. In der App steht dort **„Profil noch vorläufig“**. Die Beschreibungen stehen in `BESCHREIBUNGEN_VORLAEUFIG`. Das Kennzeichen `vorlaeufig` wird für die ganze Liste automatisch gesetzt – ist ein Beruf geprüft, ihn mit seiner Beschreibung nach `BERUFE_GEPRUEFT` verschieben, dann verschwindet der Hinweis.

## So wird gerechnet (zum Erklären)

1. Jede Antwort gibt Punkte für bestimmte Eigenschaften.
2. Die Punkte werden in Prozent der maximal möglichen Punkte umgerechnet.
3. In jedem Bereich gewinnt die Eigenschaft mit dem höchsten Prozentwert. Sie gilt als **deutlich**, wenn sie mindestens 50 % hat und die Gegenseite um mehr als 25 Prozentpunkte übertrifft. Verantwortung zählt ab 50 %. Das sind deine stärksten Eigenschaften.
4. Aus deinen Prozentwerten entsteht **dein eigenes Profil** im selben Format wie die Berufsprofile. Beispiel: Hast du bei Menschen 67 % und bei Dinge 33 % der möglichen Punkte, wird daraus Menschen 67, Dinge 33, Infos 0.
5. Die **Passung** zeigt, wie nah dein Profil am Profil eines Berufs liegt. 100 % heißt: gleich. Die Bereiche zählen unterschiedlich stark:

   | Bereich | Gewicht |
   |---|---|
   | Menschen / Dinge / Infos | 30 % |
   | Drinnen / Draußen | 25 % |
   | Struktur / Spontan | 20 % |
   | Verantwortung | 15 % |
   | Vorne / Hintergrund | 10 % |

6. Höhere Passung = weiter oben. Bei exakt gleicher Passung kommen zuerst die Berufe, die mehr deiner stärksten Eigenschaften treffen, dann die geprüften Berufe, darunter wird zufällig ausgewählt.
7. Vorgeschlagen werden die Berufe, die höchstens 10 Prozentpunkte unter dem besten liegen (mindestens 3, höchstens 5).

Alle Stellschrauben (50 %, 25 Punkte, Gewichte, 10 Prozentpunkte Abstand, 3–5 Berufe, Zufall an/aus) stehen im Code unter `REGELN`.

**Warum unterschiedliche Gewichte?** Womit man arbeitet (Menschen, Dinge oder Infos), ist für die Berufswahl am wichtigsten, Sichtbarkeit am wenigsten. Außerdem verhindern unterschiedliche Gewichte viele zufällige Gleichstände: Bei gleichen Gewichten bekommen zwei Berufe, die in verschiedenen Bereichen gleich weit danebenliegen, exakt dieselbe Prozentzahl.

## Gleiche Prozentzahlen

Mit den Profilen und der Nachkommastelle haben die Vorschläge fast immer verschiedene Werte. Gemessen über alle 15.552 möglichen Antwort-Kombinationen, jeweils die größte Gruppe mit demselben angezeigten Wert:

| | vorher (Merkmale nach Bereich) | jetzt |
|---|---|---|
| Top 5 | typisch 3 gleiche | typisch keine gleichen, höchstens 4 |
| Top 25 | typisch 10 gleiche | typisch 2, höchstens 6 |
| ganze Liste (329) | typisch 37 gleiche | typisch 6, höchstens 13 |

Ganz verschwinden können gleiche Werte in der langen Liste nicht. Manche Berufe sind sich wirklich sehr ähnlich (zum Beispiel die vielen Verfahrens- und Produktionsberufe), und 329 Berufe passen nicht in eine Skala von 0 bis 100 mit einer Nachkommastelle, ohne dass einige zusammenfallen. Gruppen von 10 oder mehr gleichen Werten gibt es nur noch bei rund 1 % der Antwort-Kombinationen, und dann weit hinten in der Liste (nie unter den besten 25).

## Aufbau der Datei

`Aptio.html` besteht aus drei Teilen:

| Teil | Inhalt | Wann ändern? |
|---|---|---|
| 1. DATEN | Fragen, Antworten, Punkte, Berufe mit Profilen und Beschreibungen, Regeln | Neue Fragetexte, Punkte, Berufe, Profile, Beschreibungen |
| 2. AUSWERTUNG | Rechenlogik | Wenn sich die Matching-Regeln ändern |
| 3. OBERFLÄCHE | Bildschirme, Texte im Ergebnis, Einstellungen, Berufsdetails | Design oder Ablauf |

Die Berufe stehen in zwei Listen: `BERUFE_GEPRUEFT` (die 20 aus der eigenen Liste, mit Beschreibungstext) und `BERUFE_VORLAEUFIG` (die 309 aus dem BIBB-Verzeichnis). Beim Öffnen prüft die App alle Profile (Summe 100, Werte zwischen 0 und 100) und meldet Fehler in der Browser-Konsole.

## Offene Punkte

- [ ] **Profile prüfen:** 309 Berufe haben vorläufige Profile (meine Einschätzung).
- [x] **Beschreibungen:** Alle 309 BIBB-Berufe haben eine Kurzbeschreibung (Stand 02.10.2026, noch vorläufig – fachlich prüfen).
- [x] **Fragetexte:** Die Originale aus `TiP_Quizfragen_Entwurf_2026-08-28` (Google Drive, Liste „Die 20 Fragen“) sind 1:1 eingesetzt. Nur die Apostrophe sind typografisch gesetzt (’ statt ').
- [ ] **Neue Antworten prüfen:** Die 33 Antworten aus v0.6 stehen nicht im Entwurf. Texte und Punkte gegenlesen und ggf. in den Entwurf übernehmen.
- [ ] **Speichern/Mitnehmen:** Laut `Aptio_planung_2026-08-28` Pflicht für Version 1 (PDF, Link oder Screenshot), laut Meilensteinen bis Ende Dezember.
- [ ] **Begründung pro Vorschlag:** Laut Planung ein bis zwei Sätze, warum der Beruf passt. Bisher nur Stichworte („Passt zu dir: …“).
- [x] **Punktelogik** für Frage 5, 9, 10, 13, 15, 16, 17, 18 ergänzt (Stand 30.09.2026, siehe „Punkte der Fragen 5–18“). Frage 12 bleibt bewusst ohne Punkte.
- [ ] **Frage 12 (Kritik):** Ohne Punkte. Offen, ob sie wie Frage 7 einen Satz im Ergebnis bekommt oder gestrichen wird.
- [ ] **Frage 20:** Wird vorerst wie Frage 19 behandelt (Zitat, keine Punkte). Das ist noch nicht offiziell entschieden.
- [ ] **Bereiche vereinheitlichen:** Die 20 geprüften Berufe nutzen eigene Bereichsnamen (Handwerk, Büro, Pflege …), die BIBB-Berufe die aus der Liste (Bau/Handwerk, Büro/Verwaltung …).
- [x] **Draußen-Lücke:** weitgehend geschlossen – Bau, Logistik und Landwirtschaft bringen viele Draußen-Berufe mit.

## Punkte der Fragen 5–18

Die Punkte für die Fragen 1, 2, 3, 4, 6, 8, 11 und 14 stammen aus `TiP_Auswertungslogik_2026-09-04`. Die übrigen wurden am 30.09.2026 ergänzt:

| Frage | a) | b) | c) |
|---|---|---|---|
| 5 Menschen, Dinge oder Zahlen/Infos | +2 Menschen | +2 Dinge | +2 Infos |
| 9 Zimmer/Schreibtisch | +1 Struktur | – | +1 Spontan |
| 10 Gerät reparieren oder Streit schlichten | +2 Dinge | +2 Menschen, +1 Verantwortung | +1 Infos |
| 12 Kritik | – | – | – |
| 13 Kreativ sein | +1 Dinge, +1 Spontan | – | +1 Struktur |
| 15 Wechsel oder Routine stresst | +2 Struktur | +2 Spontan | +1 Struktur, +1 Spontan |
| 16 Computer/Technik | +2 Infos, +1 Drinnen | – | – |
| 17 Helfen oder sichtbares Ergebnis | +2 Menschen | +2 Dinge | +1 Menschen, +1 Dinge |
| 18 Risiko oder Sicherheit | +1 Spontan | +1 Struktur | – |

- Direkte Fragen geben 2 Punkte, indirekte (9, 13, 18) nur 1.
- Gestalten zählt zu „Dinge“ (laut Auswertungslogik handwerklich/gestalterisch).
- Frage 12 bleibt ohne Punkte: Punkte auf Vorne/Hintergrund haben im Test „Vorne“ fast doppelt so oft zur stärksten Eigenschaft gemacht wie „Hintergrund“.

Höchstpunkte in v0.5: Menschen 12, Dinge 11, Infos 11, Drinnen 3, Draußen 4, Struktur 9, Spontan 9, Verantwortung 5, Vorne 2, Hintergrund 4 (aktuelle Werte siehe „Neue Antworten in v0.6“).

## Themen und Ausschlüsse (v0.7)

**Themen:** Jeder Beruf hat in `BERUF_THEMEN` ein oder mehrere von 21 Themen (`THEMEN`). Hast du Themen gewählt, setzt sich die Passung so zusammen: **80 % Profilvergleich + 20 % Thema** (Beruf aus deinem Thema = 100 %, sonst 0 %). Stellschraube: `REGELN.themenGewicht`. „Weiß ich noch nicht“ heißt: nur Profilvergleich.

**Ausschlüsse:**

| Nachfrage | Antwort | fällt weg |
|---|---|---|
| 8a (bei Hintergrund) | Lieber nicht / Auf keinen Fall | Berufe mit Vorne ab 80 / ab 65 |
| 11a (bei drinnen) | Lieber nicht / Auf keinen Fall | Berufe mit Drinnen bis 25 / bis 40 |
| 11b (bei draußen) | Lieber nicht / Auf keinen Fall | Berufe mit Drinnen ab 90 / ab 75 |

Die Themen-Zuordnung ist eine erste Einschätzung (automatisch nach Berufsnamen, von Hand korrigiert) und sollte geprüft werden.

## Neue Antworten in v0.6

Damit man genauer sagen kann, was passt, hat jede Antwortfrage jetzt **5 Antworten**. Die Originalantworten stehen unverändert vorn (a, b, c …), die neuen kommen dahinter. Meist sind es Zwischenstufen („eher …“) oder Mischungen. Zwischenstufen geben 1 Punkt, Mischungen je 1 Punkt auf zwei Eigenschaften.

| Frage | neue Antworten (Punkte) |
|---|---|
| 1 Freier Nachmittag | e) Was mit anderen organisieren (+1 Menschen, +1 Verantwortung) |
| 2 Gruppenprojekt | e) Ergebnis vorstellen (+2 Vorne) |
| 3 Plan | d) eher Plan (+1 Struktur) · e) eher spontan (+1 Spontan) |
| 4 Neues lernen | e) Video/Anleitung, dann selbst (+1 Infos, +1 Dinge) |
| 5 Menschen, Dinge, Infos | d) Menschen und Dinge (+1/+1) · e) Dinge und Infos (+1/+1) |
| 6 Plötzlich anders | d) Ansage machen (+1 Spontan, +1 Verantwortung) · e) schnell neuer Plan (+1 Struktur) |
| 7 Geld oder Spaß | d) sicherer Job · e) Sinnvolles machen (je ein eigener Ergebnissatz, keine Punkte) |
| 8 Vorne/Hintergrund | d) eher vorne (+1 Vorne) · e) eher Hintergrund (+1 Hintergrund) |
| 9 Zimmer | d) meistens ordentlich (+1 Struktur) · e) wechselt ständig (+1 Spontan) |
| 10 Reparieren/Schlichten | d) beides (+1 Menschen, +1 Dinge) · e) erst rausfinden, woran’s liegt (+1 Infos) |
| 11 Drinnen/Draußen | d) eher drinnen (+1) · e) eher draußen (+1) |
| 12 Kritik | d) nachfragen · e) kommt drauf an, von wem (keine Punkte) |
| 13 Kreativ | d) Tüfteln an Lösungen (+1 Infos, +1 Spontan) · e) ein bisschen (–) |
| 14 Verantwortung | d) für eine Person ja (+1) · e) lieber im Team unterstützen (–) |
| 15 Wechsel/Routine | d) eher Wechsel stresst (+1 Struktur) · e) eher Routine stresst (+1 Spontan) |
| 16 Computer | d) gut, helfe anderen (+1 Infos, +1 Menschen) · e) lieber Technik zum Anfassen (+1 Dinge) |
| 17 Motivation | d) Schwieriges verstanden (+1 Infos) · e) besser als letztes Mal (–) |
| 18 Risiko | d) je nach Größe (–) · e) erst genau überlegen (+1 Struktur) |

Höchstpunkte jetzt: Menschen 13, Dinge 12, Infos 13, Drinnen 3, Draußen 4, Struktur 9, Spontan 9, Verantwortung 7, **Vorne 4, Hintergrund 4** (vorher 2 zu 4 – Sichtbarkeit ist jetzt ausgeglichen).

## Gegenprobe

**Stand v0.7 (02.10.2026),** 20.000 zufällige Durchläufe mit Nachfragen und Mehrfachauswahl:

- kein einziger Fehler, immer 3 bis 5 Vorschläge
- in keinem Durchlauf taucht ein ausgeschlossener Beruf in den Vorschlägen auf
- 307 von 329 Berufen landen bei irgendeiner Kombination unter den Vorschlägen (vorher 284 – die Themen sorgen für mehr Abwechslung)
- die beste Passung liegt zwischen 48 % und 98 %, typisch bei 80 %

**Stand v0.6 (02.10.2026),** 20.000 zufällige Antwort-Kombinationen mit 5 Antworten je Frage:

- kein einziger Fehler, immer 3 bis 5 Vorschläge
- 284 von 329 Berufen landen bei irgendeiner Kombination unter den Vorschlägen
- die beste Passung liegt je nach Antworten zwischen 51 % und 98 %, typisch bei 81 %

**Stand v0.5 (30.09.2026):**

Mit 16 gewerteten Fragen gibt es zu viele Kombinationen, um alle durchzurechnen. Getestet wurden deshalb 20.000 zufällige Antwort-Kombinationen (Stand 30.09.2026):

- kein einziger Fehler, immer 3 bis 5 Vorschläge
- 280 von 329 Berufen landen bei irgendeiner Kombination unter den Vorschlägen
- die beste Passung liegt je nach Antworten zwischen 57 % und 98 %, typisch bei 82 %

Vorher, mit 8 gewerteten Fragen, über alle 15.552 Kombinationen: 299 Berufe erreichbar, beste Passung 49 % bis 97 %, typisch 79 %. Die Werte unter „Gleiche Prozentzahlen“ stammen noch aus dieser Zeit.

## Doppelte Berufe

13 Einträge aus der BIBB-Liste wurden nicht übernommen, weil sie schon als geprüfter Beruf vorhanden sind: Fachinformatiker, Fachkraft für Lagerlogistik, Fotograf, IT-System-Elektroniker, Kaufmann für Büromanagement, Kaufmann für Spedition und Logistikdienstleistung, Kaufmann im Einzelhandel, Kraftfahrzeugmechatroniker, Mechatroniker, Mediengestalter Digital und Print, Sozialversicherungsfachangestellter, Steuerfachangestellter, Tischler.

Umgekehrt fehlen in der BIBB-Liste einige schulische Ausbildungen, die bei uns schon drin sind: Erzieher/in, Pflegefachmann/-frau, Notfallsanitäter/in, Physiotherapeut/in.
