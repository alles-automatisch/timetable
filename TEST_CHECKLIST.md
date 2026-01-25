# ✅ Test Checklist - TimeTable v1.0.1

Diese Checkliste hilft dir, die Integration vollständig zu testen.

## 🏠 Lokales Testing

### 1. Installation

```bash
# Kopiere Integration
cp -r custom_components/stundenplan ~/.homeassistant/custom_components/

# Kopiere Card
cp www/stundenplan-card.js ~/.homeassistant/www/

# Home Assistant neu starten
```

- [ ] Dateien erfolgreich kopiert
- [ ] Home Assistant startet ohne Fehler
- [ ] Keine Fehler in den Logs (`Settings → System → Logs`)

### 2. Integration Setup

- [ ] `Settings → Devices & Services → Add Integration`
- [ ] "TimeTable" erscheint in der Suche
- [ ] Icon (Schul-Symbol) wird angezeigt
- [ ] Setup-Dialog öffnet sich
- [ ] Name-Feld vorhanden (Default: "TimeTable")
- [ ] "Include weekends" Checkbox vorhanden
- [ ] Submit funktioniert
- [ ] Kein 500 Error! ✅
- [ ] Integration erscheint in der Liste

### 3. Entities prüfen

`Developer Tools → States`

Suche nach "timetable":

- [ ] `sensor.timetable_current` existiert
- [ ] `sensor.timetable_next_lesson` existiert
- [ ] `binary_sensor.timetable_is_schooltime` existiert

**Initial States:**
- [ ] `sensor.timetable_current`: sollte "No Schedule" oder ähnlich sein
- [ ] Attributes vorhanden: `today_lessons`, `is_vacation`, etc.

### 4. Services testen

`Developer Tools → Services`

#### Service: stundenplan.add_lesson

```yaml
service: stundenplan.add_lesson
data:
  weekday: monday
  lesson:
    subject: Mathe
    start_time: "08:00"
    end_time: "08:45"
    room: "101"
    teacher: "Herr Müller"
```

- [ ] Service erscheint in der Liste
- [ ] Form lädt korrekt
- [ ] Service ausführen funktioniert
- [ ] Keine Fehler in den Logs
- [ ] Entity wird aktualisiert (kann 60s dauern)

#### Service: stundenplan.add_vacation

```yaml
service: stundenplan.add_vacation
data:
  start_date: "2025-07-01"
  end_date: "2025-08-31"
  label: "Sommerferien"
```

- [ ] Service funktioniert
- [ ] Keine Fehler

#### Service: stundenplan.set_schedule

Kopiere Beispiel aus `example_schedule.yaml`:

- [ ] Kompletter Stundenplan kann importiert werden
- [ ] Entities zeigen Daten an
- [ ] Attributes enthalten Lessons

### 5. Card testen

#### Card hinzufügen

- [ ] Dashboard → Edit
- [ ] Add Card
- [ ] "TimeTable Card" erscheint in der Suche
- [ ] Card kann hinzugefügt werden

#### Card Editor

- [ ] Editor öffnet sich
- [ ] Entity-Auswahl funktioniert
- [ ] Title-Feld funktioniert
- [ ] View-Auswahl (Today/Week) funktioniert
- [ ] Alle Checkboxen funktionieren
- [ ] Speichern funktioniert

#### Card Display

- [ ] Card wird angezeigt
- [ ] Icon sichtbar
- [ ] Titel sichtbar
- [ ] View-Toggle funktioniert
- [ ] "No school today" oder ähnlich angezeigt (wenn kein Unterricht)

#### Mit Daten

Nach Hinzufügen von Lessons:

- [ ] Aktuelle Stunde wird hervorgehoben (wenn aktiv)
- [ ] Nächste Stunde wird angezeigt
- [ ] Tagesliste wird angezeigt
- [ ] Zeiten sind korrekt
- [ ] Raum/Lehrer werden angezeigt (wenn aktiviert)

### 6. Vacation Mode

Füge eine aktuelle Vacation hinzu:

```yaml
service: stundenplan.add_vacation
data:
  start_date: "2025-01-20"  # Aktuelles Datum
  end_date: "2025-01-31"
  label: "Test-Ferien"
```

- [ ] Card zeigt Vacation-Banner
- [ ] `sensor.timetable_current` zeigt "Ferien: Test-Ferien"
- [ ] Attribute `is_vacation: true`

### 7. Theme Testing

- [ ] Card sieht gut aus im Light Theme
- [ ] Card sieht gut aus im Dark Theme
- [ ] Farben passen sich an
- [ ] Text ist lesbar

### 8. Mobile Testing

Öffne HA auf Mobilgerät:

- [ ] Card ist responsive
- [ ] Buttons sind klickbar (min 44px tap target)
- [ ] Text ist lesbar
- [ ] Kein horizontales Scrollen

### 9. Browser Console

Öffne Browser DevTools (F12):

- [ ] Card wird geladen: "TIMETABLE-CARD 1.0.1" im Console
- [ ] Keine JavaScript-Fehler
- [ ] Keine 404-Fehler (Card-Datei gefunden)

### 10. Reload Testing

- [ ] Integration kann neu geladen werden ohne Fehler
- [ ] Services funktionieren nach Reload
- [ ] Entities bleiben erhalten
- [ ] Daten bleiben gespeichert

## 🧪 Edge Cases

### Schedule ohne Lessons

- [ ] Funktioniert ohne Absturz
- [ ] Sinnvolle Meldung wird angezeigt

### Ungültige Zeiten

Versuche ungültige Zeit:

```yaml
service: stundenplan.add_lesson
data:
  weekday: monday
  lesson:
    subject: Test
    start_time: "25:00"  # Ungültig
    end_time: "08:45"
```

- [ ] Fehler wird geloggt
- [ ] Kein Crash

### Lesson überschneidungen

Füge zwei sich überschneidende Lessons hinzu:

- [ ] Beide werden angezeigt
- [ ] Kein Crash
- [ ] Sortierung korrekt

### Leere Weekdays

- [ ] Tage ohne Lessons werden korrekt angezeigt
- [ ] "No school" Meldung erscheint

## 📊 Performance

### Update Interval

Warte 60 Sekunden:

- [ ] Coordinator updated automatisch
- [ ] Entities werden refresht
- [ ] Keine Performance-Probleme

### Große Schedules

Füge viele Lessons hinzu (z.B. 50):

- [ ] Kein Performance-Problem
- [ ] Card lädt schnell
- [ ] Scrolling funktioniert

## 🔄 Restart Testing

### HA Restart

- [ ] Restart Home Assistant
- [ ] Integration lädt automatisch
- [ ] Daten bleiben erhalten (aus Storage)
- [ ] Services funktionieren
- [ ] Card funktioniert

### Integration Reload

```bash
# Developer Tools → YAML → Reload: All
```

- [ ] Reload funktioniert
- [ ] Entities bleiben erhalten
- [ ] Keine Duplikate

## 📝 Logs prüfen

`Settings → System → Logs`

Filter: "stundenplan"

- [ ] Keine ERROR-Level Meldungen
- [ ] Nur INFO und DEBUG
- [ ] Keine Exceptions

## ✨ User Experience

### Setup Experience

- [ ] Setup ist intuitiv
- [ ] Kein YAML erforderlich
- [ ] Fehler werden klar kommuniziert
- [ ] Erfolg ist sichtbar

### Daily Use

- [ ] Card ist informativ
- [ ] Updates sind schnell genug
- [ ] Layout ist übersichtlich
- [ ] Farben sind angenehm

## 🚀 HACS Testing (nach GitHub Upload)

### Installation via HACS

- [ ] HACS → Integrations → Custom Repositories
- [ ] Repository URL eingeben
- [ ] Category: Integration
- [ ] "TimeTable" erscheint
- [ ] Installation startet
- [ ] Download erfolgreich
- [ ] Nach Restart: Integration verfügbar

### HACS Updates

- [ ] Update-Benachrichtigung funktioniert (bei neuer Version)
- [ ] Update-Prozess funktioniert

## 📋 Final Check

### Code Quality

- [ ] Keine Python-Syntax-Fehler
- [ ] Keine JS-Syntax-Fehler
- [ ] Alle Imports funktionieren
- [ ] Keine deprecated APIs

### Documentation

- [ ] README ist korrekt
- [ ] Beispiele funktionieren
- [ ] Screenshots passen (wenn vorhanden)

### Version Consistency

- [ ] manifest.json: 1.0.1 ✅
- [ ] Card JS: 1.0.1 ✅
- [ ] CHANGELOG.md: 1.0.1 ✅
- [ ] Alle Versionen stimmen überein

---

## ✅ Alles getestet?

Wenn alle Checkboxen ✅ sind:

1. **Commit & Push**
   ```bash
   git add .
   git commit -m "v1.0.1 - All tests passed"
   git push
   ```

2. **Release erstellen**
   - Tag: v1.0.1
   - Release notes aus CHANGELOG.md

3. **Community teilen!**
   - Home Assistant Forum
   - Reddit
   - Social Media

---

## 🐛 Wenn Fehler gefunden werden

1. Logs speichern
2. Issue auf GitHub erstellen
3. Fehler beschreiben
4. Logs anhängen
5. Fix entwickeln
6. Neue Version (1.0.2)

---

**Happy Testing! 🎉**
