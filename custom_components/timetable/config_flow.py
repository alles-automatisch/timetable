"""Config flow for TimeTable integration - Simple working version."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class TimetableConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for TimeTable."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        # Check if already configured
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(
                title=user_input.get("name", "TimeTable"),
                data={},
                options={
                    "name": user_input.get("name", "TimeTable"),
                    "include_weekends": user_input.get("include_weekends", False),
                    "lessons": {},
                    "vacations": [],
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional("name", default="My Timetable"): str,
                    vol.Optional("include_weekends", default=False): bool,
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
    """Handle options flow for TimeTable."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._editing_day = None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Main menu - just show available actions."""
        if user_input is not None:
            action = user_input.get("action")
            if action == "add_lesson":
                return await self.async_step_select_day()
            elif action == "settings":
                return await self.async_step_settings()

        # Safely get lessons count
        lessons = self.config_entry.options.get("lessons", {}) if self.config_entry.options else {}
        total_lessons = sum(len(day_lessons) for day_lessons in lessons.values())

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required("action"): vol.In(
                        {
                            "add_lesson": f"Add Lesson ({total_lessons} total)",
                            "settings": "Settings",
                        }
                    ),
                }
            ),
        )

    async def async_step_select_day(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Select day for new lesson."""
        if user_input is not None:
            self._editing_day = user_input.get("day")
            return await self.async_step_add_lesson()

        day_names = {
            "monday": "Monday",
            "tuesday": "Tuesday",
            "wednesday": "Wednesday",
            "thursday": "Thursday",
            "friday": "Friday",
            "saturday": "Saturday",
            "sunday": "Sunday",
        }

        return self.async_show_form(
            step_id="select_day",
            data_schema=vol.Schema(
                {
                    vol.Required("day"): vol.In(day_names),
                }
            ),
        )

    async def async_step_add_lesson(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Add a lesson with simple text inputs."""
        errors = {}

        if user_input is not None:
            start_time = user_input.get("start_time", "")
            end_time = user_input.get("end_time", "")

            # Simple validation
            if start_time and end_time and start_time >= end_time:
                errors["end_time"] = "End time must be after start time"

            if not errors:
                # Get current options or initialize if missing
                options = dict(self.config_entry.options) if self.config_entry.options else {
                    "name": "TimeTable",
                    "include_weekends": False,
                    "lessons": {},
                    "vacations": [],
                }

                if "lessons" not in options:
                    options["lessons"] = {}
                if self._editing_day not in options["lessons"]:
                    options["lessons"][self._editing_day] = []

                lesson = {
                    "subject": user_input.get("subject", ""),
                    "start_time": start_time,
                    "end_time": end_time,
                    "room": user_input.get("room", ""),
                    "teacher": user_input.get("teacher", ""),
                    "notes": user_input.get("notes", ""),
                    "color": user_input.get("color", "#2196F3"),
                    "icon": "mdi:book-open-variant",
                }

                options["lessons"][self._editing_day].append(lesson)
                options["lessons"][self._editing_day].sort(key=lambda x: x["start_time"])

                return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="add_lesson",
            data_schema=vol.Schema(
                {
                    vol.Required("subject"): str,
                    vol.Required("start_time", default="08:00"): str,
                    vol.Required("end_time", default="08:45"): str,
                    vol.Optional("room"): str,
                    vol.Optional("teacher"): str,
                    vol.Optional("notes"): str,
                    vol.Optional("color", default="#2196F3"): str,
                }
            ),
            errors=errors,
        )

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Change settings."""
        if user_input is not None:
            # Get current options or initialize
            options = dict(self.config_entry.options) if self.config_entry.options else {
                "lessons": {},
                "vacations": [],
            }
            options["name"] = user_input.get("name", "TimeTable")
            options["include_weekends"] = user_input.get("include_weekends", False)
            return self.async_create_entry(title="", data=options)

        # Safely get current values
        current_name = "TimeTable"
        current_weekends = False
        if self.config_entry.options:
            current_name = self.config_entry.options.get("name", "TimeTable")
            current_weekends = self.config_entry.options.get("include_weekends", False)

        return self.async_show_form(
            step_id="settings",
            data_schema=vol.Schema(
                {
                    vol.Required("name", default=current_name): str,
                    vol.Required("include_weekends", default=current_weekends): bool,
                }
            ),
        )
