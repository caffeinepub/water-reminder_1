import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-start via-gradient-mid to-gradient-end dark:from-gradient-dark-start dark:via-gradient-dark-mid dark:to-gradient-dark-end transition-colors duration-300">
      <div className="wave-pattern" />
      {children}
    </div>
  );
}
