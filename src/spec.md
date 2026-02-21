# Specification

## Summary
**Goal:** Build a comprehensive offline water reminder app with tracking, reminders, reports, and health benefits screens.

**Planned changes:**
- Implement Home screen with animated water glass visualization, daily intake display (ml and percentage), and quick action buttons for preset drink sizes (250ml, 500ml, 750ml)
- Create smart reminders system with custom time picker (AM/PM), configurable auto-reminders at intervals, wake-up/sleep schedule, and night mode to mute reminders during sleep hours
- Add reminder popup UI showing list of all configured reminders with individual enable/disable toggles and link to detailed settings
- Build Drink Log screen displaying timeline of daily water intake history with timestamps and amounts
- Create Reports screen with daily, weekly, and monthly statistics including visual graphs and progress bars
- Design Health Benefits screen showcasing five key benefits (better digestion, improved concentration, strong immune system, better skin, more energy) with icons and progress indicators
- Implement Settings screen for daily water target adjustment, global reminder controls, sound selection, Light/Dark theme toggle, and unit switching (ml/oz)
- Add side drawer navigation menu with links to Home, Drink Log, Reports, Reminders, and Settings with active route highlighting
- Apply blue gradient theme (#42A5F5 to #1565C0) with glassmorphism effects, rounded corners (20dp), smooth shadows (6dp), and modern card-based layouts supporting both Light and Dark modes
- Add smooth animations for page transitions, button interactions, drawer opening/closing, and water level filling
- Remove all external branding (Caffeine AI references)
- Ensure complete offline functionality with local storage only, no login/authentication system

**User-visible outcome:** Users can track daily water intake with an animated glass visualization, receive customizable reminders that respect sleep schedules, view drinking history and statistics, learn about hydration benefits, and customize their experience—all working completely offline without any login.
