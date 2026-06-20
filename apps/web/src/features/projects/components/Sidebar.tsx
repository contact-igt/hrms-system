import {
  BarChart3,
  BookMarked,
  Box,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FilePenLine,
  FolderKanban,
  Gauge,
  Globe2,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  PanelLeftClose,
  PanelsTopLeft,
  Search,
  Send,
  ShoppingBag,
  SlidersHorizontal,
  UsersRound,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "MANAGEMENT",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Project", icon: FolderKanban, active: true },
      { label: "Time Tracker", icon: Clock3 },
      { label: "Growth Stats", icon: Gauge },
      { label: "Inventory", icon: Box },
      { label: "Client Pipeline", icon: Workflow },
      { label: "Team", icon: UsersRound },
      { label: "Client Portal", icon: PanelsTopLeft },
      { label: "Financial", icon: CircleDollarSign },
      { label: "Portfolio", icon: ShoppingBag },
    ],
  },
  {
    label: "MARKETING",
    items: [
      { label: "Outreach", icon: Send },
      { label: "Email Marketing", icon: Mail },
      { label: "Social", icon: Megaphone },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Team Inbox", icon: Inbox },
      { label: "Contract", icon: FilePenLine },
      { label: "Web Form", icon: Globe2 },
      { label: "Scheduling", icon: BarChart3 },
      { label: "Customization", icon: SlidersHorizontal },
    ],
  },
];

const bookmarks = [
  { name: "#General", tone: "blue" },
  { name: "UI Design Projects", tone: "gold" },
  { name: "Recently done", tone: "pink" },
  { name: "Call booked on portal", tone: "violet" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <header className="workspace-switcher">
        <span className="workspace-name">Orbix Studio</span>
        <ChevronDown size={13} />
        <button className="sidebar-search" type="button" aria-label="Search">
          <Search size={18} strokeWidth={2} />
        </button>
      </header>

      <button
        className="sidebar-collapse"
        type="button"
        onClick={onToggle}
        aria-label="Collapse sidebar"
      >
        <PanelLeftClose size={14} />
      </button>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div className="sidebar-section" key={section.label}>
            <p className="section-label">{section.label}</p>
            {section.items.map(({ label, icon: Icon, active }) => (
              <button
                className={`nav-item ${active ? "active" : ""}`}
                type="button"
                key={label}
                title={collapsed ? label : undefined}
              >
                <Icon className="nav-item-icon" size={18} strokeWidth={1.7} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="bookmarks">
        <div className="bookmarks-title">
          <span>
            <BookMarked size={13} /> Bookmarks
          </span>
          <PlusIcon />
        </div>
        {bookmarks.map((bookmark) => (
          <button className="bookmark" type="button" key={bookmark.name}>
            <i className={bookmark.tone} />
            <span>{bookmark.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function PlusIcon() {
  return (
    <span className="bookmark-plus" aria-hidden="true">
      +
    </span>
  );
}
