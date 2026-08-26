import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  Tag,
  Users,
  Store,
  Megaphone,
  BarChart3,
  Grid3x3,
  Building2,
  Share2,
  Settings,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Home;
  badge?: string;
  children?: { label: string; to: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/home', icon: Home },
  {
    label: 'Orders',
    to: '/orders',
    icon: ShoppingBag,
    children: [
      { label: 'All orders', to: '/orders' },
      { label: 'Abandoned checkouts', to: '/orders/abandoned' },
    ],
  },
  {
    label: 'Products',
    to: '/products',
    icon: Tag,
    children: [{ label: 'Collections', to: '/products/collections' }],
  },
  { label: 'Customers', to: '/customers', icon: Users },
  {
    label: 'Storefront',
    to: '/storefront',
    icon: Store,
    children: [
      { label: 'Themes', to: '/storefront' },
      { label: 'Landing Pages', to: '/storefront/landing-pages' },
    ],
  },
  {
    label: 'Marketing',
    to: '/marketing',
    icon: Megaphone,
    children: [{ label: 'Discounts', to: '/discounts' }],
  },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Apps', to: '/apps', icon: Grid3x3 },
  { label: 'B2B', to: '/b2b', icon: Building2 },
  { label: 'Channels', to: '/channels', icon: Share2 },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
    children: [
      { label: 'Checkout', to: '/settings/checkout' },
      { label: 'Shipping and delivery', to: '/settings/shipping' },
      { label: 'Facebook Pixel', to: '/settings/facebook-pixel' },
      { label: 'Domains', to: '/settings/domains' },
      { label: 'Connected apps', to: '/settings/connected-apps' },
    ],
  },
];

function baseLinkClasses(active: boolean) {
  return clsx(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    active ? 'bg-surface-selected text-ink' : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    Products: location.pathname.startsWith('/products'),
  }));

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col gap-0.5 border-r border-border bg-surface-secondary p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isChildActive = item.children?.some((child) =>
          location.pathname.startsWith(child.to),
        );
        const isParentActive =
          !isChildActive &&
          (location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));
        const isOpen = expanded[item.label] ?? (isChildActive || location.pathname.startsWith(item.to));

        if (!item.children) {
          return (
            <NavLink key={item.to} to={item.to} className={() => baseLinkClasses(isParentActive)}>
              <Icon size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        }

        return (
          <div key={item.to}>
            <div className={baseLinkClasses(isParentActive || !!isChildActive)}>
              <NavLink to={item.to} className="flex flex-1 items-center gap-3">
                <Icon size={17} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
              <button
                type="button"
                aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !isOpen }))}
                className="rounded p-0.5 text-ink-tertiary hover:bg-surface-hover hover:text-ink"
              >
                <ChevronDown
                  size={15}
                  className={clsx('transition-transform', isOpen && 'rotate-180')}
                />
              </button>
            </div>

            {isOpen && (
              <div className="ml-8 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    end
                    className={({ isActive }) =>
                      clsx(
                        'rounded-md px-2 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-surface-selected font-medium text-ink'
                          : 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
