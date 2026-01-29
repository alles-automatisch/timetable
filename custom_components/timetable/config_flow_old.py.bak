"""Config flow for TimeTable integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import DEFAULT_INCLUDE_WEEKENDS, DEFAULT_SCHEDULE_NAME, DOMAIN

_LOGGER = logging.getLogger(__name__)


class TimetableConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Timetable."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        # Check if already configured
        await self.async_set_unique_id("stundenplan")
        self._abort_if_unique_id_configured()

        # If user provided input, create the entry
        if user_input is not None:
            return self.async_create_entry(
                title=user_input.get("name", "TimeTable"),
                data={},
                options=user_input,
            )

        # Show form with default values
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional("name", default="TimeTable"): str,
                    vol.Optional(
                        "include_weekends", default=DEFAULT_INCLUDE_WEEKENDS
                    ): bool,
                }
            ),
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> TimetableOptionsFlow:
        """Get the options flow for this handler."""
        return TimetableOptionsFlow(config_entry)


class TimetableOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Timetable."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Get current values, checking both options and data for backward compatibility
        current_name = (
            self.config_entry.options.get("name")
            or self.config_entry.data.get("name")
            or DEFAULT_SCHEDULE_NAME
        )
        current_include_weekends = (
            self.config_entry.options.get("include_weekends")
            if "include_weekends" in self.config_entry.options
            else self.config_entry.data.get(
                "include_weekends", DEFAULT_INCLUDE_WEEKENDS
            )
        )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "name",
                        default=current_name,
                    ): str,
                    vol.Optional(
                        "include_weekends",
                        default=current_include_weekends,
                    ): bool,
                }
            ),
        )
