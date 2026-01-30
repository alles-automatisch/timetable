# TimeTable v4.0.0 - Visual Management Interface 🎉

**Release Date:** January 30, 2026

## 🌟 Major New Feature: TimeTable Manager Panel

This release introduces a **complete visual management interface** for your school timetables, inspired by the Home Assistant Switch Manager integration. Say goodbye to manual service calls and hello to intuitive drag-and-drop scheduling!

---

## 🎨 What's New

### Visual Week Grid
- **Timeline View:** See your entire week at a glance (6am-6pm)
- **Color-Coded Lessons:** Each lesson block shows subject, time, room, and teacher
- **Custom Icons:** Choose from 14 education-themed icons
- **Beautiful Design:** Mushroom-inspired aesthetic with smooth animations

### Advanced Editing
- **🖱️ Drag & Drop:** Move lessons between days by dragging
- **📏 Resize Blocks:** Adjust lesson duration with grab handles
- **🎨 Color Picker:** Choose from 12 vibrant preset colors
- **✏️ Rich Forms:** Edit all lesson details in beautiful modals

### Power User Features
- **⏪ Undo/Redo:** 20-action history with Ctrl+Z / Ctrl+Shift+Z
- **📋 Templates:** Pre-built schedules (Elementary, High School, University)
- **💾 Import/Export:** Backup and restore schedules as JSON
- **⌨️ Keyboard Shortcuts:** Escape to close, quick navigation

### Smart Features
- **Auto-Snap:** 15-minute grid alignment
- **Auto-Sort:** Lessons sorted by time automatically
- **Vacation Manager:** Visual cards with date ranges
- **Statistics Dashboard:** Total lessons, vacation count at a glance

---

## 📸 Screenshots

### Main Panel View
The week grid shows all your lessons positioned by actual time, with colors and icons making subjects easy to identify.

### Lesson Editor
Rich modal interface with all fields, color picker, and icon selector. Edit any lesson detail with live preview.

### Template Selector
Choose from three professionally designed schedule templates to quick-start your timetable.

### Drag & Drop
Grab any lesson and drag it to a new day or time. Snaps to 15-minute intervals for clean scheduling.

---

## 🚀 Quick Start

### For New Users
1. Install TimeTable via HACS
2. Add integration through HA UI
3. Open **"TimeTable Manager"** from sidebar
4. Choose a template or add lessons manually
5. Drag, resize, and customize to your needs

### For Existing Users
1. Update to v4.0.0 via HACS
2. Restart Home Assistant
3. Look for **"TimeTable Manager"** in your sidebar
4. All existing schedules are preserved
5. Explore the new visual interface!

---

## ✨ Key Features

### Complete CRUD Operations
- ✅ **Create:** Add lessons with "+" buttons on each day
- ✅ **Read:** View lessons on beautiful week grid
- ✅ **Update:** Click any lesson to edit
- ✅ **Delete:** Remove with confirmation dialog

### Drag & Drop System
- Move lessons between days
- Visual feedback during drag
- Snap to 15-minute intervals
- Maintains lesson duration
- Auto-sorts after drop

### Resize Duration
- Grab handles on top/bottom
- Live preview while resizing
- Snap to 15-minute marks
- Min 15 minutes, max 12 hours

### Undo/Redo
- Track last 20 actions
- Keyboard shortcuts
- Header buttons
- Works for all changes
- State restoration

### Schedule Templates
- **Elementary School:** 5 lessons/day, 45 minutes each
- **High School:** 6 periods/day, 50 minutes each
- **University:** Flexible blocks, 90-120 minutes
- One-click application
- Customizable after loading

### Import/Export
- Export schedule as JSON
- Import from backup file
- Timestamped filenames
- Version tagged
- Perfect for sharing

---

## 📋 Technical Details

### Implementation
- **Backend:** New `view.py` registers panel with HA
- **Frontend:** `timetable-panel.js` (2,440 lines of code)
- **Architecture:** Uses HA's built-in panel system
- **API:** Direct WebSocket config_entries API
- **Performance:** Optimized rendering, minimal re-renders

### Browser Support
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ HTML5 Drag & Drop
- ✅ ES6+ JavaScript

### Requirements
- Home Assistant 2024.1.0 or later
- Modern web browser
- No additional dependencies

---

## 🔄 Upgrade Guide

### Is This Breaking?
**No!** Version 4.0.0 is fully backward compatible.

### What Happens on Upgrade?
1. All existing schedules are preserved
2. Panel automatically appears in sidebar
3. Config flow still works as before
4. Sensors continue to function normally
5. No action required from you

### Should I Use Panel or Config Flow?
**Both!** They work together:
- **Config Flow:** Great for initial setup
- **Panel:** Advanced editing, templates, drag & drop

Changes in one interface reflect in the other immediately.

---

## 🎯 Use Cases

### For Parents
- Set up kids' school schedules visually
- Drag lessons around when schedule changes
- Export for backup before new semester
- Use templates as starting point

### For Students
- Manage your class schedule
- Color-code by subject type
- Quick edits when classes move
- Undo mistakes instantly

### For Teachers
- Create different schedule variants
- Use templates for different grade levels
- Export and share with colleagues
- Track vacation periods

### For Administrators
- Manage multiple schedules
- Standardize with templates
- Backup and restore schedules
- Visual planning interface

---

## 🐛 Known Issues

### v4.0.0
- Resize handles work best with mouse (touch support planned)
- Undo history doesn't persist across HA restarts
- Multi-schedule switching needs backend work
- Time range currently fixed at 6am-6pm

### Workarounds
- Use export/import for backups
- Desktop recommended for advanced features
- Mobile works for viewing and basic editing

---

## 🗺️ What's Next?

### Planned for 4.1.0
- Touch-friendly drag & drop
- Mobile optimizations
- Custom time range selection
- Persistent undo history

### Under Consideration
- Multi-schedule backend support
- Bulk lesson operations
- Recurring lesson patterns
- Google Calendar export
- Print/PDF view
- Analytics dashboard

---

## 📚 Documentation

### New Docs
- `PANEL_PHASE1_COMPLETE.md` - Basic UI features
- `PANEL_PHASE2_COMPLETE.md` - Visual editor features
- `PANEL_PHASE3_COMPLETE.md` - Advanced features (complete)
- `CHANGELOG.md` - Full version history

### Existing Docs
- `README.md` - Integration overview
- `CLAUDE.md` - Development guidelines
- Brain files - Architecture documentation

---

## 🙏 Credits

### Inspiration
This panel was inspired by the excellent [Home-Assistant-Switch-Manager](https://github.com/Sian-Lee-SA/Home-Assistant-Switch-Manager) by Sian-Lee-SA, which pioneered the custom panel approach for complex configuration in Home Assistant.

### Design
The visual design takes inspiration from Mushroom Cards, focusing on clean, minimal, modern aesthetics.

### Community
Thanks to all users who provided feedback and testing during development!

---

## 🔗 Links

- **Repository:** https://github.com/alles-automatisch/timetable
- **Issues:** https://github.com/alles-automatisch/timetable/issues
- **HACS:** Available in HACS default repository
- **Home Assistant:** https://www.home-assistant.io/

---

## 📦 Installation

### Via HACS (Recommended)
1. Open HACS
2. Go to Integrations
3. Search for "TimeTable"
4. Click "Download"
5. Restart Home Assistant
6. Add integration via UI

### Manual Installation
1. Download latest release
2. Copy `custom_components/timetable` to your HA config
3. Copy `www/timetable-card.js` to `www` folder
4. Restart Home Assistant
5. Add integration via UI

---

## 🎊 Summary

TimeTable v4.0.0 transforms schedule management in Home Assistant:

- ✅ **Visual Interface:** Beautiful week grid with timeline
- ✅ **Drag & Drop:** Move lessons intuitively
- ✅ **Resize Blocks:** Adjust duration visually
- ✅ **Templates:** Quick-start with presets
- ✅ **Undo/Redo:** Mistake-proof editing
- ✅ **Import/Export:** Easy backup/restore
- ✅ **Keyboard Shortcuts:** Power user features
- ✅ **Backward Compatible:** No breaking changes

**This is a major milestone** - enjoy the new visual interface! 🚀

---

**Questions? Issues? Feedback?**

Open an issue on GitHub or start a discussion. We're here to help!

**Happy Scheduling! 📅✨**
