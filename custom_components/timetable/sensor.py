"""Sensor platform for TimeTable."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTR_CURRENT_LESSON,
    ATTR_IS_SCHOOL_DAY,
    ATTR_IS_VACATION,
    ATTR_NEXT_LESSON,
    ATTR_REMAINING_TODAY,
    ATTR_TODAY_LESSONS,
    ATTR_VACATION_NAME,
    DOMAIN,
)
from .coordinator import TimetableCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Timetable sensor based on a config entry."""
    coordinator: TimetableCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]

    async_add_entities(
        [
            TimetableCurrentSensor(coordinator, entry),
            TimetableNextSensor(coordinator, entry),
        ]
    )


class TimetableCurrentSensor(CoordinatorEntity, SensorEntity):
    """Sensor for current lesson/state."""

    def __init__(
        self, coordinator: TimetableCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_name = "TimeTable Current"
        self._attr_unique_id = f"{entry.entry_id}_current"
        self._attr_icon = "mdi:school"
        self._attr_has_entity_name = False

    @property
    def native_value(self) -> str:
        """Return the state of the sensor."""
        return self.coordinator.data.get("state", "Unknown")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        data = self.coordinator.data
        return {
            ATTR_CURRENT_LESSON: data.get("current_lesson"),
            ATTR_NEXT_LESSON: data.get("next_lesson"),
            ATTR_TODAY_LESSONS: data.get("today_lessons", []),
            ATTR_REMAINING_TODAY: data.get("remaining_today_count", 0),
            ATTR_IS_VACATION: data.get("is_vacation", False),
            ATTR_VACATION_NAME: data.get("vacation_name"),
            ATTR_IS_SCHOOL_DAY: data.get("is_school_day", False),
        }


class TimetableNextSensor(CoordinatorEntity, SensorEntity):
    """Sensor for next lesson."""

    def __init__(
        self, coordinator: TimetableCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_name = "TimeTable Next Lesson"
        self._attr_unique_id = f"{entry.entry_id}_next"
        self._attr_icon = "mdi:clock-outline"
        self._attr_has_entity_name = False

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        next_lesson = self.coordinator.data.get("next_lesson")
        if next_lesson is None:
            return "No upcoming lesson"

        subject = next_lesson.get("subject", "Unknown")
        start = next_lesson.get("start_time", "")
        return f"{subject} at {start}"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        next_lesson = self.coordinator.data.get("next_lesson")
        if next_lesson is None:
            return {}

        return {
            "subject": next_lesson.get("subject"),
            "start_time": next_lesson.get("start_time"),
            "end_time": next_lesson.get("end_time"),
            "room": next_lesson.get("room"),
            "teacher": next_lesson.get("teacher"),
            "notes": next_lesson.get("notes"),
            "color": next_lesson.get("color"),
            "icon": next_lesson.get("icon"),
        }
