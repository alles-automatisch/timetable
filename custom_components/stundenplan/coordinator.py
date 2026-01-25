"""DataUpdateCoordinator for Stundenplan."""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import DOMAIN, UPDATE_INTERVAL, WEEKDAY_MAP
from .storage import StundenplanStorage

_LOGGER = logging.getLogger(__name__)


class StundenplanCoordinator(DataUpdateCoordinator):
    """Class to manage fetching Stundenplan data."""

    def __init__(self, hass: HomeAssistant, storage: StundenplanStorage) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.storage = storage

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from storage and compute current state."""
        now = dt_util.now()
        schedule = self.storage.get_schedule()

        if schedule is None:
            return self._get_empty_state()

        # Get today's weekday
        weekday_index = now.weekday()
        weekday_name = WEEKDAY_MAP.get(weekday_index, "monday")

        # Check if in vacation
        vacation_info = self._get_current_vacation(now)
        is_vacation = vacation_info is not None

        # Get today's lessons
        today_lessons = schedule.get("lessons", {}).get(weekday_name, [])

        # Find current and next lesson
        current_lesson = None
        next_lesson = None
        remaining_count = 0

        current_time = now.time()

        for lesson in today_lessons:
            start_time = self._parse_time(lesson.get("start_time", "00:00"))
            end_time = self._parse_time(lesson.get("end_time", "23:59"))

            if start_time <= current_time < end_time:
                current_lesson = lesson
            elif current_time < start_time:
                if next_lesson is None:
                    next_lesson = lesson
                remaining_count += 1

        # Determine state
        state = self._determine_state(
            is_vacation,
            vacation_info,
            current_lesson,
            weekday_index,
            schedule.get("include_weekends", False),
        )

        # Check if it's a school day
        is_school_day = self._is_school_day(
            weekday_index,
            schedule.get("include_weekends", False),
            is_vacation,
        )

        return {
            "state": state,
            "current_lesson": current_lesson,
            "next_lesson": next_lesson,
            "today_lessons": today_lessons,
            "remaining_today_count": remaining_count,
            "is_vacation": is_vacation,
            "vacation_name": vacation_info.get("label") if vacation_info else None,
            "is_school_day": is_school_day,
            "schedule": schedule,
        }

    def _get_empty_state(self) -> dict[str, Any]:
        """Return empty state when no schedule exists."""
        return {
            "state": "No Schedule",
            "current_lesson": None,
            "next_lesson": None,
            "today_lessons": [],
            "remaining_today_count": 0,
            "is_vacation": False,
            "vacation_name": None,
            "is_school_day": False,
            "schedule": None,
        }

    def _get_current_vacation(self, now: datetime) -> dict[str, Any] | None:
        """Check if current date is within a vacation period."""
        current_date = now.date()
        vacations = self.storage.get_vacations()

        for vacation in vacations:
            try:
                start_date = datetime.strptime(
                    vacation.get("start_date", ""), "%Y-%m-%d"
                ).date()
                end_date = datetime.strptime(
                    vacation.get("end_date", ""), "%Y-%m-%d"
                ).date()

                if start_date <= current_date <= end_date:
                    return vacation
            except ValueError:
                _LOGGER.warning("Invalid vacation date format: %s", vacation)
                continue

        return None

    def _parse_time(self, time_str: str) -> datetime.time:
        """Parse time string to time object."""
        try:
            return datetime.strptime(time_str, "%H:%M").time()
        except ValueError:
            _LOGGER.warning("Invalid time format: %s", time_str)
            return datetime.strptime("00:00", "%H:%M").time()

    def _determine_state(
        self,
        is_vacation: bool,
        vacation_info: dict[str, Any] | None,
        current_lesson: dict[str, Any] | None,
        weekday_index: int,
        include_weekends: bool,
    ) -> str:
        """Determine the current state string."""
        if is_vacation and vacation_info:
            return f"Ferien: {vacation_info.get('label', 'Vacation')}"

        if not self._is_school_day(weekday_index, include_weekends, is_vacation):
            return "Schulfrei / Wochenende"

        if current_lesson:
            subject = current_lesson.get("subject", "Unknown")
            start = current_lesson.get("start_time", "")
            end = current_lesson.get("end_time", "")
            return f"{subject} ({start}–{end})"

        # Check if between lessons (free period)
        # For now, return "Freistunde" if there are more lessons today
        # This could be enhanced to detect actual gaps
        return "Freistunde"

    def _is_school_day(
        self,
        weekday_index: int,
        include_weekends: bool,
        is_vacation: bool,
    ) -> bool:
        """Determine if today is a school day."""
        if is_vacation:
            return False

        if weekday_index >= 5 and not include_weekends:  # Saturday (5) or Sunday (6)
            return False

        return True
