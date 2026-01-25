# ⏰ TimeTable - Smart School Schedule for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/alles-automatisch/timetable.svg)](https://github.com/alles-automatisch/timetable/releases)
[![License](https://img.shields.io/github/license/alles-automatisch/timetable.svg)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg)](https://www.buymeacoffee.com/allesautomatisch)

A comprehensive Home Assistant integration for managing and displaying school timetables. Features a beautiful custom Lovelace card with support for lessons, free periods, and vacation tracking. Perfect for students, parents, and teachers!

## ✨ Features

### Custom Integration (Backend)
- 📅 **Schedule Management** - Store and manage weekly school schedules
- 🔄 **Real-time Updates** - Automatic updates every minute
- 📊 **Rich Sensors** - Current lesson, next lesson, and school time status
- 🌴 **Vacation Support** - Define vacation periods with custom labels
- 🎯 **Multiple Schedules** - Support for different schedule profiles
- 🔧 **Service Calls** - Full API for programmatic schedule management

### Lovelace Card (Frontend)
- 🎨 **Modern Design** - Mushroom-inspired aesthetic with smooth animations
- 📱 **Responsive Layout** - Works on desktop and mobile
- 🌓 **Theme Support** - Automatic light/dark mode
- 📆 **Multiple Views** - Today view and week overview
- 🎨 **Color Coding** - Optional color-coded lessons
- ⚙️ **GUI Editor** - No YAML required, full visual configuration
- 🌍 **Bilingual** - English and German translations

## 📦 Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on "Integrations"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/alles-automatisch/timetable`
6. Select category: "Integration"
7. Click "Add"
8. Find "Stundenplan" in the integration list and install it
9. Restart Home Assistant

### Manual Installation

1. Download the latest release from [GitHub releases](https://github.com/alles-automatisch/timetable/releases)
2. Copy the `custom_components/stundenplan` folder to your `config/custom_components/` directory
3. Copy `www/stundenplan-card.js` to your `config/www/` directory
4. Restart Home Assistant

## 🚀 Setup

### 1. Add the Integration

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "TimeTable"
4. Follow the configuration flow

### 2. Add the Lovelace Card

#### Via UI (Recommended)

1. Go to your dashboard
2. Click **Edit Dashboard**
3. Click **+ Add Card**
4. Search for "TimeTable Card"
5. Configure the card using the visual editor

#### Manual YAML

Add the card resource first:

```yaml
resources:
  - url: /local/stundenplan-card.js
    type: module
```

Then add the card to your dashboard:

```yaml
type: custom:stundenplan-card
entity: sensor.stundenplan_current
view: today
show_weekends: false
show_room: true
show_teacher: true
show_colors: true
compact_mode: false
title: My Timetable
```

## 📚 Usage

### Managing Your Schedule

#### Using Services

Add lessons to your schedule using the developer tools or automations:

```yaml
service: stundenplan.add_lesson
data:
  schedule_id: default
  weekday: monday
  lesson:
    subject: Mathematics
    start_time: "08:00"
    end_time: "08:45"
    room: "101"
    teacher: "Mr. Smith"
    notes: "Bring calculator"
    color: "#FF5722"
    icon: "mdi:calculator"
```

#### Set a Complete Schedule

```yaml
service: stundenplan.set_schedule
data:
  schedule_id: default
  schedule_data:
    name: "My School Schedule"
    include_weekends: false
    lessons:
      monday:
        - subject: "Mathematics"
          start_time: "08:00"
          end_time: "08:45"
          room: "101"
          teacher: "Mr. Smith"
        - subject: "English"
          start_time: "08:50"
          end_time: "09:35"
          room: "203"
          teacher: "Mrs. Johnson"
      tuesday:
        - subject: "Physics"
          start_time: "08:00"
          end_time: "08:45"
          room: "Lab 1"
          teacher: "Dr. Brown"
```

#### Add Vacation Periods

```yaml
service: stundenplan.add_vacation
data:
  start_date: "2025-07-01"
  end_date: "2025-08-31"
  label: "Summer Vacation"
```

#### Remove a Lesson

```yaml
service: stundenplan.remove_lesson
data:
  schedule_id: default
  weekday: monday
  lesson_index: 0
```

### Available Services

| Service | Description |
|---------|-------------|
| `stundenplan.set_schedule` | Set or update a complete schedule |
| `stundenplan.add_lesson` | Add a lesson to a specific weekday |
| `stundenplan.remove_lesson` | Remove a lesson from a weekday |
| `stundenplan.add_vacation` | Add a vacation period |
| `stundenplan.remove_vacation` | Remove a vacation period |

### Entities

After installation, you'll have access to:

| Entity | Description |
|--------|-------------|
| `sensor.stundenplan_current` | Current lesson or state |
| `sensor.stundenplan_next_lesson` | Next upcoming lesson |
| `binary_sensor.stundenplan_is_schooltime` | On when currently in a lesson |

### Entity Attributes

The `sensor.stundenplan_current` entity provides rich attributes:

```yaml
current_lesson:
  subject: "Mathematics"
  start_time: "08:00"
  end_time: "08:45"
  room: "101"
  teacher: "Mr. Smith"
next_lesson:
  subject: "English"
  start_time: "08:50"
  end_time: "09:35"
today_lessons: [...]
remaining_today_count: 5
is_vacation: false
vacation_name: null
is_school_day: true
```

## 🎨 Card Configuration

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | **Required** | Entity ID (e.g., `sensor.stundenplan_current`) |
| `title` | string | `Stundenplan` | Card title |
| `view` | string | `today` | Default view (`today` or `week`) |
| `show_weekends` | boolean | `false` | Include weekends in week view |
| `show_room` | boolean | `true` | Display room information |
| `show_teacher` | boolean | `true` | Display teacher information |
| `show_colors` | boolean | `true` | Use lesson colors |
| `compact_mode` | boolean | `false` | Compact card layout |

## 🔧 Advanced Usage

### Automation Example

Create an automation to announce the next lesson:

```yaml
automation:
  - alias: "Announce Next Lesson"
    trigger:
      - platform: state
        entity_id: sensor.stundenplan_next_lesson
    condition:
      - condition: state
        entity_id: binary_sensor.stundenplan_is_schooltime
        state: "off"
    action:
      - service: tts.speak
        data:
          entity_id: media_player.living_room
          message: "Your next lesson is {{ state_attr('sensor.stundenplan_next_lesson', 'subject') }} in 5 minutes"
```

### Notification Before Lessons

```yaml
automation:
  - alias: "Lesson Reminder"
    trigger:
      - platform: time_pattern
        minutes: "/5"
    condition:
      - condition: template
        value_template: >
          {% set next_lesson = state_attr('sensor.stundenplan_current', 'next_lesson') %}
          {% if next_lesson %}
            {% set start_time = next_lesson.start_time %}
            {% set now_time = now().strftime('%H:%M') %}
            {{ (as_timestamp(now()) + 300) | timestamp_custom('%H:%M') == start_time }}
          {% else %}
            false
          {% endif %}
    action:
      - service: notify.mobile_app
        data:
          title: "Lesson Starting Soon"
          message: "{{ state_attr('sensor.stundenplan_current', 'next_lesson').subject }} starts in 5 minutes!"
```

## 🌍 Translations

Currently supported languages:
- 🇬🇧 English
- 🇩🇪 German (Deutsch)

Want to add your language? Contributions are welcome!

## 📸 Screenshots

*Screenshots coming soon*

## 🐛 Troubleshooting

### Card Not Showing

1. Make sure the card JavaScript is loaded:
   - Check browser console for errors
   - Verify `/local/stundenplan-card.js` is accessible
   - Clear browser cache

2. Verify entity exists:
   - Check Developer Tools → States
   - Look for `sensor.stundenplan_current`

### Services Not Working

1. Check logs in Settings → System → Logs
2. Verify service call syntax
3. Ensure schedule_id exists (default is "default")

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Home Assistant community
- Design influenced by Mushroom cards
- Built with ❤️ for students and parents

## ☕ Support

If you find this integration helpful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔧 Contributing code
- ☕ [Buy me a coffee](https://www.buymeacoffee.com/allesautomatisch) to support development

## 🔗 More Projects & Resources

Check out more smart home content and integrations:

- 🏠 **[Alles Automatisch](https://alles-automatisch.de/)** - German smart home automation blog & resources
- 🔍 **[SmartHome Finder](https://smarthome-finder.com/)** - Find the perfect smart home devices
- 💬 **[Join the Community](https://alles-automatisch.de/join)** - Connect with other smart home enthusiasts

---

**Made with ❤️ for the Home Assistant community by [Alles Automatisch](https://alles-automatisch.de/)**
