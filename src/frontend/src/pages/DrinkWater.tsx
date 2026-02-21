import { useState } from 'react';
import { useWaterData, useSetGoal, useIncrementWater } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Target, Droplets, Bell } from 'lucide-react';
import { WaterGlassVisualization } from '../components/WaterGlassVisualization';
import { ReminderPopup } from '../components/ReminderPopup';
import { toast } from 'sonner';

export default function DrinkWater() {
  const [goalInput, setGoalInput] = useState('');
  const { data: waterData, isLoading } = useWaterData();
  const setGoalMutation = useSetGoal();
  const incrementMutation = useIncrementWater();

  const handleSetGoal = () => {
    const goal = parseInt(goalInput);
    if (isNaN(goal) || goal <= 0) {
      toast.error('Please enter a valid positive number for your daily goal');
      return;
    }
    setGoalMutation.mutate(BigInt(goal), {
      onSuccess: () => {
        setGoalInput('');
        toast.success('Daily goal updated!');
      },
    });
  };

  const handleDrinkWater = (amount: number) => {
    incrementMutation.mutate(BigInt(amount), {
      onSuccess: () => {
        toast.success(`Added ${amount}ml to your intake!`);
      },
      onError: (error) => {
        if (error.message?.includes('set a daily goal')) {
          toast.error('Please set a daily goal first!');
        }
      }
    });
  };

  const currentCount = waterData ? Number(waterData.currentCount) : 0;
  const dailyGoal = waterData ? Number(waterData.dailyGoal) : 0;
  const progressPercentage = dailyGoal > 0 ? Math.min((currentCount / dailyGoal) * 100, 100) : 0;
  const remaining = Math.max(dailyGoal - currentCount, 0);
  const isGoalReached = dailyGoal > 0 && currentCount >= dailyGoal;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Goal Setting Card */}
        {dailyGoal === 0 && (
          <Card className="card-modern border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Set Your Daily Goal
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Start by setting your daily water intake goal
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="number"
                  min="1"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Enter daily goal (ml)"
                  className="flex-1 rounded-[20px] h-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleSetGoal()}
                />
                <Button
                  onClick={handleSetGoal}
                  disabled={setGoalMutation.isPending || !goalInput}
                  className="btn-primary px-6 rounded-[20px] h-12"
                >
                  {setGoalMutation.isPending ? 'Setting...' : 'Set Goal'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Progress Card */}
        {dailyGoal > 0 && (
          <Card className="card-modern relative overflow-hidden">
            <CardContent className="pt-8 space-y-6">
              {/* Reminder Bell Icon */}
              <div className="absolute top-4 right-4">
                <ReminderPopup>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                    <Bell className="w-5 h-5 text-primary" />
                  </Button>
                </ReminderPopup>
              </div>

              {/* Water Glass Visualization */}
              <WaterGlassVisualization
                percentage={progressPercentage}
                current={currentCount}
                goal={dailyGoal}
              />

              {/* Remaining Amount */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                <p className="text-3xl font-bold gradient-text">{remaining} ml</p>
              </div>

              {isGoalReached && (
                <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[20px] border border-primary/20">
                  <p className="text-primary font-semibold text-lg">
                    🎉 Goal reached! Excellent hydration!
                  </p>
                </div>
              )}

              {/* Large Add Water Button */}
              <Button
                onClick={() => handleDrinkWater(250)}
                disabled={incrementMutation.isPending}
                className="w-full btn-primary-large group h-16 text-lg"
              >
                <Plus className="w-7 h-7 mr-2 group-hover:scale-110 transition-transform" />
                Add Water
              </Button>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[250, 500, 750].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleDrinkWater(amount)}
                    disabled={incrementMutation.isPending}
                    variant="outline"
                    className="rounded-[20px] h-14 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{amount}</div>
                      <div className="text-xs">ml</div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Change Goal Button */}
              <Button
                onClick={() => setGoalInput(dailyGoal.toString())}
                variant="ghost"
                className="w-full rounded-[20px] text-muted-foreground hover:text-primary"
              >
                <Target className="w-4 h-4 mr-2" />
                Change Daily Goal
              </Button>

              {goalInput && (
                <div className="flex gap-3">
                  <Input
                    type="number"
                    min="1"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="New goal (ml)"
                    className="flex-1 rounded-[20px]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetGoal()}
                  />
                  <Button
                    onClick={handleSetGoal}
                    disabled={setGoalMutation.isPending}
                    className="btn-primary px-6 rounded-[20px]"
                  >
                    Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              Hydration Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">💧</span>
                <span>Drink water first thing in the morning to kickstart your metabolism</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">💧</span>
                <span>Keep a water bottle with you throughout the day</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">💧</span>
                <span>Set reminders to drink water regularly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">💧</span>
                <span>Drink a glass of water before each meal</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
