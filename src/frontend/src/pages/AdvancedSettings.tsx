import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SlidersHorizontal, Moon, Volume2, Bell, Clock } from 'lucide-react';
import { useNightMode, useSetNightMode, useAdvancedSettings, useSetAdvancedSettings, useUpdateSleepWakeTimes } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function AdvancedSettings() {
  const { theme } = useTheme();
  const { data: nightMode } = useNightMode();
  const { data: advancedSettings } = useAdvancedSettings();
  const setNightModeMutation = useSetNightMode();
  const setAdvancedSettingsMutation = useSetAdvancedSettings();
  const updateSleepWakeTimesMutation = useUpdateSleepWakeTimes();

  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [muteReminders, setMuteReminders] = useState(true);
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  const [reminderSound, setReminderSound] = useState('default');
  const [reminderMode, setReminderMode] = useState('manual');
  const [missedAlerts, setMissedAlerts] = useState(true);
  const [units, setUnits] = useState('ml/kg');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (nightMode) {
      setNightModeEnabled(nightMode.enabled);
      setMuteReminders(nightMode.muteReminders);
      const sleepHours = Math.floor(Number(nightMode.startTime) / 60);
      const sleepMins = Number(nightMode.startTime) % 60;
      setSleepTime(`${sleepHours.toString().padStart(2, '0')}:${sleepMins.toString().padStart(2, '0')}`);
      const wakeHours = Math.floor(Number(nightMode.endTime) / 60);
      const wakeMins = Number(nightMode.endTime) % 60;
      setWakeTime(`${wakeHours.toString().padStart(2, '0')}:${wakeMins.toString().padStart(2, '0')}`);
    }
  }, [nightMode]);

  useEffect(() => {
    if (advancedSettings) {
      setReminderSound(advancedSettings.reminderSound);
      setReminderMode(advancedSettings.reminderMode);
      setMissedAlerts(advancedSettings.missedReminderAlerts);
      setUnits(advancedSettings.units);
      setLanguage(advancedSettings.language);
    }
  }, [advancedSettings]);

  const handleSaveNightMode = () => {
    const [sleepHours, sleepMins] = sleepTime.split(':').map(Number);
    const [wakeHours, wakeMins] = wakeTime.split(':').map(Number);
    const startTime = BigInt(sleepHours * 60 + sleepMins);
    const endTime = BigInt(wakeHours * 60 + wakeMins);

    setNightModeMutation.mutate(
      {
        enabled: nightModeEnabled,
        startTime,
        endTime,
        muteReminders,
      },
      {
        onSuccess: () => {
          toast.success('Night mode settings saved!');
        },
      }
    );
  };

  const handleSaveWakeSleepTimes = () => {
    const [sleepHours, sleepMins] = sleepTime.split(':').map(Number);
    const [wakeHours, wakeMins] = wakeTime.split(':').map(Number);
    const sleepTimeMinutes = BigInt(sleepHours * 60 + sleepMins);
    const wakeTimeMinutes = BigInt(wakeHours * 60 + wakeMins);

    updateSleepWakeTimesMutation.mutate(
      {
        wakeUpTime: wakeTimeMinutes,
        sleepTime: sleepTimeMinutes,
      },
      {
        onSuccess: () => {
          toast.success('Wake/Sleep times updated!');
        },
      }
    );
  };

  const handleSaveAdvancedSettings = () => {
    const [sleepHours, sleepMins] = sleepTime.split(':').map(Number);
    const [wakeHours, wakeMins] = wakeTime.split(':').map(Number);
    const sleepTimeMinutes = BigInt(sleepHours * 60 + sleepMins);
    const wakeTimeMinutes = BigInt(wakeHours * 60 + wakeMins);

    setAdvancedSettingsMutation.mutate(
      {
        reminderSound,
        reminderMode,
        missedReminderAlerts: missedAlerts,
        units,
        themeMode: theme || 'system',
        language,
        wakeUpTime: wakeTimeMinutes,
        sleepTime: sleepTimeMinutes,
      },
      {
        onSuccess: () => {
          toast.success('Advanced settings saved!');
        },
      }
    );
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Wake/Sleep Schedule */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Wake & Sleep Schedule
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set your daily wake-up and sleep times for smart reminders
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wake Up Time</Label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-[20px] border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Sleep Time</Label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-[20px] border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveWakeSleepTimes}
              disabled={updateSleepWakeTimesMutation.isPending}
              className="w-full btn-primary rounded-[20px]"
            >
              {updateSleepWakeTimesMutation.isPending ? 'Saving...' : 'Save Schedule'}
            </Button>
          </CardContent>
        </Card>

        {/* Night Mode */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-6 h-6 text-primary" />
              Night Mode
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Automatically mute reminders during sleep hours
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Night Mode</Label>
              <Switch checked={nightModeEnabled} onCheckedChange={setNightModeEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mute Reminders</Label>
              <Switch checked={muteReminders} onCheckedChange={setMuteReminders} />
            </div>
            <Button
              onClick={handleSaveNightMode}
              disabled={setNightModeMutation.isPending}
              className="w-full btn-primary rounded-[20px]"
            >
              {setNightModeMutation.isPending ? 'Saving...' : 'Save Night Mode'}
            </Button>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Reminder Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reminder Sound</Label>
              <Select value={reminderSound} onValueChange={setReminderSound}>
                <SelectTrigger className="rounded-[20px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="gentle">Gentle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reminder Mode</Label>
              <Select value={reminderMode} onValueChange={setReminderMode}>
                <SelectTrigger className="rounded-[20px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto-1h">Auto (Every 1 hour)</SelectItem>
                  <SelectItem value="auto-2h">Auto (Every 2 hours)</SelectItem>
                  <SelectItem value="auto-3h">Auto (Every 3 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Missed Reminder Alerts</Label>
              <Switch checked={missedAlerts} onCheckedChange={setMissedAlerts} />
            </div>

            <Button
              onClick={handleSaveAdvancedSettings}
              disabled={setAdvancedSettingsMutation.isPending}
              className="w-full btn-primary rounded-[20px]"
            >
              {setAdvancedSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Units & Language */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Units</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger className="rounded-[20px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml/kg">ml/kg</SelectItem>
                  <SelectItem value="oz/lb">oz/lb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-[20px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
