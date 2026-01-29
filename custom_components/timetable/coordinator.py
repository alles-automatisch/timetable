"""DataUpdateCoordinator for TimeTable that reads from config entry."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import DOMAIN, UPDATE_INTERVAL, WEEKDAY_MAP

_LOGGER = logging.getLogger(__name__)


class TimetableCoordinator(DataUpdateCoordinator):
    """Class to manage fetching TimeTable data from config entry."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.config_entry = config_entry

    def _get_schedule_data(self) -> dict[str, Any]:
        """Get schedule data from config entry options."""
        return {
            "lessons": self.config_entry.options.get("lessons", {}),
            "vacations": self.config_entry.options.get("vacations", []),
            "include_weekends": self.config_entry.options.get("include_weekends", False),
        }

    def _get_lessons_for_day(self, weekday: str) -> list[dict[str, Any]]:
        """Get lessons for a specific weekday."""
        schedule = self._get_schedule_data()
        return schedule["lessons"].get(weekday, [])

    def _check_vacation(self, date: datetime) -> tuple[bool, str | None]:
        """Check if date is in vacation period."""
        schedule = self._get_schedule_data()
        date_str = date.date().isoformat()

        for vacation in schedule["vacations"]:
            start = vacation["start_date"]
            end = vacation["end_date"]

            if start <= date_str <= end:
                return True, vacation["label"]

        return False, None

    def _get_current_lesson(
        self, now: datetime, lessons: list[dict[str, Any]]
    ) -> dict[str, Any] | None:
        """Get the current lesson if any."""
        current_time = now.strftime("%H:%M")

        for lesson in lessons:
            if lesson["start_time"] <= current_time < lesson["end_time"]:
                return lesson

        return None

    def _get_next_lesson(
        self, now: datetime, lessons: list[dict[str, Any]]
    ) -> dict[str, Any] | None:
        """Get the next upcoming lesson."""
        current_time = now.strftime("%H:%M")

        for lesson in lessons:
            if lesson["start_time"] > current_time:
                return lesson

        return None

    def _get_remaining_lessons(
        self, now: datetime, lessons: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Get remaining lessons for today."""
        current_time = now.strftime("%H:%M")

        return [lesson for lesson in lessons if lesson["end_time"] > current_time]

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from config entry."""
        now = dt_util.now()
        weekday = WEEKDAY_MAP[now.weekday()]

        # Check if in vacation
        is_vacation, vacation_name = self._check_vacation(now)

        # Get today's lessons
        today_lessons = self._get_lessons_for_day(weekday)

        # Get current and next lessons
        current_lesson = self._get_current_lesson(now, today_lessons)
        next_lesson = self._get_next_lesson(now, today_lessons)

        # Get remaining lessons
        remaining_lessons = self._get_remaining_lessons(now, today_lessons)

        # Determine current state
        if is_vacation:
            state = f"Vacation: {vacation_name}"
        elif current_lesson:
            state = current_lesson["subject"]
        elif next_lesson:
            state = "Free Period"
        elif today_lessons:
            state = "After School"
        else:
            state = "No School Today"

        # Build result data
        return {
            "state": state,
            "current_lesson": current_lesson,
            "next_lesson": next_lesson,
            "today_lessons": today_lessons,
            "remaining_today_count": len(remaining_lessons),
            "is_vacation": is_vacation,
            "vacation_name": vacation_name,
            "is_school_day": len(today_lessons) > 0,
            "is_schooltime": current_lesson is not None,
            "weekday": weekday,
        }
