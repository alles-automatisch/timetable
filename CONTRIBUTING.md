# Contributing to TimeTable

Thank you for your interest in contributing to TimeTable! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Home Assistant version
- TimeTable version
- Relevant logs (from Settings → System → Logs)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach (if you have ideas)

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

## 📋 Development Guidelines

### Code Style

#### Python (Backend)
- Follow PEP 8
- Use type hints
- Add docstrings to all functions/classes
- Keep functions focused and small
- Use meaningful variable names
- Maximum line length: 88 characters (Black formatter)

Example:
```python
async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up TimeTable from a config entry."""
    # Implementation
    pass
```

#### JavaScript (Frontend)
- Use ES6+ syntax
- Use const/let (not var)
- Use template literals
- Add comments for complex logic
- Keep functions small and focused
- Use camelCase for variables

Example:
```javascript
renderLesson(lesson) {
  const color = lesson.color || 'var(--primary-color)';
  return `<div class="lesson">${lesson.subject}</div>`;
}
```

### Testing

Before submitting:
- Test on Home Assistant 2024.1.0+
- Test config flow
- Test all services
- Test card in both light and dark themes
- Test on mobile devices
- Check browser console for errors
- Verify no breaking changes

### Git Commit Messages

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add weekly schedule export
fix: correct timezone handling for DST
docs: update installation instructions
style: format code with Black
refactor: simplify coordinator logic
```

## 🏗️ Project Structure

```
custom_components/stundenplan/
├── __init__.py          # Integration setup, service handlers
├── config_flow.py       # Configuration UI
├── const.py            # Constants
├── coordinator.py      # Data update coordinator
├── storage.py          # Data persistence
├── sensor.py           # Sensor entities
├── binary_sensor.py    # Binary sensor entities
└── translations/       # Language files

www/
└── stundenplan-card.js  # Lovelace card + editor
```

## 🔧 Development Setup

### Prerequisites
- Home Assistant development environment
- Python 3.11+
- Node.js (for JavaScript linting, optional)
- Git

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/timetable.git
   cd timetable
   ```

2. **Link to Home Assistant**
   ```bash
   # Create symlink to your HA config
   ln -s $(pwd)/custom_components/stundenplan ~/.homeassistant/custom_components/stundenplan
   ln -s $(pwd)/www/stundenplan-card.js ~/.homeassistant/www/stundenplan-card.js
   ```

3. **Make changes**

4. **Restart Home Assistant**

5. **Test changes**

### Debugging

Enable debug logging in `configuration.yaml`:
```yaml
logger:
  default: info
  logs:
    custom_components.stundenplan: debug
```

View logs in Settings → System → Logs

## 🌍 Adding Translations

We welcome translations to new languages!

1. Copy `custom_components/stundenplan/translations/en.json`
2. Rename to your language code (e.g., `fr.json`, `es.json`)
3. Translate all strings
4. Test in Home Assistant
5. Submit PR

Translation files include:
- Setup UI text
- Entity names
- Service descriptions

## 📝 Documentation

When adding features:
- Update README.md
- Update CHANGELOG.md
- Add examples to example_schedule.yaml
- Update service documentation in services.yaml
- Add inline code comments

## 🎨 UI/UX Guidelines

### Card Design
- Follow Material Design principles
- Use Home Assistant CSS variables for theming
- Ensure accessibility (contrast, focus states)
- Support touch interfaces (tap targets ≥44px)
- Responsive design (mobile first)
- Test with browser DevTools

### Colors
Use HA theme colors:
- `var(--primary-color)` - Main accent
- `var(--primary-text-color)` - Main text
- `var(--secondary-text-color)` - Secondary text
- `var(--divider-color)` - Borders/dividers
- `var(--card-background-color)` - Card background

## ✅ Pull Request Checklist

Before submitting PR:
- [ ] Code follows style guidelines
- [ ] All features tested manually
- [ ] No console errors or warnings
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages are clear
- [ ] PR description explains changes
- [ ] No merge conflicts
- [ ] Works on latest HA version

## 📦 Release Process

(For maintainers)

1. Update version in `manifest.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v1.x.x -m "Release v1.x.x"`
4. Push tag: `git push origin v1.x.x`
5. Create GitHub release
6. Update HACS default

## 💬 Communication

- **Issues**: Bug reports and feature requests
- **Discussions**: Questions and ideas
- **Pull Requests**: Code contributions

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution helps make TimeTable better for everyone in the Home Assistant community!

---

**Questions?** Open an issue or discussion on GitHub.
