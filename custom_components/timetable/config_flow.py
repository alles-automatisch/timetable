"""Config flow for TimeTable integration."""
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
                    "name": user_input.get("name", "My Timetable"),
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
        self._editing_lesson_index = None

    def _get_lessons(self) -> dict:
        """Get current lessons."""
        return self.config_entry.options.get("lessons", {}) if self.config_entry.options else {}

    def _get_vacations(self) -> list:
        """Get current vacations."""
        return self.config_entry.options.get("vacations", []) if self.config_entry.options else []

    def _format_lesson(self, lesson: dict) -> str:
        """Format lesson for display."""
        subject = lesson.get("subject", "")
        start = lesson.get("start_time", "")
        end = lesson.get("end_time", "")
        room = lesson.get("room", "")
        room_str = f" ({room})" if room else ""
        return f"{start}-{end}: {subject}{room_str}"

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Main menu with overview."""
        lessons = self._get_lessons()
        vacations = self._get_vacations()

        total_lessons = sum(len(day_lessons) for day_lessons in lessons.values())

        # Create overview description
        description = "## 📚 Lesson Overview\n\n"
        if total_lessons == 0:
            description += "No lessons configured yet.\n"
        else:
            day_names = {
                "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday",
                "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday"
            }
            for day_key, day_name in day_names.items():
                if day_key in lessons and lessons[day_key]:
                    description += f"\n**{day_name}:** {len(lessons[day_key])} lesson(s)\n"

        if vacations:
            description += f"\n\n🌴 **Vacations:** {len(vacations)} period(s)"

        if user_input is not None:
            action = user_input.get("action")
            if action == "manage_lessons":
                return await self.async_step_manage_lessons()
            elif action == "manage_vacations":
                return await self.async_step_manage_vacations()
            elif action == "settings":
                return await self.async_step_settings()

        return self.async_show_form(
            step_id="init",
            description_placeholders={"overview": description},
            data_schema=vol.Schema(
                {
                    vol.Required("action"): vol.In(
                        {
                            "manage_lessons": f"📚 Manage Lessons ({total_lessons} total)",
                            "manage_vacations": f"🌴 Manage Vacations ({len(vacations)} total)",
                            "settings": "⚙️ Settings",
                        }
                    ),
                }
            ),
        )

    async def async_step_manage_lessons(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage lessons - select day."""
        if user_input is not None:
            self._editing_day = user_input.get("day")
            return await self.async_step_day_lessons()

        lessons = self._get_lessons()
        day_names = {
            "monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday",
            "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday", "sunday": "Sunday"
        }

        # Add lesson count to each day
        day_options = {}
        for day_key, day_name in day_names.items():
            count = len(lessons.get(day_key, []))
            day_options[day_key] = f"{day_name} ({count} lessons)"

        return self.async_show_form(
            step_id="manage_lessons",
            data_schema=vol.Schema(
                {
                    vol.Required("day"): vol.In(day_options),
                }
            ),
        )

    async def async_step_day_lessons(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show lessons for selected day."""
        if user_input is not None:
            action = user_input.get("action")
            if action == "add":
                return await self.async_step_add_lesson()
            elif action == "back":
                return await self.async_step_init()
            elif action.startswith("edit_"):
                self._editing_lesson_index = int(action.split("_")[1])
                return await self.async_step_edit_lesson()

        lessons = self._get_lessons()
        day_lessons = lessons.get(self._editing_day, [])

        day_name = self._editing_day.capitalize()

        # Build action menu
        actions = {"add": f"➕ Add New Lesson"}

        if day_lessons:
            for idx, lesson in enumerate(day_lessons):
                actions[f"edit_{idx}"] = f"✏️ {self._format_lesson(lesson)}"

        actions["back"] = "⬅️ Back"

        return self.async_show_form(
            step_id="day_lessons",
            description_placeholders={"day": day_name},
            data_schema=vol.Schema(
                {
                    vol.Required("action"): vol.In(actions),
                }
            ),
        )

    async def async_step_add_lesson(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Add a new lesson."""
        errors = {}

        if user_input is not None:
            start_time = user_input.get("start_time", "")
            end_time = user_input.get("end_time", "")

            if start_time and end_time and start_time >= end_time:
                errors["end_time"] = "end_before_start"

            if not errors:
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

    async def async_step_edit_lesson(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Edit or delete existing lesson."""
        lessons = self._get_lessons()
        day_lessons = lessons.get(self._editing_day, [])

        if self._editing_lesson_index >= len(day_lessons):
            return await self.async_step_day_lessons()

        current_lesson = day_lessons[self._editing_lesson_index]
        errors = {}

        if user_input is not None:
            if user_input.get("delete", False):
                # Delete lesson
                options = dict(self.config_entry.options)
                options["lessons"][self._editing_day].pop(self._editing_lesson_index)
                return self.async_create_entry(title="", data=options)

            # Update lesson
            start_time = user_input.get("start_time", "")
            end_time = user_input.get("end_time", "")

            if start_time and end_time and start_time >= end_time:
                errors["end_time"] = "end_before_start"

            if not errors:
                options = dict(self.config_entry.options)

                updated_lesson = {
                    "subject": user_input.get("subject", ""),
                    "start_time": start_time,
                    "end_time": end_time,
                    "room": user_input.get("room", ""),
                    "teacher": user_input.get("teacher", ""),
                    "notes": user_input.get("notes", ""),
                    "color": user_input.get("color", "#2196F3"),
                    "icon": "mdi:book-open-variant",
                }

                options["lessons"][self._editing_day][self._editing_lesson_index] = updated_lesson
                options["lessons"][self._editing_day].sort(key=lambda x: x["start_time"])

                return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="edit_lesson",
            data_schema=vol.Schema(
                {
                    vol.Required("subject", default=current_lesson.get("subject", "")): str,
                    vol.Required("start_time", default=current_lesson.get("start_time", "08:00")): str,
                    vol.Required("end_time", default=current_lesson.get("end_time", "08:45")): str,
                    vol.Optional("room", default=current_lesson.get("room", "")): str,
                    vol.Optional("teacher", default=current_lesson.get("teacher", "")): str,
                    vol.Optional("notes", default=current_lesson.get("notes", "")): str,
                    vol.Optional("color", default=current_lesson.get("color", "#2196F3")): str,
                    vol.Optional("delete", default=False): bool,
                }
            ),
            errors=errors,
        )

    async def async_step_manage_vacations(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage vacation periods."""
        vacations = self._get_vacations()

        if user_input is not None:
            action = user_input.get("action")
            if action == "add":
                return await self.async_step_add_vacation()
            elif action == "back":
                return await self.async_step_init()
            elif action.startswith("delete_"):
                idx = int(action.split("_")[1])
                options = dict(self.config_entry.options)
                options["vacations"].pop(idx)
                return self.async_create_entry(title="", data=options)

        actions = {"add": "➕ Add Vacation Period"}

        for idx, vacation in enumerate(vacations):
            label = vacation.get("label", "Vacation")
            start = vacation.get("start_date", "")
            end = vacation.get("end_date", "")
            actions[f"delete_{idx}"] = f"🗑️ {label} ({start} to {end})"

        actions["back"] = "⬅️ Back"

        return self.async_show_form(
            step_id="manage_vacations",
            data_schema=vol.Schema(
                {
                    vol.Required("action"): vol.In(actions),
                }
            ),
        )

    async def async_step_add_vacation(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Add vacation period."""
        errors = {}

        if user_input is not None:
            start_date = user_input.get("start_date", "")
            end_date = user_input.get("end_date", "")

            if start_date and end_date and start_date > end_date:
                errors["end_date"] = "end_before_start"

            if not errors:
                options = dict(self.config_entry.options) if self.config_entry.options else {
                    "name": "TimeTable",
                    "include_weekends": False,
                    "lessons": {},
                    "vacations": [],
                }

                if "vacations" not in options:
                    options["vacations"] = []

                vacation = {
                    "label": user_input.get("label", "Vacation"),
                    "start_date": start_date,
                    "end_date": end_date,
                }

                options["vacations"].append(vacation)
                return self.async_create_entry(title="", data=options)

        return self.async_show_form(
            step_id="add_vacation",
            data_schema=vol.Schema(
                {
                    vol.Required("label", default="Summer Vacation"): str,
                    vol.Required("start_date"): str,
                    vol.Required("end_date"): str,
                }
            ),
            errors=errors,
        )

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Change settings."""
        if user_input is not None:
            options = dict(self.config_entry.options) if self.config_entry.options else {
                "lessons": {},
                "vacations": [],
            }
            options["name"] = user_input.get("name", "TimeTable")
            options["include_weekends"] = user_input.get("include_weekends", False)
            return self.async_create_entry(title="", data=options)

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
