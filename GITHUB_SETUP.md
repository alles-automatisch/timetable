# 🚀 GitHub Repository Setup

Diese Anleitung zeigt, wie du das Repository auf GitHub richtig konfigurierst für HACS-Kompatibilität.

## 1. Repository erstellen

### Auf GitHub.com:

1. Gehe zu https://github.com/new
2. Repository Name: `timetable`
3. Owner: `alles-automatisch`
4. **Description:** (wichtig für HACS!)
   ```
   Smart school schedule integration for Home Assistant with beautiful Lovelace card
   ```
5. Public ✅
6. **KEIN** README.md initialisieren (wir haben schon eins)
7. **KEINE** .gitignore (wir haben schon eine)
8. **KEINE** License (wir haben schon eine)
9. Create repository

## 2. Repository Topics hinzufügen

Nach dem Erstellen des Repos:

1. Klicke auf ⚙️ (Settings Icon) neben "About" (rechte Sidebar)
2. Füge folgende **Topics** hinzu (wichtig für HACS!):
   ```
   home-assistant
   hacs
   custom-integration
   school
   timetable
   schedule
   education
   lovelace-card
   home-automation
   smart-home
   ```
3. ✅ Include in the home page: aktiviert
4. Save changes

## 3. Repository Description

In den Repository Settings:

1. Description (bereits ausgefüllt):
   ```
   Smart school schedule integration for Home Assistant with beautiful Lovelace card
   ```
2. Website: `https://alles-automatisch.de`
3. Save

## 4. Code hochladen

### Lokal in deinem Projekt-Ordner:

```bash
# Terminal öffnen in: /Users/danielboberg/Projects/alles-automatisch/timetable/

# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit
git commit -m "Initial release v1.0.1 - TimeTable integration

- Complete HACS-compatible integration
- Lovelace card with GUI editor
- Schedule management with services
- Vacation tracking
- Bilingual (EN/DE)
- Bug fixes from v1.0.0"

# Main Branch
git branch -M main

# Remote hinzufügen
git remote add origin https://github.com/alles-automatisch/timetable.git

# Hochladen
git push -u origin main
```

## 5. Release erstellen

### Auf GitHub:

1. Gehe zu deinem Repo: https://github.com/alles-automatisch/timetable
2. Klicke **Releases** (rechte Sidebar)
3. Klicke **Create a new release**

#### Release Details:

**Tag version:**
```
v1.0.1
```

**Release title:**
```
v1.0.1 - Bug Fixes & HACS Ready
```

**Description:**
```markdown
## 🐛 Bug Fixes

- Fixed 500 Internal Server Error in config flow
- Added missing icon in manifest.json
- Improved entity names (now "TimeTable" instead of "Stundenplan")
- Fixed service registration conflicts
- Corrected HACS validation issues

## ✨ Features

- Complete schedule management system
- Beautiful Lovelace card with GUI editor
- 3 entities (sensors + binary sensor)
- 5 services (full CRUD API)
- Vacation tracking
- Bilingual (English + German)

## 📦 Installation

### Via HACS (Recommended)

1. HACS → Integrations → ⋮ → Custom repositories
2. Add: `https://github.com/alles-automatisch/timetable`
3. Category: Integration
4. Install "TimeTable"
5. Restart Home Assistant

### Manual

1. Download `timetable.zip` below
2. Extract to `config/custom_components/stundenplan/`
3. Extract `www/stundenplan-card.js` to `config/www/`
4. Restart Home Assistant

## 📚 Documentation

See [README.md](https://github.com/alles-automatisch/timetable#readme) for full documentation.

## 🙏 Support

- ⭐ Star this repo
- 🐛 Report issues
- ☕ [Buy me a coffee](https://www.buymeacoffee.com/allesautomatisch)
```

**Choose target:** main

**Set as the latest release:** ✅

**Klicke "Publish release"**

## 6. HACS Validation checken

Nach dem Release:

### ✅ Sollte jetzt passen:

- [x] Repository exists
- [x] Description vorhanden
- [x] Topics vorhanden
- [x] hacs.json korrekt
- [x] manifest.json korrekt
- [x] Release erstellt
- [x] README.md vorhanden

### ⚠️ Optional (kann später):

- [ ] Brands integration (für besseres Icon/Logo)
  - Siehe: https://github.com/home-assistant/brands
  - Nicht erforderlich für HACS

## 7. Als HACS Custom Repository nutzen

User können jetzt installieren via:

```
HACS → Integrations → ⋮ → Custom repositories
Repository: https://github.com/alles-automatisch/timetable
Category: Integration
```

## 8. (Optional) Submit to HACS Default

Wenn du willst, dass es in HACS Default aufgenommen wird:

1. Gehe zu: https://github.com/hacs/default
2. Fork the repo
3. Edit `custom_components/integration.json`
4. Füge hinzu:
   ```json
   "timetable": {
     "name": "TimeTable",
     "description": "Smart school schedule integration for Home Assistant",
     "documentation": "https://github.com/alles-automatisch/timetable",
     "category": "integration"
   }
   ```
5. Create Pull Request

**Anforderungen für HACS Default:**
- Mindestens 5 Releases
- Aktive Wartung
- Gute Dokumentation
- Community-Interesse

## 9. Repository Settings (Optional)

### Features aktivieren:

- [x] Issues
- [x] Discussions (optional)
- [ ] Projects (optional)
- [ ] Wiki (optional)

### GitHub Pages (für Docs):

Settings → Pages:
- Source: Deploy from a branch
- Branch: main / docs (falls du einen docs-Ordner erstellst)

## 10. Verification Checklist

Nach dem Setup:

```bash
# Clone testen
git clone https://github.com/alles-automatisch/timetable.git

# HACS validate lokal (optional)
# Installiere: https://github.com/hacs/integration
# Dann: hacs validate --repo alles-automatisch/timetable
```

### Manuell prüfen:

- [ ] Repository ist öffentlich
- [ ] README wird angezeigt
- [ ] Topics sind sichtbar
- [ ] Description ist gesetzt
- [ ] Release ist verfügbar
- [ ] Clone funktioniert
- [ ] Alle Dateien sind da

## 11. Marketing (Optional)

### Share on:

1. **Home Assistant Community Forum**
   - Category: Third-party integrations
   - https://community.home-assistant.io/

2. **Reddit**
   - r/homeassistant
   - Title: "[Custom Integration] TimeTable - Smart School Schedule Manager"

3. **Twitter/X**
   ```
   🎉 Neu: TimeTable für @home_assistant!

   ⏰ Schulstundenplan Integration
   📅 Schöne Lovelace Card
   🌍 DE/EN Support

   Perfect für Schüler & Eltern!

   https://github.com/alles-automatisch/timetable

   #HomeAssistant #SmartHome
   ```

4. **Alles Automatisch Blog**
   - Ausführlicher Artikel
   - Screenshots
   - Setup-Anleitung
   - Use Cases

## 12. Maintenance

### Regelmäßig:

- Issues beantworten
- Pull Requests prüfen
- Releases erstellen bei Updates
- CHANGELOG.md aktualisieren
- HA-Kompatibilität checken

### Bei Home Assistant Updates:

1. Teste mit neuer HA-Version
2. Update `homeassistant` in manifest.json falls nötig
3. Neues Release wenn Änderungen nötig

---

## 🎉 Fertig!

Dein Repository ist jetzt:
- ✅ HACS-ready
- ✅ Professionell strukturiert
- ✅ Community-ready
- ✅ Ready to share!

**Next:** Push the code und create the release! 🚀

---

## Quick Commands Zusammenfassung

```bash
# Im Projekt-Ordner:
cd /Users/danielboberg/Projects/alles-automatisch/timetable/

# Setup
git init
git add .
git commit -m "Initial release v1.0.1"
git branch -M main
git remote add origin https://github.com/alles-automatisch/timetable.git
git push -u origin main

# Tag erstellen
git tag -a v1.0.1 -m "Release v1.0.1 - Bug Fixes & HACS Ready"
git push origin v1.0.1

# Dann auf GitHub: Release aus dem Tag erstellen
```

**Viel Erfolg! 🎉**
