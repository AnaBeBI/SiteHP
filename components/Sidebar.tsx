'use client';

import { SectionId } from '@/lib/data';

interface NavItem { id: string; icon: string; label: string }

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
  visibleItems: NavItem[];
}

export default function Sidebar({ activeSection, onNavigate, visibleItems }: SidebarProps) {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn${activeSection === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id as SectionId)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
