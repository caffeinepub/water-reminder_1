import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Volume2, Vibrate, Bell } from 'lucide-react';
import type { Reminder } from '../backend';

interface ReminderCardProps {
  reminder: Reminder;
  onUpdate: (id: bigint, data: {
    time: bigint;
    daysOfWeek: boolean[];
    sound: boolean;
    vibration: boolean;
    alertType: string;
  }) => void;
  onToggle: (id: bigint, enabled: boolean) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ReminderCard({ reminder, onUpdate, onToggle }: ReminderCardProps) {
  const [time, setTime] = useState(Number(reminder.time));
  const [daysOfWeek, setDaysOfWeek] = useState<boolean[]>(reminder.daysOfWeek);
  const [sound, setSound] = useState(reminder.sound);
  const [vibration, setVibration] = useState(reminder.vibration);
  const [alertType, setAlertType] = useState(reminder.alertType);

  const formatTimeAMPM = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const formatTime24 = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, mins] = e.target.value.split(':').map(Number);
    const newTime = hours * 60 + mins;
    setTime(newTime);
    onUpdate(reminder.id, { time: BigInt(newTime), daysOfWeek, sound, vibration, alertType });
  };

  const toggleDay = (index: number) => {
    const newDays = [...daysOfWeek];
    newDays[index] = !newDays[index];
    setDaysOfWeek(newDays);
    onUpdate(reminder.id, { time: BigInt(time), daysOfWeek: newDays, sound, vibration, alertType });
  };

  const handleSoundChange = (checked: boolean) => {
    setSound(checked);
    onUpdate(reminder.id, { time: BigInt(time), daysOfWeek, sound: checked, vibration, alertType });
  };

  const handleVibrationChange = (checked: boolean) => {
    setVibration(checked);
    onUpdate(reminder.id, { time: BigInt(time), daysOfWeek, sound, vibration: checked, alertType });
  };

  const handleAlertTypeChange = (value: string) => {
    setAlertType(value);
    onUpdate(reminder.id, { time: BigInt(time), daysOfWeek, sound, vibration, alertType: value });
  };

  return (
    <Card className={`card-modern transition-all duration-300 ${reminder.enabled ? 'border-primary/30 shadow-soft' : 'opacity-60'}`}>
      <CardContent className="pt-6 space-y-5">
        {/* Header with toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-[12px] ${reminder.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
              <Bell className={`w-5 h-5 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <Label className="text-base font-semibold">Reminder</Label>
              <p className="text-xs text-muted-foreground">{formatTimeAMPM(time)}</p>
            </div>
          </div>
          <Switch
            checked={reminder.enabled}
            onCheckedChange={(checked) => onToggle(reminder.id, checked)}
          />
        </div>

        {/* Time picker */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </Label>
          <input
            type="time"
            value={formatTime24(time)}
            onChange={handleTimeChange}
            className="w-full px-4 py-3 rounded-[20px] border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Days of week */}
        <div className="space-y-2">
          <Label className="text-sm">Days</Label>
          <div className="flex gap-2">
            {DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => toggleDay(index)}
                className={`flex-1 py-2.5 rounded-[12px] text-xs font-medium transition-all ${
                  daysOfWeek[index]
                    ? 'bg-gradient-to-r from-[oklch(70%_0.14_220)] to-[oklch(55%_0.15_240)] text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Sound and vibration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between space-x-2 p-3 rounded-[12px] bg-muted/30">
            <Label className="text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Sound
            </Label>
            <Switch checked={sound} onCheckedChange={handleSoundChange} />
          </div>
          <div className="flex items-center justify-between space-x-2 p-3 rounded-[12px] bg-muted/30">
            <Label className="text-sm flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              Vibrate
            </Label>
            <Switch checked={vibration} onCheckedChange={handleVibrationChange} />
          </div>
        </div>

        {/* Alert type */}
        <div className="space-y-2">
          <Label className="text-sm">Alert Type</Label>
          <Select value={alertType} onValueChange={handleAlertTypeChange}>
            <SelectTrigger className="rounded-[20px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="sound">Sound Only</SelectItem>
              <SelectItem value="vibration">Vibration Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
