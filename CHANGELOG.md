# Changelog

All notable changes to TimeTable will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
