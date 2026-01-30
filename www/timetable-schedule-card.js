/**
 * TimeTable Schedule Card
 * Full week schedule view with current lesson highlighting
 * Version: 1.0.0
 */

class TimetableScheduleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._loadMaterialIcons();
  }

  _loadMaterialIcons() {
    // Load MDI in both document head and shadow root
    if (!document.querySelector('link[href*="materialdesignicons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
      document.head.appendChild(link);
    }

    // Also add to shadow root
    if (!this.shadowRoot.querySelector('link[href*="materialdesignicons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
      this.shadowRoot.appendChild(link);
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this._config = {
      entity: config.entity,
      show_weekends: config.show_weekends !== false,
      show_room: config.show_room !== false,
      show_teacher: config.show_teacher !== false,
      show_colors: config.show_colors !== false,
      show_logo: config.show_logo !== false,
      logo_url: config.logo_url || '/local/community/timetable/logo.png',
      compact_mode: config.compact_mode || false,
      highlight_current: config.highlight_current !== false,
      title: config.title || 'Schedule',
      ...config
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return this._config.compact_mode ? 6 : 10;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.timetable_current',
      show_weekends: false,
      show_room: true,
      show_teacher: true,
      show_colors: true,
      show_logo: true,
      compact_mode: false,
      highlight_current: true,
      title: 'Schedule'
    };
  }

  render() {
    if (!this._hass || !this._config.entity) {
      return;
    }

    const entityState = this._hass.states[this._config.entity];
    if (!entityState) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: var(--error-color);">
            Entity ${this._config.entity} not found
          </div>
        </ha-card>
      `;
      return;
    }

    const isVacation = entityState.attributes.is_vacation || false;
    const vacationName = entityState.attributes.vacation_name;
    const schedule = entityState.attributes.schedule || {};
    const currentLesson = this._config.highlight_current ? entityState.attributes.current_lesson : null;

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <ha-card>
        <div class="card-content">
          ${this.renderHeader()}
          ${isVacation
            ? this.renderVacation(vacationName)
            : this.renderSchedule(schedule, currentLesson)
          }
        </div>
      </ha-card>
    `;
  }

  renderHeader() {
    return `
      <div class="header">
        <div class="header-left">
          ${this._config.show_logo ? `
            <img src="${this._config.logo_url}" alt="TimeTable" class="logo"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="logo-fallback" style="display: none;">
              <i class="mdi mdi-school"></i>
            </div>
          ` : `
            <i class="mdi mdi-school header-icon"></i>
          `}
          <span class="title">${this._config.title}</span>
        </div>
      </div>
    `;
  }

  renderVacation(vacationName) {
    return `
      <div class="vacation-banner">
        <i class="mdi mdi-beach"></i>
        <div class="vacation-info">
          <span class="vacation-label">On Vacation</span>
          <span class="vacation-name">${vacationName || 'Holiday'}</span>
        </div>
      </div>
    `;
  }

  renderSchedule(schedule, currentLesson) {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    if (this._config.show_weekends) {
      weekdays.push('saturday', 'sunday');
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hasLessons = weekdays.some(day => schedule[day] && schedule[day].length > 0);

    if (!hasLessons) {
      return `
        <div class="empty-schedule">
          <i class="mdi mdi-calendar-blank"></i>
          <span>No lessons scheduled</span>
        </div>
      `;
    }

    return `
      <div class="schedule-grid ${this._config.compact_mode ? 'compact' : ''}">
        ${weekdays.map(day => this.renderDayColumn(day, schedule[day] || [], today, currentLesson)).join('')}
      </div>
    `;
  }

  renderDayColumn(weekday, lessons, today, currentLesson) {
    const isToday = weekday === today;
    const dayName = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const dayShort = dayName.substring(0, 3);

    return `
      <div class="day-column ${isToday ? 'today' : ''}">
        <div class="day-header">
          <span class="day-name">${this._config.compact_mode ? dayShort : dayName}</span>
          ${isToday ? '<span class="today-badge">Today</span>' : ''}
        </div>
        <div class="lessons-list">
          ${lessons.length === 0 ? `
            <div class="no-lessons-day">
              <i class="mdi mdi-minus-circle-outline"></i>
              <span>Free day</span>
            </div>
          ` : lessons.map(lesson => this.renderLesson(lesson, isToday, currentLesson)).join('')}
        </div>
      </div>
    `;
  }

  renderLesson(lesson, isToday, currentLesson) {
    const isCurrent = isToday && currentLesson &&
                      currentLesson.subject === lesson.subject &&
                      currentLesson.start_time === lesson.start_time;

    const accentColor = this._config.show_colors ? lesson.color : 'var(--primary-color)';
    const iconName = lesson.icon ? lesson.icon.replace('mdi:', '') : 'book-open-variant';

    return `
      <div class="lesson ${isCurrent ? 'current' : ''}" style="border-left-color: ${accentColor};">
        <div class="lesson-header">
          <div class="lesson-icon" style="color: ${accentColor};">
            <i class="mdi mdi-${iconName}"></i>
          </div>
          <div class="lesson-info">
            <div class="lesson-subject">${lesson.subject}</div>
            <div class="lesson-time">
              <i class="mdi mdi-clock-outline"></i>
              ${lesson.start_time} - ${lesson.end_time}
            </div>
          </div>
          ${isCurrent ? '<div class="current-badge"><i class="mdi mdi-circle"></i></div>' : ''}
        </div>
        ${!this._config.compact_mode && (this._config.show_room || this._config.show_teacher) ? `
          <div class="lesson-details">
            ${this._config.show_room && lesson.room ? `
              <span class="detail">
                <i class="mdi mdi-door"></i>
                ${lesson.room}
              </span>
            ` : ''}
            ${this._config.show_teacher && lesson.teacher ? `
              <span class="detail">
                <i class="mdi mdi-account"></i>
                ${lesson.teacher}
              </span>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  getStyles() {
    return `
      <style>
        :host {
          display: block;
        }

        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-content {
          padding: 16px;
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--divider-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          height: 32px;
          width: 32px;
          object-fit: contain;
          border-radius: 6px;
        }

        .logo-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--primary-color);
          color: white;
          border-radius: 6px;
          font-size: 20px;
        }

        .header-icon {
          font-size: 24px;
          color: var(--primary-color);
        }

        .title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        /* Vacation Banner */
        .vacation-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .vacation-banner i {
          font-size: 40px;
        }

        .vacation-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vacation-label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .vacation-name {
          font-size: 20px;
          font-weight: 600;
        }

        /* Schedule Grid */
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          flex: 1;
          overflow: auto;
        }

        .schedule-grid.compact {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }

        /* Day Column */
        .day-column {
          display: flex;
          flex-direction: column;
          background: var(--card-background-color);
          border-radius: 8px;
          border: 1px solid var(--divider-color);
          overflow: hidden;
        }

        .day-column.today {
          border: 2px solid var(--primary-color);
          box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
        }

        .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .day-column.today .day-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .day-name {
          flex: 1;
        }

        .today-badge {
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Lessons List */
        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          flex: 1;
        }

        /* Lesson */
        .lesson {
          background: var(--card-background-color);
          border-left: 4px solid var(--primary-color);
          border-radius: 6px;
          padding: 8px;
          transition: all 0.2s ease;
        }

        .lesson:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .lesson.current {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
          box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3); }
          50% { box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5); }
        }

        .lesson-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          position: relative;
        }

        .lesson-icon {
          font-size: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-background-color);
          border-radius: 6px;
          flex-shrink: 0;
        }

        .lesson-info {
          flex: 1;
          min-width: 0;
        }

        .lesson-subject {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lesson-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .lesson-time i {
          font-size: 12px;
        }

        .current-badge {
          position: absolute;
          top: 0;
          right: 0;
          color: var(--primary-color);
          font-size: 12px;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .lesson-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--divider-color);
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--secondary-text-color);
        }

        .detail i {
          font-size: 12px;
          opacity: 0.7;
        }

        /* No Lessons */
        .no-lessons-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px 12px;
          color: var(--secondary-text-color);
          opacity: 0.5;
        }

        .no-lessons-day i {
          font-size: 32px;
        }

        .no-lessons-day span {
          font-size: 12px;
        }

        /* Empty Schedule */
        .empty-schedule {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 48px 16px;
          color: var(--secondary-text-color);
        }

        .empty-schedule i {
          font-size: 64px;
          opacity: 0.3;
        }

        .empty-schedule span {
          font-size: 16px;
        }

        /* Compact Mode Adjustments */
        .schedule-grid.compact .lesson {
          padding: 6px;
        }

        .schedule-grid.compact .lesson-icon {
          width: 28px;
          height: 28px;
          font-size: 16px;
        }

        .schedule-grid.compact .lesson-subject {
          font-size: 13px;
        }

        .schedule-grid.compact .lesson-time {
          font-size: 11px;
        }

        .schedule-grid.compact .day-header {
          padding: 8px;
          font-size: 13px;
        }
      </style>
    `;
  }
}

customElements.define('timetable-schedule-card', TimetableScheduleCard);

// Register with window.customCards for card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timetable-schedule-card',
  name: 'TimeTable Full Schedule',
  description: 'Shows the full week schedule with current lesson highlighted',
  preview: true,
  documentationURL: 'https://github.com/alles-automatisch/timetable'
});

console.info(
  '%c TIMETABLE-SCHEDULE-CARD %c 1.0.0 ',
  'color: white; background: #667eea; font-weight: 700;',
  'color: #667eea; background: white; font-weight: 700;'
);
