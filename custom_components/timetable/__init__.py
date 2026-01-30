"""The TimeTable integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import TimetableCoordinator
from .view import async_setup_view

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "binary_sensor"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the TimeTable component (YAML not supported)."""
    # Register the TimeTable Manager panel
    await async_setup_view(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up TimeTable from a config entry."""
    try:
        hass.data.setdefault(DOMAIN, {})

        # Initialize coordinator with config entry
        _LOGGER.debug("Initializing coordinator for entry %s", entry.entry_id)
        coordinator = TimetableCoordinator(hass, entry)
        await coordinator.async_config_entry_first_refresh()

        # Store coordinator
        hass.data[DOMAIN][entry.entry_id] = {
            "coordinator": coordinator,
        }

        # Set up platforms
        _LOGGER.debug("Setting up platforms for entry %s", entry.entry_id)
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

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
