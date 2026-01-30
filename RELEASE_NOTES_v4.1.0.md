# TimeTable v4.1.0 - Dashboard Cards Collection

**Release Date:** January 30, 2026
**Type:** Feature Release
**Status:** ✅ Production Ready

---

## 🎉 New Features

### Three Specialized Dashboard Cards

This release introduces a complete suite of Lovelace cards for displaying your timetable on the Home Assistant dashboard with different perspectives and use cases.

---

## 📱 1. Next Lesson Card (NEW)

**File:** `timetable-next-lesson-card.js`
**Purpose:** Compact, focused view of current and upcoming lessons
**Perfect for:** Dashboard quick glance, mobile views, at-a-glance status

### Features
- **Flexible Display Modes:**
  - Show current lesson only (when active)
  - Show previous lesson (if recently ended)
  - Show 1 or 2 upcoming lessons

- **Visual Design:**
  - Status badges (Now, Next, Previous, Later)
  - Color-coded lesson blocks
  - Smooth hover animations
  - Current lesson highlighted with gradient

- **Configuration:**
```yaml
type: custom:timetable-next-lesson-card
entity: sensor.timetable_current
show_current_only: false
show_previous: false
show_upcoming: 1        # 1 or 2
show_room: true
show_teacher: true
show_colors: true
show_logo: true
```

### Use Cases
- **Student Dashboard:** Quick view of what's happening now
- **Mobile View:** Compact display for phones
- **Family Dashboard:** Show next lesson for multiple schedules
- **Classroom Display:** Current and next period

---

## 📅 2. Full Schedule Card (NEW)

**File:** `timetable-schedule-card.js`
**Purpose:** Complete week view with current lesson highlighting
**Perfect for:** Weekly overview, planning, wall-mounted displays

### Features
- **Week Grid Layout:**
  - Responsive grid adapts to screen size
  - Shows Monday-Friday (optionally Saturday-Sunday)
  - Today column specially highlighted

- **Current Lesson:**
  - Pulse animation on active lesson
  - Blinking indicator badge
  - Gradient background highlight

- **Display Modes:**
  - Normal mode: Full details
  - Compact mode: Smaller for mobile
  - Weekend toggle: 5-day or 7-day view

- **Configuration:**
```yaml
type: custom:timetable-schedule-card
entity: sensor.timetable_current
show_weekends: false
compact_mode: false
highlight_current: true
show_room: true
show_teacher: true
show_colors: true
show_logo: true
```

### Use Cases
- **Tablet Dashboard:** Full week at a glance
- **Wall Display:** Classroom or home schedule board
- **Planning View:** See entire week's commitments
- **Family Calendar:** Everyone's schedule together

---

## 🏫 3. Enhanced Original Card

**File:** `timetable-card.js` (Updated to v4.1.0)
**Purpose:** Flexible card with today/week toggle views
**Perfect for:** Users who want control over view mode

### New in v4.1.0
- **Logo Support:** Show integration logo in header
- **MDI Icons:** Automatic Material Design Icons loading
- **Improved Styling:** Better header layout
- **Configurable Logo:** Custom logo URL option

---

## 🎨 Design Features

### Consistent Design Language
- **Mushroom-Inspired:** Clean, modern, minimal aesthetic
- **Color Accents:** Lesson colors used throughout
- **Smooth Animations:** Hover effects, pulse animations
- **Responsive:** Works on all screen sizes

### Logo Integration
- **Professional Branding:** Integration logo in card headers
- **Automatic Fallback:** MDI icon if logo fails to load
- **Customizable:** Set custom logo URL
- **Consistent:** Same logo across all cards

### Theme Support
- **Light Mode:** Bright, clean design
- **Dark Mode:** High contrast, easy on eyes
- **CSS Variables:** Respects Home Assistant themes
- **Accessible:** Semantic HTML structure

---

## 📦 What's Included

### New Files
- `www/timetable-next-lesson-card.js` → Next Lesson Card (685 lines)
- `www/timetable-schedule-card.js` → Full Schedule Card (745 lines)
- `CARDS.md` → Comprehensive card documentation

### Modified Files
- `www/timetable-card.js` → Enhanced with logo support (v4.1.0)
- `custom_components/timetable/manifest.json` → v4.1.0
- `CHANGELOG.md` → v4.1.0 entry

### Documentation
- Complete configuration examples
- Use case scenarios
- Troubleshooting guide
- Layout examples

---

## 🚀 Upgrade Instructions

### From v4.0.x

**Via HACS (Recommended):**
1. HACS → Integrations → TimeTable → Update
2. Restart Home Assistant
3. **Hard refresh browser** (Ctrl+F5 or Cmd+Shift+R)
4. Cards are automatically available!

**Manual:**
1. Pull latest from GitHub
2. Copy `www/` files to your Home Assistant `www/` folder
3. Restart Home Assistant
4. Hard refresh browser

**No Breaking Changes** - All existing cards continue to work

---

## 📝 Adding Cards to Dashboard

### Via UI (Easiest)
1. Edit Dashboard
2. Add Card → Search "timetable"
3. Choose from:
   - TimeTable Next Lesson
   - TimeTable Full Schedule
   - TimeTable (original)
4. Configure options
5. Save

### Via YAML
Add to your `ui-lovelace.yaml` or dashboard config:

```yaml
type: custom:timetable-next-lesson-card
entity: sensor.timetable_current
show_upcoming: 2
```

---

## 🎯 Configuration Examples

### Quick Glance Dashboard
```yaml
views:
  - title: Home
    cards:
      # What's happening now
      - type: custom:timetable-next-lesson-card
        entity: sensor.timetable_current
        show_upcoming: 1

      # Week overview
      - type: custom:timetable-schedule-card
        entity: sensor.timetable_current
        compact_mode: true
```

### Tablet Wall Display
```yaml
views:
  - title: Schedule
    cards:
      - type: custom:timetable-schedule-card
        entity: sensor.timetable_current
        show_weekends: true
        compact_mode: false
        highlight_current: true
```

### Mobile Dashboard
```yaml
views:
  - title: Home
    cards:
      - type: custom:timetable-next-lesson-card
        entity: sensor.timetable_current
        show_current_only: true
        show_room: false
        compact_mode: true
```

---

## 🧪 Testing Checklist

### After Upgrade
- [ ] Dashboard loads without errors
- [ ] All three card types appear in card picker
- [ ] Next Lesson Card displays correctly
- [ ] Full Schedule Card shows week grid
- [ ] Original TimeTable Card still works
- [ ] Logos display in headers (or fallback to icon)
- [ ] Current lesson is highlighted (if active)
- [ ] Animations are smooth
- [ ] Cards work in light theme
- [ ] Cards work in dark theme
- [ ] Mobile responsive layout works
- [ ] Icons display properly

### Feature Testing

**Next Lesson Card:**
- [ ] Shows current lesson when active
- [ ] Shows next lesson
- [ ] "Now" badge appears on current
- [ ] Previous lesson option works
- [ ] Upcoming 2 lessons option works
- [ ] Vacation banner appears when on vacation

**Full Schedule Card:**
- [ ] Week grid displays all weekdays
- [ ] Today column is highlighted
- [ ] Current lesson pulses
- [ ] Compact mode works
- [ ] Weekend toggle works
- [ ] Empty days show "Free day"

**Original Card:**
- [ ] Today view works
- [ ] Week view works
- [ ] View toggle buttons work
- [ ] Logo displays in header

---

## 💡 Usage Tips

### Next Lesson Card
- **Dashboard Top:** Place at top for immediate visibility
- **Mobile:** Use `show_current_only: true` to save space
- **Multiple Cards:** Create one per family member/schedule

### Full Schedule Card
- **Tablet View:** Use normal mode for full details
- **Mobile:** Enable `compact_mode: true`
- **Wall Display:** Disable compact mode, enable weekends

### Logo Configuration
- **Default Path:** `/local/community/timetable/logo.png`
- **Custom Logo:** Set `logo_url: /local/my-logo.png`
- **Disable Logo:** Set `show_logo: false`

---

## 🎨 Design Highlights

### Visual Polish
- **Gradient Backgrounds:** Current lessons stand out
- **Pulse Animation:** Subtly draws attention to active lesson
- **Status Badges:** Clear indication of lesson timing
- **Color Accents:** Border and icons match lesson colors

### Responsive Design
- **Grid Layout:** Automatically adapts to screen width
- **Compact Mode:** Optimized for mobile devices
- **Touch Friendly:** Proper tap targets for mobile
- **Flexible Heights:** Cards adjust to content

### Professional Appearance
- **Consistent Typography:** Clean, readable fonts
- **Proper Spacing:** Neither cramped nor wasteful
- **Subtle Shadows:** Depth without distraction
- **Smooth Transitions:** Polished interactions

---

## 📊 Comparison

| Feature | Next Lesson | Full Schedule | Original |
|---------|-------------|---------------|----------|
| **Size** | Compact (2 rows) | Large (6-10 rows) | Medium (3-6 rows) |
| **Focus** | Current/Next | Entire Week | Today or Week |
| **Best For** | Quick glance | Overview | Flexible |
| **Mobile** | Excellent | Good (compact mode) | Good |
| **Highlighting** | Status badges | Pulse animation | Border highlight |
| **Customization** | High | High | Medium |

---

## 🔧 Technical Details

### Architecture
- **Modular:** Each card is independent
- **Shadow DOM:** Style isolation
- **MDI Auto-load:** Icons always available
- **Theme-Aware:** Respects CSS variables

### Performance
- **Efficient Rendering:** Only updates when data changes
- **Lightweight:** Minimal JavaScript/CSS
- **No Dependencies:** Pure Web Components
- **Fast Loading:** Optimized code

### Browser Support
- ✅ Chrome/Edge 88+
- ✅ Firefox 92+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## 📝 Known Issues

### None Critical
All cards have been thoroughly tested.

### Minor Notes
- Logo path may need adjustment based on installation method
- Touch gestures are basic (improved in future versions)
- Week view on very small screens may require scrolling

---

## 🔗 Links

- **Repository:** https://github.com/alles-automatisch/timetable
- **Issues:** https://github.com/alles-automatisch/timetable/issues
- **Documentation:** See CARDS.md for full guide
- **Previous Release:** v4.0.4

---

## 📢 Announcement Text

### Social Media
```
🎉 TimeTable v4.1.0

NEW Dashboard Cards:
📱 Next Lesson Card - Compact, focused view
📅 Full Schedule Card - Complete week grid
🏫 Enhanced Original Card - Logo support

Beautiful, responsive, customizable!
Update via HACS 🚀

#HomeAssistant #TimeTable
```

### Forum
```
[Release] TimeTable v4.1.0 - Dashboard Cards Collection

THREE NEW WAYS to display your schedule:

1. NEXT LESSON CARD
   - Compact, focused view
   - Perfect for quick glance
   - Shows current and upcoming

2. FULL SCHEDULE CARD
   - Complete week grid layout
   - Current lesson highlighted
   - Responsive design

3. ENHANCED ORIGINAL CARD
   - Logo support added
   - Improved styling
   - Same flexibility

All cards feature:
✓ Integration logo in header
✓ Smooth animations
✓ Light/dark theme support
✓ Mobile responsive
✓ Customizable options

See CARDS.md for complete guide!

Update via HACS!
```

---

## ✅ Summary

Version 4.1.0 introduces a complete suite of dashboard cards, giving users multiple ways to display their timetable with different focuses and use cases. Each card is polished, responsive, and customizable.

**Key Highlights:**
- **Three specialized cards** for different use cases
- **Professional design** with logo integration
- **Fully responsive** for all screen sizes
- **Comprehensive documentation** in CARDS.md

**Recommended upgrade for all users wanting better dashboard integration.**

---

## 🔄 What's Next

### Planned for v4.2
- Touch gesture improvements
- Card editor UI for configuration
- Additional card layouts
- Calendar integration features

---

**Questions? Issues?**
- Check CARDS.md for complete guide
- Open GitHub issue if needed
- Include card type and configuration

**Beautiful Dashboards! 📅✨**
