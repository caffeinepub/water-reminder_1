import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Target } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { useWaterData, useSetGoal } from '../hooks/useQueries';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { data: waterData } = useWaterData();
  const setGoalMutation = useSetGoal();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [units, setUnits] = useState('ml');
  const [dailyGoalInput, setDailyGoalInput] = useState('');
  
  const dailyGoal = waterData ? Number(waterData.dailyGoal) : 0;

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotificationsEnabled(settings.notificationsEnabled ?? false);
      setUnits(settings.units ?? 'ml');
    }
  }, []);
  
  const saveSettings = () => {
    const settings = {
      notificationsEnabled,
      units,
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };
  
  useEffect(() => {
    saveSettings();
  }, [notificationsEnabled, units]);
  
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled');
      } else {
        setNotificationsEnabled(false);
        toast.error('Notification permission denied');
      }
    } else {
      toast.error('Notifications not supported in this browser');
    }
  };

  const handleUpdateGoal = () => {
    const goal = parseInt(dailyGoalInput);
    if (isNaN(goal) || goal <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    setGoalMutation.mutate(BigInt(goal), {
      onSuccess: () => {
        setDailyGoalInput('');
        toast.success('Daily goal updated!');
      },
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Daily Goal */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Daily Water Target
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current goal: {dailyGoal} ml
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="number"
                min="1"
                value={dailyGoalInput}
                onChange={(e) => setDailyGoalInput(e.target.value)}
                placeholder="Enter new goal (ml)"
                className="flex-1 rounded-[20px]"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateGoal()}
              />
              <Button
                onClick={handleUpdateGoal}
                disabled={setGoalMutation.isPending || !dailyGoalInput}
                className="btn-primary px-6 rounded-[20px]"
              >
                {setGoalMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              Appearance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize how the app looks
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex flex-col items-center gap-2 h-auto py-4 rounded-[20px]"
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-sm">Light</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex flex-col items-center gap-2 h-auto py-4 rounded-[20px]"
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-sm">Dark</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="flex flex-col items-center gap-2 h-auto py-4 rounded-[20px]"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm">System</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage notification preferences
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Allow browser notifications for water reminders
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleRequestNotificationPermission();
                  } else {
                    setNotificationsEnabled(false);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Units */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg">Units</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your preferred measurement unit
            </p>
          </CardHeader>
          <CardContent>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger className="w-full rounded-[20px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml">Milliliters (ml)</SelectItem>
                <SelectItem value="oz">Ounces (oz)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg">About Hydrate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Stay hydrated with smart water reminders and track your daily water intake</p>
            <Separator className="my-4" />
            <p className="text-xs">Version 1.0.0</p>
            <p className="text-xs">© {new Date().getFullYear()} Hydrate. All rights reserved.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
