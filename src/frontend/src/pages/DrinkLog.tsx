import { useDrinkLog } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Droplets } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { DrinkEntryCard } from '../components/DrinkEntryCard';

export default function DrinkLog() {
  const { data: entries, isLoading } = useDrinkLog();

  // Group entries by date
  const groupedEntries = entries?.reduce((acc, entry) => {
    const date = new Date(Number(entry.timestamp) / 1_000_000);
    const dateKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Drink History
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your complete water intake history
            </p>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedEntries || {})
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, dateEntries]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {dateEntries
                      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                      .map((entry, index) => (
                        <DrinkEntryCard
                          key={index}
                          amount={Number(entry.amount)}
                          timestamp={entry.timestamp}
                        />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Card className="card-modern">
            <CardContent className="py-12 text-center">
              <img 
                src="/assets/generated/water-glass-character.dim_256x256.png" 
                alt="No entries" 
                className="w-32 h-32 mx-auto mb-4 opacity-50"
              />
              <p className="text-muted-foreground">No water intake recorded yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start tracking your water intake from the home page
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
