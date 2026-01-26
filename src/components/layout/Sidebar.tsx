import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    t
  } = useLanguage();
  const navigation = [{
    name: t('nav.dashboard'),
    href: '/',
    icon: LayoutDashboard
  }, {
    name: t('nav.reservations'),
    href: '/reservas',
    icon: Calendar
  }, {
    name: t('nav.guests'),
    href: '/hospedes',
    icon: Users
  }, {
    name: t('nav.import'),
    href: '/importar',
    icon: Upload
  }, {
    name: t('nav.documents'),
    href: '/documentos',
    icon: FileText
  }];
  return <div className={cn('flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && <h1 className="text-xl font-bold text-sidebar-foreground">
            Villa Araçá
          </h1>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground hover:bg-sidebar-accent">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 bg-popover-foreground">
        {navigation.map(item => {
        const isActive = location.pathname === item.href || item.href !== '/' && location.pathname.startsWith(item.href);
        return <Link key={item.href} to={item.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors', isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
              <item.icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>;
      })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings size={20} />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </Link>
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut size={20} />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </div>;
}