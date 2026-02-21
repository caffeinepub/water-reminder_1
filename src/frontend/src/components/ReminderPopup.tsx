import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Bell, Settings } from 'lucide-react';
import { useRemindersData, useToggleReminder } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { ScrollArea } from './ui/scroll-area';

interface ReminderPopupProps {
  children: React.ReactNode;
}

export function ReminderPopup({ children }: ReminderPopupProps) {
  const { data: reminders } = useRemindersData();
  const toggleReminderMutation = useToggleReminder();
  const navigate = useNavigate();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const handleToggle = (reminderId: bigint, enabled: boolean) => {
    toggleReminderMutation.mutate({ reminderId, enabled });
  };

  const handleOpenSettings = () => {
    navigate({ to: '/reminders' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="glass max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="w-6 h-6 text-primary" />
            Water Reminders
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {reminders && reminders.length > 0 ? (
              reminders.map((reminder) => (
                <div
                  key={Number(reminder.id)}
                  className="flex items-center justify-between p-4 rounded-[20px] bg-muted/30 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-semibold">{formatTime(Number(reminder.time))}</p>
                      <p className="text-xs text-muted-foreground">
                        {reminder.daysOfWeek.every(d => d) ? 'Every day' : 'Custom days'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => handleToggle(reminder.id, checked)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No reminders set</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={handleOpenSettings}
            className="w-full btn-primary rounded-[20px]"
          >
            <Settings className="w-4 h-4 mr-2" />
            Reminder Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
