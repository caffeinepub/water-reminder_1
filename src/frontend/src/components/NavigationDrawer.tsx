import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu, Droplets, FileText, BarChart3, Bell, Settings as SettingsIcon, Heart } from 'lucide-react';

export function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const menuItems = [
    { title: 'Home', path: '/', icon: Droplets },
    { title: 'Drink Log', path: '/drink-log', icon: FileText },
    { title: 'Reports', path: '/reports', icon: BarChart3 },
    { title: 'Health Benefits', path: '/health-benefits', icon: Heart },
    { title: 'Reminders', path: '/reminders', icon: Bell },
    { title: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setOpen(false);
  };

  return (
    <>
      {/* Header with hamburger menu */}
      <header className="glass sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl transition-all">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] glass border-border">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <img 
                    src="/assets/generated/app-logo.dim_256x256.png" 
                    alt="Hydrate" 
                    className="w-10 h-10"
                  />
                  <span className="gradient-text text-xl font-bold">Hydrate</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[20px] transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[oklch(70%_0.14_220)] to-[oklch(55%_0.15_240)] text-white font-semibold shadow-md'
                          : 'text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/app-logo.dim_256x256.png" 
              alt="Hydrate" 
              className="w-10 h-10"
            />
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Hydrate
            </h1>
          </div>

          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>
    </>
  );
}
