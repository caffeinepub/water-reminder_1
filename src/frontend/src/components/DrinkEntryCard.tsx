import { Droplets } from 'lucide-react';

interface DrinkEntryCardProps {
  amount: number;
  timestamp: bigint;
}

export function DrinkEntryCard({ amount, timestamp }: DrinkEntryCardProps) {
  const formatTimestamp = (ts: bigint) => {
    const date = new Date(Number(ts) / 1_000_000);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  const { time, date } = formatTimestamp(timestamp);

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-200 group">
      <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform">
        <Droplets className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{amount} ml</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
      <div className="text-sm text-muted-foreground">{date}</div>
    </div>
  );
}
