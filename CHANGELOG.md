# Changelog

All notable changes to TimeTable will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-29

### ⚠️ BREAKING CHANGES

This is a major release that renames the integration domain from `stundenplan` to `timetable` for better international compatibility.

**Migration Required:**
- Entity IDs changed: `sensor.stundenplan_*` → `sensor.timetable_*`
- Service names changed: `stundenplan.*` → `timetable.*`
- Card type changed: `custom:stundenplan-card` → `custom:timetable-card`
- Card file renamed: `stundenplan-card.js` → `timetable-card.js`
- Directory renamed: `custom_components/stundenplan/` → `custom_components/timetable/`

**How to Migrate:**
1. Remove old integration from HA
2. Delete `custom_components/stundenplan/` directory
3. Delete `www/stundenplan-card.js` file
4. Install v2.0.0 via HACS or manually
5. Add integration again (new domain: `timetable`)
6. Update all dashboard cards from `stundenplan-card` to `timetable-card`
7. Update automations to use new entity IDs and service names

### Changed
- **Domain**: Renamed from `stundenplan` to `timetable`
- **Entity IDs**: All entities now use `timetable` prefix
- **Services**: All services now use `timetable` domain
- **Card**: Renamed to `timetable-card`
- **German translations**: "Stundenplan" remains in German translation files only

### Rationale
This change provides better international naming and makes the integration more accessible to non-German speakers while maintaining proper German translations.

## [1.0.8] - 2026-01-29

### Fixed
- Fixed terminology inconsistency - changed "Stundenplan" to "TimeTable" in strings.json
- Fixed terminology inconsistency - changed "Timetable" (lowercase t) to "TimeTable" in en.json
- Completed strings.json with entity and service translations
- Fixed README instruction (changed "Stundenplan" to "TimeTable" in installation steps)

### Added
- Added async_setup() stub function for full Home Assistant compatibility

### Changed
- Updated frontend card version to match backend (1.0.8)
- Improved translation system completeness

## [1.0.7] - 2026-01-26

### Added
- Added icon.png and logo.png for HACS integration store display
- Icons now visible in HACS store listing

### Changed
- README already in English for HACS compatibility
- Improved HACS store presentation

## [1.0.6] - 2026-01-26

### Fixed
- Fixed integration not appearing in Home Assistant's "Add Integration" list
- Config flow now properly shows form before creating entry (required by HA)
- Integration is now discoverable and can be added via UI

### Changed
- Config flow shows configuration form with pre-filled default values
- User can now see and adjust settings before confirming
- Follows Home Assistant's config flow best practices

## [1.0.5] - 2026-01-26

### Fixed
- Fixed critical import error in config_flow.py that prevented integration from appearing in HA
- Added missing DEFAULT_SCHEDULE_NAME import that caused NameError on load
- Integration now properly appears in the integration list

### Changed
- All Python files validated for syntax errors
- Improved error handling and logging

## [1.0.4] - 2026-01-26

### Fixed
- Fixed 500 Internal Server Error during config flow initialization
- Config flow now automatically creates entry with default values
- Removed unnecessary user input step that caused loading errors
- Simplified imports in config flow to prevent import errors

### Changed
- Config flow now starts automatically when integration is added
- No manual user input required for initial setup
- Configuration can still be changed via Options flow

## [1.0.1] - 2025-01-25

### Fixed
- Fixed 500 Internal Server Error when loading config flow
- Added missing icon in manifest.json (`mdi:school`)
- Corrected integration_type from `device` to `service`
- Fixed service registration conflicts on reload
- Improved entity naming (changed from "Stundenplan" to "TimeTable")
- Fixed HACS validation errors in hacs.json
- Added `_attr_has_entity_name = False` to prevent entity naming issues

### Changed
- Services now register only once and access storage/coordinator dynamically
- Entity names updated to use "TimeTable" prefix
- Simplified hacs.json for better HACS compatibility

## [1.0.0] - 2025-01-25

### Added
- Initial release of TimeTable integration
- Custom component with full HACS support
- Schedule management system
  - Weekly schedule support (Monday-Sunday)
  - Lesson metadata (subject, time, room, teacher, notes, color, icon)
  - Multiple schedule profiles
  - Free period detection
- Vacation period management
  - Date range support
  - Custom vacation labels
  - Vacation state detection
- Three entities:
  - `sensor.stundenplan_current` - Current lesson/state sensor
  - `sensor.stundenplan_next_lesson` - Next lesson sensor
  - `binary_sensor.stundenplan_is_schooltime` - Active lesson binary sensor
- Five services:
  - `stundenplan.set_schedule` - Import/update complete schedule
  - `stundenplan.add_lesson` - Add single lesson
  - `stundenplan.remove_lesson` - Remove lesson by index
  - `stundenplan.add_vacation` - Add vacation period
  - `stundenplan.remove_vacation` - Remove vacation by index
- Lovelace custom card
  - Today view mode
  - Week view mode
  - Current lesson display
  - Next lesson preview
  - Full day schedule list
  - Vacation banner
  - GUI editor (no YAML required)
  - Responsive design
  - Light/dark theme support
  - Configurable display options
  - Compact mode
- Internationalization
  - English (en) translations
  - German (de) translations
- Configuration Flow
  - GUI-based setup
  - Options flow for settings
- Documentation
  - Complete README
  - Quick start guide
  - Example configurations
  - Automation examples
  - Service documentation

### Technical
- DataUpdateCoordinator for efficient updates (60s interval)
- JSON-based persistent storage
- Timezone-aware datetime handling
- Error handling and logging
- Type hints throughout
- Clean modular architecture

[1.0.0]: https://github.com/alles-automatisch/timetable/releases/tag/v1.0.0
