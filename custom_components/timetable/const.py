"""Constants for the TimeTable integration."""
from typing import Final

DOMAIN: Final = "timetable"
STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = "timetable.storage"

# Update interval (in seconds)
UPDATE_INTERVAL: Final = 60

# Weekdays
WEEKDAYS: Final = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
WEEKDAY_MAP: Final = {
    0: "monday",
    1: "tuesday",
    2: "wednesday",
    3: "thursday",
    4: "friday",
    5: "saturday",
    6: "sunday",
}

# Default config
DEFAULT_SCHEDULE_NAME: Final = "Default Schedule"
DEFAULT_INCLUDE_WEEKENDS: Final = False

# Services
SERVICE_SET_SCHEDULE: Final = "set_schedule"
SERVICE_ADD_LESSON: Final = "add_lesson"
SERVICE_REMOVE_LESSON: Final = "remove_lesson"
SERVICE_ADD_VACATION: Final = "add_vacation"
SERVICE_REMOVE_VACATION: Final = "remove_vacation"

# Attributes
ATTR_SCHEDULE_ID: Final = "schedule_id"
ATTR_SCHEDULE_NAME: Final = "schedule_name"
ATTR_SCHEDULE_DATA: Final = "schedule_data"
ATTR_WEEKDAY: Final = "weekday"
ATTR_LESSON_INDEX: Final = "lesson_index"
ATTR_LESSON: Final = "lesson"
ATTR_SUBJECT: Final = "subject"
ATTR_START_TIME: Final = "start_time"
ATTR_END_TIME: Final = "end_time"
ATTR_ROOM: Final = "room"
ATTR_TEACHER: Final = "teacher"
ATTR_NOTES: Final = "notes"
ATTR_COLOR: Final = "color"
ATTR_ICON: Final = "icon"
ATTR_VACATION_START: Final = "start_date"
ATTR_VACATION_END: Final = "end_date"
ATTR_VACATION_LABEL: Final = "label"
ATTR_VACATION_INDEX: Final = "vacation_index"

# Sensor attributes
ATTR_TODAY_LESSONS: Final = "today_lessons"
ATTR_NEXT_LESSON: Final = "next_lesson"
ATTR_REMAINING_TODAY: Final = "remaining_today_count"
ATTR_IS_VACATION: Final = "is_vacation"
ATTR_IS_SCHOOL_DAY: Final = "is_school_day"
ATTR_CURRENT_LESSON: Final = "current_lesson"
ATTR_VACATION_NAME: Final = "vacation_name"
