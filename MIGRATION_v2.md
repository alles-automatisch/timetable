# Migration Guide: v1.x to v2.0.0

## Overview

Version 2.0.0 renames the integration domain from `stundenplan` to `timetable` for better international compatibility and consistency.

⚠️ **This is a BREAKING CHANGE** - You must migrate your installation.

## What Changed

### Domain Rename
| Old (v1.x) | New (v2.0.0) |
|------------|--------------|
| Domain: `stundenplan` | Domain: `timetable` |
| Directory: `custom_components/stundenplan/` | Directory: `custom_components/timetable/` |
| Card file: `www/stundenplan-card.js` | Card file: `www/timetable-card.js` |

### Entity IDs Changed
All entity IDs now use the `timetable` prefix:

| Old Entity ID | New Entity ID |
|---------------|---------------|
| `sensor.stundenplan_current` | `sensor.timetable_current` |
| `sensor.stundenplan_next_lesson` | `sensor.timetable_next_lesson` |
| `binary_sensor.stundenplan_is_schooltime` | `binary_sensor.timetable_is_schooltime` |

### Service Names Changed
All services now use the `timetable` domain:

| Old Service | New Service |
|-------------|-------------|
| `stundenplan.set_schedule` | `timetable.set_schedule` |
| `stundenplan.add_lesson` | `timetable.add_lesson` |
| `stundenplan.remove_lesson` | `timetable.remove_lesson` |
| `stundenplan.add_vacation` | `timetable.add_vacation` |
| `stundenplan.remove_vacation` | `timetable.remove_vacation` |

### Card Type Changed
The Lovelace card type has been renamed:

**Old:**
```yaml
type: custom:stundenplan-card
entity: sensor.stundenplan_current
```

**New:**
```yaml
type: custom:timetable-card
entity: sensor.timetable_current
```

## Migration Steps

### Step 1: Backup Your Data

Before migrating, back up your schedule data:

1. Go to Developer Tools → States
2. Find `sensor.stundenplan_current`
3. Copy all attributes (schedule data)
4. Save to a text file

### Step 2: Remove Old Integration

1. **Settings** → **Devices & Services**
2. Find "TimeTable" integration
3. Click three dots → **Delete**
4. Confirm deletion

### Step 3: Clean Up Old Files

**For HACS users:**
1. HACS → Integrations
2. Find "TimeTable"
3. Click three dots → **Remove**

**For manual installation:**
```bash
# Remove old files
rm -rf config/custom_components/stundenplan/
rm config/www/stundenplan-card.js
```

### Step 4: Install v2.0.0

**Via HACS:**
1. HACS → Integrations
2. Search for "TimeTable"
3. Install (will install v2.0.0)
4. Restart Home Assistant

**Manual Installation:**
1. Download v2.0.0 from releases
2. Extract to `config/custom_components/timetable/`
3. Copy `www/timetable-card.js` to `config/www/`
4. Restart Home Assistant

### Step 5: Add Integration

1. **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "TimeTable"
4. Configure with same settings as before
5. Integration will create new entities with `timetable` prefix

### Step 6: Restore Your Schedule

Use the backup from Step 1 to recreate your schedule:

**Option A: Via UI (Services)**
1. Developer Tools → Services
2. Use `timetable.set_schedule` service
3. Paste your backup data

**Option B: Via Automation**
Create temporary automation with your schedule data

### Step 7: Update Dashboard Cards

For each dashboard with the TimeTable card:

1. **Edit Dashboard**
2. Find TimeTable cards
3. **Three dots** → **Edit**
4. **Show Code Editor**
5. Change:
   ```yaml
   type: custom:stundenplan-card
   entity: sensor.stundenplan_current
   ```
   To:
   ```yaml
   type: custom:timetable-card
   entity: sensor.timetable_current
   ```
6. **Save**

### Step 8: Update Automations

Search all automations for old entity IDs and services:

**Find and replace:**
- `sensor.stundenplan_` → `sensor.timetable_`
- `binary_sensor.stundenplan_` → `binary_sensor.timetable_`
- `stundenplan.` → `timetable.`

**Example automation update:**

**Before:**
```yaml
trigger:
  - platform: state
    entity_id: sensor.stundenplan_next_lesson
action:
  - service: stundenplan.add_vacation
```

**After:**
```yaml
trigger:
  - platform: state
    entity_id: sensor.timetable_next_lesson
action:
  - service: timetable.add_vacation
```

### Step 9: Update Scripts

If you have scripts using the old services:

1. **Settings** → **Automations & Scenes** → **Scripts**
2. Edit each script
3. Replace service calls: `stundenplan.*` → `timetable.*`
4. Update entity references

### Step 10: Clear Browser Cache

To ensure the new card loads:

1. Hard refresh your browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Or clear Home Assistant frontend cache:
   - Profile → Developer Tools → Clear Frontend Cache

### Step 11: Verify Installation

**Check entities exist:**
1. Developer Tools → States
2. Filter: `timetable`
3. Should see:
   - `sensor.timetable_current`
   - `sensor.timetable_next_lesson`
   - `binary_sensor.timetable_is_schooltime`

**Check services work:**
1. Developer Tools → Services
2. Search for `timetable`
3. Should see all 5 services

**Check card loads:**
1. Dashboard with card should display correctly
2. Check browser console for errors (F12)

## Troubleshooting

### Card Not Loading

**Symptom:** Card shows "Custom element doesn't exist: stundenplan-card"

**Fix:**
1. Verify `timetable-card.js` is in `/www/` directory
2. Update card type to `custom:timetable-card`
3. Clear browser cache (Ctrl+Shift+R)
4. Check Resources: Configuration → Dashboards → Resources
5. Should have: `/local/timetable-card.js`

### Entities Not Found

**Symptom:** Dashboard shows "Entity not available"

**Fix:**
1. Check integration is installed: Settings → Integrations
2. Check entity IDs: Developer Tools → States → Filter "timetable"
3. Update card entity to new ID: `sensor.timetable_current`

### Services Not Found

**Symptom:** Automation fails with "Service not found"

**Fix:**
1. Verify integration is running
2. Check logs: Settings → System → Logs
3. Update service calls to use `timetable` domain

### Old Data Missing

**Symptom:** Schedule is empty after migration

**Fix:**
1. Restore from backup (Step 1)
2. Use `timetable.set_schedule` service
3. Or manually re-add lessons via services

## Complete Example: Before & After

### Before (v1.x)

**Lovelace Card:**
```yaml
type: custom:stundenplan-card
entity: sensor.stundenplan_current
title: My Schedule
show_weekends: false
```

**Automation:**
```yaml
automation:
  - alias: "Morning Reminder"
    trigger:
      - platform: state
        entity_id: sensor.stundenplan_next_lesson
    action:
      - service: notify.mobile_app
        data:
          message: "Next: {{ state_attr('sensor.stundenplan_current', 'next_lesson').subject }}"
```

**Service Call:**
```yaml
service: stundenplan.add_lesson
data:
  weekday: monday
  lesson:
    subject: Math
    start_time: "08:00"
    end_time: "08:45"
```

### After (v2.0.0)

**Lovelace Card:**
```yaml
type: custom:timetable-card
entity: sensor.timetable_current
title: My Schedule
show_weekends: false
```

**Automation:**
```yaml
automation:
  - alias: "Morning Reminder"
    trigger:
      - platform: state
        entity_id: sensor.timetable_next_lesson
    action:
      - service: notify.mobile_app
        data:
          message: "Next: {{ state_attr('sensor.timetable_current', 'next_lesson').subject }}"
```

**Service Call:**
```yaml
service: timetable.add_lesson
data:
  weekday: monday
  lesson:
    subject: Math
    start_time: "08:00"
    end_time: "08:45"
```

## Why This Change?

**Better International Naming:**
- `timetable` is more universally understood
- Reduces confusion for non-German speakers
- Aligns with integration name "TimeTable"

**Consistency:**
- Domain matches the public-facing name
- Professional and clear branding

**Translations Still Work:**
- German translations still show "Stundenplan"
- UI displays correctly in all languages

## Need Help?

If you encounter issues during migration:

1. **Check Logs:** Settings → System → Logs → Filter "timetable"
2. **GitHub Issues:** https://github.com/alles-automatisch/timetable/issues
3. **Community Forum:** Post in Home Assistant community

## Rollback (Not Recommended)

If you need to rollback to v1.0.8:

1. Remove v2.0.0 integration
2. Reinstall v1.0.8 from HACS or GitHub releases
3. Note: v1.0.8 will not receive future updates

---

**Estimated Migration Time:** 15-30 minutes

**Recommended:** Perform migration during low-usage time
