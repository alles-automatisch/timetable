"""Config flow for TimeTable integration with beautiful frontend UI."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector

from .const import (
    DEFAULT_INCLUDE_WEEKENDS,
    DOMAIN,
    WEEKDAYS,
)

_LOGGER = logging.getLogger(__name__)

# Default colors for subjects
SUBJECT_COLORS = {
    "Mathematics": "#FF5722",
    "English": "#2196F3",
    "Science": "#4CAF50",
    "History": "#FFC107",
    "Geography": "#00BCD4",
    "Physics": "#9C27B0",
    "Chemistry": "#E91E63",
    "Biology": "#8BC34A",
    "Physical Education": "#FF9800",
    "Art": "#F44336",
    "Music": "#3F51B5",
    "Computer Science": "#607D8B",
}

DAY_NAMES = {
    "monday": "Monday",
    "tuesday": "Tuesday",
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday",
}


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
            # Initialize with empty schedule
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

        # Show welcome form
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
    """Handle options flow for TimeTable with beautiful UI."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry
        self._editing_day = None
        self._editing_lesson_index = None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Main menu for configuration."""
        lessons = self.config_entry.options.get("lessons", {})
        total_lessons = sum(len(day_lessons) for day_lessons in lessons.values())
        vacation_count = len(self.config_entry.options.get("vacations", []))

        return self.async_show_menu(
            step_id="init",
            menu_options=["lessons", "vacations", "settings"],
            description_placeholders={
                "lesson_count": str(total_lessons),
                "vacation_count": str(vacation_count),
            },
        )

    async def async_step_lessons(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show lesson management options."""
        return self.async_show_menu(
            step_id="lessons",
            menu_options=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        )

    async def async_step_monday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Monday lessons."""
        self._editing_day = "monday"
        return await self._show_day_menu()

    async def async_step_tuesday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Tuesday lessons."""
        self._editing_day = "tuesday"
        return await self._show_day_menu()

    async def async_step_wednesday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Wednesday lessons."""
        self._editing_day = "wednesday"
        return await self._show_day_menu()

    async def async_step_thursday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Thursday lessons."""
        self._editing_day = "thursday"
        return await self._show_day_menu()

    async def async_step_friday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Friday lessons."""
        self._editing_day = "friday"
        return await self._show_day_menu()

    async def async_step_saturday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Saturday lessons."""
        self._editing_day = "saturday"
        return await self._show_day_menu()

    async def async_step_sunday(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Manage Sunday lessons."""
        self._editing_day = "sunday"
        return await self._show_day_menu()

    async def _show_day_menu(self) -> FlowResult:
        """Show menu for a specific day."""
        lessons = self.config_entry.options.get("lessons", {}).get(self._editing_day, [])

        menu_options = ["add_lesson"]

        if lessons:
            menu_options.extend([f"lesson_{i}" for i in range(len(lessons))])

        return self.async_show_menu(
            step_id=self._editing_day,
            menu_options=menu_options,
        )

    async def async_step_add_lesson(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Add a new lesson."""
        errors = {}

        if user_input is not None:
            start_time = user_input.get("start_time")
            end_time = user_input.get("end_time")

            if start_time and end_time and start_time >= end_time:
                errors["end_time"] = "End time must be after start time"

            if not errors:
                # Get current lessons
                options = dict(self.config_entry.options)
                if "lessons" not in options:
                    options["lessons"] = {}
                if self._editing_day not in options["lessons"]:
                    options["lessons"][self._editing_day] = []

                # Get color
                subject = user_input.get("subject", "")
                color = user_input.get("color") or SUBJECT_COLORS.get(subject, "#2196F3")

                # Add lesson
                lesson = {
                    "subject": user_input.get("subject"),
                    "start_time": start_time,
                    "end_time": end_time,
                    "room": user_input.get("room", ""),
                    "teacher": user_input.get("teacher", ""),
                    "notes": user_input.get("notes", ""),
                    "color": color,
                    "icon": user_input.get("icon", "mdi:book-open-variant"),
                }

                options["lessons"][self._editing_day].append(lesson)
                options["lessons"][self._editing_day].sort(key=lambda x: x["start_time"])

                return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="add_lesson",
            data_schema=vol.Schema(
                {
                    vol.Required("subject"): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=list(SUBJECT_COLORS.keys()),
                            mode=selector.SelectSelectorMode.DROPDOWN,
                            custom_value=True,
                        )
                    ),
                    vol.Required("start_time", default="08:00"): selector.TimeSelector(),
                    vol.Required("end_time", default="08:45"): selector.TimeSelector(),
                    vol.Optional("room"): str,
                    vol.Optional("teacher"): str,
                    vol.Optional("notes"): selector.TextSelector(
                        selector.TextSelectorConfig(multiline=True)
                    ),
                    vol.Optional("color"): selector.ColorRGBSelector(),
                    vol.Optional("icon", default="mdi:book-open-variant"): selector.IconSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_vacations(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage vacations."""
        vacations = self.config_entry.options.get("vacations", [])

        menu_options = ["add_vacation"]

        if vacations:
            menu_options.extend([f"vacation_{i}" for i in range(len(vacations))])

        return self.async_show_menu(
            step_id="vacations",
            menu_options=menu_options,
        )

    async def async_step_add_vacation(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Add a vacation period."""
        errors = {}

        if user_input is not None:
            start = user_input.get("start_date")
            end = user_input.get("end_date")

            if start and end and start > end:
                errors["end_date"] = "End date must be after start date"

            if not errors:
                options = dict(self.config_entry.options)
                if "vacations" not in options:
                    options["vacations"] = []

                options["vacations"].append({
                    "label": user_input.get("label"),
                    "start_date": start,
                    "end_date": end,
                })

                options["vacations"].sort(key=lambda x: x["start_date"])

                return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="add_vacation",
            data_schema=vol.Schema(
                {
                    vol.Required("label", default="Summer Vacation"): str,
                    vol.Required("start_date"): selector.DateSelector(),
                    vol.Required("end_date"): selector.DateSelector(),
                }
            ),
            errors=errors,
        )

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage settings."""
        if user_input is not None:
            options = dict(self.config_entry.options)
            options["name"] = user_input.get("name", "TimeTable")
            options["include_weekends"] = user_input.get("include_weekends", False)
            return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="settings",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "name",
                        default=self.config_entry.options.get("name", "TimeTable"),
                    ): str,
                    vol.Required(
                        "include_weekends",
                        default=self.config_entry.options.get("include_weekends", False),
                    ): bool,
                }
            ),
        )
