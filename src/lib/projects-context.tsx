"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api, type Project } from "./api";
import { toast } from "sonner";

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  refresh: () => void;
}

const ProjectsContext = createContext<ProjectsState>({
  projects: [],
  loading: true,
  refresh: () => {},
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    api
      .getMyProjects()
      .then((data) => setProjects(data.projects))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ProjectsContext.Provider value={{ projects, loading, refresh }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectsContext);
}
