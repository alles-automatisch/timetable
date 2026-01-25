class StundenplanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this._config = {
      entity: config.entity,
      view: config.view || 'today', // 'today', 'week'
      show_weekends: config.show_weekends !== false,
      show_room: config.show_room !== false,
      show_teacher: config.show_teacher !== false,
      show_colors: config.show_colors !== false,
      compact_mode: config.compact_mode || false,
      title: config.title || 'TimeTable',
      ...config
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return this._config.compact_mode ? 3 : 6;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.stundenplan_current',
      view: 'today',
      show_weekends: false,
      show_room: true,
      show_teacher: true,
      show_colors: true,
      compact_mode: false,
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
          <div class="warning">Entity ${this._config.entity} not found</div>
        </ha-card>
      `;
      return;
    }

    const isVacation = entityState.attributes.is_vacation || false;
    const vacationName = entityState.attributes.vacation_name;
    const currentLesson = entityState.attributes.current_lesson;
    const nextLesson = entityState.attributes.next_lesson;
    const todayLessons = entityState.attributes.today_lessons || [];
    const isSchoolDay = entityState.attributes.is_school_day || false;

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <ha-card>
        <div class="card-content">
          ${this.renderHeader()}
          ${isVacation ? this.renderVacationBanner(vacationName) : ''}
          ${!isVacation && this._config.view === 'today'
            ? this.renderTodayView(currentLesson, nextLesson, todayLessons, isSchoolDay)
            : ''}
          ${!isVacation && this._config.view === 'week'
            ? this.renderWeekView()
            : ''}
        </div>
      </ha-card>
    `;
  }

  renderHeader() {
    return `
      <div class="header">
        <div class="header-title">
          <ha-icon icon="mdi:school"></ha-icon>
          <span>${this._config.title}</span>
        </div>
        <div class="view-toggle">
          <button class="view-btn ${this._config.view === 'today' ? 'active' : ''}"
                  onclick="this.getRootNode().host.setView('today')">
            Today
          </button>
          <button class="view-btn ${this._config.view === 'week' ? 'active' : ''}"
                  onclick="this.getRootNode().host.setView('week')">
            Week
          </button>
        </div>
      </div>
    `;
  }

  renderVacationBanner(name) {
    return `
      <div class="vacation-banner">
        <ha-icon icon="mdi:beach"></ha-icon>
        <div class="vacation-text">
          <div class="vacation-title">${name || 'Vacation'}</div>
          <div class="vacation-subtitle">Enjoy your time off!</div>
        </div>
      </div>
    `;
  }

  renderTodayView(currentLesson, nextLesson, todayLessons, isSchoolDay) {
    if (!isSchoolDay) {
      return `
        <div class="no-school">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <div>No school today</div>
        </div>
      `;
    }

    return `
      <div class="today-view">
        ${currentLesson ? this.renderCurrentLesson(currentLesson) : ''}
        ${nextLesson ? this.renderNextLesson(nextLesson) : ''}
        ${todayLessons.length > 0 ? this.renderTodayLessons(todayLessons, currentLesson) : ''}
      </div>
    `;
  }

  renderCurrentLesson(lesson) {
    const color = this._config.show_colors && lesson.color ? lesson.color : 'var(--primary-color)';
    return `
      <div class="current-lesson" style="border-left-color: ${color}">
        <div class="lesson-badge">Now</div>
        <div class="lesson-info">
          <div class="lesson-subject">${lesson.subject}</div>
          <div class="lesson-time">${lesson.start_time} - ${lesson.end_time}</div>
          ${this._config.show_room && lesson.room ? `<div class="lesson-detail"><ha-icon icon="mdi:door"></ha-icon> ${lesson.room}</div>` : ''}
          ${this._config.show_teacher && lesson.teacher ? `<div class="lesson-detail"><ha-icon icon="mdi:account"></ha-icon> ${lesson.teacher}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderNextLesson(lesson) {
    const color = this._config.show_colors && lesson.color ? lesson.color : 'var(--secondary-text-color)';
    return `
      <div class="next-lesson" style="border-left-color: ${color}">
        <div class="lesson-badge next">Next</div>
        <div class="lesson-info">
          <div class="lesson-subject">${lesson.subject}</div>
          <div class="lesson-time">${lesson.start_time} - ${lesson.end_time}</div>
          ${this._config.show_room && lesson.room ? `<div class="lesson-detail"><ha-icon icon="mdi:door"></ha-icon> ${lesson.room}</div>` : ''}
          ${this._config.show_teacher && lesson.teacher ? `<div class="lesson-detail"><ha-icon icon="mdi:account"></ha-icon> ${lesson.teacher}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderTodayLessons(lessons, currentLesson) {
    const currentSubject = currentLesson?.subject;
    return `
      <div class="lessons-list">
        <div class="list-title">Today's Schedule</div>
        ${lessons.map(lesson => {
          const isCurrent = lesson.subject === currentSubject &&
                           lesson.start_time === currentLesson?.start_time;
          const color = this._config.show_colors && lesson.color ? lesson.color : 'var(--divider-color)';
          return `
            <div class="lesson-item ${isCurrent ? 'active' : ''}" style="border-left-color: ${color}">
              <div class="lesson-time-compact">${lesson.start_time}</div>
              <div class="lesson-details-compact">
                <div class="lesson-subject-compact">${lesson.subject}</div>
                ${this._config.show_room && lesson.room ? `<div class="lesson-meta">${lesson.room}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderWeekView() {
    const entityState = this._hass.states[this._config.entity];
    if (!entityState) return '';

    // Get schedule data from storage via a dedicated sensor or by calling a service
    // For now, we'll show a placeholder
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    if (this._config.show_weekends) {
      weekdays.push('saturday', 'sunday');
    }

    return `
      <div class="week-view">
        <div class="weekday-tabs">
          ${weekdays.map((day, index) => `
            <button class="weekday-tab ${index === 0 ? 'active' : ''}"
                    data-day="${day}"
                    onclick="this.getRootNode().host.selectDay('${day}')">
              ${this.getDayLabel(day)}
            </button>
          `).join('')}
        </div>
        <div class="week-content">
          <div class="placeholder">
            Week view with full schedule coming soon.
            <br>Use services to manage your schedule.
          </div>
        </div>
      </div>
    `;
  }

  getDayLabel(day) {
    const labels = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    return labels[day] || day;
  }

  setView(view) {
    this._config.view = view;
    this.render();
  }

  selectDay(day) {
    // Future implementation for week view day selection
    console.log('Selected day:', day);
  }

  getStyles() {
    return `
      <style>
        :host {
          --stp-primary-color: var(--primary-color);
          --stp-text-primary: var(--primary-text-color);
          --stp-text-secondary: var(--secondary-text-color);
          --stp-divider: var(--divider-color);
          --stp-card-background: var(--card-background-color);
        }

        ha-card {
          padding: 16px;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 500;
          color: var(--stp-text-primary);
        }

        .header-title ha-icon {
          color: var(--stp-primary-color);
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: var(--stp-divider);
          border-radius: 8px;
          padding: 2px;
        }

        .view-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: var(--stp-text-secondary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-btn.active {
          background: var(--stp-card-background);
          color: var(--stp-primary-color);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .vacation-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .vacation-banner ha-icon {
          font-size: 48px;
          opacity: 0.9;
        }

        .vacation-title {
          font-size: 20px;
          font-weight: 600;
        }

        .vacation-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .no-school {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--stp-text-secondary);
          gap: 12px;
        }

        .no-school ha-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .today-view {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .current-lesson,
        .next-lesson {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: var(--stp-card-background);
          border-radius: 12px;
          border-left: 4px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .current-lesson {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .lesson-badge {
          background: var(--stp-primary-color);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          height: fit-content;
        }

        .lesson-badge.next {
          background: var(--stp-text-secondary);
        }

        .lesson-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lesson-subject {
          font-size: 18px;
          font-weight: 600;
          color: var(--stp-text-primary);
        }

        .lesson-time {
          font-size: 14px;
          color: var(--stp-text-secondary);
          font-weight: 500;
        }

        .lesson-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--stp-text-secondary);
          margin-top: 4px;
        }

        .lesson-detail ha-icon {
          font-size: 16px;
        }

        .lessons-list {
          margin-top: 8px;
        }

        .list-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--stp-text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .lesson-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--stp-card-background);
          border-radius: 8px;
          border-left: 3px solid;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .lesson-item:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateX(2px);
        }

        .lesson-item.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .lesson-time-compact {
          font-size: 13px;
          font-weight: 600;
          color: var(--stp-text-secondary);
          min-width: 50px;
        }

        .lesson-details-compact {
          flex: 1;
        }

        .lesson-subject-compact {
          font-size: 15px;
          font-weight: 500;
          color: var(--stp-text-primary);
        }

        .lesson-meta {
          font-size: 12px;
          color: var(--stp-text-secondary);
          margin-top: 2px;
        }

        .week-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .weekday-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding: 4px;
          background: var(--stp-divider);
          border-radius: 8px;
        }

        .weekday-tab {
          flex: 1;
          min-width: 60px;
          background: transparent;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: var(--stp-text-secondary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .weekday-tab.active {
          background: var(--stp-card-background);
          color: var(--stp-primary-color);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .week-content {
          min-height: 200px;
        }

        .placeholder {
          text-align: center;
          padding: 40px;
          color: var(--stp-text-secondary);
          line-height: 1.6;
        }

        .warning {
          padding: 16px;
          color: var(--error-color);
          text-align: center;
        }
      </style>
    `;
  }

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }
}

// Card editor
class StundenplanCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._hass) {
      return;
    }

    const entities = Object.keys(this._hass.states).filter(
      (eid) => eid.startsWith('sensor.stundenplan_')
    );

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }

        .config-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 500;
          font-size: 14px;
        }

        select, input {
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
        }
      </style>

      <div class="card-config">
        <div class="config-row">
          <label>Entity</label>
          <select id="entity">
            ${entities.map(entity => `
              <option value="${entity}" ${this._config.entity === entity ? 'selected' : ''}>
                ${entity}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="config-row">
          <label>Title</label>
          <input type="text" id="title" value="${this._config.title || 'TimeTable'}" />
        </div>

        <div class="config-row">
          <label>Default View</label>
          <select id="view">
            <option value="today" ${this._config.view === 'today' ? 'selected' : ''}>Today</option>
            <option value="week" ${this._config.view === 'week' ? 'selected' : ''}>Week</option>
          </select>
        </div>

        <div class="checkbox-row">
          <input type="checkbox" id="show_weekends"
                 ${this._config.show_weekends !== false ? 'checked' : ''} />
          <label for="show_weekends">Show Weekends</label>
        </div>

        <div class="checkbox-row">
          <input type="checkbox" id="show_room"
                 ${this._config.show_room !== false ? 'checked' : ''} />
          <label for="show_room">Show Room</label>
        </div>

        <div class="checkbox-row">
          <input type="checkbox" id="show_teacher"
                 ${this._config.show_teacher !== false ? 'checked' : ''} />
          <label for="show_teacher">Show Teacher</label>
        </div>

        <div class="checkbox-row">
          <input type="checkbox" id="show_colors"
                 ${this._config.show_colors !== false ? 'checked' : ''} />
          <label for="show_colors">Show Colors</label>
        </div>

        <div class="checkbox-row">
          <input type="checkbox" id="compact_mode"
                 ${this._config.compact_mode ? 'checked' : ''} />
          <label for="compact_mode">Compact Mode</label>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('select, input').forEach(element => {
      element.addEventListener('change', () => this.updateConfig());
    });
  }

  updateConfig() {
    const newConfig = {
      ...this._config,
      entity: this.shadowRoot.getElementById('entity').value,
      title: this.shadowRoot.getElementById('title').value,
      view: this.shadowRoot.getElementById('view').value,
      show_weekends: this.shadowRoot.getElementById('show_weekends').checked,
      show_room: this.shadowRoot.getElementById('show_room').checked,
      show_teacher: this.shadowRoot.getElementById('show_teacher').checked,
      show_colors: this.shadowRoot.getElementById('show_colors').checked,
      compact_mode: this.shadowRoot.getElementById('compact_mode').checked,
    };
    this.configChanged(newConfig);
  }
}

customElements.define('stundenplan-card', StundenplanCard);
customElements.define('stundenplan-card-editor', StundenplanCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'stundenplan-card',
  name: 'TimeTable Card',
  description: 'A beautiful card to display school timetables with lessons, free periods, and vacation tracking',
  preview: true,
  documentationURL: 'https://github.com/alles-automatisch/timetable',
});

console.info(
  '%c TIMETABLE-CARD %c 1.0.1 ',
  'color: white; background: #667eea; font-weight: 700;',
  'color: #667eea; background: white; font-weight: 700;'
);
