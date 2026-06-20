import type { Project } from "../types/project.types";

export const projects: Project[] = [
  {
    id: 1,
    name: "UI Finance Mobile",
    status: "Done",
    progress: 100,
    trackingTime: "01:34 hours",
    members: ["EL", "NK", "AM"],
  },
  {
    id: 2,
    name: "Dashboard Finance",
    status: "In Progress",
    progress: 50,
    trackingTime: "01:34 hours",
    members: ["TS", "JL", "MR"],
  },
  {
    id: 3,
    name: "Exploration UI Mobile",
    status: "Stuck",
    progress: 67,
    trackingTime: "01:34 hours",
    members: ["LC", "AR", "VB"],
  },
  {
    id: 4,
    name: "UI Marketplace",
    status: "In Review",
    progress: 15,
    trackingTime: "01:34 hours",
    members: ["GM", "SA", "HO"],
  },
  {
    id: 5,
    name: "Landing Page",
    status: "Done",
    progress: 100,
    trackingTime: "01:34 hours",
    members: ["KM", "DP", "RJ"],
  },
];
