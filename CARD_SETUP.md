# TimeTable Dashboard Cards - Setup Guide

## Card Files Not Showing Up?

If you can't find the TimeTable cards when adding them to your dashboard, follow these steps:

## Option 1: Automatic via HACS (Recommended)

1. **Reinstall via HACS:**
   - HACS → Integrations → TimeTable → Redownload
   - This ensures all files are properly copied

2. **Restart Home Assistant:**
   ```
   Settings → System → Restart
   ```

3. **Clear Browser Cache:**
   - Chrome/Edge: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E
   - **Or use Incognito/Private mode to test**

4. **Hard Refresh:**
   - Windows/Linux: Ctrl+F5
   - Mac: Cmd+Shift+R

## Option 2: Manual Resource Registration

If automatic discovery doesn't work, add the resources manually:

1. **Go to Settings → Dashboards → Resources**

2. **Add these three resources:**

   **Resource 1: Original Card**
   - URL: `/hacsfiles/timetable/timetable-card.js`
   - Type: JavaScript Module

   **Resource 2: Next Lesson Card**
   - URL: `/hacsfiles/timetable/timetable-next-lesson-card.js`
   - Type: JavaScript Module

   **Resource 3: Full Schedule Card**
   - URL: `/hacsfiles/timetable/timetable-schedule-card.js`
   - Type: JavaScript Module

3. **Refresh your browser**

## Option 3: Manual File Copy

If HACS paths don't work:

1. **Copy card files to www folder:**
   ```bash
   cd /config
   mkdir -p www/timetable
   cp custom_components/timetable/www/*.js www/timetable/
   cp custom_components/timetable/www/*.png www/timetable/
   ```

2. **Add resources with local paths:**
   - URL: `/local/timetable/timetable-card.js`
   - URL: `/local/timetable/timetable-next-lesson-card.js`
   - URL: `/local/timetable/timetable-schedule-card.js`

3. **Restart Home Assistant**

## Verification

After setup, verify the cards are loaded:

1. **Open Browser Console (F12)**
2. **Look for these messages:**
   ```
   TIMETABLE-CARD 4.1.0
   TIMETABLE-NEXT-LESSON-CARD 1.0.0
   TIMETABLE-SCHEDULE-CARD 1.0.0
   ```

3. **Try adding a card:**
   - Edit Dashboard
   - Add Card
   - Search for "timetable"
   - You should see 3 cards:
     - TimeTable
     - TimeTable Next Lesson
     - TimeTable Full Schedule

## Troubleshooting

### Cards still not appearing?

**Check 1: File locations**
```bash
# Files should exist at:
ls -la /config/custom_components/timetable/www/
# Should show:
#  timetable-card.js
#  timetable-next-lesson-card.js
#  timetable-schedule-card.js
#  logo.png
```

**Check 2: Browser console**
- Open F12 → Console tab
- Look for red errors
- Common issues:
  - 404 errors = files not found (wrong path)
  - CORS errors = serving issue (restart HA)
  - Script errors = check file integrity

**Check 3: Home Assistant logs**
```
Settings → System → Logs
Filter for: timetable
```

### Resource Path Priority

Home Assistant checks paths in this order:
1. `/hacsfiles/{integration}/` - HACS managed files
2. `/local/{folder}/` - www folder files
3. `/customcards/` - deprecated

Use the path that works for your installation.

## Quick Test

**Add a simple test card:**

```yaml
type: custom:timetable-next-lesson-card
entity: sensor.timetable_current
```

If this works, all three cards are properly loaded!

## Getting Help

If cards still don't work after trying all options:

1. **Check GitHub Issues:**
   https://github.com/alles-automatisch/timetable/issues

2. **Open new issue with:**
   - Home Assistant version
   - HACS version
   - Browser console errors (F12)
   - Resource URLs you tried
   - File listing from `/config/custom_components/timetable/www/`

## Alternative: Use Panel Only

If dashboard cards don't work, you can still use the full-featured panel:

**Sidebar → ⏰ TimeTable Manager**

The panel has all functionality built-in and doesn't require card setup!

---

**Need help?** https://github.com/alles-automatisch/timetable/issues
