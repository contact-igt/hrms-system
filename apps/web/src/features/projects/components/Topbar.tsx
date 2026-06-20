import {
  Bell,
  Clock3,
  Crown,
  MessageSquareMore,
  Sparkles,
  Video,
} from "lucide-react";

export function Topbar() {
  return (
    <header className="topbar">
      <strong className="topbar-section">Project</strong>

      <label className="ai-search">
        <Sparkles size={15} />
        <input aria-label="Ask AI" placeholder="Ask AI...." />
        <kbd>⌘ A</kbd>
      </label>

      <div className="topbar-actions">
        <button type="button" aria-label="Recent activity">
          <Clock3 size={18} />
        </button>
        <button type="button" aria-label="Video meeting">
          <Video size={18} />
        </button>
        <button className="notification-button" type="button" aria-label="Messages">
          <MessageSquareMore size={18} />
          <b>156</b>
        </button>
        <button className="notification-button" type="button" aria-label="Notifications">
          <Bell size={18} />
          <i />
        </button>
        <button className="premium-button" type="button">
          <Crown size={15} fill="currentColor" />
          Premium
        </button>
      </div>
    </header>
  );
}
