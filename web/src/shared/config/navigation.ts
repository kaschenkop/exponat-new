import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bot,
  Boxes,
  Hammer,
  LayoutDashboard,
  Map,
  Settings,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';

export type NavItemType = {
  titleKey:
    | 'dashboard'
    | 'projects'
    | 'budget'
    | 'logistics'
    | 'construction'
    | 'spacePlanning'
    | 'participants'
    | 'aiAssistant'
    | 'analytics'
    | 'settings';
  href: string;
  icon: LucideIcon;
};

export const dashboardNavItems: NavItemType[] = [
  { titleKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { titleKey: 'projects', href: '/dashboard/projects', icon: Boxes },
  { titleKey: 'budget', href: '/dashboard/budget', icon: Wallet },
  { titleKey: 'logistics', href: '/dashboard/logistics', icon: Truck },
  { titleKey: 'construction', href: '/dashboard/construction', icon: Hammer },
  { titleKey: 'spacePlanning', href: '/dashboard/space-planning', icon: Map },
  { titleKey: 'participants', href: '/dashboard/participants', icon: Users },
  { titleKey: 'aiAssistant', href: '/dashboard/ai-assistant', icon: Bot },
  { titleKey: 'analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { titleKey: 'settings', href: '/dashboard/settings', icon: Settings },
];
