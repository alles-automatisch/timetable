# Known Issues & Solutions

## Console Errors

### card-mod.js 404 Error (Non-Critical)

**Error:**
```
GET http://homeassistant.local:8123/www/community/lovelace-card-mod/card-mod.js 404
Uncaught TypeError: Failed to fetch dynamically imported module
```

**Cause:**
- Home Assistant tries to load global Lovelace resources in panel iframes
- This is expected behavior from HA, not our panel
- The panel works perfectly fine despite this error

**Impact:**
- ✅ Panel functionality: NOT AFFECTED
- ✅ Icon display: Works correctly
- ✅ All features: Fully functional
- ⚠️ Console: Shows error message (cosmetic only)

**Solutions:**

**Option 1: Ignore (Recommended)**
- The error is harmless
- Panel works perfectly
- No action needed

**Option 2: Install card-mod (Optional)**
```bash
# Via HACS
HACS → Frontend → Search "card-mod" → Install
```
This will satisfy HA's resource loading, but it's not required for our panel.

**Option 3: Filter Console (For Development)**
```javascript
// In browser DevTools → Console → Filter
-card-mod
```

**Fixed in v4.0.2:**
- Added error suppression for non-critical HA resource errors
- Console now cleaner
- Panel still fully functional

---

## Browser Compatibility

### Shadow DOM Support
**Required:** Modern browsers with Shadow DOM support

**Supported:**
- ✅ Chrome/Edge 88+
- ✅ Firefox 92+
- ✅ Safari 14+

**Not Supported:**
- ❌ IE 11
- ❌ Old mobile browsers

---

## Performance

### Large Schedules
**Issue:** Week grid may slow down with 50+ lessons
**Solution:** Use compact mode or filter by day

### Drag & Drop on Mobile
**Issue:** Touch events not as smooth as mouse
**Workaround:** Use edit modals on mobile (coming in v4.1)

---

## Known Limitations

### 1. Time Range Fixed
- Currently limited to 6am-6pm
- Custom time ranges planned for v4.2

### 2. Undo Stack Not Persistent
- Undo history cleared on HA restart
- Use Export feature for backups

### 3. Multi-Schedule UI
- Backend supports it, UI doesn't yet
- Planned for v4.3

### 4. Resize Touch Support
- Resize handles work best with mouse
- Touch support coming in v4.1

---

## Workarounds

### Issue: Icons Don't Load
**Symptoms:** Blank squares instead of icons
**Cause:** CDN blocked or slow connection
**Solution:**
1. Check browser DevTools → Network tab
2. Verify `materialdesignicons.min.css` loads
3. Check firewall/ad-blocker settings
4. Hard refresh (Ctrl+F5)

### Issue: Vacations Tab Empty
**Symptoms:** "No vacations" shown even though some exist
**Cause:** Data not yet loaded from coordinator
**Solution:** Wait 60 seconds for coordinator refresh

### Issue: Changes Don't Save
**Symptoms:** Edits revert after refresh
**Cause:** WebSocket connection issue
**Solution:**
1. Check HA logs for errors
2. Verify integration is loaded
3. Restart integration
4. Check browser console for errors

---

## Reporting Issues

### Before Reporting
1. Check this file for known issues
2. Check browser console (F12) for errors
3. Try hard refresh (Ctrl+F5)
4. Test in incognito/private mode
5. Verify Home Assistant is up to date

### How to Report
1. Go to: https://github.com/alles-automatisch/timetable/issues
2. Click "New Issue"
3. Include:
   - Home Assistant version
   - Browser version
   - Console errors (F12)
   - Steps to reproduce
   - Expected vs actual behavior

### Template
```markdown
**Environment:**
- HA Version: 2024.x.x
- Browser: Chrome 120
- TimeTable Version: 4.0.x

**Issue:**
[Describe the problem]

**Console Errors:**
```
[Paste errors from F12 Console]
```

**Steps to Reproduce:**
1. Open TimeTable Manager
2. Click X button
3. See error

**Expected:**
[What should happen]

**Actual:**
[What actually happens]

**Screenshots:**
[If applicable]
```

---

## FAQ

### Q: Why do I see card-mod errors?
**A:** Home Assistant loads global resources. Harmless, panel works fine.

### Q: Can I customize the time range?
**A:** Not yet. Fixed to 6am-6pm. Coming in v4.2.

### Q: Does drag & drop work on mobile?
**A:** Yes, but touch support is basic. Use edit modals for best experience.

### Q: How do I backup my schedule?
**A:** Click Import/Export → Export Schedule → Save JSON file

### Q: Can I have multiple schedules?
**A:** Backend supports it, UI doesn't yet. Coming in v4.3.

### Q: Why don't my changes save?
**A:** Check WebSocket connection and HA logs. Restart integration if needed.

### Q: How do I report a bug?
**A:** GitHub Issues with console errors and reproduction steps.

---

## Fixed Issues

### v4.0.1
- ✅ Broken icons (replaced ha-icon with MDI)
- ✅ Vacations tab not clickable
- ✅ Poor typography
- ✅ Dashboard helper missing

### v4.0.0
- ✅ No visual management interface
- ✅ Manual service calls required
- ✅ No drag & drop
- ✅ No templates

---

## Upcoming Fixes

### v4.0.2 (Current)
- Error suppression for non-critical HA errors
- Better console logging
- MDI loading feedback

### v4.1 (Planned)
- Touch-friendly drag & drop
- Mobile optimizations
- Persistent undo history

### v4.2 (Planned)
- Custom time ranges
- Bulk operations
- Keyboard navigation improvements

---

**Last Updated:** January 30, 2026
**Version:** 4.0.2-dev
