/**
 * TimeTable Manager Panel
 * Advanced visual editor for managing school timetables
 * Version: 4.0.0
 */

class TimetablePanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._selectedSchedule = 'default';
    this._loading = true;
    this._editingLesson = null;
    this._editingVacation = null;
    this._showLessonEditor = false;
    this._showVacationEditor = false;
    this._showTemplateSelector = false;
    this._showImportExport = false;
    this._showDashboardHelper = false;
    this._draggedLesson = null;
    this._resizingLesson = null;
    this._undoStack = [];
    this._redoStack = [];
    this._activeTab = 'schedule';
  }

  set hass(hass) {
    this._hass = hass;
    this._loading = false;
    this.render();
  }

  connectedCallback() {
    console.info(
      '%c TIMETABLE-PANEL %c 4.0.1 ',
      'color: white; background: #667eea; font-weight: 700;',
      'color: #667eea; background: white; font-weight: 700;'
    );

    // Suppress non-critical resource loading errors from HA
    this._suppressKnownErrors();

    // Load Material Design Icons
    this._loadMaterialIcons();

    this.render();
    this._attachKeyboardShortcuts();
  }

  _suppressKnownErrors() {
    // Suppress known non-critical errors from Home Assistant's global resource loading
    const originalError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ');

      // Filter out card-mod and other non-critical resource errors
      if (errorStr.includes('card-mod') ||
          errorStr.includes('lovelace-card-mod') ||
          (errorStr.includes('Failed to fetch dynamically imported module') && errorStr.includes('card-mod'))) {
        // Silently ignore these errors - they don't affect our panel
        console.log('ℹ️ Suppressed non-critical HA resource error (card-mod)');
        return;
      }

      // Pass through all other errors
      originalError.apply(console, args);
    };
  }

  _loadMaterialIcons() {
    // Check if Material Design Icons are already loaded
    if (document.querySelector('link[href*="materialdesignicons"]')) {
      console.log('✓ Material Design Icons already loaded');
      return;
    }

    // Load MDI CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
    link.onload = () => {
      console.log('✓ Material Design Icons loaded successfully');
    };
    link.onerror = () => {
      console.warn('⚠ Failed to load Material Design Icons from CDN');
    };
    document.head.appendChild(link);
  }

  disconnectedCallback() {
    this._detachKeyboardShortcuts();
  }

  _attachKeyboardShortcuts() {
    this._keyboardHandler = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this._undo();
      }
      // Ctrl/Cmd + Shift + Z = Redo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this._redo();
      }
      // Escape = Close modal
      else if (e.key === 'Escape') {
        if (this._showLessonEditor) this._cancelLessonEdit();
        if (this._showVacationEditor) this._cancelVacationEdit();
        if (this._showTemplateSelector) this._showTemplateSelector = false;
        if (this._showImportExport) this._showImportExport = false;
        this.render();
      }
    };
    document.addEventListener('keydown', this._keyboardHandler);
  }

  _detachKeyboardShortcuts() {
    if (this._keyboardHandler) {
      document.removeEventListener('keydown', this._keyboardHandler);
    }
  }

  _getConfigEntryId() {
    const entry = this._getConfigEntry();
    return entry ? entry.entry_id : null;
  }

  _getConfigEntry() {
    if (!this._hass) return null;

    // Find the timetable config entry
    const entries = this._hass.config_entries || [];
    return entries.find(entry => entry.domain === 'timetable');
  }

  _getScheduleData() {
    const entry = this._getConfigEntry();
    if (!entry || !entry.options) {
      return {
        name: 'My Timetable',
        lessons: {},
        vacations: [],
        include_weekends: false
      };
    }
    return entry.options;
  }

  _getAllSensors() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => id.startsWith('sensor.') && id.includes('timetable'))
      .map(id => this._hass.states[id]);
  }

  _formatTime(timeStr) {
    // timeStr is in format "HH:MM"
    return timeStr;
  }

  _parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  _getTimeSlots() {
    // Generate time slots from 6:00 to 18:00 (6am to 6pm)
    const slots = [];
    for (let hour = 6; hour <= 18; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        minutes: hour * 60
      });
    }
    return slots;
  }

  _getLessonPosition(lesson) {
    const startMinutes = this._parseTime(lesson.start_time);
    const endMinutes = this._parseTime(lesson.end_time);
    const startOfDay = 6 * 60; // 6am
    const minutesPerHour = 60;
    const pixelsPerMinute = 1; // 60px per hour = 1px per minute

    const top = (startMinutes - startOfDay) * pixelsPerMinute;
    const height = (endMinutes - startMinutes) * pixelsPerMinute;

    return { top, height };
  }

  _renderHeader() {
    const scheduleData = this._getScheduleData();
    const sensors = this._getAllSensors();
    const canUndo = this._undoStack.length > 0;
    const canRedo = this._redoStack.length > 0;

    return `
      <div class="header">
        <div class="header-content">
          <div class="header-row">
            <div class="title-section">
              <i class="mdi mdi-table-clock"></i>
              <h1>TimeTable Manager</h1>
            </div>
            <div class="header-actions">
              <button class="header-btn ${!canUndo ? 'disabled' : ''}" id="undo-btn" title="Undo (Ctrl+Z)" ${!canUndo ? 'disabled' : ''}>
                <i class="mdi mdi-undo"></i>
              </button>
              <button class="header-btn ${!canRedo ? 'disabled' : ''}" id="redo-btn" title="Redo (Ctrl+Shift+Z)" ${!canRedo ? 'disabled' : ''}>
                <i class="mdi mdi-redo"></i>
              </button>
              <button class="header-btn" id="template-btn" title="Load Template">
                <i class="mdi mdi-file-document-multiple"></i>
              </button>
              <button class="header-btn" id="duplicate-btn" title="Duplicate Schedule">
                <i class="mdi mdi-content-copy"></i>
              </button>
              <button class="header-btn" id="import-export-btn" title="Import/Export">
                <i class="mdi mdi-download"></i>
              </button>
              <button class="header-btn" id="dashboard-btn" title="Add Dashboard Card">
                <i class="mdi mdi-view-dashboard"></i>
              </button>
            </div>
          </div>
          <div class="stats">
            <div class="stat">
              <span class="stat-label">Schedule</span>
              <span class="stat-value">${scheduleData.name}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Lessons</span>
              <span class="stat-value">${this._getTotalLessons(scheduleData.lessons)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Vacations</span>
              <span class="stat-value">${scheduleData.vacations.length}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _getTotalLessons(lessons) {
    return Object.values(lessons).reduce((total, dayLessons) => total + dayLessons.length, 0);
  }

  _renderWeekGrid() {
    const scheduleData = this._getScheduleData();
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const displayDays = scheduleData.include_weekends
      ? weekdays
      : weekdays.slice(0, 5);

    const dayLabels = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    return `
      <div class="week-grid">
        ${this._renderTimeAxis()}
        <div class="days-container">
          ${displayDays.map(day => this._renderDay(day, dayLabels[day], scheduleData.lessons[day] || [])).join('')}
        </div>
      </div>
    `;
  }

  _renderTimeAxis() {
    const timeSlots = this._getTimeSlots();
    return `
      <div class="time-axis">
        ${timeSlots.map(slot => `
          <div class="time-slot" style="top: ${(slot.minutes - 6 * 60)}px">
            <span>${slot.time}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  _renderDay(weekday, label, lessons) {
    return `
      <div class="day-column" data-weekday="${weekday}">
        <div class="day-header">
          <span>${label}</span>
          <button class="add-lesson-btn" data-weekday="${weekday}">
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
        <div class="day-content drop-zone" data-weekday="${weekday}">
          ${this._renderTimeGrid()}
          ${lessons.map((lesson, index) => this._renderLesson(lesson, weekday, index)).join('')}
        </div>
      </div>
    `;
  }

  // Drag and Drop Handlers
  async _handleDragStart(e, weekday, index) {
    this._draggedLesson = { weekday, index };
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  }

  _handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this._draggedLesson = null;
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async _handleDrop(e, targetWeekday) {
    e.preventDefault();

    if (!this._draggedLesson) return;

    const { weekday: sourceWeekday, index: sourceIndex } = this._draggedLesson;

    // Calculate drop time based on Y position
    const dayContent = e.currentTarget;
    const rect = dayContent.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = Math.round(y / 1) + (6 * 60); // 6am start

    // Snap to 15 minute intervals
    const snappedMinutes = Math.round(minutes / 15) * 15;
    const hours = Math.floor(snappedMinutes / 60);
    const mins = snappedMinutes % 60;
    const newStartTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    this._saveState(); // Save for undo

    const scheduleData = this._getScheduleData();
    const lesson = { ...scheduleData.lessons[sourceWeekday][sourceIndex] };

    // Calculate duration and new end time
    const oldStart = this._parseTime(lesson.start_time);
    const oldEnd = this._parseTime(lesson.end_time);
    const duration = oldEnd - oldStart;
    const newEnd = snappedMinutes + duration;
    const newEndHours = Math.floor(newEnd / 60);
    const newEndMins = newEnd % 60;
    const newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMins).padStart(2, '0')}`;

    lesson.start_time = newStartTime;
    lesson.end_time = newEndTime;

    const entryId = this._getConfigEntryId();
    if (!entryId) return;

    try {
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };
      const lessons = { ...currentOptions.lessons };

      // Remove from source
      lessons[sourceWeekday] = [...lessons[sourceWeekday]];
      lessons[sourceWeekday].splice(sourceIndex, 1);

      // Add to target
      if (!lessons[targetWeekday]) lessons[targetWeekday] = [];
      lessons[targetWeekday] = [...lessons[targetWeekday], lesson];
      lessons[targetWeekday].sort((a, b) => a.start_time.localeCompare(b.start_time));

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          lessons
        }
      });

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to move lesson:', error);
    }
  }

  // Resize Handlers
  _handleResizeStart(e, weekday, index, handle) {
    e.stopPropagation();
    this._resizingLesson = { weekday, index, handle, startY: e.clientY };

    const scheduleData = this._getScheduleData();
    const lesson = scheduleData.lessons[weekday][index];
    this._resizingLesson.originalStart = lesson.start_time;
    this._resizingLesson.originalEnd = lesson.end_time;

    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleResizeEnd);
  }

  _handleResizeMove = (e) => {
    if (!this._resizingLesson) return;

    const { weekday, index, handle, startY, originalStart, originalEnd } = this._resizingLesson;
    const deltaY = e.clientY - startY;
    const deltaMinutes = Math.round(deltaY / 1);

    const scheduleData = this._getScheduleData();
    const lesson = scheduleData.lessons[weekday][index];

    if (handle === 'top') {
      const newStart = this._parseTime(originalStart) + deltaMinutes;
      const snapped = Math.round(newStart / 15) * 15;
      const hours = Math.floor(snapped / 60);
      const mins = snapped % 60;

      if (snapped >= 6 * 60 && snapped < this._parseTime(originalEnd) - 15) {
        lesson.start_time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        this.render();
      }
    } else if (handle === 'bottom') {
      const newEnd = this._parseTime(originalEnd) + deltaMinutes;
      const snapped = Math.round(newEnd / 15) * 15;
      const hours = Math.floor(snapped / 60);
      const mins = snapped % 60;

      if (snapped <= 18 * 60 && snapped > this._parseTime(originalStart) + 15) {
        lesson.end_time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        this.render();
      }
    }
  }

  _handleResizeEnd = async () => {
    if (!this._resizingLesson) return;

    document.removeEventListener('mousemove', this._handleResizeMove);
    document.removeEventListener('mouseup', this._handleResizeEnd);

    const { weekday, index, originalStart, originalEnd } = this._resizingLesson;
    const scheduleData = this._getScheduleData();
    const lesson = scheduleData.lessons[weekday][index];

    // Only save if actually changed
    if (lesson.start_time !== originalStart || lesson.end_time !== originalEnd) {
      this._saveState(); // Save for undo

      const entryId = this._getConfigEntryId();
      if (entryId) {
        try {
          const entry = this._getConfigEntry();
          const currentOptions = { ...entry.options };
          const lessons = { ...currentOptions.lessons };
          lessons[weekday] = [...lessons[weekday]];

          await this._hass.callWS({
            type: 'config_entries/options/update',
            entry_id: entryId,
            options: {
              ...currentOptions,
              lessons
            }
          });

          setTimeout(() => this.render(), 500);
        } catch (error) {
          console.error('Failed to save resized lesson:', error);
        }
      }
    }

    this._resizingLesson = null;
  }

  _renderTimeGrid() {
    const hours = Array.from({ length: 13 }, (_, i) => i + 6); // 6am to 6pm
    return `
      <div class="time-grid">
        ${hours.map(hour => `<div class="grid-line" style="top: ${(hour - 6) * 60}px"></div>`).join('')}
      </div>
    `;
  }

  _renderLesson(lesson, weekday, index) {
    const position = this._getLessonPosition(lesson);
    const color = lesson.color || '#667eea';
    const icon = lesson.icon || 'mdi:book-open-variant';

    return `
      <div
        class="lesson-block"
        data-weekday="${weekday}"
        data-index="${index}"
        draggable="true"
        style="top: ${position.top}px; height: ${position.height}px; border-left-color: ${color};"
      >
        <div class="resize-handle resize-handle-top"></div>
        <div class="lesson-content">
          <div class="lesson-header">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="lesson-subject">${lesson.subject}</span>
          </div>
          <div class="lesson-time">${this._formatTime(lesson.start_time)} - ${this._formatTime(lesson.end_time)}</div>
          ${lesson.room ? `<div class="lesson-meta"><ha-icon icon="mdi:door"></ha-icon>${lesson.room}</div>` : ''}
          ${lesson.teacher ? `<div class="lesson-meta"><ha-icon icon="mdi:account"></ha-icon>${lesson.teacher}</div>` : ''}
        </div>
        <div class="resize-handle resize-handle-bottom"></div>
      </div>
    `;
  }

  _renderVacations() {
    const scheduleData = this._getScheduleData();
    const vacations = scheduleData.vacations || [];

    return `
      <div class="vacations-container">
        <div class="vacations-header">
          <button class="primary-btn" id="add-vacation-btn">
            <ha-icon icon="mdi:plus"></ha-icon>
            <span>Add Vacation</span>
          </button>
        </div>
        ${vacations.length === 0 ? `
          <div class="empty-state">
            <ha-icon icon="mdi:beach"></ha-icon>
            <p>No vacations planned yet</p>
          </div>
        ` : `
          <div class="vacations-list">
            ${vacations.map((vacation, index) => `
              <div class="vacation-card">
                <div class="vacation-icon">
                  <ha-icon icon="mdi:beach"></ha-icon>
                </div>
                <div class="vacation-info">
                  <h3>${vacation.label}</h3>
                  <p>${vacation.start_date} to ${vacation.end_date}</p>
                </div>
                <button class="icon-btn" data-vacation-index="${index}">
                  <ha-icon icon="mdi:delete"></ha-icon>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  _renderLessonEditor() {
    if (!this._showLessonEditor || !this._editingLesson) return '';

    const { weekday, index, data } = this._editingLesson;
    const isNew = index === null;

    const colorPresets = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0',
      '#a8edea', '#ff6b6b', '#4ecdc4', '#45b7d1'
    ];

    const iconPresets = [
      'mdi:book-open-variant', 'mdi:calculator', 'mdi:flask',
      'mdi:music', 'mdi:palette', 'mdi:run', 'mdi:soccer',
      'mdi:laptop', 'mdi:pencil', 'mdi:earth', 'mdi:atom',
      'mdi:drama-masks', 'mdi:test-tube', 'mdi:book-alphabet'
    ];

    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${isNew ? 'Add Lesson' : 'Edit Lesson'}</h2>
            <button class="icon-btn" id="close-editor">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Subject *</label>
              <input
                type="text"
                id="lesson-subject"
                value="${data.subject}"
                placeholder="e.g., Mathematics"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  id="lesson-start"
                  value="${data.start_time}"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  id="lesson-end"
                  value="${data.end_time}"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Room</label>
                <input
                  type="text"
                  id="lesson-room"
                  value="${data.room || ''}"
                  placeholder="e.g., 101"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Teacher</label>
                <input
                  type="text"
                  id="lesson-teacher"
                  value="${data.teacher || ''}"
                  placeholder="e.g., Mr. Smith"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Notes</label>
              <textarea
                id="lesson-notes"
                placeholder="Any additional notes..."
                class="form-input"
                rows="2"
              >${data.notes || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Color</label>
              <div class="color-picker">
                ${colorPresets.map(color => `
                  <button
                    class="color-option ${data.color === color ? 'selected' : ''}"
                    data-color="${color}"
                    style="background: ${color};"
                  ></button>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label>Icon</label>
              <div class="icon-picker">
                ${iconPresets.map(icon => `
                  <button
                    class="icon-option ${data.icon === icon ? 'selected' : ''}"
                    data-icon="${icon}"
                  >
                    <ha-icon icon="${icon}"></ha-icon>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            ${!isNew ? `
              <button class="danger-btn" id="delete-lesson-btn">
                <ha-icon icon="mdi:delete"></ha-icon>
                <span>Delete</span>
              </button>
            ` : ''}
            <div class="button-group">
              <button class="secondary-btn" id="cancel-lesson-btn">Cancel</button>
              <button class="primary-btn" id="save-lesson-btn">
                <ha-icon icon="mdi:check"></ha-icon>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderVacationEditor() {
    if (!this._showVacationEditor || !this._editingVacation) return '';

    const { index, data } = this._editingVacation;
    const isNew = index === null;

    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${isNew ? 'Add Vacation' : 'Edit Vacation'}</h2>
            <button class="icon-btn" id="close-vacation-editor">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Vacation Name *</label>
              <input
                type="text"
                id="vacation-label"
                value="${data.label}"
                placeholder="e.g., Summer Vacation"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  id="vacation-start"
                  value="${data.start_date}"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  id="vacation-end"
                  value="${data.end_date}"
                  class="form-input"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="button-group">
              <button class="secondary-btn" id="cancel-vacation-btn">Cancel</button>
              <button class="primary-btn" id="save-vacation-btn">
                <ha-icon icon="mdi:check"></ha-icon>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderTemplateSelector() {
    if (!this._showTemplateSelector) return '';

    const templates = this._getTemplates();

    return `
      <div class="modal-overlay">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2>Load Schedule Template</h2>
            <button class="icon-btn" id="close-template-selector">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-body">
            <p style="color: var(--secondary-text-color); margin-bottom: 20px;">
              Choose a pre-built template to quickly set up your schedule. This will replace your current schedule.
            </p>
            <div class="template-grid">
              ${Object.entries(templates).map(([id, template]) => `
                <div class="template-card" data-template="${id}">
                  <div class="template-icon">
                    <ha-icon icon="mdi:school"></ha-icon>
                  </div>
                  <h3>${template.name}</h3>
                  <p>${template.description}</p>
                  <button class="primary-btn select-template-btn" data-template="${id}">
                    Select Template
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" id="cancel-template-btn">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderImportExport() {
    if (!this._showImportExport) return '';

    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Import / Export Schedule</h2>
            <button class="icon-btn" id="close-import-export">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="import-export-section">
              <h3>Export Schedule</h3>
              <p>Download your current schedule as a JSON file for backup or sharing.</p>
              <button class="primary-btn" id="export-btn">
                <i class="mdi mdi-download"></i>
                <span>Export Schedule</span>
              </button>
            </div>

            <div class="divider"></div>

            <div class="import-export-section">
              <h3>Import Schedule</h3>
              <p>Upload a previously exported schedule file to restore or load it.</p>
              <input
                type="file"
                id="import-file-input"
                accept=".json"
                style="display: none;"
              />
              <button class="primary-btn" id="import-btn">
                <i class="mdi mdi-upload"></i>
                <span>Import Schedule</span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" id="cancel-import-export-btn">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderDashboardHelper() {
    if (!this._showDashboardHelper) return '';

    const entity = this._getConfigEntry();
    const entityId = entity ? 'sensor.timetable_current' : 'sensor.timetable_current';

    const yamlCode = `type: custom:timetable-card
entity: ${entityId}
title: TimeTable
view: today
show_weekends: false
show_room: true
show_teacher: true
show_colors: true`;

    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Add Dashboard Card</h2>
            <button class="icon-btn" id="close-dashboard-helper">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="dashboard-helper-section">
              <h3>Quick Add Card</h3>
              <p>Copy this YAML code and paste it into your dashboard:</p>

              <div class="code-block">
                <pre><code>${yamlCode}</code></pre>
                <button class="copy-btn" id="copy-yaml-btn" title="Copy to clipboard">
                  <i class="mdi mdi-content-copy"></i>
                </button>
              </div>

              <div class="help-steps">
                <h4>How to add:</h4>
                <ol>
                  <li>Click "Copy" button above</li>
                  <li>Go to your dashboard</li>
                  <li>Click "+ Add Card"</li>
                  <li>Choose "Manual" or click "Show Code Editor"</li>
                  <li>Paste the YAML code</li>
                  <li>Click "Save"</li>
                </ol>
              </div>

              <div class="card-preview">
                <h4>What you'll see:</h4>
                <ul>
                  <li><i class="mdi mdi-check-circle"></i> Current lesson display</li>
                  <li><i class="mdi mdi-check-circle"></i> Next lesson preview</li>
                  <li><i class="mdi mdi-check-circle"></i> Today's full schedule</li>
                  <li><i class="mdi mdi-check-circle"></i> Color-coded subjects</li>
                  <li><i class="mdi mdi-check-circle"></i> Room and teacher info</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" id="cancel-dashboard-btn">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderTabs() {
    const activeTab = this._activeTab || 'schedule';
    return `
      <div class="tabs">
        <button class="tab ${activeTab === 'schedule' ? 'active' : ''}" data-tab="schedule">
          <i class="mdi mdi-calendar-week"></i>
          <span>Schedule</span>
        </button>
        <button class="tab ${activeTab === 'vacations' ? 'active' : ''}" data-tab="vacations">
          <i class="mdi mdi-beach"></i>
          <span>Vacations</span>
        </button>
      </div>
    `;
  }

  _renderLoading() {
    return `
      <div class="loading">
        <ha-circular-progress active></ha-circular-progress>
        <p>Loading TimeTable Manager...</p>
      </div>
    `;
  }

  render() {
    if (this._loading || !this._hass) {
      this.shadowRoot.innerHTML = `
        ${this._getStyles()}
        ${this._renderLoading()}
      `;
      return;
    }

    const activeTab = this._activeTab || 'schedule';

    this.shadowRoot.innerHTML = `
      ${this._getStyles()}
      <div class="container">
        ${this._renderHeader()}
        ${this._renderTabs()}
        <div class="content">
          ${activeTab === 'schedule' ? this._renderWeekGrid() : this._renderVacations()}
        </div>
      </div>
      ${this._renderLessonEditor()}
      ${this._renderVacationEditor()}
      ${this._renderTemplateSelector()}
      ${this._renderImportExport()}
      ${this._renderDashboardHelper()}
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    // Header action buttons
    const undoBtn = this.shadowRoot.getElementById('undo-btn');
    const redoBtn = this.shadowRoot.getElementById('redo-btn');
    const templateBtn = this.shadowRoot.getElementById('template-btn');
    const duplicateBtn = this.shadowRoot.getElementById('duplicate-btn');
    const importExportBtn = this.shadowRoot.getElementById('import-export-btn');
    const dashboardBtn = this.shadowRoot.getElementById('dashboard-btn');

    if (undoBtn) undoBtn.addEventListener('click', () => this._undo());
    if (redoBtn) redoBtn.addEventListener('click', () => this._redo());
    if (templateBtn) templateBtn.addEventListener('click', () => {
      this._showTemplateSelector = true;
      this.render();
    });
    if (duplicateBtn) duplicateBtn.addEventListener('click', () => this._duplicateSchedule());
    if (importExportBtn) importExportBtn.addEventListener('click', () => {
      this._showImportExport = true;
      this.render();
    });
    if (dashboardBtn) dashboardBtn.addEventListener('click', () => {
      this._showDashboardHelper = true;
      this.render();
    });

    // Tab switching
    this.shadowRoot.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
    });

    // Lesson blocks - drag and resize
    this.shadowRoot.querySelectorAll('.lesson-block').forEach(block => {
      const weekday = block.dataset.weekday;
      const index = parseInt(block.dataset.index);

      // Click to edit (only on content area, not handles)
      const content = block.querySelector('.lesson-content');
      if (content) {
        content.addEventListener('click', () => this._editLesson(weekday, index));
      }

      // Drag and drop
      block.addEventListener('dragstart', (e) => this._handleDragStart(e, weekday, index));
      block.addEventListener('dragend', (e) => this._handleDragEnd(e));

      // Resize handles
      const topHandle = block.querySelector('.resize-handle-top');
      const bottomHandle = block.querySelector('.resize-handle-bottom');

      if (topHandle) {
        topHandle.addEventListener('mousedown', (e) => this._handleResizeStart(e, weekday, index, 'top'));
      }
      if (bottomHandle) {
        bottomHandle.addEventListener('mousedown', (e) => this._handleResizeStart(e, weekday, index, 'bottom'));
      }
    });

    // Drop zones
    this.shadowRoot.querySelectorAll('.drop-zone').forEach(zone => {
      const weekday = zone.dataset.weekday;
      zone.addEventListener('dragover', (e) => this._handleDragOver(e));
      zone.addEventListener('drop', (e) => this._handleDrop(e, weekday));
    });

    // Add lesson buttons
    this.shadowRoot.querySelectorAll('.add-lesson-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const weekday = btn.dataset.weekday;
        this._addLesson(weekday);
      });
    });

    // Lesson editor
    if (this._showLessonEditor) {
      const closeBtn = this.shadowRoot.getElementById('close-editor');
      const cancelBtn = this.shadowRoot.getElementById('cancel-lesson-btn');
      const saveBtn = this.shadowRoot.getElementById('save-lesson-btn');
      const deleteBtn = this.shadowRoot.getElementById('delete-lesson-btn');

      if (closeBtn) closeBtn.addEventListener('click', () => this._cancelLessonEdit());
      if (cancelBtn) cancelBtn.addEventListener('click', () => this._cancelLessonEdit());
      if (saveBtn) saveBtn.addEventListener('click', () => this._saveLesson());
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          const { weekday, index } = this._editingLesson;
          this._deleteLesson(weekday, index);
        });
      }

      // Form inputs
      const subjectInput = this.shadowRoot.getElementById('lesson-subject');
      const startInput = this.shadowRoot.getElementById('lesson-start');
      const endInput = this.shadowRoot.getElementById('lesson-end');
      const roomInput = this.shadowRoot.getElementById('lesson-room');
      const teacherInput = this.shadowRoot.getElementById('lesson-teacher');
      const notesInput = this.shadowRoot.getElementById('lesson-notes');

      if (subjectInput) subjectInput.addEventListener('input', (e) => this._updateLessonField('subject', e.target.value));
      if (startInput) startInput.addEventListener('input', (e) => this._updateLessonField('start_time', e.target.value));
      if (endInput) endInput.addEventListener('input', (e) => this._updateLessonField('end_time', e.target.value));
      if (roomInput) roomInput.addEventListener('input', (e) => this._updateLessonField('room', e.target.value));
      if (teacherInput) teacherInput.addEventListener('input', (e) => this._updateLessonField('teacher', e.target.value));
      if (notesInput) notesInput.addEventListener('input', (e) => this._updateLessonField('notes', e.target.value));

      // Color picker
      this.shadowRoot.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
          this._updateLessonField('color', btn.dataset.color);
          this.render();
        });
      });

      // Icon picker
      this.shadowRoot.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
          this._updateLessonField('icon', btn.dataset.icon);
          this.render();
        });
      });

      // Modal overlay click to close
      const overlay = this.shadowRoot.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this._cancelLessonEdit();
        });
      }
    }

    // Vacation management
    const addVacationBtn = this.shadowRoot.getElementById('add-vacation-btn');
    if (addVacationBtn) {
      addVacationBtn.addEventListener('click', () => this._addVacation());
    }

    this.shadowRoot.querySelectorAll('[data-vacation-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.vacationIndex);
        this._deleteVacation(index);
      });
    });

    // Vacation editor
    if (this._showVacationEditor) {
      const closeBtn = this.shadowRoot.getElementById('close-vacation-editor');
      const cancelBtn = this.shadowRoot.getElementById('cancel-vacation-btn');
      const saveBtn = this.shadowRoot.getElementById('save-vacation-btn');

      if (closeBtn) closeBtn.addEventListener('click', () => this._cancelVacationEdit());
      if (cancelBtn) cancelBtn.addEventListener('click', () => this._cancelVacationEdit());
      if (saveBtn) saveBtn.addEventListener('click', () => this._saveVacation());

      // Form inputs
      const labelInput = this.shadowRoot.getElementById('vacation-label');
      const startInput = this.shadowRoot.getElementById('vacation-start');
      const endInput = this.shadowRoot.getElementById('vacation-end');

      if (labelInput) labelInput.addEventListener('input', (e) => this._updateVacationField('label', e.target.value));
      if (startInput) startInput.addEventListener('input', (e) => this._updateVacationField('start_date', e.target.value));
      if (endInput) endInput.addEventListener('input', (e) => this._updateVacationField('end_date', e.target.value));

      // Modal overlay click to close
      const overlay = this.shadowRoot.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this._cancelVacationEdit();
        });
      }
    }

    // Template selector
    if (this._showTemplateSelector) {
      const closeBtn = this.shadowRoot.getElementById('close-template-selector');
      const cancelBtn = this.shadowRoot.getElementById('cancel-template-btn');

      if (closeBtn) closeBtn.addEventListener('click', () => {
        this._showTemplateSelector = false;
        this.render();
      });
      if (cancelBtn) cancelBtn.addEventListener('click', () => {
        this._showTemplateSelector = false;
        this.render();
      });

      this.shadowRoot.querySelectorAll('.select-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const templateId = btn.dataset.template;
          this._applyTemplate(templateId);
        });
      });
    }

    // Import/Export
    if (this._showImportExport) {
      const closeBtn = this.shadowRoot.getElementById('close-import-export');
      const cancelBtn = this.shadowRoot.getElementById('cancel-import-export-btn');
      const exportBtn = this.shadowRoot.getElementById('export-btn');
      const importBtn = this.shadowRoot.getElementById('import-btn');
      const fileInput = this.shadowRoot.getElementById('import-file-input');

      if (closeBtn) closeBtn.addEventListener('click', () => {
        this._showImportExport = false;
        this.render();
      });
      if (cancelBtn) cancelBtn.addEventListener('click', () => {
        this._showImportExport = false;
        this.render();
      });

      if (exportBtn) exportBtn.addEventListener('click', () => this._exportSchedule());

      if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) this._importSchedule(file);
        });
      }
    }

    // Dashboard helper
    if (this._showDashboardHelper) {
      const closeBtn = this.shadowRoot.getElementById('close-dashboard-helper');
      const cancelBtn = this.shadowRoot.getElementById('cancel-dashboard-btn');
      const copyBtn = this.shadowRoot.getElementById('copy-yaml-btn');

      if (closeBtn) closeBtn.addEventListener('click', () => {
        this._showDashboardHelper = false;
        this.render();
      });
      if (cancelBtn) cancelBtn.addEventListener('click', () => {
        this._showDashboardHelper = false;
        this.render();
      });

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const codeBlock = this.shadowRoot.querySelector('.code-block code');
          if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
              copyBtn.innerHTML = '<i class="mdi mdi-check"></i>';
              setTimeout(() => {
                copyBtn.innerHTML = '<i class="mdi mdi-content-copy"></i>';
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
              alert('Failed to copy to clipboard');
            });
          }
        });
      }
    }
  }

  _switchTab(tabName) {
    this._activeTab = tabName;
    this.render();
  }

  _addLesson(weekday) {
    this._editingLesson = {
      weekday,
      index: null,
      data: {
        subject: '',
        start_time: '08:00',
        end_time: '09:00',
        room: '',
        teacher: '',
        notes: '',
        color: '#667eea',
        icon: 'mdi:book-open-variant'
      }
    };
    this._showLessonEditor = true;
    this.render();
  }

  _editLesson(weekday, index) {
    const scheduleData = this._getScheduleData();
    const lessons = scheduleData.lessons[weekday] || [];
    const lesson = lessons[index];

    if (lesson) {
      this._editingLesson = {
        weekday,
        index,
        data: { ...lesson }
      };
      this._showLessonEditor = true;
      this.render();
    }
  }

  async _saveLesson() {
    if (!this._editingLesson) return;

    const { weekday, index, data } = this._editingLesson;
    const entryId = this._getConfigEntryId();

    if (!entryId) {
      alert('Error: Could not find config entry');
      return;
    }

    this._saveState(); // Save for undo

    try {
      // Get current options
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };
      const lessons = { ...currentOptions.lessons };

      // Initialize weekday array if needed
      if (!lessons[weekday]) {
        lessons[weekday] = [];
      }

      if (index !== null) {
        // Update existing lesson
        lessons[weekday][index] = data;
      } else {
        // Add new lesson
        lessons[weekday].push(data);
        // Sort by start_time
        lessons[weekday].sort((a, b) => a.start_time.localeCompare(b.start_time));
      }

      // Update config entry options
      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          lessons
        }
      });

      // Close editor
      this._showLessonEditor = false;
      this._editingLesson = null;

      // Reload to show changes
      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert(`Error saving lesson: ${error.message}`);
    }
  }

  async _deleteLesson(weekday, index) {
    if (!confirm('Delete this lesson?')) return;

    this._saveState(); // Save for undo

    const entryId = this._getConfigEntryId();
    if (!entryId) return;

    try {
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };
      const lessons = { ...currentOptions.lessons };

      if (lessons[weekday]) {
        lessons[weekday].splice(index, 1);
      }

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          lessons
        }
      });

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert(`Error deleting lesson: ${error.message}`);
    }
  }

  _cancelLessonEdit() {
    this._showLessonEditor = false;
    this._editingLesson = null;
    this.render();
  }

  _updateLessonField(field, value) {
    if (this._editingLesson) {
      this._editingLesson.data[field] = value;
    }
  }

  async _addVacation() {
    this._editingVacation = {
      index: null,
      data: {
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        label: ''
      }
    };
    this._showVacationEditor = true;
    this.render();
  }

  async _saveVacation() {
    if (!this._editingVacation) return;

    const { index, data } = this._editingVacation;
    const entryId = this._getConfigEntryId();

    if (!entryId) {
      alert('Error: Could not find config entry');
      return;
    }

    if (!data.label.trim()) {
      alert('Please enter a vacation name');
      return;
    }

    this._saveState(); // Save for undo

    try {
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };
      const vacations = [...(currentOptions.vacations || [])];

      if (index !== null) {
        vacations[index] = data;
      } else {
        vacations.push(data);
        vacations.sort((a, b) => a.start_date.localeCompare(b.start_date));
      }

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          vacations
        }
      });

      this._showVacationEditor = false;
      this._editingVacation = null;

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to save vacation:', error);
      alert(`Error saving vacation: ${error.message}`);
    }
  }

  async _deleteVacation(index) {
    if (!confirm('Delete this vacation?')) return;

    this._saveState(); // Save for undo

    const entryId = this._getConfigEntryId();
    if (!entryId) return;

    try {
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };
      const vacations = [...(currentOptions.vacations || [])];

      vacations.splice(index, 1);

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          vacations
        }
      });

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to delete vacation:', error);
      alert(`Error deleting vacation: ${error.message}`);
    }
  }

  _cancelVacationEdit() {
    this._showVacationEditor = false;
    this._editingVacation = null;
    this.render();
  }

  _updateVacationField(field, value) {
    if (this._editingVacation) {
      this._editingVacation.data[field] = value;
    }
  }

  // Undo/Redo System
  _saveState() {
    const entry = this._getConfigEntry();
    if (!entry) return;

    this._undoStack.push(JSON.stringify(entry.options));
    this._redoStack = []; // Clear redo stack on new action

    // Limit undo stack to 20 items
    if (this._undoStack.length > 20) {
      this._undoStack.shift();
    }
  }

  async _undo() {
    if (this._undoStack.length === 0) return;

    const entry = this._getConfigEntry();
    if (!entry) return;

    // Save current state to redo stack
    this._redoStack.push(JSON.stringify(entry.options));

    // Restore previous state
    const previousState = this._undoStack.pop();
    const options = JSON.parse(previousState);

    try {
      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entry.entry_id,
        options
      });

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Undo failed:', error);
      // Restore stack on failure
      this._undoStack.push(previousState);
      this._redoStack.pop();
    }
  }

  async _redo() {
    if (this._redoStack.length === 0) return;

    const entry = this._getConfigEntry();
    if (!entry) return;

    // Save current state to undo stack
    this._undoStack.push(JSON.stringify(entry.options));

    // Restore redo state
    const redoState = this._redoStack.pop();
    const options = JSON.parse(redoState);

    try {
      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entry.entry_id,
        options
      });

      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Redo failed:', error);
      // Restore stack on failure
      this._redoStack.push(redoState);
      this._undoStack.pop();
    }
  }

  // Template System
  _getTemplates() {
    return {
      'elementary': {
        name: 'Elementary School',
        description: '5 lessons per day, 45 minutes each',
        lessons: {
          monday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:45', room: '101', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Language Arts', start_time: '09:00', end_time: '09:45', room: '101', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Science', start_time: '10:15', end_time: '11:00', room: '102', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'Physical Education', start_time: '11:15', end_time: '12:00', room: 'Gym', teacher: '', notes: '', color: '#fa709a', icon: 'mdi:run' },
            { subject: 'Art', start_time: '13:00', end_time: '13:45', room: '103', teacher: '', notes: '', color: '#f093fb', icon: 'mdi:palette' }
          ],
          tuesday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:45', room: '101', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Language Arts', start_time: '09:00', end_time: '09:45', room: '101', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Social Studies', start_time: '10:15', end_time: '11:00', room: '101', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:earth' },
            { subject: 'Music', start_time: '11:15', end_time: '12:00', room: 'Music Room', teacher: '', notes: '', color: '#fee140', icon: 'mdi:music' },
            { subject: 'Science', start_time: '13:00', end_time: '13:45', room: '102', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' }
          ],
          wednesday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:45', room: '101', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Language Arts', start_time: '09:00', end_time: '09:45', room: '101', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Science', start_time: '10:15', end_time: '11:00', room: '102', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'Physical Education', start_time: '11:15', end_time: '12:00', room: 'Gym', teacher: '', notes: '', color: '#fa709a', icon: 'mdi:run' },
            { subject: 'Library', start_time: '13:00', end_time: '13:45', room: 'Library', teacher: '', notes: '', color: '#30cfd0', icon: 'mdi:book-open-variant' }
          ],
          thursday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:45', room: '101', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Language Arts', start_time: '09:00', end_time: '09:45', room: '101', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Social Studies', start_time: '10:15', end_time: '11:00', room: '101', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:earth' },
            { subject: 'Science', start_time: '11:15', end_time: '12:00', room: '102', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'Art', start_time: '13:00', end_time: '13:45', room: '103', teacher: '', notes: '', color: '#f093fb', icon: 'mdi:palette' }
          ],
          friday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:45', room: '101', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Language Arts', start_time: '09:00', end_time: '09:45', room: '101', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Physical Education', start_time: '10:15', end_time: '11:00', room: 'Gym', teacher: '', notes: '', color: '#fa709a', icon: 'mdi:run' },
            { subject: 'Music', start_time: '11:15', end_time: '12:00', room: 'Music Room', teacher: '', notes: '', color: '#fee140', icon: 'mdi:music' },
            { subject: 'Show and Tell', start_time: '13:00', end_time: '13:45', room: '101', teacher: '', notes: '', color: '#a8edea', icon: 'mdi:drama-masks' }
          ],
          saturday: [],
          sunday: []
        }
      },
      'highschool': {
        name: 'High School',
        description: '6 periods, 50 minutes each',
        lessons: {
          monday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:50', room: '201', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'English', start_time: '09:00', end_time: '09:50', room: '202', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Biology', start_time: '10:00', end_time: '10:50', room: 'Lab 1', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'History', start_time: '11:00', end_time: '11:50', room: '203', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:earth' },
            { subject: 'Physical Education', start_time: '13:00', end_time: '13:50', room: 'Gym', teacher: '', notes: '', color: '#fa709a', icon: 'mdi:run' },
            { subject: 'Chemistry', start_time: '14:00', end_time: '14:50', room: 'Lab 2', teacher: '', notes: '', color: '#fee140', icon: 'mdi:test-tube' }
          ],
          tuesday: [
            { subject: 'Physics', start_time: '08:00', end_time: '08:50', room: 'Lab 3', teacher: '', notes: '', color: '#30cfd0', icon: 'mdi:atom' },
            { subject: 'Mathematics', start_time: '09:00', end_time: '09:50', room: '201', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'English', start_time: '10:00', end_time: '10:50', room: '202', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Computer Science', start_time: '11:00', end_time: '11:50', room: 'IT Lab', teacher: '', notes: '', color: '#45b7d1', icon: 'mdi:laptop' },
            { subject: 'Art', start_time: '13:00', end_time: '13:50', room: 'Art Room', teacher: '', notes: '', color: '#f093fb', icon: 'mdi:palette' },
            { subject: 'Spanish', start_time: '14:00', end_time: '14:50', room: '204', teacher: '', notes: '', color: '#ff6b6b', icon: 'mdi:book-open-variant' }
          ],
          wednesday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:50', room: '201', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Chemistry', start_time: '09:00', end_time: '09:50', room: 'Lab 2', teacher: '', notes: '', color: '#fee140', icon: 'mdi:test-tube' },
            { subject: 'English', start_time: '10:00', end_time: '10:50', room: '202', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'History', start_time: '11:00', end_time: '11:50', room: '203', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:earth' },
            { subject: 'Biology', start_time: '13:00', end_time: '13:50', room: 'Lab 1', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'Physical Education', start_time: '14:00', end_time: '14:50', room: 'Gym', teacher: '', notes: '', color: '#fa709a', icon: 'mdi:run' }
          ],
          thursday: [
            { subject: 'English', start_time: '08:00', end_time: '08:50', room: '202', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Mathematics', start_time: '09:00', end_time: '09:50', room: '201', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Computer Science', start_time: '10:00', end_time: '10:50', room: 'IT Lab', teacher: '', notes: '', color: '#45b7d1', icon: 'mdi:laptop' },
            { subject: 'Physics', start_time: '11:00', end_time: '11:50', room: 'Lab 3', teacher: '', notes: '', color: '#30cfd0', icon: 'mdi:atom' },
            { subject: 'Spanish', start_time: '13:00', end_time: '13:50', room: '204', teacher: '', notes: '', color: '#ff6b6b', icon: 'mdi:book-open-variant' },
            { subject: 'History', start_time: '14:00', end_time: '14:50', room: '203', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:earth' }
          ],
          friday: [
            { subject: 'Mathematics', start_time: '08:00', end_time: '08:50', room: '201', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'English', start_time: '09:00', end_time: '09:50', room: '202', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-alphabet' },
            { subject: 'Biology', start_time: '10:00', end_time: '10:50', room: 'Lab 1', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' },
            { subject: 'Art', start_time: '11:00', end_time: '11:50', room: 'Art Room', teacher: '', notes: '', color: '#f093fb', icon: 'mdi:palette' },
            { subject: 'Free Period', start_time: '13:00', end_time: '13:50', room: '', teacher: '', notes: '', color: '#a8edea', icon: 'mdi:book-open-variant' },
            { subject: 'Chemistry', start_time: '14:00', end_time: '14:50', room: 'Lab 2', teacher: '', notes: '', color: '#fee140', icon: 'mdi:test-tube' }
          ],
          saturday: [],
          sunday: []
        }
      },
      'university': {
        name: 'University',
        description: 'Flexible schedule with longer blocks',
        lessons: {
          monday: [
            { subject: 'Advanced Mathematics', start_time: '09:00', end_time: '10:30', room: 'Hall A', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Research Methods', start_time: '11:00', end_time: '12:30', room: 'Room 301', teacher: '', notes: '', color: '#764ba2', icon: 'mdi:book-open-variant' },
            { subject: 'Lab Work', start_time: '14:00', end_time: '16:00', room: 'Lab Building', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' }
          ],
          tuesday: [
            { subject: 'Seminar', start_time: '10:00', end_time: '11:30', room: 'Room 205', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:account-group' },
            { subject: 'Computer Science', start_time: '13:00', end_time: '15:00', room: 'IT Building', teacher: '', notes: '', color: '#45b7d1', icon: 'mdi:laptop' }
          ],
          wednesday: [
            { subject: 'Advanced Mathematics', start_time: '09:00', end_time: '10:30', room: 'Hall A', teacher: '', notes: '', color: '#667eea', icon: 'mdi:calculator' },
            { subject: 'Project Work', start_time: '11:00', end_time: '13:00', room: 'Library', teacher: '', notes: '', color: '#30cfd0', icon: 'mdi:pencil' }
          ],
          thursday: [
            { subject: 'Lecture', start_time: '10:00', end_time: '12:00', room: 'Hall B', teacher: '', notes: '', color: '#f093fb', icon: 'mdi:book-alphabet' },
            { subject: 'Lab Work', start_time: '14:00', end_time: '16:00', room: 'Lab Building', teacher: '', notes: '', color: '#43e97b', icon: 'mdi:flask' }
          ],
          friday: [
            { subject: 'Tutorial', start_time: '09:00', end_time: '10:30', room: 'Room 102', teacher: '', notes: '', color: '#fee140', icon: 'mdi:account' },
            { subject: 'Seminar', start_time: '11:00', end_time: '12:30', room: 'Room 205', teacher: '', notes: '', color: '#4facfe', icon: 'mdi:account-group' }
          ],
          saturday: [],
          sunday: []
        }
      }
    };
  }

  async _applyTemplate(templateId) {
    if (!confirm('This will replace your current schedule. Continue?')) return;

    const templates = this._getTemplates();
    const template = templates[templateId];
    if (!template) return;

    this._saveState(); // Save for undo

    const entryId = this._getConfigEntryId();
    if (!entryId) return;

    try {
      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          lessons: template.lessons
        }
      });

      this._showTemplateSelector = false;
      setTimeout(() => this.render(), 500);
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert(`Error applying template: ${error.message}`);
    }
  }

  async _duplicateSchedule() {
    const newName = prompt('Enter name for duplicated schedule:');
    if (!newName || !newName.trim()) return;

    alert('Note: Multiple schedules not yet fully supported. This will export current schedule for backup.');

    const scheduleData = this._getScheduleData();
    const exportData = {
      name: newName,
      lessons: scheduleData.lessons,
      vacations: scheduleData.vacations,
      include_weekends: scheduleData.include_weekends,
      exported_at: new Date().toISOString(),
      version: '4.0.0'
    };

    this._downloadJSON(exportData, `timetable-${newName.toLowerCase().replace(/\s+/g, '-')}.json`);
  }

  _exportSchedule() {
    const scheduleData = this._getScheduleData();
    const exportData = {
      name: scheduleData.name,
      lessons: scheduleData.lessons,
      vacations: scheduleData.vacations,
      include_weekends: scheduleData.include_weekends,
      exported_at: new Date().toISOString(),
      version: '4.0.0'
    };

    this._downloadJSON(exportData, `timetable-backup-${Date.now()}.json`);
  }

  _downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _importSchedule(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.lessons) {
        throw new Error('Invalid schedule file: missing lessons data');
      }

      if (!confirm(`Import schedule "${data.name}"? This will replace your current schedule.`)) {
        return;
      }

      this._saveState(); // Save for undo

      const entryId = this._getConfigEntryId();
      if (!entryId) return;

      const entry = this._getConfigEntry();
      const currentOptions = { ...entry.options };

      await this._hass.callWS({
        type: 'config_entries/options/update',
        entry_id: entryId,
        options: {
          ...currentOptions,
          name: data.name || currentOptions.name,
          lessons: data.lessons,
          vacations: data.vacations || [],
          include_weekends: data.include_weekends ?? currentOptions.include_weekends
        }
      });

      this._showImportExport = false;
      setTimeout(() => this.render(), 500);
      alert('Schedule imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Failed to import schedule: ${error.message}`);
    }
  }

  _getStyles() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :host {
          display: block;
          height: 100vh;
          background: var(--primary-background-color);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        * {
          box-sizing: border-box;
        }

        /* Material Design Icons */
        .mdi {
          font-size: 24px;
          line-height: 1;
        }

        .mdi::before {
          display: inline-block;
        }

        .container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .header-btn:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .header-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .header-btn .mdi {
          font-size: 20px;
        }

        .title-section .mdi {
          font-size: 32px;
        }

        .title-section h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .stats {
          display: flex;
          gap: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 600;
        }

        .tabs {
          display: flex;
          gap: 8px;
          padding: 16px 24px 0;
          background: var(--card-background-color);
          border-bottom: 1px solid var(--divider-color);
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--secondary-text-color);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--primary-text-color);
          background: var(--secondary-background-color);
          border-radius: 8px 8px 0 0;
        }

        .tab.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .tab .mdi {
          font-size: 20px;
        }

        .content {
          flex: 1;
          overflow: auto;
          padding: 24px;
          background: var(--primary-background-color);
        }

        .tab-content {
          display: none;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tab-content.active {
          display: block;
        }

        .week-grid {
          display: flex;
          gap: 16px;
          position: relative;
        }

        .time-axis {
          width: 60px;
          position: relative;
          height: 780px; /* 13 hours * 60px */
          flex-shrink: 0;
        }

        .time-slot {
          position: absolute;
          width: 100%;
          font-size: 12px;
          color: var(--secondary-text-color);
          text-align: right;
          padding-right: 8px;
        }

        .days-container {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }

        .day-column {
          background: var(--card-background-color);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--secondary-background-color);
          border-bottom: 1px solid var(--divider-color);
          font-weight: 600;
        }

        .add-lesson-btn {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .add-lesson-btn:hover {
          background: var(--primary-color);
          color: white;
        }

        .add-lesson-btn ha-icon {
          --mdc-icon-size: 18px;
        }

        .day-content {
          position: relative;
          height: 780px;
          padding: 0 8px;
        }

        .time-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
        }

        .grid-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--divider-color);
        }

        .lesson-block {
          position: absolute;
          left: 8px;
          right: 8px;
          background: var(--card-background-color);
          border-left: 4px solid;
          border-radius: 6px;
          cursor: move;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .lesson-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
        }

        .lesson-block.dragging {
          opacity: 0.5;
          transform: rotate(2deg);
        }

        .lesson-content {
          flex: 1;
          padding: 8px;
          cursor: pointer;
        }

        .resize-handle {
          height: 8px;
          width: 100%;
          cursor: ns-resize;
          position: relative;
          flex-shrink: 0;
        }

        .resize-handle:hover {
          background: rgba(var(--rgb-primary-color), 0.2);
        }

        .resize-handle-top {
          cursor: n-resize;
        }

        .resize-handle-bottom {
          cursor: s-resize;
        }

        .drop-zone {
          position: relative;
        }

        .drop-zone.drag-over {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .lesson-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .lesson-header ha-icon {
          --mdc-icon-size: 16px;
          color: var(--primary-color);
        }

        .lesson-subject {
          font-weight: 600;
          font-size: 13px;
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-time {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }

        .lesson-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--secondary-text-color);
          margin-top: 2px;
        }

        .lesson-meta ha-icon {
          --mdc-icon-size: 12px;
        }

        .vacations-list {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .vacation-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--card-background-color);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .vacation-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .vacation-icon ha-icon {
          --mdc-icon-size: 24px;
        }

        .vacation-info {
          flex: 1;
        }

        .vacation-info h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .vacation-info p {
          margin: 0;
          font-size: 13px;
          color: var(--secondary-text-color);
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--secondary-text-color);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--error-color);
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .empty-state ha-icon {
          --mdc-icon-size: 64px;
          color: var(--secondary-text-color);
          margin-bottom: 16px;
        }

        .empty-state p {
          color: var(--secondary-text-color);
          margin-bottom: 24px;
        }

        .primary-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 16px;
        }

        .loading p {
          color: var(--secondary-text-color);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: var(--card-background-color);
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--divider-color);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid var(--divider-color);
          gap: 12px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-left: auto;
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .form-input::placeholder {
          color: var(--secondary-text-color);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 60px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Color Picker */
        .color-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          gap: 8px;
        }

        .color-option {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: var(--primary-text-color);
          box-shadow: 0 0 0 2px var(--card-background-color);
        }

        /* Icon Picker */
        .icon-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
          gap: 8px;
        }

        .icon-option {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 2px solid transparent;
          background: var(--secondary-background-color);
          cursor: pointer;
          transition: all 0.2s;
          color: var(--primary-text-color);
        }

        .icon-option:hover {
          background: var(--primary-color);
          color: white;
        }

        .icon-option.selected {
          border-color: var(--primary-color);
          background: var(--primary-color);
          color: white;
        }

        .icon-option ha-icon {
          --mdc-icon-size: 24px;
        }

        /* Button Styles */
        .primary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .primary-btn ha-icon {
          --mdc-icon-size: 18px;
        }

        .secondary-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover {
          background: var(--divider-color);
        }

        .danger-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--error-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .danger-btn:hover {
          filter: brightness(0.9);
        }

        .danger-btn ha-icon {
          --mdc-icon-size: 18px;
        }

        .vacations-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .vacations-header {
          display: flex;
          justify-content: flex-end;
        }

        /* Template Selector */
        .modal-large {
          max-width: 900px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .template-card {
          background: var(--secondary-background-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .template-card:hover {
          border-color: var(--primary-color);
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .template-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 8px;
        }

        .template-icon ha-icon {
          --mdc-icon-size: 32px;
        }

        .template-card h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .template-card p {
          margin: 0;
          font-size: 13px;
          color: var(--secondary-text-color);
          flex: 1;
        }

        .select-template-btn {
          width: 100%;
          justify-content: center;
        }

        /* Import/Export */
        .import-export-section {
          padding: 20px;
          background: var(--secondary-background-color);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .import-export-section:last-child {
          margin-bottom: 0;
        }

        .import-export-section h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
        }

        .import-export-section p {
          margin: 0 0 16px;
          font-size: 13px;
          color: var(--secondary-text-color);
        }

        .divider {
          height: 1px;
          background: var(--divider-color);
          margin: 16px 0;
        }

        /* Dashboard Helper */
        .dashboard-helper-section {
          padding: 0;
        }

        .dashboard-helper-section h3 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
        }

        .dashboard-helper-section h4 {
          margin: 20px 0 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .dashboard-helper-section p {
          margin: 0 0 16px;
          font-size: 14px;
          color: var(--secondary-text-color);
          line-height: 1.5;
        }

        .code-block {
          position: relative;
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .code-block pre {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow-x: auto;
        }

        .code-block code {
          color: var(--primary-text-color);
        }

        .copy-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .copy-btn .mdi {
          font-size: 16px;
        }

        .help-steps {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .help-steps ol {
          margin: 8px 0 0;
          padding-left: 20px;
        }

        .help-steps li {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--primary-text-color);
        }

        .card-preview {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 8px;
          padding: 16px;
        }

        .card-preview ul {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
        }

        .card-preview li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
          font-size: 14px;
          color: var(--primary-text-color);
        }

        .card-preview .mdi {
          color: var(--primary-color);
          font-size: 18px;
        }
      </style>
    `;
  }
}

customElements.define('timetable-manager-panel', TimetablePanel);
