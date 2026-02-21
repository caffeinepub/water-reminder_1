import { useState } from 'react';
import { useReports, useDrinkLog } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, TrendingUp, Calendar, CalendarDays } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { WaterChart } from '../components/WaterChart';

export default function Reports() {
  const { data: reports, isLoading } = useReports();
  const { data: entries } = useDrinkLog();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const dailyProgress = reports?.daily
    ? (Number(reports.daily.total) / Number(reports.daily.goal)) * 100
    : 0;

  // Prepare chart data
  const getChartData = () => {
    if (!entries) return [];
    
    const now = new Date();
    const days = period === 'weekly' ? 7 : 30;
    const data: Array<{ date: string; amount: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime() * 1_000_000;
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime() * 1_000_000;
      
      const dayTotal = entries
        .filter(entry => {
          const entryTime = Number(entry.timestamp);
          return entryTime >= dayStart && entryTime <= dayEnd;
        })
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      data.push({ date: dateStr, amount: dayTotal });
    }

    return data;
  };

  const chartData = getChartData();
  const averageIntake = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length)
    : 0;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Water Intake Reports
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your hydration progress over time
            </p>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Daily Summary */}
            <Card className="card-modern hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {reports?.daily ? Number(reports.daily.total) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {reports?.daily ? Number(reports.daily.goal) : 0} ml
                  </p>
                </div>
                <Progress value={Math.min(dailyProgress, 100)} className="h-3" />
                <p className="text-center text-sm font-medium text-primary">
                  {dailyProgress.toFixed(0)}% complete
                </p>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card className="card-modern hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {reports?.weekly ? Number(reports.weekly) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">total ml</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Last 7 days</span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card className="card-modern hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {reports?.monthly ? Number(reports.monthly) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">total ml</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Last 30 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg">Progress Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as 'weekly' | 'monthly')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly">
                <WaterChart data={chartData} period="weekly" />
              </TabsContent>
              <TabsContent value="monthly">
                <WaterChart data={chartData} period="monthly" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg">📊 Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  {reports?.daily && Number(reports.daily.total) >= Number(reports.daily.goal)
                    ? "Great job! You've reached your daily goal today."
                    : 'Keep going! Stay hydrated throughout the day.'}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Average intake: {averageIntake} ml per day
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  {reports?.daily && Number(reports.daily.total) > 0
                    ? `You're ${Math.round((Number(reports.daily.total) / Number(reports.daily.goal)) * 100)}% towards your goal`
                    : 'Start tracking to see your progress'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
