# TimeTable Dashboard Cards

TimeTable provides three specialized Lovelace cards for displaying your schedule on the Home Assistant dashboard.

## Available Cards

### 1. Next Lesson Card (`timetable-next-lesson-card`)
**Purpose:** Compact card showing current and upcoming lessons
**Best for:** Quick glance at what's happening now and next
**Card Size:** 2 rows

### 2. Full Schedule Card (`timetable-schedule-card`)
**Purpose:** Complete week view with current lesson highlighting
**Best for:** Overview of entire week's schedule
**Card Size:** 6-10 rows (configurable with compact_mode)

### 3. TimeTable Card (`timetable-card`)
**Purpose:** Original card with today/week toggle views
**Best for:** Flexible viewing with user-controlled perspective
**Card Size:** 3-6 rows (configurable with compact_mode)

---

## Installation

### Via HACS (Automatic)
The cards are automatically installed with the TimeTable integration. Just add them to your dashboard!

### Manual Installation
1. Copy card files from `www/` to your Home Assistant `www/` folder:
   - `timetable-next-lesson-card.js`
   - `timetable-schedule-card.js`
   - `timetable-card.js`
   - `logo.png` (optional)

2. Add as resources in your Lovelace configuration:
```yaml
resources:
  - url: /local/timetable-next-lesson-card.js
    type: module
  - url: /local/timetable-schedule-card.js
    type: module
  - url: /local/timetable-card.js
    type: module
```

---

## Next Lesson Card

### Basic Configuration
```yaml
type: custom:timetable-next-lesson-card
entity: sensor.timetable_current
```

### Full Configuration
```yaml
type: custom:timetable-next-lesson-card
entity: sensor.timetable_current
title: "Next Lesson"
show_current_only: false    # Only show when lesson is active
show_previous: false         # Show recently finished lesson
show_upcoming: 1             # Show 1 or 2 upcoming lessons
show_room: true
show_teacher: true
show_colors: true
show_logo: true
logo_url: /local/community/timetable/logo.png
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | TimeTable entity (sensor.timetable_current) |
| `title` | string | "Next Lesson" | Card title |
| `show_current_only` | boolean | false | Only show current lesson (hide next if no lesson active) |
| `show_previous` | boolean | false | Show the previous lesson if no current lesson |
| `show_upcoming` | number | 1 | Show 1 or 2 upcoming lessons (1 or 2) |
| `show_room` | boolean | true | Display room information |
| `show_teacher` | boolean | true | Display teacher information |
| `show_colors` | boolean | true | Use lesson colors for accents |
| `show_logo` | boolean | true | Show integration logo in header |
| `logo_url` | string | auto | Custom logo URL |

### Use Cases

**Dashboard Quick Glance:**
```yaml
show_upcoming: 1
show_room: true
show_teacher: true
```

**Minimal Current Lesson:**
```yaml
show_current_only: true
show_upcoming: 0
show_room: false
show_teacher: false
```

**Student View with Context:**
```yaml
show_previous: true
show_upcoming: 2
```

### Visual Features
- **Status Badges:** "Now", "Next", "Previous", "Later"
- **Color Accents:** Border and icon match lesson color
- **Hover Effects:** Subtle lift animation
- **Current Lesson:** Highlighted with gradient background
- **Icons:** Material Design Icons for visual clarity

---

## Full Schedule Card

### Basic Configuration
```yaml
type: custom:timetable-schedule-card
entity: sensor.timetable_current
```

### Full Configuration
```yaml
type: custom:timetable-schedule-card
entity: sensor.timetable_current
title: "Weekly Schedule"
show_weekends: false
show_room: true
show_teacher: true
show_colors: true
show_logo: true
logo_url: /local/community/timetable/logo.png
compact_mode: false
highlight_current: true
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | TimeTable entity (sensor.timetable_current) |
| `title` | string | "Schedule" | Card title |
| `show_weekends` | boolean | false | Include Saturday and Sunday |
| `show_room` | boolean | true | Display room information |
| `show_teacher` | boolean | true | Display teacher information |
| `show_colors` | boolean | true | Use lesson colors for accents |
| `show_logo` | boolean | true | Show integration logo in header |
| `logo_url` | string | auto | Custom logo URL |
| `compact_mode` | boolean | false | Reduce spacing and font sizes |
| `highlight_current` | boolean | true | Pulse animation on current lesson |

### Use Cases

**Classroom Display (Large Screen):**
```yaml
show_weekends: false
compact_mode: false
highlight_current: true
```

**Mobile Dashboard:**
```yaml
compact_mode: true
show_room: false
show_teacher: false
```

**Family Calendar (Including Weekends):**
```yaml
show_weekends: true
show_colors: true
```

### Visual Features
- **Responsive Grid:** Adapts to screen width
- **Today Highlight:** Special styling for current day column
- **Pulse Animation:** Current lesson subtly pulses
- **Empty States:** Clear "Free day" indicator
- **Vacation Banner:** Full-width gradient when on vacation

---

## TimeTable Card (Original)

### Basic Configuration
```yaml
type: custom:timetable-card
entity: sensor.timetable_current
```

### Full Configuration
```yaml
type: custom:timetable-card
entity: sensor.timetable_current
title: "TimeTable"
view: today                 # 'today' or 'week'
show_weekends: false
show_room: true
show_teacher: true
show_colors: true
show_logo: true
logo_url: /local/community/timetable/logo.png
compact_mode: false
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **required** | TimeTable entity (sensor.timetable_current) |
| `title` | string | "TimeTable" | Card title |
| `view` | string | "today" | Default view: "today" or "week" |
| `show_weekends` | boolean | false | Include Saturday and Sunday (week view) |
| `show_room` | boolean | true | Display room information |
| `show_teacher` | boolean | true | Display teacher information |
| `show_colors` | boolean | true | Use lesson colors for accents |
| `show_logo` | boolean | true | Show integration logo in header |
| `logo_url` | string | auto | Custom logo URL |
| `compact_mode` | boolean | false | Reduce card height |

### Visual Features
- **View Toggle:** User can switch between Today and Week views
- **Current Lesson Highlight:** Shows what's happening now
- **Next Lesson Preview:** Quick glance at upcoming
- **Interactive:** Clickable view switcher

---

## Dashboard Layout Examples

### Tablet Dashboard
```yaml
views:
  - title: Home
    cards:
      - type: custom:timetable-next-lesson-card
        entity: sensor.timetable_current
        show_upcoming: 2

      - type: custom:timetable-schedule-card
        entity: sensor.timetable_current
        compact_mode: false
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
        show_teacher: false

      - type: custom:timetable-schedule-card
        entity: sensor.timetable_current
        compact_mode: true
        show_room: false
        show_teacher: false
```

### Wall-Mounted Display
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

---

## Styling and Theming

All cards automatically adapt to your Home Assistant theme:

- **Light Mode:** Bright, clean design
- **Dark Mode:** High contrast, easy on eyes
- **Custom Themes:** Respects CSS variables

### CSS Variables Used
- `--primary-color` - Accent color
- `--card-background-color` - Card backgrounds
- `--primary-text-color` - Main text
- `--secondary-text-color` - Labels and metadata
- `--divider-color` - Borders and separators

---

## Troubleshooting

### Icons Not Showing
**Solution:** Cards automatically load Material Design Icons. If icons don't appear:
1. Check browser console for errors
2. Ensure MDI CDN is accessible
3. Hard refresh browser (Ctrl+F5)

### Logo Not Displaying
**Solution:**
1. Verify logo file location: `/local/community/timetable/logo.png`
2. Or set custom path: `logo_url: /local/my-custom-logo.png`
3. Logo automatically falls back to MDI icon if file not found

### Card Not Found
**Solution:**
1. Ensure integration is installed via HACS
2. Restart Home Assistant
3. Clear browser cache
4. Check Lovelace resources are loaded

### Current Lesson Not Highlighted
**Solution:**
1. Verify `sensor.timetable_current` has data
2. Check system time is correct
3. Ensure lesson times match current time
4. Set `highlight_current: true` in config

---

## Advanced Customization

### Custom Logo
```yaml
logo_url: /local/school-logo.png
show_logo: true
```

### Hide All Metadata
```yaml
show_room: false
show_teacher: false
show_colors: false
show_logo: false
```

### Maximum Information
```yaml
show_room: true
show_teacher: true
show_colors: true
show_previous: true
show_upcoming: 2
```

---

## Performance Notes

- **Efficient Rendering:** Cards only update when data changes
- **Lightweight:** Minimal CSS and JavaScript
- **Responsive:** Grid layouts adapt to any screen size
- **Accessible:** Semantic HTML and ARIA labels

---

## Support

- **Issues:** https://github.com/alles-automatisch/timetable/issues
- **Discussions:** https://github.com/alles-automatisch/timetable/discussions
- **Documentation:** https://github.com/alles-automatisch/timetable

---

**Version:** 4.1.0
**Last Updated:** January 30, 2026
