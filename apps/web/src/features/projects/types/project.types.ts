export type ProjectStatus = "Done" | "In Progress" | "Stuck" | "In Review";

export type Project = {
  id: number;
  name: string;
  status: ProjectStatus;
  progress: number;
  trackingTime: string;
  members: string[];
};
