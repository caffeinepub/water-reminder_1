import { useRemindersData, useAddReminder, useUpdateReminder, useToggleReminder } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, Plus } from 'lucide-react';
import { ReminderCard } from '../components/ReminderCard';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export default function Reminders() {
  const { data: reminders, isLoading } = useRemindersData();
  const addReminderMutation = useAddReminder();
  const updateReminderMutation = useUpdateReminder();
  const toggleReminderMutation = useToggleReminder();

  const handleAddReminder = () => {
    addReminderMutation.mutate({
      time: BigInt(9 * 60), // 9:00 AM
      daysOfWeek: [true, true, true, true, true, true, true],
      sound: true,
      vibration: true,
      alertType: 'notification',
    }, {
      onSuccess: () => {
        toast.success('Reminder added successfully!');
      },
    });
  };

  const handleUpdateReminder = (
    id: bigint,
    data: {
      time: bigint;
      daysOfWeek: boolean[];
      sound: boolean;
      vibration: boolean;
      alertType: string;
    }
  ) => {
    updateReminderMutation.mutate({ reminderId: id, ...data });
  };

  const handleToggleReminder = (id: bigint, enabled: boolean) => {
    toggleReminderMutation.mutate({ reminderId: id, enabled }, {
      onSuccess: () => {
        toast.success(enabled ? 'Reminder enabled' : 'Reminder disabled');
      },
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="card-modern bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Bell className="w-7 h-7 text-primary" />
                  Smart Reminders
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Set up custom notifications to remind you to drink water throughout the day
                </p>
              </div>
              <Button
                onClick={handleAddReminder}
                disabled={addReminderMutation.isPending}
                className="btn-primary rounded-[20px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-[20px]" />
            ))}
          </div>
        ) : reminders && reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <ReminderCard
                key={Number(reminder.id)}
                reminder={reminder}
                onUpdate={handleUpdateReminder}
                onToggle={handleToggleReminder}
              />
            ))}
          </div>
        ) : (
          <Card className="card-modern">
            <CardContent className="py-16 text-center">
              <Bell className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">No reminders set</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first reminder to stay hydrated throughout the day
              </p>
              <Button
                onClick={handleAddReminder}
                disabled={addReminderMutation.isPending}
                className="btn-primary rounded-[20px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
