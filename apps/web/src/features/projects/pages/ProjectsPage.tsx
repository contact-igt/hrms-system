import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  EyeOff,
  Filter,
  GanttChartSquare,
  Info,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";
import { AppRail } from "../components/AppRail";
import { ProjectTable } from "../components/ProjectTable";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { projects as initialProjects } from "../data/projectData";
import type { ProjectStatus } from "../types/project.types";

const views = [
  { label: "Main View", icon: LayoutDashboard },
  { label: "Gantt view", icon: GanttChartSquare },
  { label: "Milestones view", icon: CalendarDays },
  { label: "Kanban view", icon: Workflow },
  { label: "Time Tracking", icon: Clock3 },
];

const filterOrder: Array<ProjectStatus | "All"> = [
  "All",
  "Done",
  "In Progress",
  "Stuck",
  "In Review",
];

export function ProjectsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("Main View");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sortAscending, setSortAscending] = useState(true);
  const [hideMetaColumns, setHideMetaColumns] = useState(false);
  const [firstGroupCollapsed, setFirstGroupCollapsed] = useState(false);
  const [secondGroupCollapsed, setSecondGroupCollapsed] = useState(false);
  const [nextMonthCollapsed, setNextMonthCollapsed] = useState(true);

  const visibleProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return initialProjects
      .filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "All" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((first, second) =>
        sortAscending
          ? first.name.localeCompare(second.name)
          : second.name.localeCompare(first.name),
      );
  }, [search, statusFilter, sortAscending]);

  function cycleFilter() {
    const current = filterOrder.indexOf(statusFilter);
    setStatusFilter(filterOrder[(current + 1) % filterOrder.length]);
  }

  return (
    <div className="app-shell">
      <AppRail />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <main className="main-area">
        <Topbar />

        <div className="projects-page">
          <section className="page-title-row">
            <div>
              <div className="title-line">
                <h1>Projects</h1>
                <Info size={18} />
                <Star size={19} />
              </div>
              <p>
                Manage projects by assigning owners, setting timelines, and
                tracking progress.
              </p>
            </div>

            <div className="page-actions">
              <button type="button">
                <Activity size={16} /> Activity
              </button>
              <button type="button">
                <UsersRound size={16} /> Member
              </button>
              <button className="icon-only" type="button" aria-label="More">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </section>

          <section className="view-toolbar">
            <div className="view-tabs">
              {views.map(({ label, icon: Icon }) => (
                <button
                  className={activeView === label ? "active" : ""}
                  type="button"
                  key={label}
                  onClick={() => setActiveView(label)}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
              <button className="view-add" type="button" aria-label="Add view">
                <Plus size={17} />
              </button>
            </div>

            <div className="automation-actions">
              <button type="button">
                <Zap size={16} /> Integrate
              </button>
              <button type="button">
                <Bot size={16} /> Automate
              </button>
            </div>
          </section>

          <section className="list-toolbar">
            <button className="new-project" type="button">
              <Plus size={17} /> New Project
            </button>

            <label className="list-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                aria-label="Search projects"
              />
            </label>

            <button type="button">
              <UserRound size={16} /> Employee
            </button>
            <button
              className={statusFilter !== "All" ? "is-selected" : ""}
              type="button"
              onClick={cycleFilter}
              title="Click to cycle project status"
            >
              <Filter size={16} />
              {statusFilter === "All" ? "Filter" : statusFilter}
            </button>
            <button type="button" onClick={() => setSortAscending((value) => !value)}>
              <ArrowDownUp size={16} /> Sort
            </button>
            <button
              className={hideMetaColumns ? "is-selected" : ""}
              type="button"
              onClick={() => setHideMetaColumns((value) => !value)}
            >
              <EyeOff size={16} /> Hide
            </button>
          </section>

          <div className="project-board">
            <ProjectTable
              projects={visibleProjects}
              hideMetaColumns={hideMetaColumns}
              collapsed={firstGroupCollapsed}
              onToggle={() => setFirstGroupCollapsed((value) => !value)}
            />

            <section className="next-month">
              <button
                type="button"
                onClick={() => setNextMonthCollapsed((value) => !value)}
              >
                {nextMonthCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                Next Month
              </button>
              <p>There are 09 tasks are hidden in this months</p>
              {!nextMonthCollapsed && (
                <div className="next-month-message">
                  <Sparkles size={17} />
                  Upcoming projects will appear here.
                </div>
              )}
            </section>

            <ProjectTable
              projects={visibleProjects}
              hideMetaColumns={hideMetaColumns}
              collapsed={secondGroupCollapsed}
              onToggle={() => setSecondGroupCollapsed((value) => !value)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
