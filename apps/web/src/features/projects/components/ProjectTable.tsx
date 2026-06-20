import { ChevronDown, ChevronRight, Clock3, Eye, Info } from "lucide-react";
import type { Project } from "../types/project.types";
import { AvatarStack } from "./AvatarStack";

type ProjectTableProps = {
  projects: Project[];
  hideMetaColumns: boolean;
  collapsed: boolean;
  onToggle: () => void;
};

const statusClass = {
  Done: "status-done",
  "In Progress": "status-progress",
  Stuck: "status-stuck",
  "In Review": "status-review",
};

export function ProjectTable({
  projects,
  hideMetaColumns,
  collapsed,
  onToggle,
}: ProjectTableProps) {
  return (
    <section className="month-group">
      <button className="month-heading" type="button" onClick={onToggle}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        <span>This month</span>
      </button>

      {!collapsed && (
        <div className="project-table-wrap">
          <table className="project-table">
            <thead>
              <tr>
                <th className="check-cell">
                  <span className="checkbox" />
                </th>
                <th>Member</th>
                <th>Project</th>
                <th>
                  <span className="with-info">
                    Status <Info size={13} />
                  </span>
                </th>
                <th>Progress</th>
                {!hideMetaColumns && (
                  <th>
                    <span className="with-info">
                      Tracking Time <Info size={13} />
                    </span>
                  </th>
                )}
                {!hideMetaColumns && <th>Visible</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="check-cell">
                    <span className="checkbox" />
                  </td>
                  <td>
                    <AvatarStack members={project.members} />
                  </td>
                  <td className="project-name">{project.name}</td>
                  <td>
                    <span className={`project-status ${statusClass[project.status]}`}>
                      <i />
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <span className={`progress-track ${statusClass[project.status]}`}>
                        <i style={{ width: `${project.progress}%` }} />
                      </span>
                      <b>{project.progress}%</b>
                    </div>
                  </td>
                  {!hideMetaColumns && (
                    <td>
                      <span className="tracking-time">
                        <Clock3 size={15} />
                        {project.trackingTime}
                      </span>
                    </td>
                  )}
                  {!hideMetaColumns && (
                    <td>
                      <button className="show-task" type="button">
                        <Eye size={14} />
                        Show Task
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="empty-state">No projects match your search.</div>
          )}
        </div>
      )}
    </section>
  );
}
