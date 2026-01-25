# 🔧 Fehlerbehebungen / Fixes Applied

## Version 1.0.1 - Bug Fixes

### Probleme behoben / Issues Fixed

#### 1. ✅ Icon fehlte / Missing Icon
**Problem:** Integration hatte kein Icon in der UI

**Lösung:**
- `manifest.json` ergänzt mit `"icon": "mdi:school"`
- `integration_type` geändert von `"device"` zu `"service"`

**Datei:** `custom_components/stundenplan/manifest.json`

---

#### 2. ✅ Config Flow 500 Error
**Problem:** "Der Konfigurationsfluss konnte nicht geladen werden: 500 Internal Server Error"

**Ursache:** Services wurden bei jedem Entry-Setup neu registriert, was zu Konflikten führte.

**Lösung:**
- Services werden nur noch einmal registriert (Check mit `hass.services.has_service()`)
- Service-Handler greifen dynamisch auf Storage/Coordinator zu statt diese als Parameter zu erhalten
- Verhindert Mehrfach-Registrierung bei Neustart oder mehreren Entries

**Dateien geändert:**
- `custom_components/stundenplan/__init__.py`
  - `async_setup_entry()`: Service-Registrierung nur wenn noch nicht vorhanden
  - `async_setup_services()`: Keine Parameter mehr, dynamischer Zugriff auf Instanzen
  - Alle Service-Handler: Holen sich Storage/Coordinator dynamisch aus `hass.data`

**Code-Änderungen:**
```python
# Vorher:
await async_setup_services(hass, storage, coordinator)

# Nachher:
if not hass.services.has_service(DOMAIN, SERVICE_SET_SCHEDULE):
    await async_setup_services(hass)
```

---

#### 3. ✅ Entity-Namen verbessert / Improved Entity Names
**Problem:** Entity-Namen zeigten "Stundenplan" statt "TimeTable"

**Lösung:**
- Alle Sensor-Namen geändert von "Stundenplan" zu "TimeTable"
- `_attr_has_entity_name = False` hinzugefügt für korrekte Namensgebung

**Dateien geändert:**
- `custom_components/stundenplan/sensor.py`
  - `StundenplanCurrentSensor`: "TimeTable Current"
  - `StundenplanNextSensor`: "TimeTable Next Lesson"
- `custom_components/stundenplan/binary_sensor.py`
  - `StundenplanIsSchooltimeSensor`: "TimeTable Is Schooltime"

---

### Resultierende Entity-Namen / Resulting Entity Names

Nach den Fixes haben Sie folgende Entities:

```
sensor.timetable_current              # Aktueller Status
sensor.timetable_next_lesson          # Nächste Stunde
binary_sensor.timetable_is_schooltime # Schulzeit aktiv?
```

---

### Installation & Test

#### Nach Update:

1. **Home Assistant neu starten**
   ```bash
   # Settings → System → Restart
   ```

2. **Integration neu laden** (optional)
   - Gehe zu Settings → Devices & Services
   - Finde "TimeTable"
   - Klicke auf die drei Punkte → "Reload"

3. **Entities prüfen**
   - Developer Tools → States
   - Suche nach "timetable"
   - Alle 3 Entities sollten erscheinen

4. **Services testen**
   - Developer Tools → Services
   - Teste `stundenplan.add_lesson`
   - Keine Fehler sollten auftreten

---

### Wenn noch Probleme auftreten / If Issues Persist

#### Debug-Logging aktivieren:

`configuration.yaml`:
```yaml
logger:
  default: info
  logs:
    custom_components.stundenplan: debug
```

Dann:
1. Home Assistant neu starten
2. Settings → System → Logs
3. Filter nach "stundenplan"
4. Fehler im Issue auf GitHub posten

---

### Bekannte Einschränkungen / Known Limitations

1. **Nur eine Integration-Instanz**
   - Aktuell wird nur die erste Entry verwendet
   - Mehrere Instances würden die gleichen Storage-Daten teilen

2. **Service-Restart**
   - Services werden beim Unload nicht entfernt
   - Bleibt nach Integration-Entfernung aktiv bis HA-Restart

---

### Changelog

**v1.0.1** (2025-01-25)
- Fix: Icon in manifest.json hinzugefügt
- Fix: Config Flow 500 Error behoben
- Fix: Entity-Namen zu "TimeTable" geändert
- Fix: Service-Registrierung verbessert
- Fix: integration_type korrigiert

**v1.0.0** (2025-01-25)
- Initial Release

---

### Upgrade-Anleitung / Upgrade Guide

#### Von v1.0.0 zu v1.0.1:

1. **Files ersetzen:**
   ```bash
   # Alle Dateien in custom_components/stundenplan/ überschreiben
   ```

2. **Home Assistant neu starten**

3. **Integration ist ready!**
   - Keine Datenbank-Migration nötig
   - Bestehende Schedules bleiben erhalten
   - Entity-IDs können sich ändern

4. **Cards aktualisieren** (falls nötig):
   ```yaml
   # Alte Entity:
   entity: sensor.stundenplan_current

   # Neue Entity:
   entity: sensor.timetable_current
   ```

---

### Technische Details / Technical Details

#### Service-Handler Pattern (Neu):

```python
async def handle_add_lesson(call: ServiceCall) -> None:
    # Dynamischer Zugriff auf aktuelle Instanz
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        _LOGGER.error("No TimeTable integration entry found")
        return

    entry = entries[0]
    storage = hass.data[DOMAIN][entry.entry_id]["storage"]
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

    # ... rest der Logik
```

**Vorteile:**
- Keine Closure-Probleme
- Funktioniert mit Reloads
- Keine Mehrfach-Registrierung
- Cleaner Code

---

### Support

Bei weiteren Problemen:
- 🐛 [GitHub Issues](https://github.com/alles-automatisch/timetable/issues)
- 💬 [Community](https://alles-automatisch.de/join)

---

**Alle Fehler behoben! Integration ist jetzt stabil und ready to use! ✅**
