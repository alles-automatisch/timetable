# 🚀 Quick Start Guide - TimeTable

Get your school schedule up and running in Home Assistant in just a few minutes!

## Step 1: Install (2 minutes)

### Via HACS
1. Open HACS → Integrations
2. Click ⋮ → Custom repositories
3. Add: `https://github.com/alles-automatisch/timetable`
4. Category: Integration
5. Install "TimeTable"
6. **Restart Home Assistant**

## Step 2: Setup Integration (1 minute)

1. Go to **Settings** → **Devices & Services**
2. Click **+ Add Integration**
3. Search for "TimeTable"
4. Click to add
5. Give it a name (or use default "TimeTable")
6. Done! You'll see new sensors appear

## Step 3: Add Your First Lesson (2 minutes)

1. Go to **Developer Tools** → **Services**
2. Select `stundenplan.add_lesson`
3. Fill in:
   ```yaml
   schedule_id: default
   weekday: monday
   lesson:
     subject: Math
     start_time: "08:00"
     end_time: "08:45"
     room: "101"
     teacher: "Mr. Smith"
   ```
4. Click **Call Service**
5. Your first lesson is added! ✅

## Step 4: Add the Card (2 minutes)

1. Go to your dashboard
2. Click **Edit Dashboard**
3. Click **+ Add Card**
4. Search for "TimeTable"
5. Select it and configure:
   - **Entity**: `sensor.stundenplan_current`
   - **View**: Today
   - Keep defaults for now
6. Click **Save**

## Step 5: Add More Lessons

You can add lessons one by one, or use the full schedule import.

### Quick Add Multiple Lessons

For a complete schedule, copy the example from `example_schedule.yaml` and paste it into:
**Developer Tools** → **Services** → `stundenplan.set_schedule`

## Step 6: Add Vacation Periods (Optional)

```yaml
service: stundenplan.add_vacation
data:
  start_date: "2025-07-01"
  end_date: "2025-08-31"
  label: "Summer Vacation"
```

## What You Get

After setup, you'll have:

### 📊 Sensors
- `sensor.stundenplan_current` - Shows current state
- `sensor.stundenplan_next_lesson` - Shows what's next
- `binary_sensor.stundenplan_is_schooltime` - On during lessons

### 🎴 Card Views
- **Now** - Current lesson (if active)
- **Next** - Upcoming lesson
- **Today** - Full day schedule
- **Week** - Weekly overview (toggle view)

### ⚡ Services Available
All under `stundenplan.*`:
- `set_schedule` - Import complete schedule
- `add_lesson` - Add single lesson
- `remove_lesson` - Remove by index
- `add_vacation` - Add vacation period
- `remove_vacation` - Remove by index

## Pro Tips

### 1. Color Code Your Subjects
Add `color` to lessons for visual distinction:
```yaml
color: "#FF5722"  # Orange for Math
color: "#2196F3"  # Blue for English
color: "#4CAF50"  # Green for Science
```

### 2. Use Icons
Add custom icons:
```yaml
icon: "mdi:calculator"   # Math
icon: "mdi:flask"        # Science
icon: "mdi:book-open"    # Reading
```

### 3. Create Automations
Example - Morning reminder:
```yaml
automation:
  - alias: "Morning Schedule"
    trigger:
      platform: time
      at: "07:00:00"
    action:
      service: notify.mobile_app
      data:
        message: >
          First class today:
          {{ state_attr('sensor.stundenplan_current', 'today_lessons')[0].subject }}
          at {{ state_attr('sensor.stundenplan_current', 'today_lessons')[0].start_time }}
```

### 4. Check Your Schedule
View raw data in **Developer Tools** → **States** → `sensor.stundenplan_current`

All attributes are visible there!

## Troubleshooting

**Card not showing?**
- Clear browser cache
- Check `/local/stundenplan-card.js` loads
- Verify entity exists in States

**Services not working?**
- Check **Settings** → **System** → **Logs**
- Verify weekday spelling (lowercase: monday, tuesday...)
- Check time format (HH:MM)

**Wrong timezone?**
- Set your timezone in **Settings** → **System** → **General**

## Need Help?

- 📖 Full docs: [README.md](README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/alles-automatisch/timetable/issues)
- 💡 See examples: [example_schedule.yaml](example_schedule.yaml)

---

**You're all set! Enjoy your smart school schedule!** 📚✨
