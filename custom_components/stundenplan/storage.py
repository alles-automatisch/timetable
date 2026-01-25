"""Storage for Stundenplan integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION, WEEKDAYS

_LOGGER = logging.getLogger(__name__)


class StundenplanStorage:
    """Class to manage Stundenplan storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage."""
        self.hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {}

    async def async_load(self) -> dict[str, Any]:
        """Load data from storage."""
        data = await self._store.async_load()
        if data is None:
            self._data = self._get_default_data()
        else:
            self._data = data
        return self._data

    async def async_save(self) -> None:
        """Save data to storage."""
        await self._store.async_save(self._data)

    def _get_default_data(self) -> dict[str, Any]:
        """Return default data structure."""
        return {
            "schedules": {
                "default": {
                    "name": "Default Schedule",
                    "lessons": {day: [] for day in WEEKDAYS},
                    "include_weekends": False,
                }
            },
            "vacations": [],
            "active_schedule": "default",
        }

    @property
    def data(self) -> dict[str, Any]:
        """Return the current data."""
        return self._data

    def get_schedule(self, schedule_id: str = None) -> dict[str, Any] | None:
        """Get a schedule by ID or active schedule."""
        if schedule_id is None:
            schedule_id = self._data.get("active_schedule", "default")
        return self._data.get("schedules", {}).get(schedule_id)

    def set_schedule(self, schedule_id: str, schedule_data: dict[str, Any]) -> None:
        """Set or update a schedule."""
        if "schedules" not in self._data:
            self._data["schedules"] = {}

        # Ensure all weekdays exist
        if "lessons" not in schedule_data:
            schedule_data["lessons"] = {day: [] for day in WEEKDAYS}
        else:
            for day in WEEKDAYS:
                if day not in schedule_data["lessons"]:
                    schedule_data["lessons"][day] = []

        self._data["schedules"][schedule_id] = schedule_data

    def add_lesson(
        self,
        schedule_id: str,
        weekday: str,
        lesson: dict[str, Any],
    ) -> None:
        """Add a lesson to a schedule."""
        schedule = self.get_schedule(schedule_id)
        if schedule is None:
            raise ValueError(f"Schedule {schedule_id} not found")

        if weekday not in WEEKDAYS:
            raise ValueError(f"Invalid weekday: {weekday}")

        schedule["lessons"][weekday].append(lesson)
        # Sort lessons by start time
        schedule["lessons"][weekday].sort(key=lambda x: x.get("start_time", "00:00"))

    def remove_lesson(
        self,
        schedule_id: str,
        weekday: str,
        lesson_index: int,
    ) -> None:
        """Remove a lesson from a schedule."""
        schedule = self.get_schedule(schedule_id)
        if schedule is None:
            raise ValueError(f"Schedule {schedule_id} not found")

        if weekday not in WEEKDAYS:
            raise ValueError(f"Invalid weekday: {weekday}")

        lessons = schedule["lessons"][weekday]
        if lesson_index < 0 or lesson_index >= len(lessons):
            raise ValueError(f"Invalid lesson index: {lesson_index}")

        lessons.pop(lesson_index)

    def add_vacation(self, vacation: dict[str, Any]) -> None:
        """Add a vacation period."""
        if "vacations" not in self._data:
            self._data["vacations"] = []

        self._data["vacations"].append(vacation)
        # Sort vacations by start date
        self._data["vacations"].sort(key=lambda x: x.get("start_date", ""))

    def remove_vacation(self, vacation_index: int) -> None:
        """Remove a vacation period."""
        if "vacations" not in self._data:
            self._data["vacations"] = []

        if vacation_index < 0 or vacation_index >= len(self._data["vacations"]):
            raise ValueError(f"Invalid vacation index: {vacation_index}")

        self._data["vacations"].pop(vacation_index)

    def get_vacations(self) -> list[dict[str, Any]]:
        """Get all vacation periods."""
        return self._data.get("vacations", [])

    def set_active_schedule(self, schedule_id: str) -> None:
        """Set the active schedule."""
        if schedule_id not in self._data.get("schedules", {}):
            raise ValueError(f"Schedule {schedule_id} not found")
        self._data["active_schedule"] = schedule_id
