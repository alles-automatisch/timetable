/**
 * TimeTable Next Lesson Card
 * Compact card for displaying current/next lessons
 * Version: 1.0.0
 */

class TimetableNextLessonCard extends HTMLElement {
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
      show_current_only: config.show_current_only || false,
      show_previous: config.show_previous || false,
      show_upcoming: config.show_upcoming || 1, // 1 or 2
      show_room: config.show_room !== false,
      show_teacher: config.show_teacher !== false,
      show_colors: config.show_colors !== false,
      show_logo: config.show_logo !== false,
      logo_url: config.logo_url || '/local/community/timetable/logo.png',
      title: config.title || 'Next Lesson',
      ...config
    };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 2;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.timetable_current',
      show_current_only: false,
      show_previous: false,
      show_upcoming: 1,
      show_room: true,
      show_teacher: true,
      show_colors: true,
      show_logo: true,
      title: 'Next Lesson'
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
    const currentLesson = entityState.attributes.current_lesson;
    const nextLesson = entityState.attributes.next_lesson;
    const todayLessons = entityState.attributes.today_lessons || [];

    this.shadowRoot.innerHTML = `
      ${this.getStyles()}
      <ha-card>
        <div class="card-content">
          ${this.renderHeader()}
          ${isVacation
            ? this.renderVacation(vacationName)
            : this.renderLessons(currentLesson, nextLesson, todayLessons)
          }
        </div>
      </ha-card>
    `;
  }

  renderHeader() {
    return `
      <div class="header">
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

  renderLessons(currentLesson, nextLesson, todayLessons) {
    const lessons = [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Show current lesson if active
    if (currentLesson && !this._config.show_current_only) {
      lessons.push({
        ...currentLesson,
        status: 'current',
        label: 'Now'
      });
    }

    // Show previous lesson if requested
    if (this._config.show_previous && !currentLesson && todayLessons.length > 0) {
      // Find most recent past lesson
      const pastLessons = todayLessons.filter(lesson => {
        const [hours, minutes] = lesson.end_time.split(':').map(Number);
        const lessonEnd = hours * 60 + minutes;
        return lessonEnd <= currentTime;
      });

      if (pastLessons.length > 0) {
        const previousLesson = pastLessons[pastLessons.length - 1];
        lessons.push({
          ...previousLesson,
          status: 'previous',
          label: 'Previous'
        });
      }
    }

    // Show current if show_current_only
    if (this._config.show_current_only && currentLesson) {
      return this.renderLessonCard({
        ...currentLesson,
        status: 'current',
        label: 'Now'
      });
    }

    // Show next lesson
    if (nextLesson) {
      lessons.push({
        ...nextLesson,
        status: 'next',
        label: 'Next'
      });

      // Show additional upcoming lessons if requested
      if (this._config.show_upcoming === 2 && todayLessons.length > 0) {
        const nextIndex = todayLessons.findIndex(l =>
          l.start_time === nextLesson.start_time && l.subject === nextLesson.subject
        );

        if (nextIndex !== -1 && nextIndex + 1 < todayLessons.length) {
          const upcomingLesson = todayLessons[nextIndex + 1];
          lessons.push({
            ...upcomingLesson,
            status: 'upcoming',
            label: 'Later'
          });
        }
      }
    }

    // If no lessons to show
    if (lessons.length === 0) {
      return `
        <div class="no-lessons">
          <i class="mdi mdi-calendar-blank"></i>
          <span>No lessons today</span>
        </div>
      `;
    }

    return `
      <div class="lessons-container">
        ${lessons.map(lesson => this.renderLessonCard(lesson)).join('')}
      </div>
    `;
  }

  renderLessonCard(lesson) {
    const accentColor = this._config.show_colors ? lesson.color : 'var(--primary-color)';
    const iconName = lesson.icon ? lesson.icon.replace('mdi:', '') : 'book-open-variant';

    return `
      <div class="lesson-card lesson-${lesson.status}" style="border-left-color: ${accentColor};">
        <div class="lesson-header">
          <div class="lesson-icon" style="color: ${accentColor};">
            <i class="mdi mdi-${iconName}"></i>
          </div>
          <div class="lesson-main">
            <div class="lesson-subject">${lesson.subject}</div>
            <div class="lesson-time">
              <i class="mdi mdi-clock-outline"></i>
              ${lesson.start_time} - ${lesson.end_time}
            </div>
          </div>
          <div class="lesson-badge ${lesson.status}">${lesson.label}</div>
        </div>
        ${(this._config.show_room || this._config.show_teacher) ? `
          <div class="lesson-details">
            ${this._config.show_room && lesson.room ? `
              <span class="detail-item">
                <i class="mdi mdi-door"></i>
                ${lesson.room}
              </span>
            ` : ''}
            ${this._config.show_teacher && lesson.teacher ? `
              <span class="detail-item">
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
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--divider-color);
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
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .vacation-banner i {
          font-size: 32px;
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
          font-size: 18px;
          font-weight: 600;
        }

        /* Lessons Container */
        .lessons-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Lesson Card */
        .lesson-card {
          background: var(--card-background-color);
          border-left: 4px solid var(--primary-color);
          border-radius: 8px;
          padding: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .lesson-card:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .lesson-card.lesson-current {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
        }

        .lesson-card.lesson-previous {
          opacity: 0.7;
        }

        .lesson-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lesson-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-background-color);
          border-radius: 8px;
          flex-shrink: 0;
        }

        .lesson-main {
          flex: 1;
          min-width: 0;
        }

        .lesson-subject {
          font-size: 16px;
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
          font-size: 13px;
          color: var(--secondary-text-color);
        }

        .lesson-time i {
          font-size: 14px;
        }

        .lesson-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .lesson-badge.current {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .lesson-badge.next {
          background: var(--primary-color);
          color: white;
          opacity: 0.9;
        }

        .lesson-badge.previous {
          background: var(--disabled-text-color);
          color: white;
          opacity: 0.6;
        }

        .lesson-badge.upcoming {
          background: var(--secondary-text-color);
          color: white;
          opacity: 0.8;
        }

        .lesson-details {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--divider-color);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--secondary-text-color);
        }

        .detail-item i {
          font-size: 14px;
          opacity: 0.7;
        }

        /* No Lessons */
        .no-lessons {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px 16px;
          color: var(--secondary-text-color);
        }

        .no-lessons i {
          font-size: 48px;
          opacity: 0.3;
        }

        .no-lessons span {
          font-size: 14px;
        }
      </style>
    `;
  }
}

customElements.define('timetable-next-lesson-card', TimetableNextLessonCard);

// Register with window.customCards for card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'timetable-next-lesson-card',
  name: 'TimeTable Next Lesson',
  description: 'Shows current and upcoming lessons in a compact format',
  preview: true,
  documentationURL: 'https://github.com/alles-automatisch/timetable'
});

console.info(
  '%c TIMETABLE-NEXT-LESSON-CARD %c 1.0.0 ',
  'color: white; background: #667eea; font-weight: 700;',
  'color: #667eea; background: white; font-weight: 700;'
);
