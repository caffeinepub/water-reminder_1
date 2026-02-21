import { useState } from 'react';
import { useWeightHistory, useAddWeight } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Weight as WeightIcon, Plus, TrendingDown } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function Weight() {
  const [weightInput, setWeightInput] = useState('');
  const { data: weightHistory, isLoading } = useWeightHistory();
  const addWeightMutation = useAddWeight();

  const handleAddWeight = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }
    addWeightMutation.mutate(weight, {
      onSuccess: () => {
        setWeightInput('');
      },
      onError: (error) => {
        console.error('Failed to add weight:', error);
        alert('Failed to add weight. Please try again.');
      }
    });
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Add Weight Card */}
          <Card className="shadow-xl border-water-border bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-water-dark">
                <WeightIcon className="w-6 h-6 text-water-accent" />
                Track Your Weight
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor your weight changes over time
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight" className="text-water-dark">
                    Weight (kg or lbs)
                  </Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="Enter your weight"
                      className="flex-1 border-water-border focus:ring-water-accent focus:border-water-accent rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddWeight();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddWeight}
                      disabled={addWeightMutation.isPending || !weightInput}
                      className="bg-water-accent hover:bg-water-accent-dark text-white font-semibold px-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {addWeightMutation.isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight History Card */}
          <Card className="shadow-xl border-water-border bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-water-dark">
                <TrendingDown className="w-6 h-6 text-water-accent" />
                Weight History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : weightHistory && weightHistory.length > 0 ? (
                <div className="space-y-3">
                  {weightHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-water-light/30 rounded-lg border border-water-border hover:bg-water-light/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-water-accent/10 p-2 rounded-full">
                            <WeightIcon className="w-5 h-5 text-water-accent" />
                          </div>
                          <div>
                            <p className="font-semibold text-water-dark text-lg">
                              {entry.weight.toFixed(1)} kg
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                        {index < weightHistory.length - 1 && (
                          <div className="text-sm font-medium">
                            {entry.weight < weightHistory[weightHistory.length - index - 2].weight ? (
                              <span className="text-green-600">
                                ↓{' '}
                                {(
                                  weightHistory[weightHistory.length - index - 2].weight -
                                  entry.weight
                                ).toFixed(1)}
                              </span>
                            ) : entry.weight > weightHistory[weightHistory.length - index - 2].weight ? (
                              <span className="text-orange-600">
                                ↑{' '}
                                {(
                                  entry.weight -
                                  weightHistory[weightHistory.length - index - 2].weight
                                ).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">→ 0.0</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <WeightIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No weight entries yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first weight entry above
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
