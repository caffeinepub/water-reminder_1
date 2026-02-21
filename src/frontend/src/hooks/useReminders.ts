import { useEffect, useRef } from 'react';
import { useRemindersData, useNightMode, useWaterData, useSetGoal } from './useQueries';

export function useReminders() {
  const { data: reminders } = useRemindersData();
  const { data: nightMode } = useNightMode();
  const { data: waterData } = useWaterData();
  const setGoalMutation = useSetGoal();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/assets/sounds/reminder.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const playReminderSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error);
      });
    }
  };

  // Custom reminders (existing functionality)
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!reminders || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check if we're in night mode
      if (nightMode?.enabled && nightMode.muteReminders) {
        const startTime = Number(nightMode.startTime);
        const endTime = Number(nightMode.endTime);
        
        // Handle night mode spanning midnight
        const isInNightMode = startTime > endTime
          ? currentMinutes >= startTime || currentMinutes < endTime
          : currentMinutes >= startTime && currentMinutes < endTime;

        if (isInNightMode) {
          return; // Skip reminders during night mode
        }
      }

      reminders.forEach((reminder) => {
        if (!reminder.enabled) return;

        const reminderTime = Number(reminder.time);
        
        // Convert Sunday (0) to index 6, and shift others down
        const dayIndex = currentDay === 0 ? 6 : currentDay - 1;
        
        // Check if reminder is set for today
        if (!reminder.daysOfWeek[dayIndex]) return;

        // Check if it's time for this reminder (within 1 minute window)
        if (Math.abs(currentMinutes - reminderTime) <= 1) {
          // Check if we already showed this reminder in the last 2 minutes
          const lastShown = localStorage.getItem(`reminder-${reminder.id}-last-shown`);
          const now = Date.now();
          
          if (lastShown && now - parseInt(lastShown) < 120000) {
            return; // Already shown recently
          }

          // Show notification
          if (Notification.permission === 'granted') {
            const notification = new Notification('💧 Time to Hydrate!', {
              body: 'Remember to drink water and stay hydrated.',
              icon: '/assets/generated/water-drop-icon.dim_128x128.png',
              badge: '/assets/generated/water-drop-icon.dim_128x128.png',
              silent: !reminder.sound,
              tag: `reminder-${reminder.id}`,
            });

            // Play sound if enabled
            if (reminder.sound) {
              playReminderSound();
            }

            // Vibrate if enabled and supported
            if (reminder.vibration && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }

          // Store last shown time
          localStorage.setItem(`reminder-${reminder.id}-last-shown`, now.toString());
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Check immediately
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders, nightMode]);

  // Automatic hourly reminders with goal calculation
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!waterData) return;

    const checkHourlyReminder = () => {
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const currentTimeMinutes = now.getHours() * 60 + currentMinutes;

      const wakeUpTime = Number(waterData.wakeUpTime);
      const sleepTime = Number(waterData.sleepTime);

      // Check if we're within wake/sleep window
      const isAwake = wakeUpTime < sleepTime
        ? currentTimeMinutes >= wakeUpTime && currentTimeMinutes < sleepTime
        : currentTimeMinutes >= wakeUpTime || currentTimeMinutes < sleepTime;

      if (!isAwake) {
        return; // Skip reminders outside wake hours
      }

      // Check if we're in night mode (additional check)
      if (nightMode?.enabled && nightMode.muteReminders) {
        const startTime = Number(nightMode.startTime);
        const endTime = Number(nightMode.endTime);
        
        // Handle night mode spanning midnight
        const isInNightMode = startTime > endTime
          ? currentTimeMinutes >= startTime || currentTimeMinutes < endTime
          : currentTimeMinutes >= startTime && currentTimeMinutes < endTime;

        if (isInNightMode) {
          return; // Skip hourly reminder during night mode
        }
      }

      // Trigger at the top of every hour (0 minutes)
      if (currentMinutes === 0) {
        // Check if we already showed the hourly reminder in the last 55 minutes
        const lastShown = localStorage.getItem('hourly-reminder-last-shown');
        const nowTimestamp = Date.now();
        
        if (lastShown && nowTimestamp - parseInt(lastShown) < 55 * 60 * 1000) {
          return; // Already shown recently
        }

        // Calculate remaining hours until sleep time
        let remainingHours = 0;
        if (wakeUpTime < sleepTime) {
          remainingHours = Math.floor((sleepTime - currentTimeMinutes) / 60);
        } else {
          // Sleep time crosses midnight
          if (currentTimeMinutes >= wakeUpTime) {
            remainingHours = Math.floor((1440 - currentTimeMinutes + sleepTime) / 60);
          } else {
            remainingHours = Math.floor((sleepTime - currentTimeMinutes) / 60);
          }
        }

        // Calculate and update goal based on remaining hours
        if (remainingHours > 0) {
          const currentGoal = Number(waterData.dailyGoal);
          const currentIntake = Number(waterData.currentCount || 0);
          const remaining = Math.max(currentGoal - currentIntake, 0);
          
          // Calculate suggested intake per remaining hour (minimum 200ml per hour)
          const suggestedPerHour = Math.max(Math.ceil(remaining / remainingHours), 200);
          const newGoal = currentIntake + (suggestedPerHour * remainingHours);
          
          // Update goal if it's different
          if (newGoal !== currentGoal && newGoal > currentGoal) {
            setGoalMutation.mutate(BigInt(newGoal));
          }
        }

        // Show notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('💧 Hourly Hydration Reminder', {
            body: `Time to drink water! ${remainingHours} hours until bedtime.`,
            icon: '/assets/generated/water-drop-icon.dim_128x128.png',
            badge: '/assets/generated/water-drop-icon.dim_128x128.png',
            tag: 'hourly-water-reminder',
          });

          // Play reminder sound
          playReminderSound();

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }

        // Store last shown time
        localStorage.setItem('hourly-reminder-last-shown', nowTimestamp.toString());
      }
    };

    // Check every minute
    const hourlyInterval = setInterval(checkHourlyReminder, 60000);
    
    // Check immediately
    checkHourlyReminder();

    return () => clearInterval(hourlyInterval);
  }, [nightMode, waterData, setGoalMutation]);
}

// Legacy hook for backward compatibility (not used in new implementation)
export function useReminderSettings() {
  return {
    enabled: false,
    interval: 2,
    setEnabled: () => {},
    setInterval: () => {},
  };
}
