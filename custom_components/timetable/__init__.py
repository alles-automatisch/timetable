"""The TimeTable integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import (
    ATTR_COLOR,
    ATTR_END_TIME,
    ATTR_ICON,
    ATTR_LESSON,
    ATTR_LESSON_INDEX,
    ATTR_NOTES,
    ATTR_ROOM,
    ATTR_SCHEDULE_DATA,
    ATTR_SCHEDULE_ID,
    ATTR_START_TIME,
    ATTR_SUBJECT,
    ATTR_TEACHER,
    ATTR_VACATION_END,
    ATTR_VACATION_INDEX,
    ATTR_VACATION_LABEL,
    ATTR_VACATION_START,
    ATTR_WEEKDAY,
    DOMAIN,
    SERVICE_ADD_LESSON,
    SERVICE_ADD_VACATION,
    SERVICE_REMOVE_LESSON,
    SERVICE_REMOVE_VACATION,
    SERVICE_SET_SCHEDULE,
    WEEKDAYS,
)
from .coordinator import TimetableCoordinator
from .storage import TimetableStorage

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "binary_sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the TimeTable component (YAML not supported)."""
    # This integration is configured via config flow only
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up TimeTable from a config entry."""
    try:
        hass.data.setdefault(DOMAIN, {})

        # Initialize storage
        _LOGGER.debug("Initializing storage for entry %s", entry.entry_id)
        storage = TimetableStorage(hass)
        await storage.async_load()

        # Initialize coordinator
        _LOGGER.debug("Initializing coordinator for entry %s", entry.entry_id)
        coordinator = TimetableCoordinator(hass, storage)
        await coordinator.async_config_entry_first_refresh()

        hass.data[DOMAIN][entry.entry_id] = {
            "coordinator": coordinator,
            "storage": storage,
        }

        # Set up platforms
        _LOGGER.debug("Setting up platforms for entry %s", entry.entry_id)
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

        # Register services only once (check if not already registered)
        if not hass.services.has_service(DOMAIN, SERVICE_SET_SCHEDULE):
            _LOGGER.debug("Registering services")
            await async_setup_services(hass)

        # Add update listener for options changes
        entry.async_on_unload(entry.add_update_listener(async_reload_entry))

        _LOGGER.info("Successfully set up TimeTable integration")
        return True
    except Exception as err:
        _LOGGER.exception("Error setting up TimeTable integration: %s", err)
        raise


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_setup_services(hass: HomeAssistant) -> None:
    """Set up services for TimeTable."""

    async def handle_set_schedule(call: ServiceCall) -> None:
        """Handle the set_schedule service."""
        schedule_id = call.data.get(ATTR_SCHEDULE_ID, "default")
        schedule_data = call.data.get(ATTR_SCHEDULE_DATA, {})

        # Get the first entry's storage and coordinator
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("No TimeTable integration entry found")
            return

        entry = entries[0]
        storage = hass.data[DOMAIN][entry.entry_id]["storage"]
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

        storage.set_schedule(schedule_id, schedule_data)
        await storage.async_save()
        await coordinator.async_request_refresh()

    async def handle_add_lesson(call: ServiceCall) -> None:
        """Handle the add_lesson service."""
        # Get the first entry's storage and coordinator
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("No TimeTable integration entry found")
            return

        entry = entries[0]
        storage = hass.data[DOMAIN][entry.entry_id]["storage"]
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

        schedule_id = call.data.get(ATTR_SCHEDULE_ID, "default")
        weekday = call.data[ATTR_WEEKDAY]
        lesson = call.data[ATTR_LESSON]

        try:
            storage.add_lesson(schedule_id, weekday, lesson)
            await storage.async_save()
            await coordinator.async_request_refresh()
        except ValueError as err:
            _LOGGER.error("Failed to add lesson: %s", err)

    async def handle_remove_lesson(call: ServiceCall) -> None:
        """Handle the remove_lesson service."""
        # Get the first entry's storage and coordinator
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("No TimeTable integration entry found")
            return

        entry = entries[0]
        storage = hass.data[DOMAIN][entry.entry_id]["storage"]
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

        schedule_id = call.data.get(ATTR_SCHEDULE_ID, "default")
        weekday = call.data[ATTR_WEEKDAY]
        lesson_index = call.data[ATTR_LESSON_INDEX]

        try:
            storage.remove_lesson(schedule_id, weekday, lesson_index)
            await storage.async_save()
            await coordinator.async_request_refresh()
        except ValueError as err:
            _LOGGER.error("Failed to remove lesson: %s", err)

    async def handle_add_vacation(call: ServiceCall) -> None:
        """Handle the add_vacation service."""
        # Get the first entry's storage and coordinator
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("No TimeTable integration entry found")
            return

        entry = entries[0]
        storage = hass.data[DOMAIN][entry.entry_id]["storage"]
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

        vacation = {
            "start_date": call.data[ATTR_VACATION_START],
            "end_date": call.data[ATTR_VACATION_END],
            "label": call.data[ATTR_VACATION_LABEL],
        }

        storage.add_vacation(vacation)
        await storage.async_save()
        await coordinator.async_request_refresh()

    async def handle_remove_vacation(call: ServiceCall) -> None:
        """Handle the remove_vacation service."""
        # Get the first entry's storage and coordinator
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("No TimeTable integration entry found")
            return

        entry = entries[0]
        storage = hass.data[DOMAIN][entry.entry_id]["storage"]
        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]

        vacation_index = call.data[ATTR_VACATION_INDEX]

        try:
            storage.remove_vacation(vacation_index)
            await storage.async_save()
            await coordinator.async_request_refresh()
        except ValueError as err:
            _LOGGER.error("Failed to remove vacation: %s", err)

    # Register services
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_SCHEDULE,
        handle_set_schedule,
        schema=vol.Schema(
            {
                vol.Optional(ATTR_SCHEDULE_ID, default="default"): cv.string,
                vol.Required(ATTR_SCHEDULE_DATA): dict,
            }
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_LESSON,
        handle_add_lesson,
        schema=vol.Schema(
            {
                vol.Optional(ATTR_SCHEDULE_ID, default="default"): cv.string,
                vol.Required(ATTR_WEEKDAY): vol.In(WEEKDAYS),
                vol.Required(ATTR_LESSON): vol.Schema(
                    {
                        vol.Required(ATTR_SUBJECT): cv.string,
                        vol.Required(ATTR_START_TIME): cv.string,
                        vol.Required(ATTR_END_TIME): cv.string,
                        vol.Optional(ATTR_ROOM): cv.string,
                        vol.Optional(ATTR_TEACHER): cv.string,
                        vol.Optional(ATTR_NOTES): cv.string,
                        vol.Optional(ATTR_COLOR): cv.string,
                        vol.Optional(ATTR_ICON): cv.string,
                    }
                ),
            }
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_LESSON,
        handle_remove_lesson,
        schema=vol.Schema(
            {
                vol.Optional(ATTR_SCHEDULE_ID, default="default"): cv.string,
                vol.Required(ATTR_WEEKDAY): vol.In(WEEKDAYS),
                vol.Required(ATTR_LESSON_INDEX): cv.positive_int,
            }
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_VACATION,
        handle_add_vacation,
        schema=vol.Schema(
            {
                vol.Required(ATTR_VACATION_START): cv.string,
                vol.Required(ATTR_VACATION_END): cv.string,
                vol.Required(ATTR_VACATION_LABEL): cv.string,
            }
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_VACATION,
        handle_remove_vacation,
        schema=vol.Schema(
            {
                vol.Required(ATTR_VACATION_INDEX): cv.positive_int,
            }
        ),
    )
