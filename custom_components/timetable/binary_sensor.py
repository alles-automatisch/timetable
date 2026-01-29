"""Binary sensor platform for TimeTable."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import TimetableCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Timetable binary sensor based on a config entry."""
    coordinator: TimetableCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]

    async_add_entities([TimetableIsSchooltimeSensor(coordinator, entry)])


class TimetableIsSchooltimeSensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor for whether currently in school time."""

    def __init__(
        self, coordinator: TimetableCoordinator, entry: ConfigEntry
    ) -> None:
        """Initialize the binary sensor."""
        super().__init__(coordinator)
        self._attr_name = "TimeTable Is Schooltime"
        self._attr_unique_id = f"{entry.entry_id}_is_schooltime"
        self._attr_icon = "mdi:school"
        self._attr_device_class = "occupancy"
        self._attr_has_entity_name = False

    @property
    def is_on(self) -> bool:
        """Return true if currently in a lesson."""
        return self.coordinator.data.get("current_lesson") is not None
