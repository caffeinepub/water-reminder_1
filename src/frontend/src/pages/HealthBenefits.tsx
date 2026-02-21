import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Brain, Shield, Sparkles, Zap } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { useWaterData } from '../hooks/useQueries';

export default function HealthBenefits() {
  const { data: waterData } = useWaterData();
  
  const currentCount = waterData ? Number(waterData.currentCount) : 0;
  const dailyGoal = waterData ? Number(waterData.dailyGoal) : 0;
  const progressPercentage = dailyGoal > 0 ? Math.min((currentCount / dailyGoal) * 100, 100) : 0;

  const benefits = [
    {
      icon: Heart,
      title: 'Better Digestion',
      description: 'Water helps break down food and absorb nutrients more efficiently, promoting healthy digestion.',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Brain,
      title: 'Improved Concentration',
      description: 'Proper hydration enhances cognitive function, memory, and mental clarity throughout the day.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Shield,
      title: 'Strong Immune System',
      description: 'Staying hydrated supports your immune system and helps your body fight off infections.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Sparkles,
      title: 'Better Skin',
      description: 'Adequate water intake keeps your skin hydrated, reducing dryness and promoting a healthy glow.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      icon: Zap,
      title: 'More Energy',
      description: 'Proper hydration prevents fatigue and keeps your energy levels stable throughout the day.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="card-modern bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              Health Benefits of Staying Hydrated
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Discover how proper hydration improves your overall health and well-being
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your hydration level today</span>
                <span className="font-semibold gradient-text">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const benefitProgress = Math.min(progressPercentage * (0.8 + index * 0.05), 100);
            
            return (
              <Card
                key={benefit.title}
                className="card-modern hover:shadow-soft-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-[20px] ${benefit.bgColor}`}>
                      <Icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{benefit.title}</CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Benefit level</span>
                      <span className="font-semibold">{Math.round(benefitProgress)}%</span>
                    </div>
                    <Progress value={benefitProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="card-modern">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-[20px] bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Did You Know?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your body is about 60% water. Every system in your body depends on water to function properly. 
                  Even mild dehydration can drain your energy and make you tired. Stay hydrated to feel your best!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
