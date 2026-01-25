# 🚀 Deployment Checklist

Use this checklist when publishing TimeTable to GitHub and HACS.

## Pre-Deployment Checklist

### Code Quality
- [ ] All Python files follow PEP 8
- [ ] Type hints are present
- [ ] Docstrings are complete
- [ ] No console.log statements in production JS
- [ ] Error handling is comprehensive

### Testing
- [ ] Test installation on fresh HA instance
- [ ] Test config flow setup
- [ ] Test all 5 services
- [ ] Test card in light theme
- [ ] Test card in dark theme
- [ ] Test on mobile device
- [ ] Test on desktop browser
- [ ] Verify no browser console errors
- [ ] Test with sample schedule data

### Documentation
- [ ] README.md is complete
- [ ] QUICKSTART.md is accurate
- [ ] example_schedule.yaml works
- [ ] CHANGELOG.md is updated
- [ ] Version number is consistent across files

### Files & Configuration
- [ ] manifest.json version is correct
- [ ] hacs.json is properly configured
- [ ] All translations are complete
- [ ] LICENSE file is present
- [ ] .gitignore is configured

## GitHub Setup

### Repository Creation
- [ ] Create repository: `https://github.com/alles-automatisch/timetable`
- [ ] Add description: "Smart school schedule integration for Home Assistant"
- [ ] Add topics: `home-assistant`, `hacs`, `school`, `timetable`, `schedule`, `education`
- [ ] Set repository to Public

### Initial Commit
```bash
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial release v1.0.0"

# Set main branch
git branch -M main

# Add remote
git remote add origin https://github.com/alles-automatisch/timetable.git

# Push
git push -u origin main
```

### Create Release
- [ ] Go to Releases → Create new release
- [ ] Tag version: `v1.0.0`
- [ ] Release title: `v1.0.0 - Initial Release`
- [ ] Copy release notes from CHANGELOG.md
- [ ] Publish release

### Repository Settings
- [ ] Enable Issues
- [ ] Enable Discussions (optional)
- [ ] Add repository description
- [ ] Add website: `https://alles-automatisch.de`
- [ ] Add topics/tags

## HACS Submission

### Option 1: Custom Repository (Immediate)
Users can add as custom repository:
```
https://github.com/alles-automatisch/timetable
Category: Integration
```

### Option 2: Submit to HACS Default (Optional)
Follow: https://hacs.xyz/docs/publish/start

Requirements:
- [ ] Repository is public
- [ ] Has valid hacs.json
- [ ] Has valid info.md
- [ ] Has at least one release
- [ ] Follows HACS repository structure
- [ ] Documentation is complete

## Post-Deployment

### Verification
- [ ] Install via HACS custom repository
- [ ] Verify integration appears
- [ ] Test complete setup workflow
- [ ] Verify card loads properly
- [ ] Check for any errors in HA logs

### Community Sharing
- [ ] Post on Home Assistant Community forum
- [ ] Share on r/homeassistant
- [ ] Tweet/share on social media
- [ ] Add to alles-automatisch.de blog

### Monitoring
- [ ] Watch for GitHub issues
- [ ] Monitor community feedback
- [ ] Track installation metrics (if available)
- [ ] Respond to questions

## Version Update Checklist (Future Releases)

When releasing a new version:

1. **Update Version Numbers**
   - [ ] `manifest.json` → version
   - [ ] `www/stundenplan-card.js` → console.info version
   - [ ] `CHANGELOG.md` → add new version section

2. **Update Documentation**
   - [ ] CHANGELOG.md with changes
   - [ ] README.md if needed
   - [ ] example_schedule.yaml if needed

3. **Test Everything**
   - [ ] Fresh install test
   - [ ] Upgrade test from previous version
   - [ ] All features working

4. **Git Workflow**
   ```bash
   git add .
   git commit -m "Release v1.x.x"
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin main
   git push origin v1.x.x
   ```

5. **GitHub Release**
   - [ ] Create new release with tag
   - [ ] Add release notes
   - [ ] Publish

## Marketing Checklist

### Content to Create
- [ ] Blog post on alles-automatisch.de
- [ ] Installation video/gif
- [ ] Screenshots for README
- [ ] Tutorial video (optional)

### Platforms to Share
- [ ] Home Assistant Community
- [ ] Reddit r/homeassistant
- [ ] Twitter/X
- [ ] Facebook HA groups
- [ ] Discord servers
- [ ] alles-automatisch.de newsletter

### SEO & Discoverability
- [ ] Add to Home Assistant integration list (wiki)
- [ ] Add to SmartHome Finder
- [ ] Register on HA addon/integration directories

## Support Preparation

### Documentation
- [ ] FAQ section in README
- [ ] Common issues troubleshooting
- [ ] Example automations

### Issue Templates
- [ ] Bug report template ✅ (already created)
- [ ] Feature request template ✅ (already created)
- [ ] Question template (optional)

### Support Channels
- [ ] Monitor GitHub issues daily
- [ ] Set up GitHub notifications
- [ ] Prepare standard responses
- [ ] Consider Discord/community channel

## Maintenance Plan

### Regular Tasks
- [ ] Weekly: Check for new issues
- [ ] Monthly: Review HA compatibility
- [ ] Quarterly: Update dependencies
- [ ] Yearly: Major feature review

### Monitoring
- [ ] Watch HA breaking changes
- [ ] Track HACS updates
- [ ] Monitor user feedback
- [ ] Check for security issues

---

## Quick Deploy Commands

For quick reference:

```bash
# Full deployment
git init
git add .
git commit -m "Initial release v1.0.0"
git branch -M main
git remote add origin https://github.com/alles-automatisch/timetable.git
git push -u origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Then create release on GitHub UI
```

---

**Ready to deploy? Good luck! 🚀**
