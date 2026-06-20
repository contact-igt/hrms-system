import {
  CircleHelp,
  Command,
  Globe2,
  MessageSquareText,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";

const railItems = [
  { icon: Sparkles, color: "rail-dark" },
  { icon: Command, color: "" },
  { icon: Globe2, color: "rail-blue" },
];

export function AppRail() {
  return (
    <aside className="app-rail" aria-label="Application shortcuts">
      <div className="rail-logo" aria-label="Orbix">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="rail-actions">
        {railItems.map(({ icon: Icon, color }, index) => (
          <button className={`rail-button ${color}`} key={index} type="button">
            <Icon size={14} strokeWidth={1.8} />
          </button>
        ))}
        <button className="rail-button rail-add" type="button">
          <Plus size={16} />
        </button>
      </div>

      <div className="rail-spacer" />

      <button className="rail-button" type="button">
        <MessageSquareText size={15} />
      </button>
      <button className="rail-button" type="button">
        <CircleHelp size={15} />
      </button>
      <button className="rail-button" type="button">
        <Settings size={15} />
      </button>
      <button className="rail-profile" type="button" aria-label="Profile">
        JD
      </button>
    </aside>
  );
}
