"""Panel view registration for TimeTable Manager."""
from __future__ import annotations

import logging

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_FILENAME, PANEL_ICON, PANEL_NAME, PANEL_URL

_LOGGER = logging.getLogger(__name__)


async def async_setup_view(hass: HomeAssistant) -> None:
    """Set up the TimeTable Manager panel."""
    # Get version from manifest
    integration = hass.data.get("integrations", {}).get(DOMAIN)
    version = integration.version if integration else "unknown"

    # Register static path for panel JavaScript
    panel_path = hass.config.path(f"custom_components/{DOMAIN}/frontend/{PANEL_FILENAME}")
    static_paths = [
        StaticPathConfig(
            url_path=PANEL_URL,
            path=panel_path,
            cache_headers=True,
        )
    ]

    await hass.http.async_register_static_paths(static_paths)

    # Register the custom panel
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_NAME,
        sidebar_icon=PANEL_ICON,
        frontend_url_path="timetable_manager",
        require_admin=False,
        config={
            "_panel_custom": {
                "name": "timetable-manager-panel",
                "module_url": f"{PANEL_URL}?v={version}",
                "embed_iframe": True,
            },
            "version": version,
        },
    )

    _LOGGER.info("TimeTable Manager panel registered")
