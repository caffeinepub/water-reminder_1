import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { NavigationDrawer } from './components/NavigationDrawer';
import { Layout } from './components/Layout';
import DrinkWater from './pages/DrinkWater';
import DrinkLog from './pages/DrinkLog';
import Reports from './pages/Reports';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import AdvancedSettings from './pages/AdvancedSettings';
import HealthBenefits from './pages/HealthBenefits';
import { useReminders } from './hooks/useReminders';
import { Toaster } from './components/ui/sonner';

// Root layout component with navigation and theme
function RootLayout() {
  // Initialize reminders at app level to ensure they run globally
  useReminders();

  return (
    <Layout>
      <NavigationDrawer />
      <Outlet />
      <Toaster />
    </Layout>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DrinkWater,
});

const drinkLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/drink-log',
  component: DrinkLog,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: Reports,
});

const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reminders',
  component: Reminders,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const advancedSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/advanced-settings',
  component: AdvancedSettings,
});

const healthBenefitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/health-benefits',
  component: HealthBenefits,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  drinkLogRoute,
  reportsRoute,
  remindersRoute,
  settingsRoute,
  advancedSettingsRoute,
  healthBenefitsRoute,
]);

// Create router
const router = createRouter({ routeTree });

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
